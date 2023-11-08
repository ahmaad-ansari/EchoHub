import React from 'react';
import { Box, Flex, Text, Button, IconButton, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { SettingsIcon } from '@chakra-ui/icons';

const Navbar = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Retrieve the username from localStorage
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    // Clear user token and profile data from storage
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    // Redirect to login page
    navigate('/login');
    // Show a toast notification
    toast({
        title: 'Logout successful.',
        description: "You've been logged out.",
        status: 'info',
        duration: 5000,
        isClosable: true,
    });
  };

  const goToSettings = () => {
    // Navigate to settings page
    navigate('/settings');
  };

  const goToHome = () => {
    // Navigate to settings page
    navigate('/');
  };

  return (
    <Flex bg="blue.800" color="white" justifyContent="space-between" alignItems="center" p={4}>
      <Button onClick={goToHome} colorScheme="">
        <Text fontSize="lg" fontWeight="bold">
            EchoHub
        </Text>
      </Button>
      
      <Flex alignItems="center">
        <Text fontSize="md" mr={4}>
          {username ? `Hello, ${username}` : 'Not logged in'}
        </Text>
        <IconButton
          icon={<SettingsIcon />}
          onClick={goToSettings}
          colorScheme="gray"
          marginRight="4"
          aria-label="Settings"
        />
        
        <Button onClick={handleLogout} colorScheme="gray">
          Logout
        </Button>
      </Flex>
    </Flex>
  );
};

export default Navbar;
