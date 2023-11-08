import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from './Sidebar'; // You'll create this component for contacts
import ChatPanel from './ChatPanel'; // You'll create this component for messages

const MainLayout = () => {
  return (
    <Flex h="100vh">
      <Box w="300px" bg="blue.500">
        <Sidebar />
      </Box>
      <Box flex="1" bg="gray.100">
        <ChatPanel />
      </Box>
    </Flex>
  );
};

export default MainLayout;
