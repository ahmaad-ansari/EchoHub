import React from 'react';
import { Flex, Button, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user token and profile data from localStorage
    localStorage.removeItem('token');
    
    // Optionally, add more logic for a logout process like clearing the state, etc.
    
    // Show a toast notification
    toast({
      title: 'Logout successful.',
      description: "You've been logged out.",
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <Flex bg="blue.500" color="white" p={4} justifyContent="space-between" alignItems="center">
      {/* Other content */}
      <Button onClick={handleLogout}>Logout</Button>
    </Flex>
  );
};

export default Navbar;
