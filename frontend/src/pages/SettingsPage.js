import React, { useState, useEffect } from 'react';
import { Box, useToast } from '@chakra-ui/react';
import ProfileSettings from '../components/ProfileSettings'; // Adjust the path as necessary
import Navbar from '../components/Navbar';


const SettingsPage = () => {
    return (<>
        <Navbar />
        <ProfileSettings />
    </>);
};

export default SettingsPage;
