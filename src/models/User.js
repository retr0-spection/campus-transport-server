import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Define the User schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Please fill a valid email address"], // Basic email validation
  },
  password: {
    type: String,
    required: false,
  },
  googleAuth: {
    type: mongoose.SchemaTypes.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.methods.serializeData = function () {
  const payload = {
    email: this.email,
  };

  return payload;
};

// Pre-save hook to hash the password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    console.log(this.isModified("password"), this.isNew);
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Method to compare the given password with the hashed password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create the User model from the schema
const User = mongoose.model("User", userSchema);

export default User;
