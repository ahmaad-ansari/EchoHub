// src/components/UserList.js
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
  const [users, setUsers] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/users/all', {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        });
        const data = await response.json();
        if (response.ok) {
          setUsers(data);
        } else {
          throw new Error(data.message || 'Could not fetch users.');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error.toString(),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchUsers();
  }, [toast]);

  const sendFriendRequest = async (toUserId) => {
    try {
      const response = await fetch('http://localhost:5000/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token') // Ensure you have the token stored in localStorage
        },
        body: JSON.stringify({ to_user_id: toUserId }), // Match the payload to what the backend expects
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // The request was successful, handle the result here
        toast({
          title: 'Friend Request Sent',
          description: `You have sent a friend request.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // The request was not successful, handle the error here
        throw new Error(data.message || 'Could not send friend request.');
      }
    } catch (error) {
      // There was an error sending the request, handle it here
      toast({
        title: 'Error',
        description: error.toString(),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  

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
                onClick={() => sendFriendRequest(user.user_id)}
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
