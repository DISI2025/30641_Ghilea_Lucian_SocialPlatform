import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css'; // Reusing the same CSS for consistency

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const defaultAvatar = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

 useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        if (activeTab === 'posts') {
          const postsResponse = await fetch('http://127.0.0.1:8000/allposts');
          if (!postsResponse.ok) throw new Error('Failed to fetch posts');
          const postsData = await postsResponse.json();
          setPosts(postsData);
        } 
        else if (activeTab === 'accounts') {
          const accountsResponse = await fetch('http://127.0.0.1:8000/notValidatedAccounts');
          if (!accountsResponse.ok) throw new Error('Failed to fetch accounts');
          const accountsData = await accountsResponse.json();
          setAccounts(accountsData);
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab} data:`, error);
        // Setează array-uri goale în caz de eroare
        if (activeTab === 'posts') setPosts([]);
        if (activeTab === 'accounts') setAccounts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleBlockPost = async (postId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/posts/${postId}/block`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setPosts(posts.map(post => 
          post.id_foto === postId ? { ...post, status: 'inappropriate' } : post
        ));
      }
    } catch (error) {
      console.error('Error blocking post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/posts/${postId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setPosts(posts.filter(post => post.id_foto !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleValidateAccount = async (userId, validate) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/validateAccount/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validate })
      });
      
      if (response.ok) {
        setAccounts(accounts.filter(account => account.id_user !== userId));
      }
    } catch (error) {
      console.error('Error validating account:', error);
    }
  };

  if (isLoading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Admin Dashboard</h1>
        <p className="username">Administration Panel</p>
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
            className={activeTab === 'accounts' ? 'active' : ''}
            onClick={() => setActiveTab('accounts')}
          >
            Accounts
          </button>
          <button 
            className={activeTab === 'other' ? 'active' : ''}
            onClick={() => setActiveTab('other')}
          >
            Other
          </button>
        </div>
        
        {activeTab === 'posts' && (
          <div className="feed-container">
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <div key={index} className="feed-post">
                  <div className="post-header">
                    <img 
                      src={post.id_poza_profil ? `data:image/jpeg;base64,${post.id_poza_profil}` : defaultAvatar}
                      alt={`${post.prenume} ${post.nume}`}
                      className="post-avatar"
                      onError={(e) => {
                        e.target.src = defaultAvatar;
                      }}
                    />
                    <div className="post-user-info">
                      <h4>{post.prenume} {post.nume}</h4>
                      <span className="post-time">
                        {new Date(post.created_at).toLocaleDateString('ro-RO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {post.caption && (
                    <p className="post-caption">{post.caption}</p>
                  )}
                  
                  <div className="post-image-container">
                    <img 
                      src={`data:image/jpeg;base64,${post.image_base64}`}
                      alt={post.caption || 'Post image'}
                      className="post-image"
                      style={post.status === 'inappropriate' ? { filter: 'blur(15px)' } : {}}
                    />
                    {post.status === 'inappropriate' && (
                      <div className="blocked-content-message">
                        <p>This content has been blocked</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="post-actions">
                    {post.status !== 'inappropriate' && (
                      <button 
                        className="block-btn"
                        onClick={() => handleBlockPost(post.id_foto)}
                      >
                        Block Post
                      </button>
                    )}
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeletePost(post.id_foto)}
                    >
                      Delete Post
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-feed">
                <p>No posts to display</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'accounts' && (
          <div className="accounts-container">
            {accounts.length > 0 ? (
              <div className="accounts-list">
                {accounts.map(account => (
                  <div key={account.id_user} className="account-card">
                    <div className="account-info">
                      <img 
                        src={account.poza_profil_base64 ? 
                          `data:image/jpeg;base64,${account.poza_profil_base64}` : 
                          defaultAvatar}
                        alt={`${account.prenume} ${account.nume}`}
                        className="account-avatar"
                        onError={(e) => {
                          e.target.src = defaultAvatar;
                        }}
                      />
                      <div className="account-details">
                        <h3>{account.prenume} {account.nume}</h3>
                        <p>{account.email}</p>
                        <button 
                          className="view-profile-btn"
                          onClick={() => navigate(`/profile/${account.id_user}`)}
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                    <div className="account-actions">
                      <button 
                        className="validate-btn"
                        onClick={() => handleValidateAccount(account.id_user, true)}
                      >
                        Validate
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => handleValidateAccount(account.id_user, false)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-accounts">
                <p>No accounts to validate</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'other' && (
          <div className="not-implemented">
            <h2>Not Implemented Yet</h2>
            <p>This section is under development.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;