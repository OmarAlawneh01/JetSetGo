import axios from 'axios';
import { API_BASE_URL } from '../config';

export function getDestinations() {
  return async function() {
    try {
      const response = await axios.get(`${API_BASE_URL}/destinations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching destinations:', error);
      throw error;
    }
  };
}

export function getDestinationById(id) {
  return async function() {
    try {
      const response = await axios.get(`${API_BASE_URL}/destinations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching destination:', error);
      throw error;
    }
  };
} 