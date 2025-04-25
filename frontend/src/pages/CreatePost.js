// src/components/CreatePost.js
import { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import './CreatePost.css';

function CreatePost() {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl('');
    fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aici vei adăuga logica pentru upload
    console.log({ image, caption });
    // Reset form after submission
    setCaption('');
    removeImage();
  };

  return (
    <div className="create-post-container">
      <div className="create-post-card">
        <h2 className="create-post-title">Create New Post</h2>
        
        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="image-upload-section">
            {previewUrl ? (
              <div className="image-preview-container">
                <img src={previewUrl} alt="Preview" className="image-preview" />
                <button 
                  type="button" 
                  onClick={removeImage}
                  className="remove-image-btn"
                >
                  <FiX />
                </button>
              </div>
            ) : (
              <div 
                className="upload-placeholder"
                onClick={() => fileInputRef.current.click()}
              >
                <FiImage className="upload-icon" />
                <p>Select an image to upload</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </div>
            )}
          </div>

          <div className="caption-section">
            <textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="caption-input"
              rows="4"
            />
          </div>

          <div className="action-buttons">
            <button 
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="upload-btn"
              disabled={!previewUrl}
            >
              <FiUpload /> Change Image
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={!image}
            >
              Share Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;