import { Notification } from '../models/Notification.js';
import { NotificationState } from '../models/NotificationState.js';

// 1. Get Active Notifications for User
export async function getNotifications(req, res) {
  try {
    const userId = req.user ? req.user._id : null;

    let dismissedIds = [];
    if (userId) {
      const dismissed = await NotificationState.find({ userId, isDismissed: true });
      dismissedIds = dismissed.map(d => d.notificationId.toString());
    }

    const notifications = await Notification.find({
      _id: { $nin: dismissedIds }
    }).sort({ createdAt: -1 }).limit(20);

    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 2. Dismiss Notification (Swipe-to-Dismiss action)
export async function dismissNotification(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    await NotificationState.findOneAndUpdate(
      { userId, notificationId: id },
      { isDismissed: true, dismissedAt: new Date() },
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, message: 'Notification dismissed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
