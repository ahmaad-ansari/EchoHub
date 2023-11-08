import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

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

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const toast = useToast();

    const handleLogin = async (event) => {
        event.preventDefault(); // Prevent the default form submit action

        try {
            // Call your backend API endpoint
            const response = await fetch("http://localhost:5000/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json(); // Try to parse the response

            if (!response.ok) {
                // If the HTTP status code is not successful, throw an error with the server's message
                throw new Error(data.message || "Failed to log in");
            }

            // Assume data.token contains your JWT token
            localStorage.setItem("token", data.token); // Store the token in localStorage
            navigate("/app"); // Redirect to main application page

            // Reset form state
            setUsername("");
            setPassword("");

            // Show success toast
            toast({
                title: "Login successful",
                description: "You have successfully logged in.",
                status: "success",
                duration: 9000,
                isClosable: true,
            });
        } catch (error) {
            // Show error toast with the server's error message
            toast({
                title: "An error occurred.",
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
                    Login
                </Text>
                <form onSubmit={handleLogin}>
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
                            Login
                        </Button>
                    </VStack>
                </form>
                <Text mt={6} textAlign="center">
                    Don't have an account?{" "}
                    <Link
                        as={RouterLink}
                        to="/register"
                        color="blue.500"
                        fontWeight="bold"
                    >
                        Register
                    </Link>
                </Text>
            </Box>
        </Center>
    );
};

export default Login;
