import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  // State variables for profile settings
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // React Router navigation hook
  const toast = useToast(); // Chakra UI toast for displaying messages

  // Function to handle profile update
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    try {
      // Send a PUT request to update the user profile
      const response = await fetch('http://localhost:5000/users/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      // Display success toast on successful profile update
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Clear user data from storage
      // Redirect to login page after updating profile
      navigate('/login');
      // Display logout success toast
      toast({
          title: 'Logout successful.',
          description: "You've been logged out.",
          status: 'info',
          duration: 5000,
          isClosable: true,
      });
    } catch (error) {
      // Display error toast if profile update fails
      toast({
        title: "Update failed",
        description: error.toString(),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Function to handle profile deletion
  const handleDelete = async () => {
    try {
      // Send a DELETE request to delete the user profile
      const response = await fetch('http://localhost:5000/users/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete profile");
      }

      // Clear user data from localStorage
      // Navigate to login page after profile deletion
      navigate('/login');

      // Display success toast on successful profile deletion
      toast({
        title: "Profile deleted",
        description: "Your profile has been deleted successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      // Display error toast if profile deletion fails
      toast({
        title: "Deletion failed",
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
        {/* Profile update form */}
        <VStack as="form" spacing={4} onSubmit={handleSubmit}>
          <FormControl id="profileImage">
            <FormLabel>Profile Image</FormLabel>
            <Input type="file" onChange={(e) => setProfileImage(e.target.files[0])} />
          </FormControl>
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
          {/* Update Profile and Delete Profile buttons */}
          <Button
            type="submit"
            colorScheme="blue"
            mt={4}
          >
            Update Profile
          </Button>
          <Button colorScheme="red" onClick={handleDelete}>
            Delete Profile
          </Button>
        </VStack>
      </Box>
    </Center>
  );
};

export default ProfileSettings;
