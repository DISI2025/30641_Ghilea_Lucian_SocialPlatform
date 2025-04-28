import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Album.css';

function Album() {
  const { userId, albumId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPhotos, setUserPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);

  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        setIsLoading(true);
        const albumRes = await fetch(`http://127.0.0.1:8000/all_fotos/${albumId}`);
        if (!albumRes.ok) throw new Error('Failed to load album');
        const albumData = await albumRes.json();
        
        setPhotos(albumData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbumData();
  }, [albumId]);

  const fetchUserPhotos = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/get_photos_by_user/${userId}`);
      if (!response.ok) throw new Error('Failed to load user photos');
      const data = await response.json();
      setUserPhotos(data.photos || []);
      setShowPhotoSelector(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const togglePhotoSelection = (photoId) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const addPhotosToAlbum = async () => {
    if (selectedPhotos.length === 0) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/album/add-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_album: parseInt(albumId),
          photo_ids: selectedPhotos
        })
      });

      if (!response.ok) throw new Error('Failed to add photos');
      
      const photosRes = await fetch(`http://127.0.0.1:8000/all_fotos/${albumId}`);
      setPhotos(await photosRes.json());
      setSelectedPhotos([]);
      setShowPhotoSelector(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const removePhotoFromAlbum = async (photoId) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/album/remove-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_album: parseInt(albumId),
          photo_ids: [photoId]
        })
      });

      if (!response.ok) throw new Error('Failed to remove photo');
      
      const photosRes = await fetch(`http://127.0.0.1:8000/all_fotos/${albumId}`);
      setPhotos(await photosRes.json());
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <div className="loading">Loading album...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="album-container">
      <div className="album-header">
        <h1>Album Photos</h1>
        <p>{photos.length} photos</p>
      </div>

      <button 
        className="add-photos-btn"
        onClick={fetchUserPhotos}
      >
        Add Existing Photos
      </button>

      {showPhotoSelector && (
        <div className="photo-selector-modal">
          <div className="modal-content">
            <h2>Select Photos to Add</h2>
            <div className="photos-grid-selector">
              {userPhotos
                .filter(photo => !photos.some(p => p.id_foto === photo.photo_id))
                .map(photo => (
                  <div 
                    key={photo.photo_id} 
                    className={`photo-select-item ${selectedPhotos.includes(photo.photo_id) ? 'selected' : ''}`}
                    onClick={() => togglePhotoSelection(photo.photo_id)}
                  >
                    <img 
                      src={`data:image/jpeg;base64,${photo.image_base64}`} 
                      alt={photo.caption} 
                    />
                    {photo.caption && <p className="photo-caption">{photo.caption}</p>}
                    {selectedPhotos.includes(photo.photo_id) && (
                      <div className="selection-check">✓</div>
                    )}
                  </div>
                ))}
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setSelectedPhotos([]);
                  setShowPhotoSelector(false);
                }}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={addPhotosToAlbum}
                disabled={selectedPhotos.length === 0}
              >
                Add {selectedPhotos.length} Photo(s)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="photos-grid">
        {photos.length > 0 ? (
          photos.map(photo => (
            <div key={photo.id_foto} className="photo-item">
              <img 
                src={`data:image/jpeg;base64,${photo.image_base64}`} 
                alt={photo.caption} 
              />
              {photo.caption && <p className="caption">{photo.caption}</p>}
              <button 
                className="remove-btn"
                onClick={() => removePhotoFromAlbum(photo.id_foto)}
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <div className="empty-album">
            <p>This album is empty</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Album;