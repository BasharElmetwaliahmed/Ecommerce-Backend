const mongoose = require("mongoose");
const slugify = require("slugify");
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "description is required"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    image: {
      type: String,
      required: [true, "image is required"],
    },
    images: [String],
    price: {
      type: Number,
      required: [true, "price is required"],
    },
    category: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Category",
      required: [true, "category is required"],
    },
    quantity: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


productSchema.pre('save', function(next){
    this.slug = slugify("some string", {
      replacement: "-", 
      lower: false, 
      trim: true, 
    });
})
module.exports = mongoose.model("Product", productSchema);
