import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  TextField,
  MenuItem,
  Box
} from '@mui/material';
import axios from 'axios';

const statusColors = {
  Pending: 'default',
  Confirmed: 'primary',
  Rejected: 'error',
  Completed: 'success'
};

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState({
    status: '',
    area: '',
    type: ''
  });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/requests');
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(request => {
    return (
      (filter.status === '' || request.status === filter.status) &&
      (filter.area === '' || request.area?.toLowerCase().includes(filter.area.toLowerCase())) &&
      (filter.type === '' || request.type === filter.type)
    );
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/requests/${id}/status`, { status: newStatus });
      setRequests(requests.map(req => 
        req._id === id ? { ...req, status: newStatus } : req
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Client Requests</Typography>
      
      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          select
          label="Status"
          value={filter.status}
          onChange={(e) => setFilter({...filter, status: e.target.value})}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Confirmed">Confirmed</MenuItem>
          <MenuItem value="Rejected">Rejected</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
        </TextField>

        <TextField
          label="Area"
          value={filter.area}
          onChange={(e) => setFilter({...filter, area: e.target.value})}
          sx={{ minWidth: 120 }}
        />

        <TextField
          select
          label="Type"
          value={filter.type}
          onChange={(e) => setFilter({...filter, type: e.target.value})}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="1BHK">1BHK</MenuItem>
          <MenuItem value="2BHK">2BHK</MenuItem>
          <MenuItem value="3BHK">3BHK</MenuItem>
          <MenuItem value="4BHK">4BHK</MenuItem>
          <MenuItem value="Studio">Studio</MenuItem>
        </TextField>
      </Box>

      {/* Requests Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client ID</TableCell>
              <TableCell>Area</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request._id}>
                <TableCell>{request.clientId?.slice(-8)}</TableCell>
                <TableCell>{request.area || '-'}</TableCell>
                <TableCell>{request.type || '-'}</TableCell>
                <TableCell>{request.budget ? `EGP${request.budget}` : '-'}</TableCell>
                <TableCell>
                  <Chip 
                    label={request.status} 
                    color={statusColors[request.status] || 'default'}
                  />
                </TableCell>
                <TableCell>
                  {new Date(request.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {request.status === 'Pending' && (
                    <>
                      <Chip 
                        label="Confirm" 
                        color="success" 
                        onClick={() => handleStatusChange(request._id, 'Confirmed')}
                        sx={{ mr: 1, cursor: 'pointer' }}
                      />
                      <Chip 
                        label="Reject" 
                        color="error"
                        onClick={() => handleStatusChange(request._id, 'Rejected')}
                        sx={{ cursor: 'pointer' }}
                      />
                    </>
                  )}
                  {request.status === 'Confirmed' && (
                    <Chip 
                      label="Mark Complete" 
                      color="primary"
                      onClick={() => handleStatusChange(request._id, 'Completed')}
                      sx={{ cursor: 'pointer' }}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Requests;