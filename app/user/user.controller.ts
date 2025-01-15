import User from "./user.schema";
import * as userService from "./user.service";
import { createResponse } from "../common/helper/response.hepler";
import asyncHandler from "express-async-handler";
import { response, type Request, type Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import transporter from "../node-mailer/config";
import { sendEmail } from "../common/helper/sendEmail";
import { IUser } from "./user.dto";


export const createUser = asyncHandler(async (req: Request, res: Response) => {
    const {email} = req.body
    const existingUser = await userService.getUserByEmail(email)
    if(existingUser){
        throw new Error("User already exists")
    }
    const result = await userService.createUser(req.body);
    let url = jwt.sign({ email }, process.env.JWT_SECRET as string, { expiresIn: "15m" })
    const mailSent = await sendEmail({
        email: email,
        url: `http://localhost:5000/api/user/set-password/${url}`,
        sub: "Set Password",
        html: `In order to set your password please follow this link ${url}`
    })

    if(mailSent){
    res.send(createResponse(result, "User created sucssefully"))
    }else{
        res.send(createResponse(result, "Error while sending email"))
    }
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
  user.isActive = true;
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










export const setPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        res.status(400).send({
            message: "Password is required",
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };
        const email = decoded.email;

        // Update the user's password
        const updatedUser = await userService.updatePassword(email, password);

        res.status(200).send({
            message: "Password updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        res.status(400).send({
            message: "Invalid or expired token",
        });
    }
});


export const changeBlockStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId, isBlocked } = req.body;

    // Initialize an array to hold validation errors
    const validationErrors: { type: string; msg: string; path: string; location: string }[] = [];

    // Validate input
    if (!userId || typeof userId !== "string") {
        validationErrors.push({
            type: "field",
            msg: "userId must be a non-empty string.",
            path: "userId",
            location: "body"
        });
    }

    if (typeof isBlocked !== "boolean") {
        validationErrors.push({
            type: "field",
            msg: "isBlocked must be a boolean.",
            path: "isBlocked",
            location: "body"
        });
    }

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
        res.status(400).json({
            success: false,
            error_code: 400,
            message: "Validation error!",
            data: {
                errors: validationErrors
            }
        });
        return; // Ensure to return here to avoid further execution
    }

    // Block or unblock the user
    const user = await userService.blockUser (userId, isBlocked);

    if (!user) {
        res.status(404).json({
            success: false,
            error_code: 404,
            message: "User  not found.",
        });
        return; // Ensure to return here to avoid further execution
    }

    // Send success response
    res.json({
        success: true,
        message: `User  ${isBlocked ? "blocked" : "unblocked"} successfully.`,
        data: user,
    });
});


export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    // Validate input
    if (!startDate || !endDate) {
        res.status(400).json({
            success: false,
            message: "Please provide both startDate and endDate as query parameters.",
        });
        return;
    }

    const stats = await userService.getDashboardStats(startDate as string, endDate as string);

    res.json({
        success: true,
        message: "Dashboard statistics fetched successfully",
        data: stats,
    });
});

export const resendEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
         res.status(400).json({ success: false, message: "Email is required" });
         return
    }

    const subject = "onboarding and KYC pending";
    const messageBody = "Dear user please complete your onboarding process and complete your KYC verification";

    const result = await userService.resendEmailService(email, subject, messageBody);
    res.json(result);
});


export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const {email} = req.body
    let url = jwt.sign({ email }, process.env.JWT_SECRET as string, { expiresIn: "15m" })
    const mailSent = await sendEmail({
        email: email,
        url: `http://localhost:5000/api/user/update-password/${url}`,
        sub: "Set Password",
        html: `In order to set your password please follow this link ${url}`
    })

    if(mailSent){
    res.send(createResponse( "Mail send successfully"))
    }else{
        res.send(createResponse("Error while sending email"))
    }
    
});

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        res.status(400).send({
            message: "Password is required",
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };
        const email = decoded.email;

        // Update the user's password
        const updatedUser = await userService.updatePassword(email, password);

        res.status(200).send({
            message: "Password updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        res.status(400).send({
            message: "Invalid or expired token",
        });
    }
})