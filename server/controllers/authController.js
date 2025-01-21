const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Register user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user", // default role
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Add a new address
// @route   POST /api/auth/address
// @access  Private
const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { fullName, phone, address, city, state, pinCode } = req.body;

    // If this is the first address, make it default
    const isDefault = user.addresses.length === 0;

    const newAddress = {
      fullName,
      phone,
      address,
      city,
      state,
      pinCode,
      isDefault,
    };

    user.addresses.push(newAddress);
    await user.save();

    res
      .status(201)
      .json({
        message: "Address added successfully",
        addresses: user.addresses,
      });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all addresses
// @route   GET /api/auth/address
// @access  Private
const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.addresses);
  } catch (error) {
    console.error("Error getting addresses:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update an address
// @route   PUT /api/auth/address/:addressId
// @access  Private
const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const {
      fullName,
      phone,
      address: newAddress,
      city,
      state,
      pinCode,
    } = req.body;

    address.fullName = fullName || address.fullName;
    address.phone = phone || address.phone;
    address.address = newAddress || address.address;
    address.city = city || address.city;
    address.state = state || address.state;
    address.pinCode = pinCode || address.pinCode;

    await user.save();
    res
      .status(200)
      .json({
        message: "Address updated successfully",
        addresses: user.addresses,
      });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete an address
// @route   DELETE /api/auth/address/:addressId
// @access  Private
const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // If deleting default address, make another address default if exists
    if (address.isDefault && user.addresses.length > 1) {
      const newDefaultAddress = user.addresses.find(
        (a) => !a._id.equals(address._id)
      );
      if (newDefaultAddress) {
        newDefaultAddress.isDefault = true;
      }
    }

    address.deleteOne();
    await user.save();

    res
      .status(200)
      .json({
        message: "Address deleted successfully",
        addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Set an address as default
// @route   PUT /api/auth/address/:addressId/default
// @access  Private
const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Remove default from all addresses
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });

    // Set new default
    address.isDefault = true;
    await user.save();

    res
      .status(200)
      .json({ message: "Default address updated", addresses: user.addresses });
  } catch (error) {
    console.error("Error setting default address:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
