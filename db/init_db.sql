-- Create users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    online BOOLEAN DEFAULT false
);

-- Create friend_requests table
CREATE TABLE friend_requests (
    request_id SERIAL PRIMARY KEY,
    from_user_id INTEGER REFERENCES users(user_id),
    to_user_id INTEGER REFERENCES users(user_id),
    status VARCHAR(20) DEFAULT 'pending' -- can be 'pending', 'accepted', 'declined'
);

-- Create contacts table
CREATE TABLE contacts (
    user_id INTEGER REFERENCES users(user_id),
    friend_user_id INTEGER REFERENCES users(user_id),
    PRIMARY KEY (user_id, friend_user_id)
);

-- Create messages table
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    from_user_id INTEGER REFERENCES users(user_id),
    to_user_id INTEGER REFERENCES users(user_id),
    message_text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
