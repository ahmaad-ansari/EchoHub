// src/components/NavBar.js
import React from 'react';
import { Box, Flex, Heading, Spacer, Link as ChakraLink } from '@chakra-ui/react'; // Import Chakra UI components
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const NavBar = () => {
  return (
    <Flex bg="blue.500" p={4} alignItems="center">
      <Box flex={1}>
        <Heading size="md" color="white">
          EchoHub
        </Heading>
      </Box>
      <Box>
        <ChakraLink as={Link} to="/login" color="white" mr={4}>
          Login
        </ChakraLink>
        <ChakraLink as={Link} to="/register" color="white">
          Register
        </ChakraLink>
      </Box>
    </Flex>
  );
};

export default NavBar;
