import { useState, useEffect } from 'react';
import Device from './Device';
import DeviceChart from './DeviceChart';
import type { IData } from '../types/data.type';
import { Box, Container, Typography, Paper, Grid, Alert, Button } from '@mui/material';
import { io, Socket } from 'socket.io-client';
import Navbar from './Navbar';

interface LogEntry {
    id: number;
    action: string;
    timestamp: string;
}

function DevicesList() {
    const [devicesData, setDevicesData] = useState<IData[][]>([]);
    const [selectedDevice, setSelectedDevice] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {

        const token = localStorage.getItem('token');

        if (!token) {
            setError('Authentication required. Please login first.');
            setLoading(false)
            return;
        }

        const socket = io('http://localhost:3000', {
            auth: { token },
        });

        setSocket(socket);

        const handleDevicesUpdate = (data: IData[][]) => {
            setDevicesData(data);
            addLog("Devices viewed");
            setLoading(false);
            setError(null);
        };

        const handleError = (err: string) => {
            setError(err);
            setLoading(false);
            if (err.includes('Authentication')) {
                console.error('Authentication error:', err);
            }
        };

        const requestData = () => {
            socket.emit("requestData");
        }

        socket.on('connect', () => {
            requestData();
        })
        socket.on('intervalData', handleDevicesUpdate);
        socket.on('error', handleError);

        return () => {
            socket.off('intervalData', handleDevicesUpdate);
            socket.off('error', handleError);
        };
    }, []);

    const refreshData = () => {
        if (socket && socket.connected) {
            setLoading(true);
            socket.emit('requestData');
        }
    };

    const hasSignificantChange = (initialData: IData, previousData: IData | null) => {
        if (!initialData || !previousData)
            return false;

        const fields: (keyof IData)[] = ['temperature', 'pressure', 'humidity'];

        return fields.some(field => {
            if (field === 'readingDate')
                return false

            const currentValue = initialData[field] ?? 0;
            const previousValue = previousData[field] ?? 0;

            if (previousValue === 0)
                return false;

            const difference = Math.abs(currentValue - previousValue);
            const percentageChange = (difference / previousValue) * 100;

            return percentageChange >= 20;
        });
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

    if (error) {
        return (
            <>
                <Navbar></Navbar>
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                    <Button
                        variant="contained"
                        onClick={refreshData}
                        disabled={loading}
                    >
                        Retry
                    </Button>
                </Container>
            </>
        );
    }

    if (loading) {
        return (
            <>
                <Navbar></Navbar>
                <Typography>Loading devices...</Typography>
            </>
        )
    }

    return (
        <>
            <Navbar></Navbar>
            <Container maxWidth="lg" sx={{}}>
                {selectedDevice !== null && devicesData[selectedDevice]?.[0] && (
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 2, height: '100%' }}>
                                <Device
                                    deviceId={selectedDevice}
                                    initialData={devicesData[selectedDevice][devicesData[selectedDevice].length - 1]}
                                    hasChange={hasSignificantChange(devicesData[selectedDevice][devicesData[selectedDevice].length - 1],
                                        devicesData[selectedDevice].length - 1 == 0 ? null : devicesData[selectedDevice][devicesData[selectedDevice].length - 2]
                                    )}
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 2, height: '100%' }}>
                                <DeviceChart
                                    deviceId={selectedDevice}
                                    result={devicesData[selectedDevice]}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                <Typography variant="h5" gutterBottom sx={{ mb: 2, mt: 5 }}>
                    All Devices
                </Typography>
                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    overflowX: 'auto',
                    py: 1,
                    pb: 2
                }}>
                    {devicesData.map((deviceData, index) => (
                        <Box
                            key={index}
                            onClick={() => {
                                setSelectedDevice(index);
                            }
                            }
                            sx={{
                                flexShrink: 0,
                                cursor: 'pointer',
                                border: selectedDevice === index ? '2px solid #1976d2' : '1px solid #ddd',
                                borderRadius: 2,
                                p: 1,
                                minWidth: 150
                            }}
                        >
                            <Device
                                deviceId={index}
                                initialData={deviceData[deviceData.length - 1]}
                                isSmall
                                hasChange={hasSignificantChange(deviceData[deviceData.length - 1],
                                    deviceData.length - 1 == 0 ? null : deviceData[deviceData.length - 2]
                                )}
                            />
                        </Box>
                    ))}
                </Box>
            </Container>
        </>
    );
};

export default DevicesList;