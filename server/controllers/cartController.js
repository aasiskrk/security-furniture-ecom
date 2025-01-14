const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price image"
    );

    if (!cart) {
      return res.status(200).json({ items: [], totalAmount: 0 });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [{ product: productId, quantity }],
        totalAmount: product.price * quantity,
      });
    } else {
      // Check if product exists in cart
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      // Recalculate total amount
      cart.totalAmount = cart.items.reduce((total, item) => {
        return total + product.price * item.quantity;
      }, 0);
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "name price image"
    );

    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cartItem.quantity = quantity;

    // Recalculate total amount
    const product = await Product.findById(productId);
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + product.price * item.quantity;
    }, 0);

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "name price image"
    );

    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    // Recalculate total amount
    const product = await Product.findById(productId);
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + product.price * item.quantity;
    }, 0);

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "name price image"
    );

    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
