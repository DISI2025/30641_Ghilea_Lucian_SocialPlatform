import { useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import './CreatePost.css';

function CreatePost() {
  const { userId } = useParams();
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image) {
      alert('Please select an image first');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('id_user', userId);
      formData.append('caption', caption);
      formData.append('status', 'public');
      formData.append('image_file', image); // Folosim 'image_file' pentru a se potrivi cu backend-ul

      // Trimitem ca FormData în loc de JSON
      const response = await fetch('http://localhost:8000/upload_photo/', {
        method: 'POST',
        body: formData,
        // Nu este nevoie de headers['Content-Type'] pentru FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const result = await response.json();
      console.log('Upload success:', result);
      alert('Photo uploaded successfully!');
      
      // Resetăm formularul după încărcare
      setCaption('');
      removeImage();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
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
              disabled={!previewUrl || isUploading}
            >
              <FiUpload /> Change Image
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={!image || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Share Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;