import type { IData } from '../types/data.type';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const DevicePaper = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(2),
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
  height: '80%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: "#808080"
}));

const DataRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
});

interface DeviceProps {
  deviceId: number;
  initialData?: IData;
  isSelected?: boolean;
  isSmall?: boolean;
}

function Device({ deviceId, initialData, isSelected = false, isSmall = false }: DeviceProps) {
  const theme = useTheme();

  if (!initialData) {
    return (
      <DevicePaper sx={{ 
        border: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
        opacity: 0.7 
      }}>
        <Typography variant="h6" color="textSecondary">Device No. {deviceId}</Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>No data</Typography>
      </DevicePaper>
    );
  }

  if (isSmall) {
    return (
      <DevicePaper sx={{ 
        border: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
        minWidth: 140 
      }}>
        <Typography variant="subtitle1" fontWeight="medium">Device No. {deviceId}</Typography>
        <Box sx={{ mt: 1 }}>
          <DataRow>
            <Typography variant="body2">Temp:</Typography>
            <Typography variant="body2" fontWeight="medium" color={theme.palette.warning.main}>
              {initialData.temperature} °C
            </Typography>
          </DataRow>
          <DataRow>
            <Typography variant="body2">Press:</Typography>
            <Typography variant="body2" fontWeight="medium">
              {initialData.pressure} hPa
            </Typography>
          </DataRow>
          <DataRow>
            <Typography variant="body2">Humid:</Typography>
            <Typography variant="body2" fontWeight="medium" color={theme.palette.info.main}>
              {initialData.humidity}%
            </Typography>
          </DataRow>
        </Box>
      </DevicePaper>
    );
  }

  return (
    <DevicePaper sx={{ border: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none' }}>
      <Typography variant="h5" fontWeight="medium" gutterBottom>
        Device No. {deviceId}
      </Typography>
      <Box sx={{ mt: 1 }}>
        <DataRow>
          <Typography variant="body1">Temperature:</Typography>
          <Typography variant="body1" fontWeight="medium" color={theme.palette.warning.main}>
            {initialData.temperature} °C
          </Typography>
        </DataRow>
        <DataRow>
          <Typography variant="body1">Pressure:</Typography>
          <Typography variant="body1" fontWeight="medium">
            {initialData.pressure} hPa
          </Typography>
        </DataRow>
        <DataRow>
          <Typography variant="body1">Humidity:</Typography>
          <Typography variant="body1" fontWeight="medium" color={theme.palette.info.main}>
            {initialData.humidity}%
          </Typography>
        </DataRow>
      </Box>
    </DevicePaper>
  );
};

export default Device;