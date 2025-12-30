import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: "false",
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordTokenExpires: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// pre save hook, similarly we can write post save hook
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hashingSalt = await bcrypt.genSalt(
      parseInt(process.env.HASHING_SALT)
    ); // fix here
    this.password = await bcrypt.hash(this.password, hashingSalt);
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
