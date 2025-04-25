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
  const [posts, setPosts] = useState([]);
  const [photos, setPhotos] = useState([]); 
  const [activeTab, setActiveTab] = useState('posts'); 
  const [selectedPhoto, setSelectedPhoto] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Poze default
  const defaultAvatar = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
  const defaultPostImage = 'https://cdn.pixabay.com/photo/2017/11/10/05/24/add-2935429_960_720.png';

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

    const fetchPosts = async () => {
      const response = await fetch(`http://127.0.0.1:8000/profile/${userId}/posts`);
      const data = await response.json();
      setPosts(data);
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

    fetchProfile();
    fetchPosts();
    fetchPhotos(); 
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
              <strong>{profile.postsCount || 0}</strong>
              <span>Posts</span>
            </div>
            <div onClick={() => navigate(`/friends/${userId}`)} style={{cursor: 'pointer'}}>
              <strong>{profile.followersCount || 0}</strong>
              <span>Friends</span>
            </div>
          </div>
          
          {isCurrentUser ? (
            <div className="profile-actions">
              <Link to={`/create-post/${userId}`} className="create-post-btn">
                Create Post
              </Link>
              <Link to="/edit-profile" className="edit-profile-btn">
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
            className={activeTab === 'posts' ? 'active' : ''}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button 
            className={activeTab === 'photos' ? 'active' : ''}
            onClick={() => setActiveTab('photos')}
          >
            Photos
          </button>
          <button 
            className={activeTab === 'saved' ? 'active' : ''}
            onClick={() => setActiveTab('saved')}
          >
            Saved
          </button>
        </div>
        
        {activeTab === 'posts' && (
          <div className="posts-grid">
            {posts.length > 0 ? (
              posts.map(post => (
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
              <div className="no-posts">
                <p>No posts yet</p>
                {true && (
                  <Link to={`/create-post/${userId}`} className="create-post-btn large">
                    <i className="fas fa-plus"></i> Create your first post
                  </Link>
                )}
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
        
        {activeTab === 'saved' && (
          <div className="saved-content">
            <p>Saved content will appear here</p>
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