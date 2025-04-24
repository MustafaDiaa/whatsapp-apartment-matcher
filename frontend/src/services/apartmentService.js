import api from './api';

export const getApartments = async () => {
  try {
    const response = await api.get('/apartments');
    return response.data;
  } catch (error) {
    console.error('Error fetching apartments:', error);
    throw error;
  }
};

export const addApartment = async (apartmentData) => {
  try {
    const response = await api.post('/apartments', apartmentData);
    return response.data;
  } catch (error) {
    console.error('Error adding apartment:', error);
    throw error;
  }
};