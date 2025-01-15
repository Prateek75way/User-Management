import mongoose from "mongoose";
import { type IUser } from "./user.dto";
import bcrypt from "bcrypt";

const Schema = mongoose.Schema;

const hashPassword = async (password: string): Promise<string> => {
  const hash = await bcrypt.hash(password, 12);
  return hash;
};

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    kycCompleted : {type: Boolean, default: false},
    isActive: { type: Boolean, default: false },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    refreshToken: {type: String,default: ""},
  },
  { timestamps: true }
);

// Pre-save middleware to hash the password if it is set or modified
UserSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await hashPassword(this.password);
  }
  next();
});

export default mongoose.model<IUser>("User", UserSchema);
