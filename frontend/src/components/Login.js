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
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    // Here you should call the backend API to perform the login
    // This is a placeholder for the API call
    try {
      const response = await fetch('http://localhost:5000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to log in");
      }
      
      localStorage.setItem('token', data.token); // Save the token
      onLoginSuccess(data.token);

      toast({
        title: "Login successful",
        description: "You have successfully logged in.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
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
        <form onSubmit={handleLogin}>
          <VStack spacing={4}>
            <FormControl id="username" isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </FormControl>
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
