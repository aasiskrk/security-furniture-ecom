const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  changePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Address routes
router.post("/address", protect, addAddress);
router.get("/address", protect, getAddresses);
router.put("/address/:addressId", protect, updateAddress);
router.delete("/address/:addressId", protect, deleteAddress);
router.put("/address/:addressId/default", protect, setDefaultAddress);

module.exports = router;
