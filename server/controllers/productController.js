const Product = require("../models/Product");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort("-createdAt");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      dimensions,
      colors,
      material,
      pictures,
      features,
      weight,
      countInStock,
    } = req.body;

    // Validate dimensions
    if (
      !dimensions ||
      !dimensions.length ||
      !dimensions.width ||
      !dimensions.height
    ) {
      return res.status(400).json({
        message: "Please provide complete dimensions (length, width, height)",
      });
    }

    // Validate colors
    if (!colors || colors.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide at least one color option" });
    }

    // Validate pictures
    if (!pictures || pictures.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide at least one product picture" });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      subCategory,
      dimensions,
      colors,
      material,
      pictures,
      features: features || [],
      weight,
      countInStock,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      dimensions,
      colors,
      material,
      pictures,
      features,
      weight,
      countInStock,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate dimensions if provided
    if (
      dimensions &&
      (!dimensions.length || !dimensions.width || !dimensions.height)
    ) {
      return res.status(400).json({
        message: "Please provide complete dimensions (length, width, height)",
      });
    }

    // Validate colors if provided
    if (colors && colors.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide at least one color option" });
    }

    // Validate pictures if provided
    if (pictures && pictures.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide at least one product picture" });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.subCategory = subCategory || product.subCategory;
    product.dimensions = dimensions || product.dimensions;
    product.colors = colors || product.colors;
    product.material = material || product.material;
    product.pictures = pictures || product.pictures;
    product.features = features || product.features;
    product.weight = weight || product.weight;
    product.countInStock = countInStock || product.countInStock;

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
