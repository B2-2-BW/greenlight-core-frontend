import axios from 'axios';
import { GREENLIGHT_CORE_API_URL } from '../config/config';

const ApiClient = axios.create({
  baseURL: GREENLIGHT_CORE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default ApiClient;
