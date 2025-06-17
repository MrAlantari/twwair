import React, { useState } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Typography, createTheme, ThemeProvider } from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { pl } from 'date-fns/locale';
import Navbar from './Navbar';
import axios from 'axios';

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

const DeleteFromRange = () => {
  const [deviceId, setDeviceId] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const handleDelete = async (deviceId: number, startDate: Date, endDate: Date) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    axios
      .delete(`http://localhost:3100/api/data/from-range/${deviceId}`, {
        data: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${localStorage.getItem("token")}`
        }
      })
      .then(response => {
        addLog(`Deleted data between ${startDate} and ${endDate} in device ${deviceId}`);
        setSuccess(true);
      })
      .catch(err => {
        const errorMessage = err.response?.data?.message
          ? err.response.data.message
          : err.message || 'Wystąpił nieznany błąd';
        setError(errorMessage);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setError('Proszę wybrać obie daty');
      return;
    }

    if (startDate > endDate) {
      setError('Data początkowa nie może być późniejsza niż data końcowa');
      return;
    }

    await handleDelete(deviceId, startDate, endDate);
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

  return (
    <ThemeProvider theme={darkTheme}>
      <Navbar></Navbar>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Usuń odczyty z urządzenia (przedział czasowy)
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel id="device-id-label">ID urządzenia</InputLabel>
          <Select
            labelId="device-id-label"
            value={deviceId}
            label="ID urządzenia"
            onChange={(e) => setDeviceId(Number(e.target.value))}
          >
            {Array.from({ length: 17 }, (_, i) => (
              <MenuItem key={i} value={i}>
                {i}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
          <DateTimePicker
            label="Od daty"
            value={startDate}
            onChange={setStartDate}
            slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
            timeSteps={{ minutes: 1 }}
            ampm={false}
          />

          <DateTimePicker
            label="Do daty"
            value={endDate}
            onChange={setEndDate}
            slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
            timeSteps={{ minutes: 1 }}
            ampm={false}
          />
        </LocalizationProvider>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {success && (
          <Typography color="success.main" sx={{ mt: 2 }}>
            Odczyty zostały pomyślnie usunięte!
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Przetwarzanie...' : 'Usuń odczyty'}
        </Button>
      </Box>
    </ThemeProvider>
  );
};

export default DeleteFromRange;