import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, Text, IconButton, useToast, HStack } from '@chakra-ui/react';
import { ChatIcon, SmallCloseIcon } from '@chakra-ui/icons';

const FriendsList = ({ onChatIconClick }) => {
  const [friends, setFriends] = useState([]); // State to store friends data
  const toast = useToast(); // Access to Chakra UI's toast notifications

  // Fetch friends data when the component mounts or 'toast' changes
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
        const response = await fetch('http://localhost:5000/friends', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Attach token to request header
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`); // Throw an error if the response is not successful
        }

        const data = await response.json(); // Parse the response data
        setFriends(data); // Set friends data obtained from the server
      } catch (error) {
        // Display an error toast notification if there's an issue fetching friends data
        toast({
          title: 'Error loading friends',
          description: error.toString(),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchFriends(); // Invoke the function to fetch friends
  }, [toast]); // Dependency array to trigger the effect on 'toast' change

  // Function to handle removal of a friend
  const removeFriendRequest = async (friendId) => {
    try {
      const response = await fetch(`http://localhost:5000/friends/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Attach token to request header
        },
        body: JSON.stringify({ friend_id: friendId }), // Send the friend ID to be removed
      });

      if (response.ok) {
        // Display a success toast notification when a friend is successfully removed
        toast({
          title: 'Friend Removed',
          description: 'You have successfully removed the friend.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Display an error toast notification if there's an issue removing the friend
        const errorData = await response.json(); // Parse the error response data
        throw new Error(errorData.message || 'Could not remove the friend.');
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
                  onClick={() => removeFriendRequest(friend.user_id)} // Call the function to remove the friend
                  size="sm"
                  colorScheme="gray"
                />
                <IconButton
                  aria-label="Chat with friend"
                  icon={<ChatIcon />}
                  onClick={() => onChatIconClick(friend.user_id, friend.username)} // Trigger a chat with the friend
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
