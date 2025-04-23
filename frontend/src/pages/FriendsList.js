import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FriendsList.css';

function FriendsList() {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockFriends = [
      {
        id: 1,
        name: "Maria Ionescu",
        username: "maria_ionescu",
        avatar: "https://randomuser.me/api/portraits/women/33.jpg",
        online: true,
        mutualFriends: 12
      },
      {
        id: 2,
        name: "Alex Popescu",
        username: "alex_popescu",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
        online: false,
        mutualFriends: 5
      },
      {
        id: 3,
        name: "Elena Dumitrescu",
        username: "elena_d",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        online: true,
        mutualFriends: 8
      },
      {
        id: 4,
        name: "Andrei Georgescu",
        username: "andrei_g",
        avatar: "https://randomuser.me/api/portraits/men/65.jpg",
        online: false,
        mutualFriends: 3
      },
      {
        id: 5,
        name: "Cristina Moldovan",
        username: "cristy_m",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
        online: true,
        mutualFriends: 7
      }
    ];

    // Simulate API call
    setTimeout(() => {
      setFriends(mockFriends);
      setIsLoading(false);
    }, 800);
  }, []);

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
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

      <div className="friends-tabs">
        <button className="active">Toți prietenii ({friends.length})</button>
        <button>Online ({friends.filter(f => f.online).length})</button>
        <button>Adăugați recent</button>
      </div>

      <div className="friends-list">
        {filteredFriends.length > 0 ? (
          filteredFriends.map(friend => (
            <div key={friend.id} className="friend-card">
              <div className="friend-info">
                <div className="friend-avatar">
                  <img src={friend.avatar} alt={friend.name} />
                  {friend.online && <span className="online-badge"></span>}
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
        )}
      </div>
    </div>
  );
}

export default FriendsList;