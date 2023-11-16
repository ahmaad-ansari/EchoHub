import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Button,
  List,
  ListItem,
  useToast,
  IconButton,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const UserList = () => {
  // State to store the list of users
  const [users, setUsers] = useState([]);
  const toast = useToast(); // Chakra UI toast for displaying error/success messages

  useEffect(() => {
    // Fetch users from the server when the component mounts or when the toast changes
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/users/all', {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        });
        const data = await response.json();
        if (response.ok) {
          setUsers(data); // Set the fetched user data into the state
        } else {
          throw new Error(data.message || 'Could not fetch users.');
        }
      } catch (error) {
        // Display error toast if fetching users fails
        toast({
          title: 'Error',
          description: error.toString(),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchUsers(); // Fetch users on component mount or when toast changes
  }, [toast]);

  // Function to send a friend request to a specific user
  const sendFriendRequest = async (toUserId) => {
    try {
      const response = await fetch('http://localhost:5000/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token') // Send request with the stored token
        },
        body: JSON.stringify({ to_user_id: toUserId }), // Body with the user ID to send the request
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Display success toast if the friend request is sent successfully
        toast({
          title: 'Friend Request Sent',
          description: `You have sent a friend request.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Display error toast if sending the request fails
        throw new Error(data.message || 'Could not send friend request.');
      }
    } catch (error) {
      // Display error toast if there's an error sending the request
      toast({
        title: 'Error',
        description: error.toString(),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Render user list with the option to send a friend request
  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="sm" bg="white">
      <Text fontSize="xl" p={4} bg="gray.500" color="white" fontWeight="bold">
        Users
      </Text>
      <Box maxH="calc(100vh - 200px)" overflowY="auto">
        <List spacing={3}>
          {users.map(user => (
            <ListItem key={user.user_id} p={4} display="flex" justifyContent="space-between" alignItems="center" borderBottomWidth="1px">
              <Text isTruncated maxWidth="70%">{user.username}</Text>
              <IconButton
                aria-label="Send friend request"
                icon={<AddIcon />}
                onClick={() => sendFriendRequest(user.user_id)} // Send friend request on button click
                size="sm"
                colorScheme="gray"
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default UserList;
