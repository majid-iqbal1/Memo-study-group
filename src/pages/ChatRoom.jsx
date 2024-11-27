import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  doc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, 
  getDoc, updateDoc, arrayUnion 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useUser } from '../UserContext';
import { MessageCircle, FileText, Calendar, Clock, Paperclip, Download, Plus } from 'lucide-react';
import NavLayout from '../components/NavLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/chatroom.css';

const ChatRoom = () => {
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
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const resourceFileInputRef = useRef(null);

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
  }, [groupId]);

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
    if (!newResource.file) return;
  
    try {
      setUploadProgress(0);
      const groupRef = doc(db, "group-database", groupId);
      const groupSnapshot = await getDoc(groupRef);
      
      if (!groupSnapshot.exists()) {
        throw new Error('Group not found');
      }
  
      const currentData = groupSnapshot.data();
      const currentResources = currentData.group.resources || [];
  
      // Upload file
      const storageRef = ref(storage, `resources/${groupId}/${Date.now()}-${newResource.file.name}`);
      const uploadTask = await uploadBytes(storageRef, newResource.file);
      const downloadURL = await getDownloadURL(uploadTask.ref);
  
      const newResourceData = {
        id: Date.now().toString(),
        name: newResource.name || newResource.file.name,
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
      console.log('Resource added successfully');
      
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
          name: file.name
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
  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (loading) return <NavLayout><LoadingSpinner /></NavLayout>;
  if (!groupInfo) return <NavLayout><div className="error-message">Group not found</div></NavLayout>;

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
  
    return (
      <NavLayout>
        <div className="chat-container">
          <div className="chat-sidebar">
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
                      {userId === groupInfo.owner && ' (Owner)'}
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
                  <a 
                    href={resource.url} 
                    key={resource.id} 
                    className="resource-item"
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <FileText size={18} />
                    <span>{resource.name}</span>
                    <Download size={16} className="download-icon" />
                  </a>
                ))}
              </div>
            </div>
          </div>
  
          <div className="chat-main">
            <div className="chat-header">
              <h1>{groupInfo?.name}</h1>
            </div>
  
            <div className="messages-container">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.userId === user.uid ? 'own-message' : ''}`}
                >
                  <div className="message-content">
                    <div className="message-header">
                      <span className="sender-name">{message.senderName}</span>
                      <span className="timestamp">
                        {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {message.text && <p>{message.text}</p>}
                    {message.attachment && (
                      <div className="attachment-preview">
                        {message.attachment.type.startsWith('image/') ? (
                          <img src={message.attachment.url} alt={message.attachment.name} />
                        ) : (
                          <a href={message.attachment.url} download className="file-download">
                            <FileText size={16} />
                            <span>{message.attachment.name}</span>
                            <Download size={16} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
                <div key={event.id} className="event-item">
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
                    placeholder="Resource Name (optional)"
                    value={newResource.name}
                    onChange={(e) => setNewResource({...newResource, name: e.target.value})}
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
                    <button type="submit" disabled={!newResource.file}>
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