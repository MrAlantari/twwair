import { useState, useEffect } from 'react';
import Device from './Device';
import DeviceChart from './DeviceChart';
import type { IData } from '../types/data.type';
import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import { io } from 'socket.io-client';

function DevicesList() {
    const [devicesData, setDevicesData] = useState<IData[][]>([]);
    const [selectedDevice, setSelectedDevice] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const socket = io('http://localhost:3000');

        const handleDevicesUpdate = (data: IData[][]) => {
            setDevicesData(data);
            console.log(data)
            setLoading(false);
        };

        const requestData = () => {
            socket.emit("requestData");
        }

        socket.on('connect', () => {
            requestData();
        })
        socket.on('intervalData', handleDevicesUpdate);

        return () => {
            socket.off('intervalData', handleDevicesUpdate);
        };
    }, []);

    if (loading) {
        return <Typography>Loading devices...</Typography>
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {selectedDevice !== null && devicesData[selectedDevice]?.[0] && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                            <Device
                                deviceId={selectedDevice}
                                initialData={devicesData[selectedDevice][0]}
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
                            initialData={deviceData[0]}
                            isSmall
                        />
                    </Box>
                ))}
            </Box>
        </Container>
    );
};

export default DevicesList;