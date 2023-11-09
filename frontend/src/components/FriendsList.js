import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, Text, IconButton, useToast, HStack } from '@chakra-ui/react';

import { ChatIcon, SmallCloseIcon } from '@chakra-ui/icons';


const FriendsList = ({ onChatIconClick }) => {
  const [friends, setFriends] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
        const response = await fetch('http://localhost:5000/friends', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFriends(data);
      } catch (error) {
        toast({
          title: 'Error loading friends',
          description: error.toString(),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchFriends();
  }, [toast]);

  const removeFriendRequest = async (friendId) => {
    try {
      const response = await fetch(`http://localhost:5000/friends/remove`, {
        method: 'DELETE',
        
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ friend_id: friendId }), // Match the payload to what the backend expects
      });
  
      if (response.ok) {
        // The request was successful, handle the result here
        toast({
          title: 'Friend Removed',
          description: 'You have successfully removed the friend.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // The request was not successful, handle the error here
        const errorData = await response.json(); // Ensure that the backend is designed to send a JSON response for errors as well
        throw new Error(errorData.message || 'Could not remove the friend.');
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
        Friends
      </Text>
      <Box maxH="calc(100vh - 200px)" overflowY="auto">
        <List spacing={3}>
          {friends.map(friend => (
            <ListItem key={friend.user_id} p={4} display="flex" justifyContent="space-between" alignItems="center" borderBottomWidth="1px">
              <Text isTruncated maxWidth="70%">
                {friend.username}
              </Text>
              <HStack spacing={2}> {/* This will keep the buttons together horizontally */}
                <IconButton
                  aria-label="Unfriend"
                  icon={<SmallCloseIcon />}
                  onClick={() => removeFriendRequest(friend.user_id)}
                  size="sm"
                  colorScheme="gray"
                />
                <IconButton
                  aria-label="Chat with friend"
                  icon={<ChatIcon />}
                  onClick={() => onChatIconClick(friend.user_id, friend.username)}
                  size="sm"
                  colorScheme="gray"
                />
              </HStack>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default FriendsList;
