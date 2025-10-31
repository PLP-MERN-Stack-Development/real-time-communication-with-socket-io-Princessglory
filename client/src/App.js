import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: true
});

function App() {
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Socket connection events
    socket.on('connect', () => {
      console.log('Connected to server');
      setConnectionStatus('Connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnectionStatus('Disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionStatus('Connection Error');
      setIsConnected(false);
    });

    // Listen for messages
    socket.on('receive_message', (messageData) => {
      console.log('Received message:', messageData);
      setMessages(prev => [...prev, messageData]);
    });

    // Listen for user list updates
    socket.on('user_list', (userList) => {
      console.log('User list updated:', userList);
      setUsers(userList);
    });

    // Listen for user joined
    socket.on('user_joined', (userData) => {
      console.log('User joined:', userData);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'System',
        message: `${userData.username} joined the chat`,
        timestamp: new Date().toISOString(),
        isSystem: true
      }]);
    });

    // Listen for user left
    socket.on('user_left', (userData) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'System',
        message: `${userData.username} left the chat`,
        timestamp: new Date().toISOString(),
        isSystem: true
      }]);
    });

    // Listen for typing users
    socket.on('typing_users', (typingUserList) => {
      setTypingUsers(typingUserList);
    });

    // Listen for private messages
    socket.on('private_message', (messageData) => {
      setMessages(prev => [...prev, {
        ...messageData,
        isPrivate: true
      }]);
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_list');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('typing_users');
      socket.off('private_message');
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      console.log('Joining chat with username:', username.trim());
      socket.emit('user_join', username.trim());
      setIsJoined(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Sending message:', message.trim());
      socket.emit('send_message', { message: message.trim() });
      setMessage('');
      handleTyping(false);
    }
  };

  const handleTyping = (typing) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      socket.emit('typing', typing);
    }
    
    if (typing) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        handleTyping(false);
      }, 3000);
    }
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      handleTyping(true);
    } else {
      handleTyping(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendPrivateMessage = (targetUserId) => {
    const privateMsg = prompt('Enter your private message:');
    if (privateMsg && privateMsg.trim()) {
      socket.emit('private_message', { to: targetUserId, message: privateMsg.trim() });
    }
  };

  if (!isJoined) {
    return (
      <div className="app">
        <div className="join-container">
          <div className="join-form">
            <h1>Socket.io Chat</h1>
            <p className="connection-status">Status: {connectionStatus}</p>
            <form onSubmit={handleJoin}>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
                required
              />
              <button type="submit" disabled={!isConnected}>
                {isConnected ? 'Join Chat' : 'Connecting...'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">
          <h2>Socket.io Chat - Welcome, {username}!</h2>
          <div className="online-count">
            {users.length} user{users.length !== 1 ? 's' : ''} online
          </div>
        </div>

        <div className="chat-main">
          <div className="users-sidebar">
            <h3>Online Users</h3>
            <div className="users-list">
              {users.map(user => (
                <div key={user.id} className="user-item">
                  <span className="username">{user.username}</span>
                  {user.id !== socket.id && (
                    <button 
                      className="pm-btn"
                      onClick={() => sendPrivateMessage(user.id)}
                      title="Send private message"
                    >
                      PM
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="messages-container">
            <div className="messages">
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`message ${msg.isSystem ? 'system' : ''} ${msg.isPrivate ? 'private' : ''} ${msg.senderId === socket.id ? 'own' : ''}`}
                >
                  {!msg.isSystem && (
                    <div className="message-header">
                      <span className="sender">{msg.sender}</span>
                      <span className="time">{formatTime(msg.timestamp)}</span>
                      {msg.isPrivate && <span className="private-label">Private</span>}
                    </div>
                  )}
                  <div className="message-content">{msg.message}</div>
                </div>
              ))}
              
              {typingUsers.length > 0 && (
                <div className="typing-indicator">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <form className="message-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={handleMessageChange}
                maxLength={500}
              />
              <button type="submit" disabled={!message.trim()}>
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
