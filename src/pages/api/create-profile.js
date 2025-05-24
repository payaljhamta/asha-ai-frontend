import { BACKEND_URL } from '@/helper';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const profileData = req.body;

    // Validate required fields
    if (!profileData.name) {
      return res.status(400).json({ 
        error: 'Missing required field: name' 
      });
    }

    // Forward to backend profile creation service
    const backendResponse = await axios.post(`${BACKEND_URL}/create-profile`, {
      ...profileData,
      user_agent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: 'Profile created successfully',
      profile: backendResponse.data.profile
    });

  } catch (error) {
    console.error('Error creating profile:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to create profile',
      details: error.response?.data || error.message
    });
  }
}