// src/components/Register.js
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

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();

    // Add validation for passwords match, etc.
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: "Passwords don't match.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      
      toast({
        title: 'Registration successful',
        description: 'You have successfully registered.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login'); // Redirect to the login page after registration
    } catch (error) {
      toast({
        title: 'Registration Error',
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
            Register
        </Text>
        <form onSubmit={handleRegister}>
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
            <FormControl id="confirm-password" isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormControl>
            <Button
              type="submit"
              width="full"
              mt={4}
              colorScheme="blue"
            >
              Register
            </Button>
          </VStack>
        </form>
        <Text mt={6} textAlign="center">
            Already have an account?{" "}
            <Link
                as={RouterLink}
                to="/login"
                color="blue.500"
                fontWeight="bold"
            >
                Login
            </Link>
        </Text>
      </Box>
    </Center>
  );
};

export default Register;
