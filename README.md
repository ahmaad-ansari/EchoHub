# EchoHub - Distributed Chat Application

EchoHub is a distributed chat application built with React, Node.js, Express.js, and PostgreSQL. It allows users to register, send friend requests, chat with friends, and track online status. This README provides an overview of the application, its features, and instructions for running it.

## Features

- **User Registration:** Users can create accounts with unique usernames and passwords.
- **Secure Login:** Users can log in to their accounts securely.
- **Issue a Friend Request:** Ability to send friend requests to other users.
- **Accept/Reject Friend Request:** Users have the option to accept or reject incoming friend requests.
- **Remove Friend:** Option to remove existing friends from the user's friend list.
- **Update User Profile:** Users can update their username, password, and profile picture.
- **Real-time Chatting:** Engage in conversations with friends in real-time.
- **Chat History:** Access and view past conversations, loaded from the database.
- **User Online Status:** View the real-time online/offline status of friends.
- **Profile Management:** Update personal profiles including usernames and profile pictures.
- **Persistent Data Storage:** Reliable storage and retrieval of messages and user data using PostgreSQL.

## Installation

### Backend (Node.js and Express)

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the `backend` directory:

   ```bash
   cd EchoHub
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Update the `.env` file and set the following environment variables:

   ```
   PORT=<port-number>
   JWT_SECRET=<your-jwt-secret>
   DB_HOST=<database-host>
   DB_PORT=<database-port>
   DB_NAME=<database-name>
   DB_USER=<database-username>
   DB_PASSWORD=<database-password>
   ```

5. Initialize the database:

   ```bash
   npm run db:init
   ```

6. Start the backend server:

   ```bash
   npm start
   ```

### Frontend (React)

1. Navigate to the `frontend` directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the frontend:

   ```bash
   npm start
   ```

## Usage

- Access the application in your browser at `http://localhost:3000`.
- Register a new account.
- Log in with your credentials.
- Send friend requests to other users.
- Chat with friends in real-time.
