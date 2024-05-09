const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  createCategory,
  deleteCategory,
  uploadCategoryImageController,
  getCategory,
  updateCategory,
  setImageBody,
} = require("../controllers/categoryController");

router
  .route("/")
  .get(getAllCategories)
  .post(uploadCategoryImageController, setImageBody, createCategory);

  router.route('/:id').
  patch(uploadCategoryImageController,setImageBody,updateCategory).
  get(getCategory).
  delete(deleteCategory);

module.exports = router;
