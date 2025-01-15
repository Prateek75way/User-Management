import User from "./user.schema";
import * as userService from "./user.service";
import { createResponse } from "../common/helper/response.hepler";
import asyncHandler from "express-async-handler";
import { type Request, type Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const createUser = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.createUser(req.body);
    res.send(createResponse(result, "User created sucssefully"))
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  // Check if the user is blocked
  if (user.isBlocked) {
    throw new Error("User is blocked");
  }

  // Validate password
  const isPasswordValid = await bcrypt.compare(password, user.password || "");
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  // Generate tokens
  const accessToken = userService.generateAccessToken(user.id, user.role);
  const refreshToken = userService.generateRefreshToken(user.id, user.role);

  // Save the refresh token to the database
  user.refreshToken = refreshToken;
  await user.save();

  // Set the access token as an HTTP-only cookie
  res.cookie("AccessToken", accessToken, {
    httpOnly: true, // Ensures the cookie can't be accessed by client-side JavaScript
    secure: process.env.NODE_ENV === "production", // Set to true in production (HTTPS only)
    maxAge: 15 * 60 * 1000, // Set the cookie expiry time (15 minutes in milliseconds)
  });

  const result = { accessToken, refreshToken };
  console.log(result);

  res.send(createResponse(result, "Login successful"));

})

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { userId: string, role: string };
      const accessToken = userService.generateAccessToken(decoded.userId, decoded.role);
      throw new Error("User not found");
    } catch (err) {
      throw new Error("Invalid refresh token");
    }
})

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.updateUser(req.params.id, req.body);
    res.send(createResponse(result, "User updated sucssefully"))
});

export const editUser = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.editUser(req.params.id, req.body);
    res.send(createResponse(result, "User updated sucssefully"))
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.deleteUser(req.params.id);
    res.send(createResponse(result, "User deleted sucssefully"))
});


export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.getUserById(req.params.id);
    res.send(createResponse(result))
});


export const getAllUser = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.getAllUser();
    res.send(createResponse(result))
});


export const refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: string };

      console.log("Decoded Token:", decoded);

      // Find the user by ID and refresh token
      const user = await User.findOne({ _id: decoded.id.toString(), refreshToken });
      console.log("Database Query Result:", user);

      if (!user) {
        throw new Error("User not found");
      }

      // Generate new tokens
      const newAccessToken = userService.generateAccessToken(user.id, user.role);
      const newRefreshToken = userService.generateRefreshToken(user.id, user.role);

      // Update the refresh token in the database (rotate token)
      user.refreshToken = newRefreshToken;
      await user.save();

      // Set the new access token as an HTTP-only cookie
      res.cookie("AccessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use HTTPS in production
        maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
      });

      res.status(200).send(createResponse({ accessToken: newAccessToken, refreshToken: newRefreshToken }, "Tokens refreshed successfully"));
    } catch (error) {
      console.error("Refresh Token Error:", error);
      throw new Error("Invalid refresh token");
    }
})
