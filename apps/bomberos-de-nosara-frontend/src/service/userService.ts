import axios from 'axios';

const API_URL = 'http://localhost:3000/users';

export const getUsers = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createUser = async (userData: {
  username: string;
  password: string;
  roles: string[];
}) => {
  const token = localStorage.getItem('token');
  const res = await axios.post(API_URL, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
