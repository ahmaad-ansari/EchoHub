import React from 'react';
import { Box, Flex, Text, Button, IconButton, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { SettingsIcon } from '@chakra-ui/icons';

const Navbar = () => {
  const navigate = useNavigate();
  const toast = useToast();


  const handleLogout = () => {
    // Clear user token and profile data from storage
    localStorage.removeItem('token');
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
    window.location.reload(false);
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
    <Flex bg="blue.500" color="white" justifyContent="space-between" alignItems="center" p={4}>
      <Button onClick={goToHome} colorScheme="blue">
        <Text fontSize="lg" fontWeight="bold">
            EchoHub
        </Text>
      </Button>
      <Box>
        <IconButton
          icon={<SettingsIcon />}
          onClick={goToSettings}
          colorScheme="blue"
          marginRight="4"
          aria-label="Settings"
        />
        
        <Button onClick={handleLogout} colorScheme="blue">
          Logout
        </Button>
      </Box>
    </Flex>
  );
};

export default Navbar;





