import { BACKEND_URL } from '@/helper';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: email and password' 
      });
    }

    // Forward to backend user login service
    const backendResponse = await axios.post(`${BACKEND_URL}/user-login`, {
      email,
      password,
      user_agent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      profile: backendResponse.data.profile,
      chat_history: backendResponse.data.chat_history
    });

  } catch (error) {
    console.error('Error during login:', error);
    
    // Handle user not found
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email address'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Login failed',
      details: error.response?.data || error.message
    });
  }
}