const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const axios = require("axios");

// Create new order
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // Calculate total price
    const totalPrice = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    // If payment method is COD, create order directly
    if (paymentMethod === "COD") {
      const createdOrder = await order.save();
      res.status(201).json(createdOrder);
    }
    // If payment method is eSewa, initiate eSewa payment
    else if (paymentMethod === "eSewa") {
      // For eSewa, we'll create a temporary order with a special status
      order.status = "Payment Pending";
      const tempOrder = await order.save();

      // eSewa configuration from environment variables
      const ESEWA_TEST_URL = process.env.ESEWA_TEST_URL;
      const MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE;
      const FRONTEND_URL = process.env.FRONTEND_URL;
      const BACKEND_URL = `http://localhost:5000`;

      // Create eSewa payment data
      const esewaData = {
        amt: totalPrice,
        pdc: 0,
        psc: 0,
        txAmt: 0,
        tAmt: totalPrice,
        pid: tempOrder._id.toString(),
        scd: MERCHANT_CODE,
        su: `${BACKEND_URL}/api/orders/esewa/success`, // Backend success URL
        fu: `${BACKEND_URL}/api/orders/esewa/failure?oid=${tempOrder._id}`, // Include order ID in failure URL
      };

      res.status(201).json({
        order: tempOrder,
        esewaData,
        esewaUrl: ESEWA_TEST_URL,
      });
    }
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ message: "Error creating order", error: error.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate({
        path: "orderItems.product",
        select: "name price pictures colors material dimensions",
        model: "Product",
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the user is authorized to view this order
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res
        .status(401)
        .json({ message: "Not authorized to view this order" });
    }

    // Format the order data for response
    const formattedOrder = {
      _id: order._id,
      user: order.user,
      orderItems: order.orderItems.map((item) => ({
        _id: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        color: item.color,
        product: item.product
          ? {
              _id: item.product._id,
              name: item.product.name,
              pictures: item.product.pictures,
              colors: item.product.colors,
              material: item.product.material,
              dimensions: item.product.dimensions,
            }
          : null,
      })),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentResult: order.paymentResult,
      totalPrice: order.totalPrice,
      status: order.status,
      isPaid: order.isPaid,
      paidAt: order.paidAt,
      isDelivered: order.isDelivered,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    res.status(200).json(formattedOrder);
  } catch (error) {
    console.error("Error fetching order:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid order ID format" });
    }
    res.status(500).json({
      message: "Error fetching order details",
      error: error.message,
    });
  }
};

// Get logged in user's orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate(
        "orderItems.product",
        "name price pictures colors material dimensions"
      )
      .sort("-createdAt");

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .populate(
        "orderItems.product",
        "name price pictures colors material dimensions"
      )
      .sort("-createdAt");

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res
      .status(500)
      .json({ message: "Error updating order status", error: error.message });
  }
};

// Update payment status (admin only)
const updatePaymentStatus = async (req, res) => {
  try {
    const { isPaid } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isPaid = isPaid;
    order.paidAt = isPaid ? Date.now() : null;

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      message: "Error updating payment status",
      error: error.message,
    });
  }
};

// Handle eSewa payment success
const handleEsewaSuccess = async (req, res) => {
  try {
    const { oid, amt, refId } = req.query;
    console.log("eSewa success params:", { oid, amt, refId });

    const order = await Order.findById(oid);
    if (!order) {
      console.error("Order not found:", oid);
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order with payment details
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = "Processing"; // Change from Payment Pending to Processing
    order.paymentResult = {
      status: "Success",
      transactionId: refId,
      amount: amt,
      referenceId: refId,
    };

    await order.save();
    console.log("Order updated successfully:", order._id);

    // Redirect to frontend order detail page
    const redirectUrl = `${process.env.FRONTEND_URL}/order/${oid}`;
    console.log("Redirecting to:", redirectUrl);

    // Set CORS headers to allow the redirect
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
    res.header("Access-Control-Allow-Credentials", "true");

    // Use HTML redirect with cart clearing and success message
    res.send(`
      <html>
        <head>
          <title>Payment Successful</title>
          <script>
            // Function to clear cart and update navbar
            function handlePaymentSuccess() {
              // Clear cart cookie
              document.cookie = "furniture_cart=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              
              // Store success message in sessionStorage to show after redirect
              sessionStorage.setItem('paymentSuccess', 'true');
              
              // Redirect to order details
              window.location.href = "${redirectUrl}";
              
            }

            // Execute after page loads
            window.onload = handlePaymentSuccess;
          </script>
        </head>
        <body>
          <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
            <div style="text-align: center;">
              <h2 style="color: #4CAF50;">Payment Successful!</h2>
              <p>Redirecting to your order details...</p>
              
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error handling eSewa success:", error);
    const failureUrl = `${process.env.FRONTEND_URL}/checkout?error=payment-failed`;
    res.redirect(failureUrl);
  }
};

// Handle eSewa payment failure
const handleEsewaFailure = async (req, res) => {
  try {
    const { oid } = req.query;
    console.log("eSewa failure params:", { oid });

    if (oid) {
      // Delete the pending order
      await Order.deleteOne({ _id: oid, status: "Payment Pending" });
      console.log("Temporary order deleted:", oid);
    }

    // Redirect to frontend with error message
    const redirectUrl = `${process.env.FRONTEND_URL}/checkout`;
    console.log("Redirecting to:", redirectUrl);

    // Use HTML redirect with error message
    res.send(`
      <html>
        <head>
          <title>Payment Failed</title>
          <script>
            sessionStorage.setItem('paymentError', 'Payment failed. Please try again.');
            window.location.href = "${redirectUrl}";
          </script>
        </head>
        <body>
          <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
            <div style="text-align: center;">
              <h2 style="color: #DC2626;">Payment Failed</h2>
              <p>Redirecting back to checkout...</p>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error handling eSewa failure:", error);
    res.redirect(`${process.env.FRONTEND_URL}/checkout`);
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  handleEsewaSuccess,
  handleEsewaFailure,
};
