const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createOrder,
  getOrderById,
  getMyOrders,
} = require("../controllers/orderController");

// Regular user routes
router.route("/").post(protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

module.exports = router;
