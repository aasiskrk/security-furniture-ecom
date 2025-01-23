const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Register user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("Registration attempt for email:", email);

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("Registration failed: User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user - password will be hashed by the model's pre-save hook
    const user = await User.create({
      name,
      email,
      password,
      role: "user", // default role
    });

    if (user) {
      // Fetch the user without password for the response
      const userResponse = await User.findById(user._id).select("-password");
      console.log("User created successfully:", {
        id: userResponse._id,
        email: userResponse.email,
        role: userResponse.role,
      });

      const token = generateToken(user._id);
      const response = {
        _id: userResponse._id,
        name: userResponse.name,
        email: userResponse.email,
        role: userResponse.role,
        token: token,
      };

      console.log("Sending registration response:", {
        ...response,
        token: `${token.substring(0, 10)}...`,
      });

      res.status(201).json(response);
    }
  } catch (error) {
    console.error("Registration error details:", {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
    });
    res.status(500).json({ message: "Server Error" });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    // Validate input
    if (!email || !password) {
      console.log("Login failed: Missing credentials");
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Check for user email
    const user = await User.findOne({ email }).select("+password"); // Explicitly select password
    if (!user) {
      console.log("Login failed: User not found:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("User found:", {
      id: user._id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password,
      passwordLength: user.password?.length,
      passwordType: typeof user.password,
    });

    // Validate password exists
    if (!user.password) {
      console.log("Login failed: User has no password set");
      return res.status(401).json({ message: "Invalid account setup" });
    }

    // Check password
    console.log("Comparing passwords...");
    console.log("Input password type:", typeof password);
    console.log("Input password length:", password.length);
    console.log("Stored hashed password length:", user.password.length);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password comparison details:", {
      inputPasswordProvided: !!password,
      hashedPasswordExists: !!user.password,
      passwordMatch: isMatch,
      inputType: typeof password,
      storedType: typeof user.password,
    });

    if (!isMatch) {
      console.log("Login failed: Invalid password for user:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    console.log("Last login time updated for user:", email);

    // Generate token
    const token = generateToken(user._id);
    console.log("Token generated successfully for user:", {
      id: user._id,
      email: user.email,
      tokenLength: token.length,
    });

    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
    };

    console.log("Sending login response:", {
      ...response,
      token: `${token.substring(0, 10)}...`,
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Login error details:", {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
    });
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

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email } = req.body;

    // Check if email is being changed and if it's already taken
    if (email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { currentPassword, newPassword } = req.body;

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Generate JWT
const generateToken = (id) => {
  try {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    console.log("JWT generated successfully for user ID:", id);
    return token;
  } catch (error) {
    console.error("Error generating JWT:", error);
    throw error;
  }
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

    res.status(201).json({
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
    res.status(200).json({
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

    res.status(200).json({
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
  updateProfile,
  changePassword,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
