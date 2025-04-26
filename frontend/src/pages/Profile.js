import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const { userId } = useParams();
  const currentUserId = localStorage.getItem('currentUserId');
  const isCurrentUser = userId;
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [feed, setFeed] = useState([]);
  const [photos, setPhotos] = useState([]); 
  const [activeTab, setActiveTab] = useState('feed'); 
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [friendsCount, setFriendsCount] = useState(0);
  const [photosCount, setPhotosCount] = useState(0);
  const [albums, setAlbums] = useState([]);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [showCreateAlbumForm, setShowCreateAlbumForm] = useState(false);

  // Default images
  const defaultAvatar = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
  const defaultPostImage = 'https://cdn.pixabay.com/photo/2017/11/10/05/24/add-2935429_960_720.png';
  const defaultAlbumCover = 'https://cdn.pixabay.com/photo/2017/03/30/17/42/album-2188987_960_720.png';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/profile/${userId}`);
        if (!response.ok) throw new Error('Profile not found');
        const data = await response.json();
        setProfile(data);
        setIsFollowing(data.isFollowing || false);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchFeed = async () => {
      const response = await fetch(`http://127.0.0.1:8000/profile/${userId}/feed`);
      const data = await response.json();
      setFeed(data);
    };

    const fetchPhotos = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/get_photos_by_user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch photos');
        const data = await response.json();
        setPhotos(data.photos || []);
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };

    const fetchFriendsCount = async () => {
      try {
        const response = await fetch(`http://localhost:8000/getfriends/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch friends');
        const data = await response.json();
        setFriendsCount(data.length);
      } catch (error) {
        console.error('Error fetching friends count:', error);
      }
    };

    const fetchPhotosCount = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/get_photos_by_user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch photos');
        const data = await response.json();
        setPhotosCount(data.photos ? data.photos.length : 0);
      } catch (error) {
        console.error('Error fetching photos count:', error);
      }
    };

    const fetchAlbums = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/user_albums/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch albums');
        const data = await response.json();
        setAlbums(data);
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };
    
    fetchPhotosCount(); 
    fetchFriendsCount();
    fetchProfile();
    fetchFeed();
    fetchPhotos();
    fetchAlbums();
  }, [userId]);

  const handleFollow = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/profile/${userId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const openModal = (photo) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateAlbum = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/albums/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_user: userId,
          nume: newAlbumName,
          vizibilitate: 'public' // Default visibility, can be made configurable
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh albums list
        const albumsResponse = await fetch(`http://127.0.0.1:8000/user_albums/${userId}`);
        const albumsData = await albumsResponse.json();
        setAlbums(albumsData);
        
        setNewAlbumName('');
        setShowCreateAlbumForm(false);
      }
    } catch (error) {
      console.error('Error creating album:', error);
    }
  };

  if (isLoading) return <div className="loading">Loading profile...</div>;
  if (!profile) return <div className="error">Profile not found</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <img 
            src={profile.avatar || defaultAvatar} 
            alt={profile.name}
            onError={(e) => {
              e.target.src = defaultAvatar;
            }}
          />
        </div>
        
        <div className="profile-info">
          <h1>{profile.name}</h1>
          <p className="username">@{profile.nume} {profile.prenume}</p>
          <p className="bio">{profile.bio || 'No bio yet'}</p>
          
          <div className="profile-stats">
            <div>
              <strong>{photosCount}</strong>
              <span>Photos</span>
            </div>
            <div onClick={() => navigate(`/friends/${userId}`)} style={{cursor: 'pointer'}}>
              <strong>{friendsCount}</strong>
              <span>Friends</span>
            </div>
            <div onClick={() => setActiveTab('albums')} style={{cursor: 'pointer'}}>
              <strong>{albums.length}</strong>
              <span>Albums</span>
            </div>
          </div>
          
          {isCurrentUser ? (
            <div className="profile-actions">
              <Link to={`/create-post/${userId}`} className="create-post-btn">
                Create Post
              </Link>
              <Link to={`/edit-profile/${userId}`} className="edit-profile-btn">
                Edit Profile
              </Link>
              <Link to={`/friends/${userId}`} className="friends-btn">
                Friends
              </Link>
            </div>
          ) : (
            <button 
              onClick={handleFollow}
              className={`follow-btn ${isFollowing ? 'following' : ''}`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-nav">
          <button 
            className={activeTab === 'feed' ? 'active' : ''}
            onClick={() => setActiveTab('feed')}
          >
            Feed
          </button>
          <button 
            className={activeTab === 'photos' ? 'active' : ''}
            onClick={() => setActiveTab('photos')}
          >
            Photos
          </button>
          <button 
            className={activeTab === 'albums' ? 'active' : ''}
            onClick={() => setActiveTab('albums')}
          >
            Albums
          </button>
        </div>
        
        {activeTab === 'feed' && (
          <div className="feed-grid">
            {feed.length > 0 ? (
              feed.map(post => (
                <div key={post.id} className="post-thumbnail">
                  <img 
                    src={post.image || defaultPostImage} 
                    alt={`Post by ${profile.name}`}
                    onError={(e) => {
                      e.target.src = defaultPostImage;
                    }}
                  />
                  <div className="post-overlay">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-feed">
                <p>Not implemented yet</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'photos' && (
          <div className="photos-grid">
            {photos.length > 0 ? (
              photos.map(photo => (
                <div 
                  key={photo.photo_id} 
                  className="photo-thumbnail"
                  onClick={() => openModal(photo)}
                >
                  <img 
                    src={`data:image/jpeg;base64,${photo.image_base64}`} 
                    alt={photo.caption || 'User photo'}
                  />
                  <div className="photo-overlay">
                    <p>{photo.caption || ''}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-photos">
                <p>No photos yet</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'albums' && (
          <div className="albums-content">
            {isCurrentUser && (
              <div className="album-actions">
                <button 
                  onClick={() => setShowCreateAlbumForm(!showCreateAlbumForm)}
                  className="create-album-btn"
                >
                  {showCreateAlbumForm ? 'Cancel' : 'Create Album'}
                </button>
                
                {showCreateAlbumForm && (
                  <div className="create-album-form">
                    <input
                      type="text"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      placeholder="Album name"
                    />
                    <button onClick={handleCreateAlbum}>Create</button>
                  </div>
                )}
              </div>
            )}
            
            {albums.length > 0 ? (
              <div className="albums-grid">
                {albums.map(album => (
                  <div 
                    key={album.id} 
                    className="album-thumbnail"
                    onClick={() => navigate(`/${userId}/album/${album.id}`)}
                  >
                    <img 
                      src={defaultAlbumCover} 
                      alt={album.nume}
                      onError={(e) => {
                        e.target.src = defaultAlbumCover;
                      }}
                    />
                    <div className="album-info">
                      <h3>{album.nume}</h3>
                      <p>{album.foto_count} photos</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-albums">
                <p>No albums yet</p>
              </div>
            )}
          </div>
        )}

        {isModalOpen && selectedPhoto && (
          <div className="photo-modal" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="close-modal" onClick={closeModal}>
                &times;
              </button>
              <img 
                src={`data:image/jpeg;base64,${selectedPhoto.image_base64}`} 
                alt={selectedPhoto.caption || 'Enlarged photo'}
                className="enlarged-photo"
              />
              {selectedPhoto.caption && (
                <div className="photo-caption">
                  <p>{selectedPhoto.caption}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;