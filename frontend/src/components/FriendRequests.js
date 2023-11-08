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
  Icon,
  Flex,
} from '@chakra-ui/react';
import { CheckIcon, SmallCloseIcon, TimeIcon } from '@chakra-ui/icons';

const FriendRequests = () => {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    setCurrentUserId(localStorage.getItem('user_id'));
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/friends/requests', {
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

  const acceptFriendRequest = async (requestId) => {
    try {
      const response = await fetch('http://localhost:5000/friends/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token') // Ensure you have the token stored in localStorage
        },
        body: JSON.stringify({ request_id: requestId }), // Match the payload to what the backend expects
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // The request was successful, handle the result here
        toast({
          title: 'Friend Request Accepted',
          description: `You have accepted a friend request.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // The request was not successful, handle the error here
        throw new Error(data.message || 'Could not accept friend request.');
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

  const rejectFriendRequest = async (requestId) => {
    try {
      const response = await fetch('http://localhost:5000/friends/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token') // Ensure you have the token stored in localStorage
        },
        body: JSON.stringify({ request_id: requestId }), // Match the payload to what the backend expects
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // The request was successful, handle the result here
        toast({
          title: 'Friend Request Rejected',
          description: `You have rejected a friend request.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // The request was not successful, handle the error here
        throw new Error(data.message || 'Could not reject friend request.');
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
        Friend Requests
      </Text>
      <Box maxH="calc(100vh - 200px)" overflowY="auto">
        <List spacing={3}>
          {users.map(user => (
            <ListItem key={user.request_id} p={4} display="flex" justifyContent="space-between" alignItems="center" borderBottomWidth="1px">
              <Text isTruncated maxWidth="70%">
                {user.from_user_id.toString() === currentUserId ? user.to_username : user.from_username}
              </Text>

              <Flex>
                {user.from_user_id.toString() === currentUserId ? (
                  <IconButton
                    aria-label='Pending'
                    icon={<TimeIcon />}
                    isDisabled={true} // Disabling the button as it's only for display
                    size="sm"
                    variant="ghost"
                  />
                ) : (
                  <>
                    <IconButton
                      aria-label="Reject friend request"
                      icon={<SmallCloseIcon />}
                      onClick={() => rejectFriendRequest(user.request_id)}
                      size="sm"
                      colorScheme="red"
                      mr={2} // Add margin to the right for spacing between buttons
                    />
                    <IconButton
                      aria-label="Accept friend request"
                      icon={<CheckIcon />}
                      onClick={() => acceptFriendRequest(user.request_id)}
                      size="sm"
                      colorScheme="green"
                    />
                  </>
                )}
              </Flex>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default FriendRequests;