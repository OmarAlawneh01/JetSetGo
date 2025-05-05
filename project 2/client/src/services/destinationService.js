import axios from 'axios';
import { API_BASE_URL } from '../config';

export const getDestinations = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/destinations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching destinations:', error);
    throw error;
  }
};

export const getDestinationById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/destinations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching destination:', error);
    throw error;
  }
}; 