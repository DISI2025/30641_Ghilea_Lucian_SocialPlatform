import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Fetch profile data
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}`);
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

    // Fetch user posts
    const fetchPosts = async () => {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/posts`);
      const data = await response.json();
      setPosts(data);
    };

    fetchProfile();
    fetchPosts();
  }, [userId]);

  const handleFollow = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/follow`, {
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

  if (isLoading) return <div className="loading">Loading profile...</div>;
  if (!profile) return <div className="error">Profile not found</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={profile.avatar || '/default-avatar.jpg'} alt={profile.name} />
        </div>
        
        <div className="profile-info">
          <h1>{profile.name}</h1>
          <p className="username">@{profile.username}</p>
          <p className="bio">{profile.bio || 'No bio yet'}</p>
          
          <div className="profile-stats">
            <div>
              <strong>{profile.postsCount || 0}</strong>
              <span>Posts</span>
            </div>
            <div>
              <strong>{profile.followersCount || 0}</strong>
              <span>Followers</span>
            </div>
            <div>
              <strong>{profile.followingCount || 0}</strong>
              <span>Following</span>
            </div>
          </div>
          
          <button 
            onClick={handleFollow}
            className={`follow-btn ${isFollowing ? 'following' : ''}`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-nav">
          <button className="active">Posts</button>
          <button>Photos</button>
          <button>Saved</button>
        </div>
        
        <div className="posts-grid">
          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className="post-thumbnail">
                <img src={post.image} alt={`Post by ${profile.name}`} />
                <div className="post-overlay">
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-posts">
              <p>No posts yet</p>
              {profile.isCurrentUser && (
                <Link to="/create-post" className="create-post-btn">
                  Create your first post
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;