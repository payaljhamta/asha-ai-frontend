import { BACKEND_URL } from '@/helper';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message_id, feedback_type, session_id, additional_data } = req.body;

    // Validate required fields
    if (!message_id || !feedback_type || !session_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: message_id, feedback_type, session_id' 
      });
    }

    // Validate feedback type
    const validFeedbackTypes = ['positive', 'negative', 'report'];
    if (!validFeedbackTypes.includes(feedback_type)) {
      return res.status(400).json({ 
        error: 'Invalid feedback_type. Must be one of: positive, negative, report' 
      });
    }

    // Forward to backend analytics service
    const backendResponse = await axios.post(`${BACKEND_URL}/feedback`, {
      message_id,
      feedback_type,
      session_id,
      additional_data: {
        ...additional_data,
        user_agent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Feedback recorded successfully',
      data: backendResponse.data
    });

  } catch (error) {
    console.error('Error processing feedback:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to record feedback',
      details: error.response?.data || error.message
    });
  }
}