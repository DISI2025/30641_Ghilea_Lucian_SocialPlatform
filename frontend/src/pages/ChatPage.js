import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ChatPage.css';

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const messagesEndRef = useRef(null);

  // Mock data for chats
  const mockChats = [
    {
      id: 1,
      user: {
        name: "Maria Ionescu",
        avatar: "https://randomuser.me/api/portraits/women/33.jpg",
        online: true
      },
      lastMessage: "Te-am așteptat la cafenea!",
      time: "12:30"
    },
    {
      id: 2,
      user: {
        name: "Alex Popescu",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
        online: false
      },
      lastMessage: "Când plecăm în excursie?",
      time: "Yesterday"
    },
    {
      id: 3,
      user: {
        name: "Elena Dumitrescu",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        online: true
      },
      lastMessage: "Am primit cadoul, mulțumesc!",
      time: "Monday"
    }
  ];

  // Mock messages for active chat
  const mockMessages = {
    1: [
      { id: 1, text: "Bună! Ce mai faci?", sender: "them", time: "12:05" },
      { id: 2, text: "Bine, tu?", sender: "me", time: "12:10" },
      { id: 3, text: "Te-am așteptat la cafenea!", sender: "them", time: "12:30" }
    ],
    2: [
      { id: 1, text: "Salut Alex!", sender: "me", time: "10:00" },
      { id: 2, text: "Când plecăm în excursie?", sender: "them", time: "Yesterday" }
    ],
    3: [
      { id: 1, text: "Ți-am lăsat un cadou la ușă", sender: "me", time: "Monday" },
      { id: 2, text: "Am primit cadoul, mulțumesc!", sender: "them", time: "Monday" }
    ]
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChatSelect = (chatId) => {
    setActiveChat(chatId);
    setMessages(mockMessages[chatId] || []);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');

    // Simulate reply after 1 second
    setTimeout(() => {
      const replyMsg = {
        id: messages.length + 2,
        text: "Răspuns automat - voi reveni cu un mesaj!",
        sender: 'them',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="chat-loading">
        <div className="spinner"></div>
        <p>Se încarcă conversațiile...</p>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Sidebar with chat list */}
        <div className="chat-sidebar">
          <div className="chat-header">
            <h2>Mesaje</h2>
            <button className="new-chat-btn">+ Conversație nouă</button>
          </div>
          
          <div className="chat-list">
            {mockChats.map(chat => (
              <div 
                key={chat.id} 
                className={`chat-item ${activeChat === chat.id ? 'active' : ''}`}
                onClick={() => handleChatSelect(chat.id)}
              >
                <div className="chat-avatar">
                  <img src={chat.user.avatar} alt={chat.user.name} />
                  {chat.user.online && <span className="online-badge"></span>}
                </div>
                <div className="chat-info">
                  <h4>{chat.user.name}</h4>
                  <p className="last-message">{chat.lastMessage}</p>
                </div>
                <div className="chat-time">{chat.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main chat area */}
        <div className="chat-main">
          {activeChat ? (
            <>
              <div className="chat-header">
                <div className="chat-user">
                  <img src={mockChats.find(c => c.id === activeChat).user.avatar} 
                       alt={mockChats.find(c => c.id === activeChat).user.name} />
                  <h3>{mockChats.find(c => c.id === activeChat).user.name}</h3>
                  {mockChats.find(c => c.id === activeChat).user.online && (
                    <span className="online-status">online</span>
                  )}
                </div>
              </div>

              <div className="messages-container">
                {messages.map(message => (
                  <div key={message.id} className={`message ${message.sender}`}>
                    <div className="message-content">
                      <p>{message.text}</p>
                      <span className="message-time">{message.time}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="message-input">
                <input
                  type="text"
                  placeholder="Scrie un mesaj..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={!newMessage.trim()}>
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
                <button className="start-chat-btn">Începe conversație</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;