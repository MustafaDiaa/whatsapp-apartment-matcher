import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './pages/Dashboard';
import Apartments from './pages/Apartments';
import Requests from './pages/Requests';
import Navbar from './components/Navbar';

const theme = createTheme({
  palette: {
    primary: {
      main: '#25D366', // WhatsApp green
    },
    secondary: {
      main: '#075E54', // WhatsApp dark green
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/apartments" element={<Apartments />} />
          <Route path="/requests" element={<Requests />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;