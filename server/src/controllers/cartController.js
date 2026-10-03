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

// 2. Add to Cart
export async function addToCart(req, res) {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);

    if (!product || !product.active) {
      return res.status(404).json({ success: false, message: 'Product not available.' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = Math.min(10, cart.items[itemIndex].quantity + Number(quantity));
    } else {
      cart.items.push({ productId, quantity: Number(quantity) });
    }

    await cart.save();
    return getCart(req, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 3. Update Cart Item Quantity (+ / -)
export async function updateCartItem(req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    if (Number(quantity) <= 0) {
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    } else {
      const item = cart.items.find(item => item.productId.toString() === productId);
      if (item) {
        item.quantity = Math.min(10, Number(quantity));
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

// 5. Wishlist: Get All
export async function getWishlist(req, res) {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, products: [] });
    }
    return res.status(200).json({ success: true, data: wishlist.products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 6. Wishlist: Toggle Product
export async function toggleWishlist(req, res) {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, products: [] });
    }

    const index = wishlist.products.findIndex(id => id.toString() === productId);
    let added = false;

    if (index > -1) {
      wishlist.products.splice(index, 1);
    } else {
      wishlist.products.push(productId);
      added = true;
    }

    await wishlist.save();
    return res.status(200).json({ success: true, added, message: added ? 'Added to wishlist' : 'Removed from wishlist' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
