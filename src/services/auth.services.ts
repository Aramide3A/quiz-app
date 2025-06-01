import {
  CreateUserSchema,
  LoginUserSchema,
} from "../controllers/schema/user.schema";
import { generateToken } from "../utils/jwt";
import prisma from "../utils/prisma";
import { User } from "@prisma/client";
import bcrypt from "bcryptjs";

const findUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
};

const createUser = async (userData: CreateUserSchema) => {
  const existingUser = await findUserByEmail(userData.email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = await prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
    },
  });
  return generateToken({
    sub: user.id,
    email: user.email,
  });
};

const loginUser = async (loginData: LoginUserSchema) => {
  const user = await findUserByEmail(loginData.email);
  if (!user) {
    throw new Error("User not found");
  }
  const comparePassword = bcrypt.compare(loginData.password, user.password);
  if (!comparePassword) {
    throw new Error("Invalid password");
  }
  return generateToken({
    sub: user.id,
    email: user.email,
  });
};

export { findUserByEmail, createUser, loginUser };
