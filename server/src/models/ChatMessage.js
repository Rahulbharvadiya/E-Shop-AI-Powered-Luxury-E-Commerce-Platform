import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  sessionId: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  productRecommendations: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String },
    slug: { type: String },
    image: { type: String },
    price: { type: Number },
    discountPercent: { type: Number },
    recommendedReason: { type: String },
    recommendationBadge: { type: String }
  }],
  followUpQuestions: [{ type: String }]
}, { timestamps: true });

chatMessageSchema.index({ userId: 1, sessionId: 1, createdAt: 1 });
chatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400, partialFilterExpression: { userId: null } });

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
