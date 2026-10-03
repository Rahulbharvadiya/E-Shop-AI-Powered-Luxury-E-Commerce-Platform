import mongoose from 'mongoose';

const notificationStateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification', required: true },
  isDismissed: { type: Boolean, default: false },
  dismissedAt: { type: Date }
}, { timestamps: true });

notificationStateSchema.index({ userId: 1, notificationId: 1 }, { unique: true });

export const NotificationState = mongoose.model('NotificationState', notificationStateSchema);
