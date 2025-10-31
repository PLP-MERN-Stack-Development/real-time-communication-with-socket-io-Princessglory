# Real-Time Chat Application with Socket.io

## Project Overview

A real-time chat application built with React.js and Socket.io for the Week 5 MERN Stack Assignment. This application demonstrates bidirectional communication between clients and server, enabling users to chat in real-time with features like private messaging, typing indicators, and user status tracking.

## Features Implemented

### Core Chat Functionality
- Real-time messaging between multiple users
- Username-based authentication
- Online/offline user status
- Typing indicators
- Message timestamps
- User list displaying all connected users

### Advanced Features
- Private messaging between users
- Join/leave notifications
- Auto-scroll to latest messages
- Responsive design for mobile and desktop
- Connection status monitoring

### Technology Stack
- **Frontend**: React.js, Socket.io-client, CSS
- **Backend**: Node.js, Express.js, Socket.io, CORS

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Git
- Web browser

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/PLP-MERN-Stack-Development/real-time-communication-with-socket-io-Princessglory.git
   cd real-time-communication-with-socket-io-Princessglory
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Start the application**

   Open two terminals:

   **Terminal 1 - Start the server:**
   ```bash
   cd server
   npm start
   ```
   Server runs on http://localhost:5000

   **Terminal 2 - Start the client:**
   ```bash
   cd client
   npm start
   ```
   Client opens automatically at http://localhost:3000

5. **Use the application**
   - Open http://localhost:3000 in your browser
   - Enter a username to join the chat
   - Start messaging in real-time

## Screenshots

### Main Chat Interface
![Main Chat Interface](screenshots/Front%20page.png)

### Private Messaging
![Private Messaging](screenshots/users%20page.png)

Users can click on any username to send private messages, which appear with a distinct orange styling to differentiate from public messages.
