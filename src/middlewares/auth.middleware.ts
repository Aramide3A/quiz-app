import {findUserByEmail} from "../services/auth.services";
import { verifyToken } from "../utils/jwt";
import { User } from "@prisma/client";
import { Request, Response, NextFunction } from "express";


declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, 'otpExpiresAt' | 'otp'>;
    }
  }
}

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const decoded = verifyToken(token) ; 
    if (!decoded?.email) {
      return res.status(403).json({
        message: "Invalid token payload",
      });
    }

    const user = await findUserByEmail(decoded.email);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const userData=  {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }

    req.user = userData as unknown as Omit<User, 'otpExpiresAt' | 'otp'>;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      message: "Invalid or expired token",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export default authMiddleware;