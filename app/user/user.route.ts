
import { Router } from "express";
import { catchError } from "../common/middleware/cath-error.middleware";
import * as userController from "./user.controller";
import * as userValidator from "./user.validation";
import { roleAuth } from "../common/middleware/role-auth.middleware";

const router = Router();

router
        .get("/", roleAuth(["ADMIN"]), userController.getAllUser)
        
        .post("/resend-mail", catchError, userController.resendEmail)
        .get("/dashboard-stats", userController.getDashboardStats)
        .get("/:id", userController.getUserById)
       
        .post("/", userValidator.createUser, catchError, userController.createUser)
        .put("/set-status", userController.changeBlockStatus)
        
        
        .post("/login", userValidator.loginUser, catchError, userController.loginUser)
        .post("/refresh", userValidator.refreshToken, catchError, userController.refresh)
        
        .post("/set-password/:token",catchError ,userController.setPassword)
        .post("/forgot-password/", catchError, userController.forgotPassword)
        .patch("/update-password/:token", catchError, userController.updatePassword)

export default router;

