const Category = require("../models/categoryModel");
const AppError = require("../utils/appError");
const {
  createOne,
  deleteOne,
  updateOne,
  getOne,
  getAll,
} = require("./factoryHandler");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: "categories",
});
function fileFilter(req, file, cb) {

  // Check if the uploaded file is an image based on its mime type
  if (!file.mimetype.startsWith("image")) {
    return cb(new AppError("invalid Category image type", 400), false); // Reject the file with custom error
  }

  cb(null, true);
}

const upload = multer({ storage,fileFilter });
exports.uploadCategoryImageController = upload.single("image");
exports.setImageBody = (req, res, next) => {
  console.log(req.file)
  if (req.file?.path) {
    req.body.image = req.file.filename;
  }
  next();
};

exports.createCategory = createOne(Category);
exports.deleteCategory = deleteOne(Category);
exports.updateCategory = updateOne(Category);
exports.getCategory = getOne(Category);
exports.getAllCategories = getAll(Category);
