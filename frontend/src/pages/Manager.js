import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Profile.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('posts');
  const { userId } = useParams();
  const [posts, setPosts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const navigate = useNavigate();

  const defaultAvatar = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

  // Fetch data based on active tab
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
        if (activeTab === 'posts') setPosts([]);
        if (activeTab === 'accounts') setAccounts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Post management functions
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

  // Account validation functions
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

  const handleDeleteAccount = async (userIdToDelete) => {
    if (!window.confirm('Are you sure you want to permanently delete this account?')) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/delete-user/${userIdToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ moderator_id: userId })
      });

      if (response.ok) {
        // Remove from search results if in search tab
        setSearchResults(searchResults.filter(user => user.id !== userIdToDelete));
        // Remove from accounts list if in accounts tab
        setAccounts(accounts.filter(account => account.id_user !== userIdToDelete));
        alert('Account deleted successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account');
    }
  };

  // User search functions
  const handleSearchUsers = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearchLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/users/id_moderator/${userId}/${encodeURIComponent(searchTerm)}`
      );
    
      if (!response.ok) throw new Error('Failed to search users');
      const data = await response.json();
      
      const formattedResults = data.map(user => ({
        id: user.id_user,
        name: `${user.prenume || ''} ${user.nume || ''}`.trim(),
        username: user.email ? user.email.split('@')[0] : `user_${user.id_user}`,
        email: user.email || '',
        avatar: `https://ui-avatars.com/api/?name=${user.prenume || ''}+${user.nume || ''}&background=random`
      }));
      
      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearchLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchUsers();
    }
  };

  // Loading state
  if (isLoading && activeTab !== 'other') {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

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
            User Search
          </button>
        </div>
        
        {/* Posts Tab */}
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
                      onError={(e) => e.target.src = defaultAvatar}
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
                  
                  {post.caption && <p className="post-caption">{post.caption}</p>}
                  
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
        
        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="accounts-container">
            {accounts.length > 0 ? (
              <div className="accounts-list">
                {accounts.map(account => (
                  <div key={account.id_user} className="account-card">
                    <div className="account-info">
                      <img 
                        src={account.poza_profil_base64 
                          ? `data:image/jpeg;base64,${account.poza_profil_base64}` 
                          : defaultAvatar}
                        alt={`${account.prenume} ${account.nume}`}
                        className="account-avatar"
                        onError={(e) => e.target.src = defaultAvatar}
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
        
        {/* User Search Tab */}
        {activeTab === 'other' && (
          <div className="search-tab">
            <div className="search-container">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                placeholder="Search users by name or email..."
                className="search-input"
              />
              <button 
                onClick={handleSearchUsers}
                className="search-button"
                disabled={isSearchLoading}
              >
                {isSearchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {isSearchLoading ? (
              <div className="loading">Searching users...</div>
            ) : searchResults.length > 0 ? (
              <div className="search-results">
                {searchResults.map((user) => (
                  <div key={user.id} className="user-result">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="result-avatar"
                      onError={(e) => e.target.src = defaultAvatar}
                    />
                    <div className="user-info">
                      <h3>{user.name}</h3>
                      <p>{user.email}</p>
                    </div>
                    <div className="user-actions">
                      <button
                        onClick={() => navigate(`/profile/${user.id}`)}
                        className="view-profile-btn"
                      >
                        View Profile
                      </button>
                      <button
                  onClick={() => handleDeleteAccount(user.id)}
                  className="delete-account-btn"
                >
                  Delete Account
                </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                {searchTerm ? 'No users found' : 'Enter a search term to find users'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;