import axios from "axios";
import { auth } from "../firebase";

// Create axios instance with auth interceptor
const createAuthenticatedApi = (baseURL) => {
  const api = axios.create({ baseURL });

  // Add auth token to every request
  api.interceptors.request.use(async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Error getting auth token
    }
    return config;
  });

  return api;
};

// Create authenticated API instance
export const farmlyApi = createAuthenticatedApi("https://farmly.onrender.com/api");

// Export all the API methods using the authenticated client
export const getFarms = () => {
  return farmlyApi.get("/farms")
    .then((response) => response.data);
};

export const getFarmById = (farm_id) => {
  return farmlyApi.get(`/farms/${farm_id}`)
    .then((response) => response.data);
};

export const postFarm = (newFarm) => {
  return farmlyApi.post(`/farms`, newFarm)
    .then((response) => response.data);
};

export const patchFarmById = (farm_id, updateBody) => {
  return farmlyApi.patch(`/farms/${farm_id}`, updateBody)
    .then((response) => response.data);
};

export const deleteFarmById = (farm_id) => {
  return farmlyApi.delete(`/farms/${farm_id}`)
    .then((response) => response.data);
};