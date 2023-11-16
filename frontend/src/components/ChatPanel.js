import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Input,
  Button,
  Text,
  Divider,
  useToast,
  Stack,
} from '@chakra-ui/react';
import { ArrowForwardIcon, AttachmentIcon } from '@chakra-ui/icons';

// Server URL for the socket connection
const SOCKET_SERVER_URL = 'http://localhost:5000'; // Update with your server URL

const ChatPanel = ({ currentChatUser, currentUser }) => {
  // State to manage the messages in the chat
  const [messages, setMessages] = useState([]);
  // State to manage the current message being typed
  const [message, setMessage] = useState('');
  // Chakra UI's toast notification function
  const toast = useToast();
  // Reference to manage the socket connection
  const socketRef = useRef();

  // Function to generate a room ID for the chat between two users
  function getRoomId(userId1, userId2) {
    // Ensure that userId1 is always the smaller ID to maintain consistency in room ID format
    return [userId1, userId2].sort((a, b) => a - b).join('_');
  }

  // Effect hook to manage socket connection and messages
  useEffect(() => {
    // Flag to track if the component is mounted or not
    let isMounted = true;

    // Check if both users are available
    if (currentUser && currentChatUser) {
      // Generate the room ID for the chat
      const roomId = getRoomId(currentUser.id, currentChatUser.id);

      // Initialize socket connection if it doesn't exist
      if (!socketRef.current) {
        // Create a new socket connection with the server
        socketRef.current = io(SOCKET_SERVER_URL, {
          auth: {
            token: localStorage.getItem('token'), // Send authentication token in the socket connection
          },
        });

        // Event listener for successful connection to the socket server
        socketRef.current.on('connect', () => {
          console.log('Connected to WebSocket server');
          // Join the chat room for the current user using the roomId
          socketRef.current.emit('joinRoom', { roomId });
          // Fetch past messages for the room
          socketRef.current.emit('getPastMessages', { roomId });
        });

        // Event listener for receiving a new message
        socketRef.current.on('receiveMessage', (newMessage) => {
          if (isMounted) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          }
        });

        // Event listener for receiving past messages for the room
        socketRef.current.on('pastMessages', (fetchedMessages) => {
          if (isMounted) {
            setMessages(fetchedMessages);
          }
        });

        // Event listener for socket connection error
        socketRef.current.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });

        // Event listener for generic socket errors
        socketRef.current.on('error', (error) => {
          console.error('Socket error:', error);
        });
      }
    }

    // Clean-up function on component unmount or when currentChatUser.id changes
    return () => {
      isMounted = false;
      if (socketRef.current) {
        const roomId = getRoomId(currentUser.id, currentChatUser.id);
        // Leave the chat room using the roomId
        socketRef.current.emit('leaveRoom', { roomId });
        // Disconnect the socket
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentChatUser, currentUser]);

  // Function to send a message
  const sendMessage = () => {
    // Check if currentUser is defined and has an id property
    if (!currentUser || !currentUser.id) {
      // Display an error toast notification if user information is not available
      toast({
        title: 'Error',
        description: 'User information is not available',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    // Check for empty message
    if (!message.trim()) {
      // Display a warning toast notification for empty message
      toast({
        title: 'Cannot send empty message',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    // Get the roomId for the chat
    const roomId = getRoomId(currentUser.id, currentChatUser.id);
    // Emit the message to the server with roomId
    socketRef.current.emit('sendMessage', {
      roomId: roomId,
      text: message,
    });

    // Clear the input field after sending the message
    setMessage('');
  };

  return (
    <Flex
      direction="column"
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      bg="white"
      height="80vh"
      maxWidth="100%"
      boxShadow="sm"
    >
      {/* Chat header */}
      <Flex
        bg="gray.100"
        p={3}
        width="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize="lg" fontWeight="bold">
          {currentChatUser.username}
        </Text>
      </Flex>

      {/* Message display area */}
      <Flex
        direction="column"
        p={3}
        width="100%"
        overflowY="auto"
        flex={1}
      >
        {/* Map through messages to display them */}
        {messages.map((msg, index) => {
          // Check if the message is from the current user or the other user
          const isFromCurrentUser = String(msg.from_user_id) === String(currentUser.id);
          return (
            <Flex
              key={index}
              direction="column"
              alignItems={isFromCurrentUser ? 'flex-end' : 'flex-start'}
              mb={4} // Margin bottom for space between messages
            >
              <Box
                p={3}
                bg={isFromCurrentUser ? 'blue.100' : 'gray.100'}
                borderRadius="lg"
              >
                <Text fontSize="sm">{msg.message_text}</Text>
              </Box>
              <Text
                fontSize="xs"
                color="gray.500"
                mt={2} // Margin top for space between message and timestamp
              >
                {new Date(msg.timestamp).toLocaleString()}
              </Text>
            </Flex>
          );
        })}
      </Flex>

      {/* Input and send button */}
      <Divider />
      <HStack spacing={3} pt={3}>
        <Input
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          flex={1}
        />
        <Button
          rightIcon={<ArrowForwardIcon />}
          colorScheme="blue"
          onClick={sendMessage}
        >
          Send
        </Button>
      </HStack>
    </Flex>
  );
};

export default ChatPanel;