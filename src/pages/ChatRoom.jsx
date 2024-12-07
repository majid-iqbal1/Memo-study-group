/*******************************************************************************
 *             ChatRoom Component - Group Communication Interface              *
 ******************************************************************************/

/**************************** Component Information ****************************
 *                                                                             *
 *  Purpose: Real-time group chat interface with resource and event mgmt       *
 *  Version: 1.9.0                                                             *
 *  Created: November 2024                                                     *
 *  Updated: December 2024                                                     *
 *  Author:  Majid Iqbal, Sulav Shakya, Bruce Duong, & Ethan Humrich           *                                         *
 *                                                                             *
 ******************************************************************************/

/*************************** Web Design & Features *****************************
 *                                                                             *
 *  LEFT PANEL                       |   RIGHT PANEL                           *
 *  -------------------------        |   -------------------------             *
 *  - Member Management              |   - Event Scheduling                    *
 *  - Resource Sharing               |   - Event Management                    *
 *  - File Upload/Download           |   - Calendar Integration                *
 *                                   |                                         *
 *  CENTRAL PANEL                    |   GENERAL FEATURES                      *
 *  -------------------------        |   -------------------------             *
 *  - Real-time Messaging            |   - User Authentication                 *
 *  - File Attachments               |   - Profile Management                  *
 *  - Message History                |   - Group Settings                      *
 *                                                                             *
 ******************************************************************************/

/****************************** Dependencies ***********************************
 *                                                                             *
 *  REACT                            |   FIREBASE                              *
 *  -------------------------        |   -------------------------             *
 *  - useState                       |   - Firestore                           *
 *  - useEffect                      |   - Storage                             *
 *  - useRef                         |   - Authentication                      *
 *                                   |                                         *
 *  COMPONENTS                       |   UTILITIES                             *
 *  -------------------------        |   -------------------------             *
 *  - NavLayout                      |   - Lucide Icons                        *
 *  - LoadingSpinner                 |   - Date Formatting                     *
 *                                                                             *
 ******************************************************************************/

/******************************** Notes ****************************************
 *                                                                             *
 *  - All file uploads limited to 5MB                                          *
 *  - Supports image, PDF, DOC, and TXT files                                  *
 *  - Events auto-delete after expiration                                      *
 *                                                                             *
 ******************************************************************************/


import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  doc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, 
  getDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useUser } from '../UserContext';
import { 
  FileText, Calendar, Clock, Paperclip, Download, Plus, 
  Edit, Image, LogOut, MoreVertical, Trash2, File, 
  Crown
} from 'lucide-react';
import NavLayout from '../components/NavLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/chatroom.css'

const ChatRoom = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [groupInfo, setGroupInfo] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '' });
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [newResource, setNewResource] = useState({ name: '', file: null });
  const [attachment, setAttachment] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userProfiles, setUserProfiles] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, resourceId: null });
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [eventContextMenu, setEventContextMenu] = useState({ 
    show: false, 
    x: 0, 
    y: 0, 
    eventId: null 
});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        const groupDoc = await getDoc(doc(db, "group-database", groupId));
        if (groupDoc.exists()) {
          const data = groupDoc.data().group;
          if (data.events) {
            data.events.sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`));
          }
          setGroupInfo(data);
          
        }
      } catch (error) {
        console.error("Error fetching group info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupInfo();
  },[groupId],[]);

  useEffect(() => {
    if (!groupId) return;

    const messagesRef = collection(db, `group-database/${groupId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [groupId]);

  useEffect(() => {
    const fetchUserProfiles = async () => {
      if (!groupInfo?.users) return;
      
      const profiles = {};
      const names = {};
      
      for (const userId of groupInfo.users) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          names[userId] = userData.name;
          profiles[userId] = userData.profilePictureURL || null;
        }
      }
      setUserNames(names);
      setUserProfiles(profiles);
    };
  
    if (groupInfo?.users) {
      fetchUserProfiles();
    }
  }, [groupInfo]);

  useEffect(() => {
    const handleClickOutside = () => {
    
        if (contextMenu.show) {
            setContextMenu({ show: false, x: 0, y: 0, resourceId: null });
        }
  
        if (eventContextMenu.show) {
            setEventContextMenu({ show: false, x: 0, y: 0, eventId: null });
        }
    };

    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            setContextMenu({ show: false, x: 0, y: 0, resourceId: null });
            setEventContextMenu({ show: false, x: 0, y: 0, eventId: null });
        }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
    };
}, [contextMenu.show, eventContextMenu.show]);


  useEffect(() => {
    const checkExpiredEvents = async () => {
        if (!groupInfo?.events?.length) return;

        const now = new Date();
        const expiredEvents = groupInfo.events.filter(event => {
            const eventDate = new Date(`${event.date} ${event.time}`);
            return eventDate < now;
        });

        if (expiredEvents.length > 0) {
            try {
                const groupRef = doc(db, "group-database", groupId);
                const updatedEvents = groupInfo.events.filter(event => {
                    const eventDate = new Date(`${event.date} ${event.time}`);
                    return eventDate >= now;
                });

                await updateDoc(groupRef, {
                    'group.events': updatedEvents
                });
            } catch (error) {
                console.error('Error removing expired events:', error);
            }
        }
    };

    checkExpiredEvents();
  }, [groupInfo?.events, groupId]);


const handleEditEvent = async (eventId) => {
  const event = groupInfo.events.find(e => e.id === eventId);
  if (!event) return;

  try {
      const newDate = prompt('Enter new date (YYYY-MM-DD):', event.date);
      const newTime = prompt('Enter new time (HH:MM):', event.time);
      
      if (!newDate || !newTime) return;

      const groupRef = doc(db, "group-database", groupId);
      const updatedEvents = groupInfo.events.map(e => {
          if (e.id === eventId) {
              return { ...e, date: newDate, time: newTime };
          }
          return e;
      });

      await updateDoc(groupRef, {
          'group.events': updatedEvents
      });
  } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event');
  }
};

const handleDeleteEvent = async (eventId) => {
  if (!window.confirm('Are you sure you want to delete this event?')) return;

  try {
      const groupRef = doc(db, "group-database", groupId);
      const updatedEvents = groupInfo.events.filter(e => e.id !== eventId);
      
      await updateDoc(groupRef, {
          'group.events': updatedEvents
      });
  } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
  }
};


  const handleFileUpload = async (file, type = 'message') => {
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }
  
    try {
      setUploadProgress(0);
      const storageFolder = type === 'message' ? 'chat-files' : 'resources';
      const fileRef = ref(storage, `${storageFolder}/${groupId}/${Date.now()}-${file.name}`);
      
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      
      if (type === 'message') {
        const messagesRef = collection(db, `group-database/${groupId}/messages`);
        await addDoc(messagesRef, {
          text: '',
          userId: user.uid,
          senderName: user.name,
          timestamp: serverTimestamp(),
          attachment: {
            name: file.name,
            url: downloadURL,
            type: file.type
          }
        });
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const groupRef = doc(db, 'group-database', groupId);
        await updateDoc(groupRef, {
          'group.resources': arrayUnion({
            name: newResource.name || file.name,
            url: downloadURL,
            type: file.type,
            id: Date.now(),
            addedBy: user.name,
            addedAt: serverTimestamp()
          })
        });
      }
  
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
      setUploadProgress(0);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
        const groupRef = doc(db, "group-database", groupId);
        const groupDoc = await getDoc(groupRef);
        const currentResources = groupDoc.data().group.resources || [];
        
        const updatedResources = currentResources.filter(resource => 
            resource.id !== resourceId
        );

        await updateDoc(groupRef, {
            'group.resources': updatedResources
        });

        setContextMenu({ show: false, x: 0, y: 0, resourceId: null });
    } catch (error) {
        console.error('Error deleting resource:', error);
        alert('Failed to delete resource');
    }
};

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachment) return;

    try {
      const messagesRef = collection(db, `group-database/${groupId}/messages`);
      
      let attachmentData = null;
      if (attachment) {
        await handleFileUpload(attachment);
        return;
      }

      await addDoc(messagesRef, {
        text: newMessage.trim(),
        userId: user.uid,
        senderName: user.name,
        timestamp: serverTimestamp(),
        attachment: attachmentData
      });

      setNewMessage('');
      setAttachment(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    
    try {
      const groupRef = doc(db, "group-database", groupId);
      const groupSnapshot = await getDoc(groupRef);
      
      if (!groupSnapshot.exists()) {
        throw new Error('Group not found');
      }
  
      const currentData = groupSnapshot.data();
      const currentEvents = currentData.group.events || [];
      
      const newEventData = {
        id: Date.now().toString(),
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        createdBy: user.name,
        createdAt: new Date().toISOString()
      };
  
      await updateDoc(groupRef, {
        'group.events': [...currentEvents, newEventData]
      });
  
      setNewEvent({ title: '', date: '', time: '' });
      setShowEventModal(false);
      console.log('Event added successfully');
  
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Failed to add event: ' + error.message);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!newResource.file || !newResource.name.trim()) {
        alert('Please provide a name for the resource');
        return;
    }

    try {
        setUploadProgress(0);
        const groupRef = doc(db, "group-database", groupId);
        const groupSnapshot = await getDoc(groupRef);
        
        if (!groupSnapshot.exists()) {
            throw new Error('Group not found');
        }

        const currentData = groupSnapshot.data();
        const currentResources = currentData.group.resources || [];

        const storageRef = ref(storage, `resources/${groupId}/${Date.now()}-${newResource.name}`);
        const uploadTask = await uploadBytes(storageRef, newResource.file);
        const downloadURL = await getDownloadURL(uploadTask.ref);

        const newResourceData = {
            id: Date.now().toString(),
            name: newResource.name.trim(),
            url: downloadURL,
            type: newResource.file.type,
            addedBy: user.name,
            addedAt: new Date().toISOString()
        };

        await updateDoc(groupRef, {
            'group.resources': [...currentResources, newResourceData]
        });

        setShowResourceModal(false);
        setNewResource({ name: '', file: null });
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);

    } catch (error) {
        console.error('Error adding resource:', error);
        alert('Failed to add resource: ' + error.message);
        setUploadProgress(0);
    }
};
  
  const handleResourceFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size <= 5 * 1024 * 1024) {
            setNewResource(prev => ({
                ...prev,
                file: file,
                name: ''
            }));
        } else {
            alert('File size should be less than 5MB');
            e.target.value = '';
        }
    }
};

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size <= 5 * 1024 * 1024) {
        setAttachment(file);
      } else {
        alert('File size should be less than 5MB');
        e.target.value = '';
      }
    }
  };

  const formatEventDateTime = (date, time) => {
    const eventDate = new Date(`${date} ${time}`);
    return eventDate.toLocaleString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMessageDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
  
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleUpdateGroup = async (updates) => {
    try {
      const groupRef = doc(db, "group-database", groupId);
      
      await updateDoc(groupRef, {
        'group.name': updates.name || groupInfo.name,
        'group.groupImage': updates.groupImage || groupInfo.groupImage
      });
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating group:', error);
      alert('Failed to update group settings');
    }
  };
  
  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        let groupRef = doc(db, "group-database", groupId);
        let updatedGroupDoc = await getDoc(groupRef);
        let currSize = updatedGroupDoc.get("group.memberCount")
        
        
        
        await updateDoc(groupRef, { 
          'group.users': arrayRemove(user.uid),
          'group.memberCount': currSize - 1
        });
       
        updatedGroupDoc = await getDoc(groupRef);
        console.log("This is after: " +  updatedGroupDoc.get("group.memberCount"));

        if (updatedGroupDoc.get("group.memberCount") === 0) {
          await deleteDoc(groupRef);
          console.log("Group deleted as no members remain");
        }
        
        navigate('/join');
        
      } catch (error) {
        console.error('Error leaving group:', error);
        alert('Failed to leave group');
      }
    }
  };

  if (loading) return <NavLayout><LoadingSpinner /></NavLayout>;
  if (!groupInfo) return <NavLayout><div className="error-message">Group not found</div></NavLayout>;

    return (
      <NavLayout>
        <div className="chat-container">
          <div className="chat-sidebar">
          <div className="settings-container">
            <button 
              className="settings-button"
              onClick={() => setShowSettings(!showSettings)}
            >
              <MoreVertical size={20} />
            </button>
            {showSettings && (
              <div className="settings-dropdown">
                {user.uid === groupInfo.owner && (
                  <>
                    <button 
                      className="settings-option"
                      onClick={() => {
                        const newName = prompt('Enter new group name:', groupInfo.name);
                        if (newName) handleUpdateGroup({ name: newName });
                      }}
                    >
                      <Edit size={16} />
                      Change Group Name
                    </button>
                    <label className="settings-option" htmlFor="group-image">
                      <Image size={16} />
                      Update Group Picture
                      <input
                        id="group-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const imageRef = ref(storage, `groupImages/${groupId}/${Date.now()}-${file.name}`);
                            await uploadBytes(imageRef, file);
                            const url = await getDownloadURL(imageRef);
                            handleUpdateGroup({ groupImage: url });
                          }
                        }}
                      />
                    </label>
                  </>
                )}
                <button 
                  className="settings-option leave-group"
                  onClick={handleLeaveGroup}
                >
                  <LogOut size={16} />
                  Leave Group
                </button>
              </div>
            )}
          </div>
            <div className="members-section">
              <h2>Members ({groupInfo?.users?.length || 0})</h2>
              <div className="members-list">
                {groupInfo?.users?.map((userId) => (
                    <div key={userId} className="member-item">
                        <div className="member-avatar">
                            {userProfiles[userId] ? (
                                <img 
                                    src={userProfiles[userId]} 
                                    alt={userNames[userId]} 
                                    className="avatar-image"
                                />
                            ) : (
                                <div className="avatar-placeholder">
                                    {userNames[userId]?.charAt(0)?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <span className="member-name">
                            {userNames[userId] || 'Loading...'}
                            {userId === groupInfo.owner && (
                                <Crown size={16} className="owner-crown" />
                            )}
                        </span>
                    </div>
                ))}
            </div>
            </div>
  
            <div className="resources-section">
              <div className="section-header">
                <h2>Resources</h2>
                <button onClick={() => setShowResourceModal(true)} className="add-button">
                  <Plus size={16} />
                </button>
              </div>
              <div className="resources-list">
                {groupInfo?.resources?.map((resource) => (
                    <div 
                        key={resource.id} 
                        className="resource-item"
                        onClick={() => window.open(resource.url, '_blank')}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            if (resource.addedBy === user.name) {
                                setContextMenu({
                                    show: true,
                                    x: e.clientX,
                                    y: e.clientY,
                                    resourceId: resource.id,
                                });
                            }
                        }}
                    >
                        <div className="resource-icon">
                            {resource.type.includes('image') ? (
                                <Image size={20} color="#3c91e6" />
                            ) : resource.type.includes('pdf') ? (
                                <FileText size={20} color="#3c91e6" />
                            ) : (
                                <File size={20} color="#3c91e6" />
                            )}
                        </div>
                        <div className="resource-info">
                            <span className="resource-name">
                                {resource.name || 'Unnamed File'}
                            </span>
                        </div>
                    </div>
                ))}

                  {contextMenu.show && (
                      <div 
                          className="context-menu"
                          style={{ 
                              top: contextMenu.y,
                              left: contextMenu.x
                          }}
                      >
                          {contextMenu.isOwner && (
                              <button 
                                  className="context-menu-item delete-option"
                                  onClick={() => {
                                      if (window.confirm('Are you sure you want to delete this resource?')) {
                                          handleDeleteResource(contextMenu.resourceId);
                                      }
                                  }}
                              >
                                  <Trash2 size={16} />
                                  Delete
                              </button>
                          )}
                      </div>
                  )}
              </div>
                </div>
              </div>
      
              <div className="chat-main">
                <div className="chat-header">
                  <h1>{groupInfo?.name}</h1>
                </div>
  
            <div className="messages-container">
              {messages.reduce((acc, message, index) => {
                const currentDate = formatMessageDate(message.timestamp);
                const previousDate = index > 0 ? formatMessageDate(messages[index - 1].timestamp) : null;
                
                if (currentDate !== previousDate) {
                  acc.push(
                    <div key={`date-${message.id}`} className="date-separator">
                      <span>{currentDate}</span>
                    </div>
                  );
                }

                acc.push(
                  <div 
                    key={message.id} 
                    className={`message ${message.userId === user.uid ? 'own-message' : ''}`}
                  >
                    <div className="message-content">
                      <div className="message-header">
                        <span className="sender-name">{message.senderName}</span>
                        <span className="timestamp">
                          {message.timestamp?.toDate().toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {message.text && <p>{message.text}</p>}
                      {message.attachment && (
                        <div className="attachment-preview">
                          {message.attachment.type.startsWith('image/') ? (
                            <img 
                              src={message.attachment.url} 
                              alt={message.attachment.name}
                              className="attachment-image"
                            />
                          ) : (
                            <a 
                              href={message.attachment.url} 
                              download 
                              className="file-download"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FileText size={16} />
                              <span>{message.attachment.name}</span>
                              <Download size={16} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
                return acc;
              }, [])}
              <div ref={messagesEndRef} />
            </div>
  
            <form onSubmit={handleSendMessage} className="message-input">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleAttachmentChange}
                className="file-input"
                accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <div className="input-container">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button type="button" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip size={20} />
                </button>
                <button type="submit" disabled={!newMessage.trim() && !attachment}>
                    Send
                </button>
                </div>
                {attachment && (
                <div className="attachment-preview">
                    <span>{attachment.name}</span>
                    <button type="button" onClick={() => {
                    setAttachment(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    }}>
                    Remove
                    </button>
                </div>
                )}
                {uploadProgress > 0 && (
                <div className="upload-progress">
                    <div 
                    className="progress-bar" 
                    style={{width: `${uploadProgress}%`}}
                    />
                </div>
                )}
            </form>
          </div>
  
          <div className="chat-sidebar">
            <div className="events-section">
              <div className="section-header">
                <h2>Upcoming Events</h2>
                <button onClick={() => setShowEventModal(true)} className="add-button">
                  <Plus size={16} />
                </button>
              </div>
              <div className="events-list">
    {groupInfo?.events?.map((event) => (
        <div 
            key={event.id} 
            className="event-item"
            onContextMenu={(e) => {
                e.preventDefault();
                setEventContextMenu({
                    show: true,
                    x: e.clientX,
                    y: e.clientY,
                    eventId: event.id
                });
            }}
        >
            <div className="event-header">
                <Calendar size={16} />
                <span className="event-title">{event.title}</span>
            </div>
            <div className="event-time">
                <Clock size={16} />
                <span>{formatEventDateTime(event.date, event.time)}</span>
            </div>
        </div>
    ))}

            {eventContextMenu.show && (
                <div 
                    className="event-context-menu"
                    style={{ 
                        top: eventContextMenu.y,
                        left: eventContextMenu.x 
                    }}
                >
                    <button 
                        className="context-menu-item"
                        onClick={() => {
                            handleEditEvent(eventContextMenu.eventId);
                            setEventContextMenu({ show: false, x: 0, y: 0, eventId: null });
                        }}
                    >
                        <Edit size={16} />
                        Edit Date/Time
                    </button>
                    <button 
                        className="context-menu-item delete-option"
                        onClick={() => {
                            handleDeleteEvent(eventContextMenu.eventId);
                            setEventContextMenu({ show: false, x: 0, y: 0, eventId: null });
                        }}
                    >
                        <Trash2 size={16} />
                        Delete Event
                    </button>
                </div>
            )}
        </div>
            </div>
          </div>
  
          {showResourceModal && (
            <div className="modal-overlay">
                <div className="modal">
                    <h2>Add New Resource</h2>
                    <form onSubmit={handleAddResource}>
                        <input
                            type="text"
                            placeholder="Enter resource name (required)"
                            value={newResource.name}
                            onChange={(e) => {
                                const value = e.target.value.slice(0, 10);
                                setNewResource({...newResource, name: value});
                            }}
                            maxLength={10}
                            required
                        />
                        <input
                            type="file"
                            onChange={handleResourceFileChange}
                            accept="image/*,.pdf,.doc,.docx,.txt"
                            required
                        />
                        {uploadProgress > 0 && (
                            <div className="upload-progress">
                                <div 
                                    className="progress-bar" 
                                    style={{width: `${uploadProgress}%`}}
                                />
                            </div>
                        )}
                        <div className="modal-buttons">
                            <button type="button" onClick={() => setShowResourceModal(false)}>
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={!newResource.file || !newResource.name.trim()}
                            >
                                Add Resource
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
          
  
            {showEventModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Add New Event</h2>
                <form onSubmit={handleAddEvent}>
                  <input
                    type="text"
                    placeholder="Event Title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    required
                  />
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    required
                  />
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    required
                  />
                  <div className="modal-buttons">
                    <button type="button" onClick={() => setShowEventModal(false)}>
                      Cancel
                    </button>
                    <button type="submit">
                      Add Event
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </NavLayout>
    );
  };
  
  export default ChatRoom;