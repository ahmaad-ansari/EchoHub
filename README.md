# EchoHub - Distributed Chat Application

EchoHub is a distributed chat application built with React, Node.js, Express.js, and PostgreSQL. It allows users to register, send friend requests, chat with friends, and track online status. This README provides an overview of the application, its features, and instructions for running it.

## Features

- User Registration: Users can create accounts with unique usernames and passwords.
- Authentication: Secure user authentication using JSON Web Tokens (JWT).
- Friend Requests: Users can send and accept friend requests, creating a list of friends.
- Real-time Chat: Real-time chat functionality allows users to communicate with friends.
- Online Status: Users can see which friends are currently online.
- User Profile: Users can update their profile information.
- Data Storage: Messages and user data are stored in a PostgreSQL database.

## Installation

### Backend (Node.js and Express)

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the `backend` directory:

   ```bash
   cd backend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the `backend` directory and set the following environment variables:

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
- View the online status of your friends.

## Contributing

Contributions are welcome! If you'd like to contribute to EchoHub, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name` or `git checkout -b bugfix/your-bug-fix-name`.
3. Make your changes and commit them.
4. Push your changes to your fork.
5. Submit a pull request to the main repository's `main` branch.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to [Chakra UI](https://chakra-ui.com/) for providing a beautiful and customizable UI component library.
- Special thanks to our contributors for making this project possible.
