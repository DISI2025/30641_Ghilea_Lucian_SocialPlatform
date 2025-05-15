import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Manager.css';

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
          console.log(postsData)
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

const handleBlockPost = async (id_foto) => {  // Schimbă parametrul din postId în id_foto
  if (!window.confirm('Sigur doriți să blocați această postare?')) {
    return;
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/markInappropriate/${id_foto}/${userId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Body gol conform endpoint-ului
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Eroare la blocarea postării');
    }

    // Actualizează starea folosind id_foto
    setPosts(posts.map(post => 
      post.id_foto === id_foto ? { ...post, status: 'inappropriate' } : post
    ));

    alert('Postarea a fost blocată cu succes!');
  } catch (error) {
    console.error('Eroare la blocare:', error);
    alert(`Eroare: ${error.message}`);
  }
};

const handleDeletePost = async (id_foto) => {
  if (!window.confirm('Sigur doriți să ștergeți această postare? Acțiunea este permanentă!')) {
    return;
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/deleteByModerator/${id_foto}`,
      {
        method: 'PUT', // Conform endpoint-ului din backend
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Eroare la ștergerea postării');
    }

    // Actualizăm starea eliminând postarea ștearsă
    setPosts(posts.filter(post => post.id_foto !== id_foto));
    
    alert('Postarea a fost ștearsă cu succes!');
  } catch (error) {
    console.error('Eroare la ștergere:', error);
    alert(`Eroare: ${error.message}`);
  }
};

// Account validation function
const handleValidateAccount = async (userIdToValidate) => {
  if (!window.confirm('Are you sure you want to validate this account?')) {
    return;
  }

  try {
    // Send moderator_id as a query parameter
    const response = await fetch(
      `http://127.0.0.1:8000/validate-user/${userIdToValidate}?moderator_id=${parseInt(userId)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error validating account');
    }

    // Update UI
    setAccounts(accounts.filter(account => account.id_user !== userIdToValidate));
    alert('Account validated successfully!');
  } catch (error) {
    console.error('Validation error:', error);
    alert(error.message || 'Error validating account');
  }
};

  const handleDeleteAccount = async (userIdToDelete) => {
  if (!window.confirm('Sigur doriți să ștergeți acest cont? Acțiunea este permanentă!')) {
    return;
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/delete-user/${userIdToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        moderator_id: parseInt(userId)  // Ensure it's sent as integer
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Eroare la ștergerea contului');
    }

    // Update UI
    setSearchResults(searchResults.filter(user => user.id !== userIdToDelete));
    setAccounts(accounts.filter(account => account.id_user !== userIdToDelete));
    alert('Contul a fost șters cu succes!');
    
  } catch (error) {
    console.error('Eroare la ștergerea contului:', error);
    alert(error.message || 'Eroare la ștergerea contului');
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
                        <p className="account-status">
                          Status: {account.is_validated ? 'Validated' : 'Pending'}
                        </p>
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
                        onClick={() => handleValidateAccount(account.id_user)}
                      >
                        Validate
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => handleDeleteAccount(account.id_user)}
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