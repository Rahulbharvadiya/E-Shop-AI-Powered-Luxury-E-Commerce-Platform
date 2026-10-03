import { chatConcierge } from '../services/aiService.js';
import { ChatMessage } from '../models/ChatMessage.js';

export async function chat(req, res) {
  try {
    const { message, sessionId = 'default-session' } = req.body;
    const userId = req.user ? req.user._id : null;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const response = await chatConcierge(userId, message.trim(), sessionId);
    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getChatHistory(req, res) {
  try {
    const { sessionId = 'default-session' } = req.query;
    const userId = req.user ? req.user._id : null;

    const query = userId ? { userId, sessionId } : { sessionId };
    const messages = await ChatMessage.find(query).sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function clearChatHistory(req, res) {
  try {
    const { sessionId = 'default-session' } = req.body;
    const userId = req.user._id;

    await ChatMessage.deleteMany({ userId, sessionId });
    return res.status(200).json({ success: true, message: 'Chat history cleared.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
