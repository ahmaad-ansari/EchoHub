import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, Text, IconButton, useToast } from '@chakra-ui/react';
import { ChatIcon } from '@chakra-ui/icons';


const FriendsList = () => {
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

  const chat = async (friend_id) => {
   
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
              <IconButton
                aria-label="Chat with friend"
                icon={<ChatIcon />}
                onClick={() => chat(friend.user_id)}
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

export default FriendsList;
