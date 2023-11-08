import { Link } from 'react-router-dom';

// src/components/Login.js
import React, { useState } from 'react';
import {
  Center,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
} from '@chakra-ui/react';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();

  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent the default form submit action
  
    try {
      // Call your backend API endpoint
      const response = await fetch('http://localhost:5000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json(); // Try to parse the response
  
      if (!response.ok) {
        // If the HTTP status code is not successful, throw an error with the server's message
        throw new Error(data.message || 'Failed to log in');
      }
  
      onLoginSuccess(data.token); // Call the onLoginSuccess function passed as a prop with the token
  
      // Reset form state
      setUsername('');
      setPassword('');
  
      // Show success toast
      toast({
        title: 'Login successful',
        description: 'You have successfully logged in.',
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
    } catch (error) {
      // Show error toast with the server's error message
      toast({
        title: 'An error occurred.',
        description: error.toString(),
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };
  

  return (
    <Center height="100vh">
      <Box
        p={8}
        maxWidth="400px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
      >
      <form onSubmit={handleLogin}>
        <VStack spacing={4}>
          <FormControl id="username" isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>
          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <Button
            type="submit"
            width="full"
            mt={4}
          >
            Login
          </Button>
        </VStack>
      </form>
      <Link to="/register">Register</Link>
      </Box>
    </Center>
  );
};

export default Login;
