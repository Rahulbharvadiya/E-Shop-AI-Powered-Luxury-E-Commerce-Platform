import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: 'Verified authentic luxury quality' },
  shortInfo: { type: String, default: 'Verified authentic luxury quality' },
  brand: { type: String, default: 'Exclusive', trim: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  categorySlug: { type: String, default: 'electronics' },
  images: [{ type: String, required: true }],
  originalPrice: { type: Number, required: true, min: 0 },
  discountedPrice: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 99 },
  stockQuantity: { type: Number, default: 10, min: 0 },
  ratingAverage: { type: Number, default: 4.5, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  specs: { type: Map, of: String, default: {} },
  inTheBox: [{ type: String }],
  warranty: { type: String, default: '1 Year Manufacturer Warranty' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', brand: 'text', shortInfo: 'text' });
productSchema.index({ categorySlug: 1, discountedPrice: 1 });
productSchema.index({ discountPercent: -1 });
productSchema.index({ ratingAverage: -1 });

export const Product = mongoose.model('Product', productSchema);
