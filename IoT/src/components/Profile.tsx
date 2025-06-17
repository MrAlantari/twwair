import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Typography, Box, Paper, List, ListItem, ListItemText, Divider,
    Button, createTheme, ThemeProvider, CircularProgress, Alert, Avatar
} from '@mui/material';
import Navbar from './Navbar';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt?: string;
}

interface LogEntry {
    id: number;
    action: string;
    timestamp: string;
}

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const Profile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const requestSent = React.useRef(1);

    useEffect(() => {
        if (requestSent.current % 2 != 0) {
            fetchUserData();
            loadLogsFromStorage();
        }
        requestSent.current += 1;
    }, []);

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return {
            headers: {
                'authorization': `Bearer ${token}`
            }
        };
    };

    const fetchUserData = async () => {
        setLoading(true);
        setError(null);

        axios
            .get(`http://localhost:3100/api/user/me/${localStorage.getItem("name")}`, getAuthHeader())
            .then((response) => {
                console.log(response.data)
                setUser(response.data)
                addLog('Profile viewed');
            })
            .catch((error) => {
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 401) {
                        handleUnauthorized();
                    } else {
                        setError(error.response?.data?.message || 'Failed to fetch user data');
                    }
                } else {
                    setError('An unexpected error occurred');
                }
            })
            .finally(() => {
                setLoading(false);
            })
    };

    const handleUnauthorized = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const loadLogsFromStorage = () => {
        const storedLogs = localStorage.getItem('userActivityLogs');
        if (storedLogs) {
            setLogs(JSON.parse(storedLogs));
        }
    };

    const addLog = (action: string) => {
        const storedLogs = localStorage.getItem('userActivityLogs');
        const currentLogs: LogEntry[] = storedLogs ? JSON.parse(storedLogs) : [];

        const newLog: LogEntry = {
            id: Date.now() * Math.random() * 1000,
            action,
            timestamp: new Date().toISOString()
        };

        const updatedLogs = [newLog, ...currentLogs].slice(0, 50);

        setLogs(updatedLogs);
        localStorage.setItem('userActivityLogs', JSON.stringify(updatedLogs));
    };

    const handleLogout = async () => {
        setLoading(true);

        axios
            .delete(`http://localhost:3100/api/user/logout/${localStorage.getItem("token")}`, getAuthHeader())
            .then((response) => {
                addLog('Logged out');
                localStorage.removeItem("token");
                navigate('/login')
            })
            .catch((error) => {
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 401) {
                        handleUnauthorized();
                    } else {
                        setError(error.response?.data?.message || 'Logout failed');
                    }
                } else {
                    setError('An unexpected error occurred');
                }
            })
            .finally(() => {
                setLoading(false);
            })
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading && !user) {
        return (
            <>
                <Navbar></Navbar>
                <ThemeProvider theme={darkTheme}>
                    <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Container>
                </ThemeProvider>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar></Navbar>
                <ThemeProvider theme={darkTheme}>
                    <Container maxWidth="md" sx={{ mt: 4 }}>
                        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                        <Button variant="contained" onClick={fetchUserData}>
                            Retry
                        </Button>
                    </Container>
                </ThemeProvider>
            </>
        );
    }

    if (!user) {
        return (
            <>
                <Navbar></Navbar>
                <ThemeProvider theme={darkTheme}>
                    <Container maxWidth="md" sx={{ mt: 4 }}>
                        <Alert severity="warning">No user data available</Alert>
                        <Button variant="contained" onClick={() => navigate('/login')}>
                            Go to Login
                        </Button>
                    </Container>
                </ThemeProvider>
            </>
        );
    }

    return (
        <>
            <Navbar></Navbar>
            <ThemeProvider theme={darkTheme}>
                <Container maxWidth="md">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography variant="h4" component="h1">
                            User Profile
                        </Typography>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleLogout}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Log Out'}
                        </Button>
                    </Box>

                    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                            <Avatar sx={{ width: 80, height: 80, fontSize: 40 }}>
                                {user.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="h5">{user.name}</Typography>
                                <Typography color="text.secondary">{user.role}</Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                                <Typography>{user.email}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">User ID</Typography>
                                <Typography>{user.id}</Typography>
                            </Box>
                            {user.createdAt && (
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Member since</Typography>
                                    <Typography>{formatDate(user.createdAt)}</Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>

                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Activity Logs</Typography>

                        {logs.length === 0 ? (
                            <Typography sx={{ p: 2 }}>No activity logs yet</Typography>
                        ) : (
                            <List dense>
                                {logs.map((log) => (
                                    <React.Fragment key={log.id}>
                                        <ListItem>
                                            <ListItemText
                                                primary={log.action}
                                                secondary={formatDate(log.timestamp)}
                                                primaryTypographyProps={{ variant: 'body2' }}
                                            />
                                        </ListItem>
                                        <Divider component="li" />
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Container>
            </ThemeProvider>
        </>
    );
};

export default Profile;