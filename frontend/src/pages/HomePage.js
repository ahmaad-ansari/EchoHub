import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import UserList from '../components/UserList';
import FriendRequests from '../components/FriendRequests';
import FriendsList from '../components/FriendsList';
import ChatPanel from '../components/ChatPanel';
import { Grid, GridItem, Box, HStack, Button } from '@chakra-ui/react';

const HomePage = () => {
  // State variables to manage active tab and current chat user
  const [activeTab, setActiveTab] = useState('userList'); // Initial active component
  const [currentChatUser, setCurrentChatUser] = useState({
    id: null,
    username: null,
  });

  // Static currentUser object - replace this with actual user data from an API or context
  const [currentUser, setCurrentUser] = useState({
    id: localStorage.getItem('user_id'), // Replace with the actual user ID
    name: localStorage.getItem('username'), // Replace with user's name or other properties
    // ... other user properties
  });

  // Function to handle chat icon clicks, sets the current chat user
  const handleChatIconClick = (userId, username) => {
    setCurrentChatUser({
      id: userId,
      username: username
    });
  };

  // Function to change the active tab
  const changeTab = (tabName) => {
    setActiveTab(tabName);
  };

  // Function to render the active tab content based on activeTab state
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'userList':
        return <UserList />;
      case 'friendRequests':
        return <FriendRequests />;
      case 'friendsList':
        return <FriendsList onChatIconClick={handleChatIconClick} />;
      default:
        return <UserList />;
    }
  };

  return (
    <>
      {/* Navbar component */}
      <Navbar />
      {/* Main layout using Chakra-UI Grid */}
      <Grid templateColumns="repeat(5, 1fr)" gap={4} p={4}>
        {/* Left Sidebar */}
        <GridItem colSpan={1} bg="gray.50">
          {/* Horizontal Tabs */}
          <HStack spacing={2} mb={4}>
            {/* Buttons for switching tabs */}
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
          {/* Active Component based on selected tab */}
          <Box>
            {renderActiveTab()}
          </Box>
        </GridItem>
        {/* Right-side Chat Panel */}
        <GridItem colSpan={4} bg="gray.100" p={4}>
          {/* Chat Panel - rendered only if both currentUser and currentChatUser are defined */}
          {currentUser && currentChatUser && (
            <ChatPanel
              currentUser={currentUser}
              currentChatUser={currentChatUser}
            />
          )}
        </GridItem>
      </Grid>
    </>
  );
};

export default HomePage;