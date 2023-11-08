// src/pages/HomePage.js
import React from 'react';
import Navbar from '../components/Navbar';
import FriendSearch from '../components/FriendSearch';
import FriendRequests from '../components/FriendRequests';
import FriendsList from '../components/FriendsList';
import ChatPanel from '../components/ChatPanel';
import { Grid, GridItem } from '@chakra-ui/react';

const HomePage = () => {
  // You will add state management and API calls here

  return (
    <>
      <Navbar /* props needed */ />
      <Grid templateColumns="repeat(5, 1fr)" gap={4}>
        <GridItem colSpan={1}>
          <FriendSearch /* props needed */ />
          <FriendRequests /* props needed */ />
          <FriendsList /* props needed */ />
        </GridItem>
        <GridItem colSpan={4}>
          <ChatPanel /* props needed */ />
        </GridItem>
      </Grid>
    </>
  );
};

export default HomePage;
