const Category = require("../models/categoryModel");
const {
  createOne,
  deleteOne,
  updateOne,
  getOne,
  getAll,
} = require("./factoryHandler");
exports.createCategory = createOne(Category);
exports.deleteCategory = deleteOne(Category);
exports.updateCategory = updateOne(Category);
exports.getCategory = getOne(Category);
exports.getAllCategories = getAll(Category);
