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

const ChatPanel = ({ currentChatUserId, currentUser }) => {
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

    if (currentUser && currentChatUserId) {
      const roomId = getRoomId(currentUser.id, currentChatUserId); // Ensure proper IDs are used
      console.log(`Computed roomId: ${roomId}`);

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
          console.log('New message received', newMessage);
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

    // Clean up on component unmount or when currentChatUserId changes
    return () => {
      isMounted = false;
      if (socketRef.current) {
        const roomId = getRoomId(currentUser.id, currentChatUserId); // Ensure proper IDs are used
        // Leave the chat room using the roomId
        socketRef.current.emit('leaveRoom', { roomId });
        // Disconnect the socket
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentChatUserId, currentUser]);

  const sendMessage = () => {
    console.log(currentChatUserId, " ",currentUser.id);
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
  
    const roomId = getRoomId(currentUser.id, currentChatUserId); // Ensure proper IDs are used
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
      <Flex
        direction="column"
        p={3}
        spacing={4}
        alignItems="flex-start"
        width="100%"
        overflowY="auto"
        flex={1}
      >
        {messages.map((msg, index) => {
          // Check if message is from current user
          const isFromCurrentUser = String(msg.from_user_id) === String(currentUser.id);

          console.log(`Message #${index} from current user: ${isFromCurrentUser}`); // This will log true for sent, false for received

          return (
            <Stack
              key={index}
              direction="row"
              spacing={3}
              alignItems="center"
              style={{ alignSelf: isFromCurrentUser ? 'flex-end' : 'flex-start' }}

            >
              <Box
                p={3}
                bg={isFromCurrentUser ? 'blue.100' : 'gray.100'}
                borderRadius="lg"
              >
                <Text fontSize="sm">{msg.message_text}</Text>
              </Box>
              <Text fontSize="xs" color="gray.500">
                {new Date(msg.timestamp).toLocaleString()}
              </Text>
            </Stack>
          );
        })}
      </Flex>
      <Divider />
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