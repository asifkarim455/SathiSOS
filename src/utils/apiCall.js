// utils/apiCall.js
import axios from 'axios';
// export const BASE_URL = 'http://192.168.1.2:4000';
export const BASE_URL = 'https://sos-backend.amptechnology.in';

export const apiCall = async (endpoint, method = 'get', data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      data,
      headers,
    };

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error?.response?.data?.message || error.message || 'API Error',
    };
  }
};
