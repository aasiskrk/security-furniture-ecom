const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Living Room",
        "Bedroom",
        "Dining Room",
        "Office",
        "Outdoor",
        "Storage",
        "Kids",
        "Other",
      ],
    },
    subCategory: {
      type: String,
      required: true,
      enum: [
        "Sofa",
        "Chair",
        "Table",
        "Bed",
        "Wardrobe",
        "Dresser",
        "Dining Set",
        "Bookshelf",
        "Cabinet",
        "Desk",
        "Outdoor Set",
        "Storage Unit",
        "Kids Furniture",
        "Other",
      ],
    },
    dimensions: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      unit: { type: String, default: "inches", enum: ["inches", "cm"] },
    },
    colors: [
      {
        name: { type: String, required: true },
        code: { type: String, required: true }, // Hex color code
      },
    ],
    material: {
      type: String,
      required: true,
    },
    pictures: [
      {
        type: String,
        required: true,
      },
    ],
    features: [
      {
        type: String,
      },
    ],

    weight: {
      value: { type: Number, required: true },
      unit: { type: String, default: "kg", enum: ["kg", "lbs"] },
    },
    countInStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
