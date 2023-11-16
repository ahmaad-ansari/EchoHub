import React from 'react';
import { Box, Flex, Text, Button, IconButton, useToast, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { SettingsIcon } from '@chakra-ui/icons';

const Navbar = () => {
  const navigate = useNavigate(); // React Router's navigate function
  const toast = useToast(); // Chakra UI toast for displaying messages

  // Retrieve the username and profile image URL from localStorage
  const username = localStorage.getItem('username');
  const profileImageUrl = localStorage.getItem('profile_image_url');

  // Debugging line to log localStorage data
  console.log('Profile Image URL:', localStorage);

  const serverBaseUrl = 'http://localhost:5000'; // Replace with your server's URL if needed

  // Function to handle user logout
  const handleLogout = () => {
    // Clear user token and profile data from storage
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('profile_image_url');

    // Redirect to login page after logout
    navigate('/login');

    // Show a toast notification for successful logout
    toast({
      title: 'Logout successful.',
      description: "You've been logged out.",
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };

  // Function to navigate to the settings page
  const goToSettings = () => {
    navigate('/settings');
  };

  // Function to navigate to the home page
  const goToHome = () => {
    navigate('/');
  };

  return (
    <Flex bg="blue.800" color="white" justifyContent="space-between" alignItems="center" p={4}>
      {/* Logo */}
      <Button onClick={goToHome}>
        <Text fontSize="lg" fontWeight="bold">
          EchoHub
        </Text>
      </Button>

      {/* User profile section */}
      <Flex alignItems="center">
        {/* Display user profile image if available */}
        {profileImageUrl && (
          <Image
            src={`${serverBaseUrl}${profileImageUrl}`}
            alt="Profile"
            borderRadius="full" // For circular images
            boxSize="40px" // Adjust size as needed
            marginRight="4"
          />
        )}
        {/* Display username or 'Not logged in' */}
        <Text fontSize="md" mr={4}>
          {username ? `Hello, ${username}` : 'Not logged in'}
        </Text>
        {/* Settings icon button to navigate to settings page */}
        <IconButton
          icon={<SettingsIcon />}
          onClick={goToSettings}
          colorScheme="gray"
          marginRight="4"
          aria-label="Settings"
        />
        {/* Logout button */}
        <Button onClick={handleLogout} colorScheme="gray">
          Logout
        </Button>
      </Flex>
    </Flex>
  );
};

export default Navbar;
