import React, { useState } from 'react';
import {
  Center,
  Box,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  useToast,
} from '@chakra-ui/react';

const ProfileSettings = ({ userProfile, setUserProfile }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.toString(),
        status: "error",
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
            Update Profile
        </Text>
    <VStack as="form" spacing={4} onSubmit={handleSubmit}>
      <FormControl id="username" isRequired>
        <FormLabel>Username</FormLabel>
        <Input
          type="text"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter new username"
        />
      </FormControl>
      <FormControl id="password">
        <FormLabel>Password</FormLabel>
        <Input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
        />
      </FormControl>
      <Button
        type="submit"
        colorScheme="blue"
        mt={4}
      >
        Update Profile
      </Button>
    </VStack>
    </Box>
    </Center>
  );
};

export default ProfileSettings;
