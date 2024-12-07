import React, { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { serverTimestamp, setDoc, doc} from "firebase/firestore";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../firebase";
import { useUser } from "../UserContext";
import NavLayout from "../components/NavLayout";
import "../styles/create-group.css";

import { v4 as uuidv4 } from 'uuid';

const CreateGroup = () => {
  const [groupData, setGroupData] = useState({
    id: "",
    name: "",
    description: "",
    meetingDays: "",
    meetingTime: "",
    topics: "",
    privacy: "public",
    groupImage: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // File type validation
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      // File size validation (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB");
        return;
      }

      try {
        // Create temporary preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setGroupData((prev) => ({
            ...prev,
            groupImage: file,
            imagePreview: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error handling image:", error);
        alert("Error handling image. Please try again.");
      }
    }
  };

  const handleRemoveImage = () => {
    // Revoke the object URL to avoid memory leaks
    if (groupData.imagePreview) {
      URL.revokeObjectURL(groupData.imagePreview);
    }

    setGroupData((prev) => ({
      ...prev,
      groupImage: null,
      imagePreview: null,
    }));

    // Reset the file input
    const fileInput = document.getElementById("groupImage");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!groupData.name.trim() || !groupData.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;
      let groupId = uuidv4();
      

      // Upload image if selected
      if (groupData.groupImage) {
        try {
          const imageRef = ref(
            storage,
            `groupImages/${groupId}/${Date.now()}-${groupData.groupImage.name}`
          );
          console.log("This is the group id" +  groupData.id);

          // Upload the image
          const snapshot = await uploadBytes(imageRef, groupData.groupImage);

          // Get the download URL
          imageUrl = await getDownloadURL(snapshot.ref);

          console.log("Image uploaded successfully:", imageUrl);
        } catch (error) {
          console.error("Error uploading image:", error);
          alert('Failed to upload image, but will create group without image.');
        }
      }

      // Create group document
      const groupDoc = {
        group: {
          id: groupId,
          name: groupData.name.trim(),
          description: groupData.description.trim(),
          meetingDays: groupData.meetingDays.trim(),
          meetingTime: groupData.meetingTime.trim(),
          topics: groupData.topics
            ? groupData.topics
                .split(",")
                .map((topic) => topic.trim())
                .filter((topic) => topic)
            : [],
          privacy: groupData.privacy,
          groupImage: imageUrl,
          owner: user.uid || "Anonymous",
          users: [user.uid],
          events: [], 
          resources: [], 
          memberCount: 1
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: {
          userId: user.uid,
          name: user.name || "Anonymous",
        },
        
      };

      // Add to Firestore
      await setDoc(doc(db, "group-database", groupDoc.group.id), groupDoc);

      // Navigate to the group page or groups list
      navigate("/join");
    } catch (error) {
      console.error("Error creating study group:", error);
      alert("Failed to create study group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
};

  return (
    <NavLayout>
      <div className="create-group-container">
        <h1>Create a Study Group</h1>
        <p className="subtitle">
          Fill in the details below to create your study group
        </p>

        <form onSubmit={handleSubmit} className="group-form">
          <div className="form-card">
            <div className="group-profile">
              <h3>Group Profile</h3>
              <div className="image-upload">
                <div className="image-upload-container">
                  <label htmlFor="groupImage" className="upload-circle">
                    {!groupData.imagePreview && (
                      <>
                        <span className="plus-icon">+</span>
                        <span className="upload-text"></span>
                      </>
                    )}
                    {groupData.imagePreview && (
                      <img
                        src={groupData.imagePreview}
                        alt="Group"
                        className="preview-image"
                      />
                    )}
                  </label>
                  {groupData.imagePreview && (
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveImage();
                      }}
                    >
                      <X size={16} /> Remove Image
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  id="groupImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                {!groupData.imagePreview && (
                  <p className="upload-hint">Click to upload a group picture</p>
                )}
              </div>
              <div className="basic-info">
                <h2>Basic Information</h2>
                <input
                  type="text"
                  name="name"
                  placeholder="Group Name *"
                  value={groupData.name}
                  onChange={handleInputChange}
                  required
                />
                <textarea
                  name="description"
                  placeholder="Description *"
                  value={groupData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="meeting-schedule">
                <h2>Meeting Schedule</h2>
                <div className="two-columns">
                  <input
                    type="text"
                    name="meetingDays"
                    placeholder="Meeting Days"
                    value={groupData.meetingDays}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="meetingTime"
                    placeholder="Meeting Time"
                    value={groupData.meetingTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="topics-section">
                <h2>Topics</h2>
                <input
                  type="text"
                  name="topics"
                  placeholder="Add Topics (separated by commas)"
                  value={groupData.topics}
                  onChange={handleInputChange}
                />
              </div>

              <div className="privacy-settings">
                <h2>Privacy Settings</h2>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="privacy"
                      value="public"
                      checked={groupData.privacy === "public"}
                      onChange={handleInputChange}
                    />
                    Public Group
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="privacy"
                      value="private"
                      checked={groupData.privacy === "private"}
                      onChange={handleInputChange}
                    />
                    Private Group (Invite Only)
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="create-group-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Group..." : "Create Group"}
            </button>

            <p className="required-fields">* Required fields</p>
          </div>
        </form>
      </div>
    </NavLayout>
  );
};

export default CreateGroup;
