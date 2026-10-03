import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  imageUrl: { type: String, required: true },
  description: { type: String },
  discountTag: { type: String, default: 'Up to 50% Off' },
  displayOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const Category = mongoose.model('Category', categorySchema);
