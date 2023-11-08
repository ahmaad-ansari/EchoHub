import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import {
    Center,
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useToast,
    Text,
    Link,
} from "@chakra-ui/react";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const toast = useToast();

    const handleRegister = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(
                "http://localhost:5000/users/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ username, password }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to register");
            }

            // Show success toast
            toast({
                title: "Registration successful",
                description: "Your account has been created.",
                status: "success",
                duration: 9000,
                isClosable: true,
            });

            // Reset form state
            setUsername("");
            setPassword("");

            // Redirect to login or another appropriate action
            // history.push('/login');
        } catch (error) {
            toast({
                title: "Registration failed",
                description: error.toString(),
                status: "error",
                duration: 9000,
                isClosable: true,
            });
        }
    };

    return (
        <Center height="100vh">
            <Box
                p={8}
                maxWidth="400px"
                borderWidth={1}
                borderRadius={8}
                boxShadow="lg"
            >
                <Text
                    mb={4}
                    fontSize="3xl"
                    fontWeight="bold"
                    textAlign="center"
                >
                    Register
                </Text>
                <form onSubmit={handleRegister}>
                    <VStack spacing={4}>
                        <FormControl id="username" isRequired>
                            <FormLabel>Username</FormLabel>
                            <Input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </FormControl>
                        <FormControl id="password" isRequired>
                            <FormLabel>Password</FormLabel>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </FormControl>
                        <Button type="submit" width="full" mt={4}>
                            Register
                        </Button>
                    </VStack>
                </form>
                <Text mt={6} textAlign="center">
                    Already have an account?{" "}
                    <Link
                        as={RouterLink}
                        to="/login"
                        color="blue.500"
                        fontWeight="bold"
                    >
                        Log in
                    </Link>
                </Text>
            </Box>
        </Center>
    );
};

export default Register;
