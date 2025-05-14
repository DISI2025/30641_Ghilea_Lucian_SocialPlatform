import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './ChatPage.css';
import axios from 'axios';

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true); // For initial data load
  const [activeChat, setActiveChat] = useState(null); // Will store numeric ID
  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false); // For messages of a specific chat
  const messagesEndRef = useRef(null);
  const { userId: userIdString } = useParams(); 
  const userId = userIdString ? Number(userIdString) : null; 

  const API_URL = 'http://localhost:8000';

  // Fetch conversations and friends, and set initial active chat
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      console.error("User ID is missing or invalid.");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [convResponse, friendsResponse] = await Promise.all([
          axios.get(`${API_URL}/allCurrentConversations/${userId}`),
          axios.get(`${API_URL}/getfriends/${userId}`),
        ]);

        const fetchedConversations = convResponse.data
          .map(conv => ({
            ...conv,
            id_conversation: Number(conv.id_conversation),
          }))
          .filter(conv => !isNaN(conv.id_conversation) && conv.id_conversation !== 0);

        setConversations(fetchedConversations);
        setFriends(friendsResponse.data);

        const lastActiveChatIdString = localStorage.getItem('lastActiveChat');
        let chatToSelect = null;

        if (lastActiveChatIdString) {
          const lastActiveChatId = Number(lastActiveChatIdString);
          if (!isNaN(lastActiveChatId) && fetchedConversations.some(conv => conv.id_conversation === lastActiveChatId)) {
            chatToSelect = lastActiveChatId;
          }
        }

        if (chatToSelect === null && fetchedConversations.length > 0) {
          chatToSelect = fetchedConversations[0].id_conversation;
        }
        
        if (chatToSelect !== null) {
          setActiveChat(chatToSelect); 
          // localStorage.setItem('lastActiveChat', chatToSelect.toString()); // Moved to handleChatSelect/startNewChat
        } else {
          setActiveChat(null);
        }
        
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [userId, API_URL]);

  // Fetch messages when activeChat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (activeChat === null || isNaN(Number(activeChat)) || Number(activeChat) === 0) {
        setMessages([]);
        setLoadingMessages(false); // Ensure loading is false if no fetch occurs
        return;
      }
      
      setLoadingMessages(true);
      try {
        const response = await axios.get(`${API_URL}/messages/${activeChat}`);
        setMessages(response.data.map(msg => ({...msg, id: Number(msg.id)})));
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };
    
    fetchMessages();
  }, [activeChat, API_URL]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChatSelect = (chatId) => {
    const numericChatId = Number(chatId);
    if (!isNaN(numericChatId) && numericChatId !== 0) {
      if (activeChat !== numericChatId) {
        setActiveChat(numericChatId);
        localStorage.setItem('lastActiveChat', numericChatId.toString());
      }
    } else {
      console.error("Invalid chatId passed to handleChatSelect:", chatId);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || activeChat === null || isNaN(Number(activeChat)) || Number(activeChat) === 0) return;

    const numericUserId = Number(userId);
    if (isNaN(numericUserId) || numericUserId === 0) {
        console.error("User ID is not a valid number for sending message.");
        return;
    }

    try {
      const messageData = {
        id_conversation: activeChat,
        id_sender: numericUserId, 
        text: newMessage,
      };

      const response = await axios.post(`${API_URL}/messages/send`, messageData);
      
      const sentMessage = {
        id: Number(response.data.id),
        text: response.data.text,
        id_sender: numericUserId,
        sent_at: response.data.sent_at,
      };
      
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      
      setConversations(prevConv => {
        const updatedConversations = prevConv.map(c => ({...c, id_conversation: Number(c.id_conversation)}));
        const index = updatedConversations.findIndex(c => c.id_conversation === activeChat);
        if (index >= 0) {
          updatedConversations[index].last_message = newMessage;
          updatedConversations[index].last_message_at = response.data.sent_at;
          const [movedConversation] = updatedConversations.splice(index, 1);
          return [movedConversation, ...updatedConversations];
        }
        return prevConv; 
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startNewChat = async (friendId) => {
    const numericFriendId = Number(friendId);
    const numericUserId = Number(userId);

    if (isNaN(numericFriendId) || numericFriendId === 0 || isNaN(numericUserId) || numericUserId === 0) {
        console.error("Invalid friendId or userId for starting new chat.");
        return;
    }

    try {
      const messageData = {
        id_receiver: numericFriendId,
        id_sender: numericUserId,
        text: "",
      };

      const response = await axios.post(`${API_URL}/messages/send`, messageData);
      const newConversationId = Number(response.data.id_conversation);

      if (isNaN(newConversationId) || newConversationId === 0) {
          console.error("Failed to get a valid new conversation ID from backend.");
          return;
      }

      const friend = friends.find(f => Number(f.id_user) === numericFriendId);
      
      const newConversationData = {
        id_conversation: newConversationId,
        nume: friend?.nume || 'Unknown',
        prenume: friend?.prenume || 'User',
        last_message: "",
        last_message_at: response.data.sent_at, 
        poza_profil_base64: friend?.poza_profil_base64 || null,
      };
      
      setConversations(prev => [newConversationData, ...prev.filter(c => Number(c.id_conversation) !== newConversationId)]);
      setActiveChat(newConversationId);
      localStorage.setItem('lastActiveChat', newConversationId.toString());
      setShowNewChatModal(false);

    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="chat-loading">
        <div className="spinner"></div>
        <p>Se încarcă conversațiile...</p>
      </div>
    );
  }
  
  const currentActiveChatDetails = conversations.find(c => c.id_conversation === activeChat);

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-sidebar">
          <div className="chat-header">
            <h2>Mesaje</h2>
            <button 
              className="new-chat-btn" 
              onClick={() => setShowNewChatModal(true)}
            >
              + Conversație nouă
            </button>
          </div>
          
          <div className="chat-list">
            {conversations.map(chat => (
              <div 
                key={chat.id_conversation}
                className={`chat-item ${activeChat === chat.id_conversation ? 'active' : ''}`}
                onClick={() => handleChatSelect(chat.id_conversation)}
              >
                <div className="chat-avatar">
                  {chat.poza_profil_base64 ? (
                    <img 
                      src={`data:image/jpeg;base64,${chat.poza_profil_base64}`} 
                      alt={`${chat.prenume || ''} ${chat.nume || ''}`} 
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {(chat.prenume || 'U').charAt(0)}{(chat.nume || 'N').charAt(0)}
                    </div>
                  )}
                </div>
                <div className="chat-info">
                  <h4>{chat.prenume || 'User'} {chat.nume || ''}</h4>
                  <p className="last-message">{chat.last_message || 'No messages'}</p>
                </div>
                <div className="chat-time">
                  {chat.last_message_at ? new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-main">
          {activeChat && currentActiveChatDetails ? (
            <>
              <div className="chat-header">
                <div className="chat-user">
                  {currentActiveChatDetails.poza_profil_base64 ? (
                    <img 
                      src={`data:image/jpeg;base64,${currentActiveChatDetails.poza_profil_base64}`} 
                      alt={currentActiveChatDetails.prenume || ''} 
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {(currentActiveChatDetails.prenume || 'U').charAt(0)}
                      {(currentActiveChatDetails.nume || 'N').charAt(0)}
                    </div>
                  )}
                  <h3>
                    {currentActiveChatDetails.prenume || 'User'} {currentActiveChatDetails.nume || ''}
                  </h3>
                </div>
              </div>

              <div className="messages-container">
                {loadingMessages ? (
                  <div className="messages-loading">
                    <div className="spinner small"></div>
                    <p>Loading messages...</p>
                  </div>
                ) : (
                  <>
                    {messages
                    .filter(message => message.text && message.text.trim() !== '')
                    .map(message => (
                      <div 
                        key={message.id} 
                        className={`message ${Number(message.id_sender) === userId ? 'me' : 'them'}`}
                      >
                        <div className="message-content">
                          <p>{message.text}</p>
                          <span className="message-time">
                            {message.sent_at ? new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="message-input">
                <input
                  type="text"
                  placeholder="Scrie un mesaj..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={loadingMessages || !activeChat}
                />
                <button type="submit" disabled={!newMessage.trim() || loadingMessages || !activeChat}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-content">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
                <h3>Selectează o conversație</h3>
                <p>Alege din lista de conversații sau începe una nouă</p>
                <button 
                  className="start-chat-btn"
                  onClick={() => setShowNewChatModal(true)}
                >
                  Începe conversație
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showNewChatModal && (
        <div className="modal-overlay">
          <div className="new-chat-modal">
            <div className="modal-header">
              <h3>Selectează un prieten</h3>
              <button onClick={() => setShowNewChatModal(false)}>×</button>
            </div>
            <div className="friends-list">
              {friends.map(friend => (
                <div 
                  key={Number(friend.id_user)}
                  className="friend-item"
                  onClick={() => startNewChat(Number(friend.id_user))}
                >
                  {friend.poza_profil_base64 ? (
                    <img 
                      src={`data:image/jpeg;base64,${friend.poza_profil_base64}`} 
                      alt={`${friend.prenume || ''} ${friend.nume || ''}`} 
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {(friend.prenume || 'U').charAt(0)}{(friend.nume || 'N').charAt(0)}
                    </div>
                  )}
                  <span>{friend.prenume || 'User'} {friend.nume || ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;

