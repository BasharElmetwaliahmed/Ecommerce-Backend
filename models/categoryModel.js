const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "category name is required"],
    unique: true,
  },
  image: {
    type: String,
    required: [true, "category image is required"],
  },
});

const Category = mongoose.model("category", CategorySchema);

module.exports = Category;
