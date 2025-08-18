import axios from 'axios';

const API_URL='http://localhost:3000/users';

export const getUsers=async () => {
  const token=localStorage.getItem('token');
  const res=await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createUser=async (userData: {
  username: string;
  password: string;
  roles: string[];
}) => {
  const token=localStorage.getItem('token');
  const res=await axios.post(API_URL, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateUser=async (
  id: number,
  userData: {
    username: string;
    password?: string;
    roles: string[];
  }
) => {
  const token=localStorage.getItem('token');
  const res=await axios.put(`http://localhost:3000/users/${id}`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteUser=async (id: number) => {
  const token=localStorage.getItem('token');
  const res=await axios.delete(`http://localhost:3000/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getUserById=async (id: number) => {
  const token=localStorage.getItem('token');
  const res=await axios.get(`http://localhost:3000/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};



