import { Box, Typography } from '@mui/material';
import type { IData } from '../types/data.type';
import { LineChart } from '@mui/x-charts/LineChart';

interface DeviceChartProps {
  deviceId: number;
  result: IData[];
}

function DeviceChart({ deviceId, result }: DeviceChartProps) {

  const chartData = result.map((data) => ({
    date: data.readingDate ? new Date(data.readingDate) : new Date(),
    temperature: data.temperature,
    pressure: data.pressure,
    humidity: data.humidity,
  }));

  chartData.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <Box sx={{ width: '100%' }}>
      <Typography>Wykres dla urządzenia {deviceId}</Typography>
      <Box>
        <LineChart
          xAxis={[{
            dataKey: 'date',
            scaleType: 'time',
            valueFormatter: (date) => date.toLocaleString(),
            label: 'Czas pomiaru',
          }]}
          yAxis={[
            {
              id: 'leftAxis',
              label: 'Temperatura (°C) / Wilgotność (%)',
            },
            {
              id: 'rightAxis',
              label: 'Ciśnienie (hPa)',
              position: 'right',
            },
          ]}
          series={[
            {
              dataKey: 'temperature',
              label: 'Temperatura (°C)',
              color: '#ff0000',
              yAxisKey: 'leftAxis',
            },
            {
              dataKey: 'humidity',
              label: 'Wilgotność (%)',
              color: '#0000ff',
              yAxisKey: 'leftAxis',
            },
            {
              dataKey: 'pressure',
              label: 'Ciśnienie (hPa)',
              color: '#00aa00',
              yAxisKey: 'rightAxis',
            },
          ]}
          leftAxis="leftAxis"
          rightAxis="rightAxis"
          dataset={chartData}
          height={400}
          margin={{ left: 70, right: 70 }} // Zwiększony margines dla osi
        />
      </Box>
    </Box>
  );
};

export default DeviceChart;