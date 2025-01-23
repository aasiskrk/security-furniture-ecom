const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort("-createdAt");

    // Get order counts for each user
    const userOrderCounts = await Promise.all(
      users.map(async (user) => {
        const count = await Order.countDocuments({ user: user._id });
        return { userId: user._id, count };
      })
    );

    // Create a map of user IDs to order counts for easier lookup
    const orderCountMap = Object.fromEntries(
      userOrderCounts.map(({ userId, count }) => [userId.toString(), count])
    );

    // Format users with additional info
    const formattedUsers = users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.isActive ? "Active" : "Inactive",
      orders: orderCountMap[user._id.toString()] || 0,
      lastLogin: user.lastLogin || user.createdAt,
      createdAt: user.createdAt,
      avatar:
        user.avatar ||
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1",
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// // Get dashboard stats
// const getDashboardStats = async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments({ role: "user" });
//     const totalProducts = await Product.countDocuments();
//     const totalOrders = await Order.countDocuments();

//     // Get revenue stats
//     const orders = await Order.find({
//       orderStatus: { $in: ["Delivered", "Shipped"] },
//       paymentStatus: "Completed",
//     });
//     const totalRevenue = orders.reduce(
//       (sum, order) => sum + order.totalAmount,
//       0
//     );

//     // Get recent orders
//     const recentOrders = await Order.find()
//       .populate("user", "name email")
//       .sort("-createdAt")
//       .limit(5);

//     // Get low stock products (less than 10 items)
//     const lowStockProducts = await Product.find({ countInStock: { $lt: 10 } });

//     res.status(200).json({
//       stats: {
//         totalUsers,
//         totalProducts,
//         totalOrders,
//         totalRevenue,
//       },
//       recentOrders,
//       lowStockProducts,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = status === "Active";
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.isActive ? "Active" : "Inactive",
      lastLogin: user.lastLogin || user.createdAt,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
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

    // Only allow 'admin' or 'user' roles
    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.isActive ? "Active" : "Inactive",
      lastLogin: user.lastLogin || user.createdAt,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ message: "Cannot delete the last admin user" });
      }
    }

    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  // getDashboardStats,
  updateUserStatus,
  updateUserRole,
  deleteUser,
};
