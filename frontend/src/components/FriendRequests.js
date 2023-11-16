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
  // State variables to manage the list of friend requests and the current user ID
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const toast = useToast(); // Chakra UI's toast notification function

  useEffect(() => {
    setCurrentUserId(localStorage.getItem('user_id')); // Retrieve and set the current user's ID
    const fetchUsers = async () => {
      try {
        // Fetch friend requests from the server using the user's token
        const response = await fetch('http://localhost:5000/friends/requests', {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token') // Include the user's token in the request header
          }
        });
        const data = await response.json(); // Parse the response data

        if (response.ok) {
          setUsers(data); // Set the list of friend requests received from the server
        } else {
          throw new Error(data.message || 'Could not fetch users.'); // Throw an error if fetching fails
        }
      } catch (error) {
        // Display an error toast notification if there's an issue fetching friend requests
        toast({
          title: 'Error',
          description: error.toString(),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchUsers(); // Invoke the function to fetch friend requests
  }, [toast]); // Re-fetch friend requests if the 'toast' function changes

  // Function to accept a friend request
  const acceptFriendRequest = async (requestId) => {
    try {
      const response = await fetch('http://localhost:5000/friends/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token') // Include the user's token in the request header
        },
        body: JSON.stringify({ request_id: requestId }), // Send the request ID to the server
      });

      const data = await response.json(); // Parse the response data

      if (response.ok) {
        // Display a success toast notification when a friend request is accepted
        toast({
          title: 'Friend Request Accepted',
          description: `You have accepted a friend request.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Display an error toast notification if there's an issue accepting the friend request
        throw new Error(data.message || 'Could not accept friend request.');
      }
    } catch (error) {
      // Display an error toast notification if there's an issue with the request
      toast({
        title: 'Error',
        description: error.toString(),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Function to reject a friend request
  const rejectFriendRequest = async (requestId) => {
    try {
      const response = await fetch('http://localhost:5000/friends/reject', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token') // Include the user's token in the request header
        },
        body: JSON.stringify({ request_id: requestId }), // Send the request ID to the server
      });

      const data = await response.json(); // Parse the response data

      if (response.ok) {
        // Display a success toast notification when a friend request is rejected
        toast({
          title: 'Friend Request Rejected',
          description: `You have rejected a friend request.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Display an error toast notification if there's an issue rejecting the friend request
        throw new Error(data.message || 'Could not reject friend request.');
      }
    } catch (error) {
      // Display an error toast notification if there's an issue with the request
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
                  // Display a time icon for pending friend requests
                  <IconButton
                    aria-label='Pending'
                    icon={<TimeIcon />}
                    isDisabled={true} // Disabling the button as it's only for display
                    size="sm"
                    variant="ghost"
                  />
                ) : (
                  // Display accept and reject buttons for received friend requests
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
