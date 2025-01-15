import bcrypt from "bcrypt";
import transporter from "../node-mailer/config";
import { type IUser } from "./user.dto";
import UserSchema from "./user.schema";
import jwt from "jsonwebtoken";
import userSchema from "./user.schema";
import { sendEmail } from "../common/helper/sendEmail";
export const createUser = async (data: IUser) => {
    const result = await UserSchema.create({ ...data, active: true });
    return result;
};

export const updateUser = async (id: string, data: IUser) => {
    const result = await UserSchema.findOneAndUpdate({ _id: id }, data, {
        new: true,
    });
    return result;
};

export const editUser = async (id: string, data: Partial<IUser>) => {
    const result = await UserSchema.findOneAndUpdate({ _id: id }, data);
    return result;
};

export const deleteUser = async (id: string) => {
    const result = await UserSchema.deleteOne({ _id: id });
    return result;
};

export const getUserById = async (id: string) => {
    const result = await UserSchema.findById(id)
    return result;
};

export const getAllUser = async () => {
    const result = await UserSchema.find({}).lean();
    return result;
};
export const getUserByEmail = async (email: string) => {
    const result = await UserSchema.findOne({ email }).lean();
    return result;
}


export const generateAccessToken = (id: string, role: string): string => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET as string, { expiresIn: "15m" });
}

export const generateRefreshToken = (id: string, role: string): string => {
    return jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: "7d" });
  };








export const updatePassword = async (email: string, newPassword: string) => {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const user = await UserSchema.findOneAndUpdate(
        { email },
        { password: hashedPassword },
        { new: true } // Return the updated document
    );

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};


export const blockUser = async function (id: string, isBlocked: boolean)  {
    if(!id) {
        throw new Error("User not found");
    }


    const user = await UserSchema.findByIdAndUpdate(
        {_id: id},
        {isBlocked: isBlocked},
        {new: true,}
    ).select("-password")
    return user;
}

export const getDashboardStats = async (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Users registered within the date range
    const registeredUsers = await UserSchema.find({
        createdAt: { $gte: start, $lte: end },
    });

    // Active sessions
    const activeSessions = await userSchema.countDocuments({ isActive: true });

    //Pending onboarding
    const pendingOnboarding = await UserSchema.countDocuments({ onboardingStatus: "pending" });

    // Pending KYC
    const pendingKYC = await UserSchema.countDocuments({ kycCompleted: false });

    return {
        registeredUserCount: registeredUsers.length,
        registeredUsers, // Optional: Include user data
        activeSessionCount: activeSessions,
        pendingOnboardingCount: pendingOnboarding,
        pendingKYCCount: pendingKYC,
    };
};


export const resendEmailService = async (email: string, subject: string, emailBody: string) => {
    if (!email) {
        throw new Error("Email address is required");
    }

    

    // Find the user
    const user = await UserSchema.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }

    try {
        // Send the email
        const mailSent = await sendEmail({
                email: email,
                url: ``,
                sub: subject,
                html: emailBody
            })
        return { success: true, message: "Email sent successfully" };
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
};
