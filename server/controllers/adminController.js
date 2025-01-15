const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort("-createdAt");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Get revenue stats
    const orders = await Order.find({
      orderStatus: { $in: ["Delivered", "Shipped"] },
      paymentStatus: "Completed",
    });
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    // Get recent orders
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort("-createdAt")
      .limit(5);

    // Get low stock products (less than 10 items)
    const lowStockProducts = await Product.find({ countInStock: { $lt: 10 } });

    res.status(200).json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
      },
      recentOrders,
      lowStockProducts,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: "User role updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot delete admin user" });
    }

    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getAllUsers,
  getDashboardStats,
  updateUserRole,
  deleteUser,
};
