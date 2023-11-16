// src/components/Login.js
import React, { useState } from 'react';
import { Link as RouterLink } from "react-router-dom";

import {
  Center,
  Box,
  Button,
  Text,
  Link,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast(); // Toast notification from Chakra UI
  const navigate = useNavigate(); // Navigation hook from react-router-dom

  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    try {
      // Fetch API call to perform user login
      const response = await fetch('http://localhost:5000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }), // Send username and password in the request body
      });

      const data = await response.json(); // Parse the response body

      if (!response.ok) {
        throw new Error(data.message || "Failed to log in"); // Throw an error if login fails
      }
      
      // Save user data to local storage upon successful login
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('username', data.username);
      localStorage.setItem('profile_image_url', data.profile_image_url);
      // Call the onLoginSuccess function passed as a prop
      onLoginSuccess(data.token);

      // Display a success toast notification
      toast({
        title: "Login successful",
        description: "You have successfully logged in.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      // Display an error toast notification if login fails
      toast({
        title: 'Login Error',
        description: error.toString(),
        status: 'error',
        duration: 5000,
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
        <Text
            mb={4}
            fontSize="3xl"
            fontWeight="bold"
            textAlign="center"
        >
            Login
        </Text>
        {/* Login form */}
        <form onSubmit={handleLogin}>
          <VStack spacing={4}>
            {/* Username input */}
            <FormControl id="username" isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </FormControl>
            {/* Password input */}
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </FormControl>
            {/* Submit button */}
            <Button
              type="submit"
              width="full"
              mt={4}
              colorScheme="blue"
            >
              Login
            </Button>
          </VStack>
        </form>
        {/* Link to registration page */}
        <Text mt={6} textAlign="center">
            Don't have an account?{" "}
            <Link
                as={RouterLink}
                to="/register"
                color="blue.500"
                fontWeight="bold"
            >
                Register
            </Link>
        </Text>
      </Box>
    </Center>
  );
};

export default Login;
