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
  // State variables for username, password, and confirm password fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const toast = useToast(); // Chakra UI toast for displaying error/success messages
  const navigate = useNavigate(); // React Router navigation hook

  // Function to handle form submission on registration
  const handleRegister = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Validate if passwords match
    if (password !== confirmPassword) {
      // Display an error toast if passwords don't match
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
      // Send a POST request to register the user
      const response = await fetch('http://localhost:5000/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }), // Send username and password in the request body
      });

      const data = await response.json();

      if (!response.ok) {
        // Display an error toast if registration fails
        throw new Error(data.message || 'Registration failed');
      }

      // Display success toast on successful registration
      toast({
        title: 'Registration successful',
        description: 'You have successfully registered.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login'); // Redirect to the login page after successful registration
    } catch (error) {
      // Display an error toast if there's an error during registration
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
        {/* Form for user registration */}
        <form onSubmit={handleRegister}>
          <VStack spacing={4}>
            {/* Input fields for username, password, and confirm password */}
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
            <FormControl id="confirm-password" isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
              />
            </FormControl>
            {/* Register button */}
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
        {/* Link to navigate to login if already registered */}
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