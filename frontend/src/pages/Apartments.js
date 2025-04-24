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
  Button, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle 
} from '@mui/material';
import axios from 'axios';

const Apartments = () => {
  const [apartments, setApartments] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    price: '',
    rooms: '2BHK',
    status: 'Available'
  });

  const fetchApartments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/apartments');
      setApartments(res.data);
    } catch (error) {
      console.error('Error fetching apartments:', error);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:5000/api/apartments', formData);
      fetchApartments();
      setOpen(false);
      setFormData({
        location: '',
        price: '',
        rooms: '2BHK',
        status: 'Available'
      });
    } catch (error) {
      console.error('Error adding apartment:', error.response?.data || error.message);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Apartment Listings</Typography>
      
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Add New Apartment
      </Button>
      
      <TableContainer component={Paper} style={{ marginTop: 20 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Location</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apartments.map((apt) => (
              <TableRow key={apt._id}>
                <TableCell>{apt.location}</TableCell>
                <TableCell>{apt.rooms}</TableCell>
                <TableCell>EGP{apt.price}</TableCell>
                <TableCell>{apt.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Apartment</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="location"
            label="Location"
            fullWidth
            value={formData.location}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="price"
            label="Price (EGP)"
            type="number"
            fullWidth
            value={formData.price}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="rooms"
            label="Type"
            select
            fullWidth
            value={formData.rooms}
            onChange={handleChange}
            SelectProps={{
              native: true,
            }}
          >
            <option value="1BHK">1BHK</option>
            <option value="2BHK">2BHK</option>
            <option value="3BHK">3BHK</option>
            <option value="4BHK">4BHK</option>
            <option value="Studio">Studio</option>
          </TextField>
          <TextField
            margin="dense"
            name="status"
            label="Status"
            select
            fullWidth
            value={formData.status}
            onChange={handleChange}
            SelectProps={{
              native: true,
            }}
          >
            <option value="Available">Available</option>
            <option value="Rented">Rented</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Apartments;