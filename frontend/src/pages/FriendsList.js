import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './FriendsList.css';

function FriendsList() {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('friends');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { userId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch friends list
        const friendsResponse = await fetch(`http://localhost:8000/getfriends/${userId}`);
        if (!friendsResponse.ok) throw new Error('Failed to fetch friends');
        const friendsData = await friendsResponse.json();
        
        // Transform friends data with proper error checking
        const formattedFriends = friendsData.map(friend => ({
          id: friend.id_user,
          name: `${friend.prenume || ''} ${friend.nume || ''}`.trim(),
          username: friend.email ? friend.email.split('@')[0] : `user_${friend.id_user}`,
          email: friend.email || '',
          avatar: `https://ui-avatars.com/api/?name=${friend.prenume || ''}+${friend.nume || ''}&background=random`,
          mutualFriends: Math.floor(Math.random() * 15) + 1
        }));
        
        setFriends(formattedFriends);

        // Fetch pending requests
        const pendingResponse = await fetch(`http://localhost:8000/get_idling_friendrequest/${userId}`);
        if (!pendingResponse.ok) throw new Error('Failed to fetch pending requests');
        const pendingData = await pendingResponse.json();
        
        // Transform pending requests data with proper error checking
        const formattedPending = pendingData.map(request => ({
          id: request.id_sender || request.id, // Use whichever field exists
          name: request.nume  || `User ${request.id_sender || request.id}`,
          username: request.prenume || `user_${request.id_sender || request.id}`,
          email: request.email || '',
          avatar: request.avatar || `https://ui-avatars.com/api/?name=User+${request.id_sender || request.id}&background=random`
        }));
        
        setPendingRequests(formattedPending);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set empty arrays if there's an error
        setFriends([]);
        setPendingRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleSearchUsers = async () => {
    if (!userSearchTerm.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/search_users?email=${userSearchTerm}`);
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
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendFriendRequest = async (receiverEmail) => {
    try {
      const response = await fetch(`http://localhost:8000/send_friend_request/${userId}/${receiverEmail}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('Cerere de prietenie trimisă cu succes!');
        // Clear search results
        setSearchResults([]);
        setUserSearchTerm('');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Eroare la trimiterea cererii de prietenie');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('A apărut o eroare la trimiterea cererii de prietenie');
    }
  };

  const handleAcceptRequest = async (senderId) => {
    try {
      const response = await fetch(`http://localhost:8000/accept_friendrequest/${userId}/${senderId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Update the pending requests list
        setPendingRequests(prev => prev.filter(req => req.id !== senderId));
        // Optionally refresh friends list
        const refreshedResponse = await fetch(`http://localhost:8000/getfriends/${userId}`);
        if (refreshedResponse.ok) {
          const refreshedData = await refreshedResponse.json();
          const formattedFriends = refreshedData.map(friend => ({
            id: friend.id_user,
            name: `${friend.prenume || ''} ${friend.nume || ''}`.trim(),
            username: friend.email ? friend.email.split('@')[0] : `user_${friend.id_user}`,
            email: friend.email || '',
            avatar: `https://ui-avatars.com/api/?name=${friend.prenume || ''}+${friend.nume || ''}&background=random`,
            mutualFriends: Math.floor(Math.random() * 15) + 1
          }));
          setFriends(formattedFriends);
        }
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleDeclineRequest = async (senderId) => {
    try {
      const response = await fetch(`http://localhost:8000/decline_friendrequest/${userId}/${senderId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Update the pending requests list
        setPendingRequests(prev => prev.filter(req => req.id !== senderId));
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPending = pendingRequests.filter(request =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="friends-loading">
        <div className="spinner"></div>
        <p>Se încarcă lista de prieteni...</p>
      </div>
    );
  }

  return (
    <div className="friends-container">
      <div className="friends-header">
        <h1>Prieteni</h1>
        <div className="friends-search">
          <input
            type="text"
            placeholder="Caută prieteni..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
      </div>

      {/* Add Friend Section */}
      <div className="add-friend-section">
        <h2>Adaugă prieten</h2>
        <div className="add-friend-search">
          <input
            type="text"
            placeholder="Caută utilizatori după email"
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
          />
          <button 
                  onClick={() => handleSendFriendRequest(userSearchTerm)}
                  className="send-request-btn"
                >
                  Trimite cerere de prietenie
                </button>
        </div>
        
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map(user => (
              <div key={user.id} className="user-result">
                <div className="user-info">
                  <img src={user.avatar} alt={user.name} className="user-avatar" />
                  <div>
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleSendFriendRequest(userSearchTerm)}
                  className="send-request-btn"
                >
                  Trimite cerere de prietenie
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="friends-tabs">
        <button 
          className={activeTab === 'friends' ? 'active' : ''}
          onClick={() => setActiveTab('friends')}
        >
          Toți prietenii ({friends.length})
        </button>
        <button 
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({pendingRequests.length})
        </button>
      </div>

      <div className="friends-list">
        {activeTab === 'friends' ? (
          filteredFriends.length > 0 ? (
            filteredFriends.map(friend => (
              <div key={friend.id} className="friend-card">
                <div className="friend-info">
                  <div className="friend-avatar">
                    <img src={friend.avatar} alt={friend.name} />
                  </div>
                  <div className="friend-details">
                    <Link to={`/profile/${friend.username}`} className="friend-name">{friend.name}</Link>
                    <p className="friend-username">@{friend.username}</p>
                    <p className="mutual-friends">{friend.mutualFriends} prieteni în comun</p>
                  </div>
                </div>
                <div className="friend-actions">
                  <button className="message-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                    Mesaj
                  </button>
                  <button className="remove-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-friends">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <h3>Nu s-au găsit prieteni</h3>
              <p>Încearcă alt termen de căutare</p>
            </div>
          )
        ) : (
          filteredPending.length > 0 ? (
            filteredPending.map(request => (
              <div key={request.id} className="friend-card">
                <div className="friend-info">
                  <div className="friend-avatar">
                    <img src={request.avatar} alt={request.name} />
                  </div>
                  <div className="friend-details">
                    <Link to={`/profile/${request.username}`} className="friend-name">{request.name} {request.username}</Link>
                  </div>
                </div>
                <div className="friend-actions">
                  <button 
                    className="accept-btn"
                    onClick={() => handleAcceptRequest(request.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                    Acceptă
                  </button>
                  <button 
                    className="decline-btn"
                    onClick={() => handleDeclineRequest(request.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                    </svg>
                    Refuză
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-friends">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <h3>Nu există cereri de prietenie în așteptare</h3>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default FriendsList;