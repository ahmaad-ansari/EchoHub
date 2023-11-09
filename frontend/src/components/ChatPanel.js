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

const SOCKET_SERVER_URL = 'http://localhost:5000'; // Update with your server URL

const ChatPanel = ({ currentChatUser, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState(''); // Corrected to be a string
  const toast = useToast();
  const socketRef = useRef();
  
  function getRoomId(userId1, userId2) {
    // Ensure that userId1 is always the smaller ID to maintain consistency in room ID format
    return [userId1, userId2].sort((a, b) => a - b).join('_');
  }
  

  useEffect(() => {
    let isMounted = true;
    if (currentUser && currentChatUser) {
      const roomId = getRoomId(currentUser.id, currentChatUser.id); // Ensure proper IDs are used

      if (!socketRef.current) {
        socketRef.current = io(SOCKET_SERVER_URL, {
          auth: {
            token: localStorage.getItem('token'), // Ensure the token is available and valid
          },
        });

        socketRef.current.on('connect', () => {
          console.log('Connected to WebSocket server');
          // Join the chat room for the current user using the roomId
          socketRef.current.emit('joinRoom', { roomId });
          // Fetch past messages
          socketRef.current.emit('getPastMessages', { roomId });
        });

        socketRef.current.on('receiveMessage', (newMessage) => {
          if (isMounted) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          }
        });

        socketRef.current.on('pastMessages', (fetchedMessages) => {
          if (isMounted) {
            setMessages(fetchedMessages);
          }
        });

        socketRef.current.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });

        socketRef.current.on('error', (error) => {
          console.error('Socket error:', error);
        });
      }
    }

    // Clean up on component unmount or when currentChatUser.id changes
    return () => {
      isMounted = false;
      if (socketRef.current) {
        const roomId = getRoomId(currentUser.id, currentChatUser.id); // Ensure proper IDs are used
        // Leave the chat room using the roomId
        socketRef.current.emit('leaveRoom', { roomId });
        // Disconnect the socket
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentChatUser, currentUser]);

  const sendMessage = () => {
    // Check if currentUser is defined and has an id property
    if (!currentUser || !currentUser.id) {
      toast({
        title: 'Error',
        description: 'User information is not available',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
  
    if (!message.trim()) {
      toast({
        title: 'Cannot send empty message',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
  
    const roomId = getRoomId(currentUser.id, currentChatUser.id); // Ensure proper IDs are used
    // Emit message to server with roomId
    socketRef.current.emit('sendMessage', {
      roomId: roomId, // This is expected on the server now
      text: message,
    });
  
    setMessage(''); // Clear the input after sending
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
        {messages.map((msg, index) => {
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