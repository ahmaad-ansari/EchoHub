import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import UserList from '../components/UserList';
import FriendRequests from '../components/FriendRequests';
import FriendsList from '../components/FriendsList';
import ChatPanel from '../components/ChatPanel';
import { Grid, GridItem, Box, HStack, Button } from '@chakra-ui/react';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('userList'); // Initial active component

  // Function to change the active tab
  const changeTab = (tabName) => {
    setActiveTab(tabName);
  };

  // Render the active component based on the activeTab state
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'userList':
        return <UserList />;
      case 'friendRequests':
        return <FriendRequests />;
      case 'friendsList':
        return <FriendsList />;
      default:
        return <UserList />;
    }
  };

  return (
    <>
      <Navbar />
      <Grid templateColumns="repeat(5, 1fr)" gap={4} p={4}>
        <GridItem colSpan={1} bg="gray.50">
          {/* Horizontal Tabs */}
          <HStack spacing={2} mb={4}>
            <Button onClick={() => changeTab('userList')} colorScheme="blue" variant={activeTab === 'userList' ? 'solid' : 'ghost'}>
              Find Friends
            </Button>
            <Button onClick={() => changeTab('friendRequests')} colorScheme="blue" variant={activeTab === 'friendRequests' ? 'solid' : 'ghost'}>
              Requests
            </Button>
            <Button onClick={() => changeTab('friendsList')} colorScheme="blue" variant={activeTab === 'friendsList' ? 'solid' : 'ghost'}>
              Friends
            </Button>
          </HStack>
          {/* Active Component */}
          <Box>
            {renderActiveTab()}
          </Box>
        </GridItem>
        <GridItem colSpan={4} bg="gray.100" p={4}>
          {/* Chat Panel */}
          <ChatPanel />
        </GridItem>
      </Grid>
    </>
  );
};

export default HomePage;
