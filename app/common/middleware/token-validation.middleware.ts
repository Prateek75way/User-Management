import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "./../../user/user.dto"; // Import your IUser interface

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    // Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as Partial<IUser>;

    // Map decoded token to match the IUser type (or your Express.User type)
    req.user = {
      id: decoded.id, // Adjust this to match the field in your token payload
      email: decoded.email!,
      name: decoded.name!,
      isVerified: decoded.isVerified!,
      isBlocked: decoded.isBlocked!,
      role: decoded.role!,  
      createdAt: decoded.createdAt!,
      updatedAt: decoded.updatedAt!,
    };

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
