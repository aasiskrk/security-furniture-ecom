const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
} = require("../controllers/orderController");
const {
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const {
  getAllUsers,
  // getDashboardStats,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} = require("../controllers/adminController");

// Dashboard
// router.get("/dashboard", protect, admin, getDashboardStats);

// User management routes
router.get("/users", protect, admin, getAllUsers);
router.put("/users/:id/status", protect, admin, updateUserStatus);
router.put("/users/:id/role", protect, admin, updateUserRole);
router.delete("/users/:id", protect, admin, deleteUser);

// Product management routes
router.post("/products", protect, admin, createProduct);
router.put("/products/:id", protect, admin, updateProduct);
router.delete("/products/:id", protect, admin, deleteProduct);

// Order management routes
router.get("/orders", protect, admin, getAllOrders);
router.put("/orders/:id/status", protect, admin, updateOrderStatus);
router.put("/orders/:id/payment", protect, admin, updatePaymentStatus);

module.exports = router;
