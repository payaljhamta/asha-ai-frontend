import { BACKEND_URL } from '@/helper';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, skills, experience, session_id } = req.body;

    // Validate required fields
    if (!session_id) {
      return res.status(400).json({ 
        error: 'Missing required field: session_id' 
      });
    }

    // Prepare user profile data
    const userProfile = {
      name: name || '',
      email: email || '',
      skills: skills || '',
      experience: experience || '',
      session_id,
      created_at: new Date().toISOString(),
      has_email: !!email
    };

    // Forward to backend user management service
    const backendResponse = await axios.post(`${BACKEND_URL}/user-profile`, {
      ...userProfile,
      user_agent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: 'User profile saved successfully',
      data: backendResponse.data
    });

  } catch (error) {
    console.error('Error saving user profile:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to save user profile',
      details: error.response?.data || error.message
    });
  }
}