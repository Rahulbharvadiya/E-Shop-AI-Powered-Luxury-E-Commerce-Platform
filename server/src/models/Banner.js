import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  discountTag: { type: String, default: 'FLAT 50% OFF' },
  imageUrl: { type: String, required: true },
  targetSlug: { type: String, required: true }, // product or category slug
  displayOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

bannerSchema.index({ active: 1, displayOrder: 1 });

export const Banner = mongoose.model('Banner', bannerSchema);
