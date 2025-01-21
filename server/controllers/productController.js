const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");

// Helper function to handle file upload
const handleFileUpload = async (files) => {
  if (!files || !files.pictures) return [];

  const uploadDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const pictures = Array.isArray(files.pictures)
    ? files.pictures
    : [files.pictures];
  const uploadedPaths = [];

  for (const file of pictures) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.name);
    const filename = `product-${uniqueSuffix}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await file.mv(filepath);
    uploadedPaths.push(`/uploads/${filename}`);
  }

  return uploadedPaths;
};

// @desc    Get all products with filtering
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      minPrice,
      maxPrice,
      sortBy,
      search,
      limit = 10,
      page = 1,
    } = req.query;

    // Build filter object
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (subCategory) {
      filter.subCategory = subCategory;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    let sort = {};
    if (sortBy) {
      switch (sortBy) {
        case "price_asc":
          sort = { price: 1 };
          break;
        case "price_desc":
          sort = { price: -1 };
          break;
        case "newest":
          sort = { createdAt: -1 };
          break;
        case "oldest":
          sort = { createdAt: 1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    } else {
      sort = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Get products
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      products,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
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
    console.error("Error getting product:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get product categories and subcategories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    // Get unique categories and their subcategories
    const categoriesWithSubs = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          subcategories: { $addToSet: "$subCategory" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json(categoriesWithSubs);
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const productData = JSON.parse(req.body.data);
    const {
      name,
      description,
      price,
      category,
      subCategory,
      dimensions,
      colors,
      material,
      features,
      weight,
      countInStock,
    } = productData;

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

    // Handle file uploads
    const pictures = await handleFileUpload(req.files);
    if (pictures.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide at least one product picture" });
    }

    // Validate category and subcategory match
    const validSubcategories = getValidSubcategoriesForCategory(category);
    if (!validSubcategories.includes(subCategory)) {
      return res.status(400).json({
        message: "Invalid subcategory for the selected category",
      });
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
    const productData = JSON.parse(req.body.data);
    const {
      name,
      description,
      price,
      category,
      subCategory,
      dimensions,
      colors,
      material,
      features,
      weight,
      countInStock,
    } = productData;

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
      return res.status(400).json({
        message: "Please provide at least one color option",
      });
    }

    // Handle file uploads if new pictures are provided
    let pictures = product.pictures;
    if (req.files && req.files.pictures) {
      const newPictures = await handleFileUpload(req.files);
      if (newPictures.length > 0) {
        // Delete old pictures
        for (const oldPicture of product.pictures) {
          const oldPicturePath = path.join(__dirname, "..", oldPicture);
          if (fs.existsSync(oldPicturePath)) {
            fs.unlinkSync(oldPicturePath);
          }
        }
        pictures = newPictures;
      }
    }

    // Update product
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.subCategory = subCategory || product.subCategory;
    product.dimensions = dimensions || product.dimensions;
    product.colors = colors || product.colors;
    product.material = material || product.material;
    product.pictures = pictures;
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

    // Delete product pictures
    for (const picture of product.pictures) {
      const picturePath = path.join(__dirname, "..", picture);
      if (fs.existsSync(picturePath)) {
        fs.unlinkSync(picturePath);
      }
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product removed" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Helper function to get valid subcategories for a category
const getValidSubcategoriesForCategory = (category) => {
  const categoryMap = {
    "Living Room": [
      "Sofas",
      "Coffee Tables",
      "TV Stands",
      "Armchairs",
      "Side Tables",
      "Bookcases",
    ],
    Bedroom: [
      "Beds",
      "Wardrobes",
      "Dressers",
      "Nightstands",
      "Bedroom Sets",
      "Mattresses",
    ],
    "Dining Room": [
      "Dining Tables",
      "Dining Chairs",
      "Dining Sets",
      "Buffets & Sideboards",
      "Bar Furniture",
    ],
    Kitchen: [
      "Kitchen Islands",
      "Bar Stools",
      "Kitchen Storage",
      "Kitchen Tables",
      "Kitchen Chairs",
    ],
    Office: ["Desks", "Office Chairs", "Filing Cabinets", "Office Sets"],
    Outdoor: [
      "Outdoor Sets",
      "Outdoor Tables",
      "Outdoor Chairs",
      "Outdoor Sofas",
      "Garden Furniture",
    ],
    Kids: [
      "Kids Beds",
      "Study Tables",
      "Storage Units",
      "Play Furniture",
      "Kids Chairs",
    ],
    Storage: [
      "Cabinets",
      "Shelving Units",
      "Storage Boxes",
      "Wall Storage",
      "Shoe Storage",
      "Coat Racks",
    ],
    Other: [
      "Mirrors",
      "Room Dividers",
      "Bean Bags",
      "Accent Furniture",
      "Decorative Items",
      "Miscellaneous",
    ],
  };

  return categoryMap[category] || [];
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};
