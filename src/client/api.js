import axios from 'axios';
import { GREENLIGHT_PROTOTYPE_CORE_API_URL } from './config.js';

const ApiClient = axios.create({
  baseURL: GREENLIGHT_PROTOTYPE_CORE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default ApiClient;
