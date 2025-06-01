import { createUser, loginUser } from "../services/auth.services";
import { User } from "@prisma/client";
import { Request, Response } from "express";

const signUpController = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const token = await createUser(userData);
    res.status(200).json({
      message: "Signup successful",
      token,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const loginController = async (req: Request, res: Response) => {
  try {
    const loginData = req.body;
    const token = await loginUser(loginData);
    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getCurrentUserController = async (req: Request, res: Response) => {
  try {
    const user = req.user as User; // Assuming user is set by auth middleware
    res.status(200).json({
      message: "User retrieved successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export { signUpController, loginController, getCurrentUserController };
