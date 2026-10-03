import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema({
  announcementText: {
    type: String,
    default: '⚡ FLASH OFFER: Enjoy Free Express Delivery to PIN 560035 on orders above ₹499 • Use Code SAVE10'
  },
  activePromoCode: {
    type: String,
    default: 'SAVE10'
  },
  freeShippingMinAmount: {
    type: Number,
    default: 499
  },
  shippingFee: {
    type: Number,
    default: 49
  },
  supportPhone: {
    type: String,
    default: '+91 800-456-7890'
  },
  supportEmail: {
    type: String,
    default: 'concierge@eshop.luxury'
  }
}, { timestamps: true });

export const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);
