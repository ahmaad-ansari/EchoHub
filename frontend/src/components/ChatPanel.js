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
  Avatar,
  Stack,
} from '@chakra-ui/react';
import { ArrowForwardIcon, AttachmentIcon } from '@chakra-ui/icons';

const SOCKET_SERVER_URL = 'http://localhost:5000'; // Update with your server URL



const ChatPanel = ({ currentChatUserId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState([]);
  const toast = useToast();
  const socketRef = useRef();

  function getRoomId(userId1, userId2) {
    // Ensure that userId1 is always the smaller ID
    return [userId1, userId2].sort().join('_');
  }

  useEffect(() => {
    let isMounted = true;

    // Check if currentUser is not undefined before attempting to use it
    if (currentUser && currentChatUserId) {
      const roomId = getRoomId(currentUser.id, currentChatUserId);
      console.log(`Computed roomId: ${roomId}`);
      if (!socketRef.current) {
        socketRef.current = io(SOCKET_SERVER_URL, {
          auth: {
            token: localStorage.getItem('token'), // Ensure the token is available and valid
          },
        });
    
        // Event listeners
        socketRef.current.on('connect', () => {
          console.log('Connected to WebSocket server');
          // Join the chat room for the current user using the roomId
          socketRef.current.emit('joinRoom', { roomId });
        });
    
        socketRef.current.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });
    
        socketRef.current.on('receiveMessage', (newMessage) => {
          console.log('New message received', newMessage);
          if (isMounted) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          }
        });
    
        // This will handle any errors that occur during the lifetime of the socket
        socketRef.current.on('error', (error) => {
          console.error('Socket error:', error);
        });
      }

    // Fetch conversation history
    const fetchConversationHistory = async () => {
      try {
        const response = await fetch(`${SOCKET_SERVER_URL}/messages/${roomId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setMessages(data.messages || []);
        }
      } catch (error) {
        toast({
          title: 'Error fetching messages',
          description: error.toString(),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
  
    if (currentChatUserId) {
      fetchConversationHistory();
    }
  } else {
    console.log(`Waiting for currentUser or currentChatUserId to be defined`, currentUser, currentChatUserId);
  }
    // Clean up on component unmount or when currentChatUserId changes
    return () => {
      isMounted = false;
      if (socketRef.current) {
        if (currentChatUserId) {
          // Leave the chat room using the roomId
          const roomId = getRoomId(currentUser.id, currentChatUserId);
          socketRef.current.emit('leaveRoom', { roomId });
        }
        // Disconnect the socket
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentChatUserId, currentUser]);
  

  const sendMessage = () => {
  if (!message.trim()) {
    toast({
      title: 'Cannot send empty message',
      status: 'warning',
      duration: 2000,
      isClosable: true,
    });
    return;
  }

  const roomId = getRoomId(currentUser, currentChatUserId);

  // Emit message to server with roomId
  socketRef.current.emit('sendMessage', {
    roomId: roomId, // This is expected on the server now
    text: message,
  });

  setMessage(''); // Clear the input after sending
};

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
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
      {/* Chat messages container */}
      <Flex
        direction="column"
        p={3}
        spacing={4}
        alignItems="flex-start"
        width="100%"
        overflowY="auto"
        flex={1}
      >
        {/* Dummy chat messages for display */}
        {Array.isArray(messages) && messages.map((msg, index) => (
          <Stack
            key={index}
            direction="row"
            spacing={3}
            alignItems="center"
            alignSelf={msg.from_user_id === currentChatUserId ? 'flex-start' : 'flex-end'}
          >
            <Box p={3} bg={msg.from_user_id === currentChatUserId ? 'blue.100' : 'gray.100'} borderRadius="lg">
              <Text fontSize="sm">{msg.message_text}</Text>
            </Box>
            <Text fontSize="xs" color="gray.500">{new Date(msg.timestamp).toLocaleString()}</Text>
          </Stack>
        ))}

      </Flex>

      {/* Divider */}
      <Divider />

      {/* Message input area (fixed to bottom) */}
      <HStack spacing={3} pt={3}>
        <IconButton
          icon={<AttachmentIcon />}
          variant="outline"
          aria-label="Attach file"
          mr={2}
        />
        <Input
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
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
