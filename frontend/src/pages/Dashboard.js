import React from 'react';
import { Container, Typography } from '@mui/material';

const Dashboard = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography paragraph>
        Welcome to the Apartment Matching Admin Panel
      </Typography>
    </Container>
  );
};

export default Dashboard;