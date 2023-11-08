import React, { useState } from 'react';
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

const ChatPanel = () => {
  const [message, setMessage] = useState('');
  const toast = useToast();

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
    // Here you would typically handle sending the message to your backend or chat service
    console.log('Message sent:', message);
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
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar name="Ryan Florence" src="https://bit.ly/ryan-florence" />
          <Box p={3} bg="gray.100" borderRadius="lg">
            <Text fontSize="sm">Hello, how are you?</Text>
          </Box>
        </Stack>
        <Stack direction="row" spacing={3} alignItems="center" alignSelf="flex-end">
          <Box p={3} bg="blue.100" borderRadius="lg">
            <Text fontSize="sm">I'm good, thanks for asking!</Text>
          </Box>
          <Avatar name="Segun Adebayo" src="https://bit.ly/sage-adebayo" />
        </Stack>
        {/* More chat messages */}
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
