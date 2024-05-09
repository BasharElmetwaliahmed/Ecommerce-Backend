const mongoose = require("mongoose");
const cloudinary = require("../utils/cloudinary");

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

CategorySchema.pre(/^findOneAnd/, async function (next) {
  const filter = this.getFilter();
  const deletedDoc = await this.model.findOne(filter);
  this.deletedDoc = deletedDoc;
  next();
});
CategorySchema.post("findOneAndDelete", async function (deletedDoc) {
  try {
    await cloudinary.uploader.destroy(this.deletedDoc.image);
    console.log("deleted");
  } catch (e) {
    console.log(e);
  }
});

const Category = mongoose.model("category", CategorySchema);

module.exports = Category;
