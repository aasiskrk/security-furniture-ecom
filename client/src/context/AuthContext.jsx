import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Set default headers for all axios requests
axios.defaults.headers.post['Content-Type'] = 'application/json';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Initial auth check - Token exists:', !!token);
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching user profile...');
      const { data } = await axios.get('http://localhost:5000/api/auth/profile');
      console.log('Profile fetched successfully:', data);
      setUser(data);
    } catch (error) {
      console.error('Error fetching profile:', error.response?.data || error.message);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Login attempt for:', email, 'password length:', password.length);

      // Clear any existing auth headers before login
      delete axios.defaults.headers.common['Authorization'];

      // Log headers before request
      console.log('Request headers:', {
        'Content-Type': axios.defaults.headers.post['Content-Type'],
        'Authorization': axios.defaults.headers.common['Authorization'] ? 'Present' : 'Not present'
      });

      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      const { data } = response;
      console.log('Login response:', {
        status: response.status,
        userId: data._id,
        email: data.email,
        role: data.role,
        tokenReceived: !!data.token,
        tokenLength: data.token?.length
      });

      if (!data.token) {
        console.error('No token received in login response');
        throw new Error('No authentication token received');
      }

      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      console.log('Token stored and axios headers updated');

      setUser(data);
      console.log('User state updated:', {
        id: data._id,
        email: data.email,
        role: data.role
      });

      return data;
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('Registration attempt for:', email, 'password length:', password.length);

      const { data } = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
      });

      console.log('Registration successful:', {
        userId: data._id,
        email: data.email,
        role: data.role,
        tokenReceived: !!data.token,
        tokenLength: data.token?.length
      });

      return data;
    } catch (error) {
      console.error('Registration error details:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
      throw error;
    }
  };

  const logout = () => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    console.log('Logout complete - User state cleared');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 