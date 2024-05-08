const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Provide a Name"],
  },
  email: {
    type: String,
    required: [true, "Provide a Email"],
    vaildate: [validator.isEmail, "Provide a vailde email"],
    lowercase: true,
    unique: true,
  },
  photo: String,
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Provide a Password"],
    minLength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Provide a Confirm Password"],
    validate: {
      //this only occurs when save or create
      validator: function (value) {
        return this.password === value;
      },
      message: "Please enter a passowrd equal to confirmation password",
    },
  },
  changedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // hash password we 12 cpu insistive
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.changedAt = Date.now() - 3000;
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({
    isActive: {
      $ne: false,
    },
  });
  next();
});

userSchema.methods.correctPassword = async (
  candidatePassword,
  userPassword
) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPassword = (jwtTime) => {
  if (this.changedAt) {
    const changedAtTime = parseInt(this.changedAt.getTime() / 10, 10);
    return changedAtTime > jwtTime;
  }

  return false;
};
userSchema.methods.createToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  console.log(resetToken);
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  console.log(resetToken, this.resetPasswordToken);
  return resetToken;
};
const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
