import crypto from 'crypto';
import { chatConcierge } from '../services/aiService.js';
import { ChatMessage } from '../models/ChatMessage.js';

export async function chat(req, res) {
  try {
    const { message } = req.body;
    let { sessionId } = req.body;
    const userId = req.user ? req.user._id : null;

    if (!message || String(message).trim() === '') {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    // Guard against shared guest sessions (P0-7)
    if (!sessionId || sessionId === 'session-guest' || sessionId === 'default-session') {
      sessionId = `guest_${crypto.randomUUID()}`;
    }

    const response = await chatConcierge(userId, String(message).trim(), sessionId);
    return res.status(200).json({
      success: true,
      sessionId,
      data: response
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getChatHistory(req, res) {
  try {
    const { sessionId } = req.query;
    const userId = req.user ? req.user._id : null;

    if (!userId && (!sessionId || sessionId === 'session-guest' || sessionId === 'default-session')) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Strictly scope query: authenticated user's own history OR specific unguessable guest session (P0-7)
    const query = userId ? { userId } : { sessionId, userId: null };
    const messages = await ChatMessage.find(query).sort({ createdAt: 1 }).limit(50);
    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function clearChatHistory(req, res) {
  try {
    const { sessionId } = req.body;
    const userId = req.user ? req.user._id : null;

    const query = userId ? { userId } : { sessionId, userId: null };
    if (!userId && !sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID required.' });
    }

    await ChatMessage.deleteMany(query);
    return res.status(200).json({ success: true, message: 'Chat history cleared.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
