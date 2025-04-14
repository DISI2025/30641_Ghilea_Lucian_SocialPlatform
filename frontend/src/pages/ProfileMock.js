import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Profile.css'; // Reuse the same CSS

function ProfileMock() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Mock profile data
    const mockProfile = {
      id: "mock-user",
      name: "Alexandra Popescu",
      username: "alex_popescu",
      bio: "Designer & fotograf amator ✨| București | Fotografii mele: #alexphotos",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      postsCount: 24,
      followersCount: 356,
      followingCount: 128,
      isCurrentUser: false
    };

    // Mock posts data
    const mockPosts = [
      { id: 1, image: "https://picsum.photos/id/10/500/500", likes: 124, comments: 8 },
      { id: 2, image: "https://picsum.photos/id/11/500/500", likes: 89, comments: 5 },
      { id: 3, image: "https://picsum.photos/id/12/500/500", likes: 201, comments: 12 },
      { id: 4, image: "https://picsum.photos/id/13/500/500", likes: 56, comments: 3 },
      { id: 5, image: "https://picsum.photos/id/14/500/500", likes: 178, comments: 9 },
      { id: 6, image: "https://picsum.photos/id/15/500/500", likes: 92, comments: 6 }
    ];

    // Simulate loading
    setTimeout(() => {
      setProfile(mockProfile);
      setPosts(mockPosts);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // Update mock counter
    setProfile(prev => ({
      ...prev,
      followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
    }));
  };

  if (isLoading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={profile.avatar} alt={profile.name} />
        </div>
        
        <div className="profile-info">
          <h1>{profile.name}</h1>
          <p className="username">@{profile.username}</p>
          <p className="bio">{profile.bio}</p>
          
          <div className="profile-stats">
            <div>
              <strong>{profile.postsCount}</strong>
              <span>Posts</span>
            </div>
            <div>
              <strong>{profile.followersCount}</strong>
              <span>Followers</span>
            </div>
            <div>
              <strong>{profile.followingCount}</strong>
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
          {posts.map(post => (
            <div key={post.id} className="post-thumbnail">
              <img src={post.image} alt={`Post by ${profile.name}`} />
              <div className="post-overlay">
                <span>❤️ {post.likes}</span>
                <span>💬 {post.comments}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProfileMock;