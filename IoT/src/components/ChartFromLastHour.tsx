import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, Paper, Typography, Chip } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import axios from 'axios';
import type { IData } from '../types/data.type'
import Navbar from './Navbar';

interface LogEntry {
    id: number;
    action: string;
    timestamp: string;
}

const ChartFromLastHour = () => {
    const [data, setData] = useState<IData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [emptyCount, setEmptyCount] = useState(0);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const requestSent = React.useRef(1);

    useEffect(() => {
        if (requestSent.current % 2 != 0) {
            handleGettingData();
        }
        requestSent.current += 1;
    }, [])

    const handleGettingData = async () => {
        axios
            .get('http://localhost:3100/api/data/hour', {
                headers: {
                    'authorization': `Bearer ${localStorage.getItem("token")}`
                }
            })
            .then((response) => {
                const flattenedData = response.data.flatMap((arr: IData[]) =>
                    arr.length > 0 ? arr : null
                ).filter(Boolean);

                setEmptyCount(response.data.filter((arr: IData[]) => arr.length === 0).length);

                setData(flattenedData)
                addLog("Visited last hour chart");
                setLoading(false)
            })
            .catch((error) => {
                setError('Failed to fetch data');
                setLoading(false);
                console.error('Error fetching data: ', error);
            });
    };

    const chartData = data.map((item) => ({
        date: item.readingDate ? new Date(item.readingDate) : new Date(),
        temperature: item.temperature,
        pressure: item.pressure,
        humidity: item.humidity,
    }));

    chartData.sort((a, b) => a.date.getTime() - b.date.getTime());

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

    return (
        <>
            <Navbar></Navbar>
            <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
                <Typography variant="h6" gutterBottom>
                    Hourly Measurements Chart
                </Typography>

                {emptyCount > 0 && (
                    <Chip
                        label={`${emptyCount} empty data sets`}
                        color="info"
                        size="small"
                        sx={{ mb: 2 }}
                    />
                )}

                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                ) : chartData.length === 0 ? (
                    <Alert severity="warning">No valid measurement data available</Alert>
                ) : (
                    <Box sx={{ width: '100%' }}>
                        <LineChart
                            xAxis={[{
                                dataKey: 'date',
                                scaleType: 'time',
                                valueFormatter: (date) => date.toLocaleTimeString(),
                                label: 'Measurement Time',
                            }]}
                            yAxis={[
                                {
                                    id: 'leftAxis',
                                    label: 'Temperature (°C) / Humidity (%)',
                                },
                                {
                                    id: 'rightAxis',
                                    label: 'Pressure (hPa)',
                                },
                            ]}
                            series={[
                                {
                                    dataKey: 'temperature',
                                    label: 'Temperature (°C)',
                                    color: '#ff5252',
                                    yAxisKey: 'leftAxis',
                                },
                                {
                                    dataKey: 'humidity',
                                    label: 'Humidity (%)',
                                    color: '#4285f4',
                                    yAxisKey: 'leftAxis',
                                },
                                {
                                    dataKey: 'pressure',
                                    label: 'Pressure (hPa)',
                                    color: '#0f9d58',
                                    yAxisKey: 'rightAxis',
                                },
                            ]}
                            leftAxis="leftAxis"
                            rightAxis="rightAxis"
                            dataset={chartData}
                            height={400}
                            margin={{ left: 70, right: 70 }}
                            slotProps={{
                                legend: {
                                    direction: 'row',
                                    position: { vertical: 'top', horizontal: 'middle' },
                                    padding: 0,
                                },
                            }}
                        />
                    </Box>
                )}
            </Paper>
        </>
    );
}

export default ChartFromLastHour;