import axios from 'axios';
import { API_BASE_URL } from '../config';

// هاد الـ function بتجيب كل الـ destinations من الـ API
export const getDestinations = () => () => fetchDestinationData('');

// هاد الـ function بتجيب معلومات destination معين باستخدام الـ ID
export const getDestinationById = id => () => fetchDestinationData(`/${id}`);

//هاد الـ function بتعمل request للـ API وتجيب البيانات
const fetchDestinationData = async (endpoint) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/destinations${endpoint}`);
    return response.data;
  } catch (error) {
    console.error('مشكلة في جلب معلومات الـ destination:', error);
    throw error;
  }
}; 