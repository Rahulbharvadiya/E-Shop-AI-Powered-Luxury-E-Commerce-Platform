import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';

// 1. Get Cart
export async function getCart(req, res) {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    let subtotal = 0;
    const items = cart.items
      .filter(item => item.productId && item.productId.active)
      .map(item => {
        const p = item.productId;
        const itemTotal = p.discountedPrice * item.quantity;
        subtotal += itemTotal;
        return {
          productId: p._id,
          name: p.name,
          slug: p.slug,
          image: p.images[0] || '',
          price: p.discountedPrice,
          originalPrice: p.originalPrice,
          discountPercent: p.discountPercent,
          quantity: item.quantity,
          subtotal: itemTotal,
          stockQuantity: p.stockQuantity
        };
      });

    return res.status(200).json({
      success: true,
      data: {
        items,
        totalItems: items.reduce((acc, curr) => acc + curr.quantity, 0),
        subtotal
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 2. Add to Cart with Stock Check & Quantity Validation (P2-4)
export async function addToCart(req, res) {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer.' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.active) {
      return res.status(404).json({ success: false, message: 'Product is no longer available.' });
    }

    if (product.stockQuantity <= 0) {
      return res.status(400).json({ success: false, message: `'${product.name}' is currently out of stock.` });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    let targetQty = qty;

    if (itemIndex > -1) {
      targetQty = cart.items[itemIndex].quantity + qty;
    }

    // Cap at 10 units per order and available stock
    if (targetQty > product.stockQuantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stockQuantity} units available for '${product.name}'.`
      });
    }

    const finalQty = Math.min(10, targetQty);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = finalQty;
    } else {
      cart.items.push({ productId, quantity: finalQty });
    }

    await cart.save();
    return getCart(req, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 3. Update Cart Item Quantity (+ / -) with Stock Check (P2-4)
export async function updateCartItem(req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty)) {
      return res.status(400).json({ success: false, message: 'Quantity must be a valid integer.' });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    if (qty <= 0) {
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    } else {
      const product = await Product.findById(productId);
      if (!product || !product.active) {
        return res.status(404).json({ success: false, message: 'Product is no longer available.' });
      }

      if (qty > product.stockQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stockQuantity} units available for '${product.name}'.`
        });
      }

      const item = cart.items.find(item => item.productId.toString() === productId);
      if (item) {
        item.quantity = Math.min(10, qty);
      }
    }

    await cart.save();
    return getCart(req, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 4. Remove Item from Cart
export async function removeFromCart(req, res) {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ userId: req.user._id });

    if (cart) {
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
      await cart.save();
    }

    return getCart(req, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 5. Toggle Wishlist
export async function toggleWishlist(req, res) {
  try {
    const { productId } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, productIds: [] });
    }

    const existsIndex = wishlist.productIds.findIndex(id => id.toString() === productId);
    let added = false;

    if (existsIndex > -1) {
      wishlist.productIds.splice(existsIndex, 1);
      added = false;
    } else {
      wishlist.productIds.push(productId);
      added = true;
    }

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: added ? 'Added to wishlist!' : 'Removed from wishlist!',
      data: {
        wishlistIds: wishlist.productIds,
        added
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 6. Get Wishlist Products
export async function getWishlist(req, res) {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id }).populate({
      path: 'productIds',
      match: { active: true }
    });

    return res.status(200).json({
      success: true,
      data: wishlist ? wishlist.productIds : []
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
