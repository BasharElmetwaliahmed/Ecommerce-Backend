const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  createCategory,
  deleteCategory,
  getCategory,
} = require("../controllers/categoryController");

router
  .route("/")
  .get(getAllCategories)
  .post(createCategory)

  router.route('/:id').
  get(getCategory).
  delete(deleteCategory);

module.exports = router;
