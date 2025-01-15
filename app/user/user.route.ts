
import { Router } from "express";
import { catchError } from "../common/middleware/cath-error.middleware";
import * as userController from "./user.controller";
import * as userValidator from "./user.validation";

const router = Router();

router
        .get("/", userController.getAllUser)
        .get("/:id", userController.getUserById)
        .delete("/:id", userController.deleteUser)
        .post("/", userValidator.createUser, catchError, userController.createUser)
        .put("/:id", userValidator.updateUser, catchError, userController.updateUser)
        .patch("/:id", userValidator.editUser, catchError, userController.editUser)
        .post("/login", userValidator.loginUser, catchError, userController.loginUser)
        .post("/refresh", userValidator.refreshToken, catchError, userController.refresh)

export default router;

