import { User } from "@prisma/client";
import {
  getAllQUiz,
  getQuizAttemptById,
  getQuizById,
  getUserAttemps,
  submitQuizAnswersService,
} from "../services/quiz.services";
import { Request, Response } from "express";
import { any } from "zod";

const getAllQuizController = async (req: Request, res: Response) => {
  try {
    const queryParam = req.query;
    const quizzes = await getAllQUiz(queryParam);
    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Error getting all quizzes:", error);
    res.status(500).json({ error: "Error getting all quiz" });
  }
};

const getQuizByIdController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const quizzes = await getQuizById(id);
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ error: "Error getting quiz by id" });
  }
};

const getUserAttemptsController = async (req: Request, res: Response) => {
  const user = req.user as User;
  if (!user || !user.id) {
    return res.status(401).json({ message: "User not authenticated." });
  }
  try {
    const attempts = await getUserAttemps(user.id);
    res.status(200).json(attempts);
  } catch (error: any) {
    console.error("Error geting quiz:", error.message);
    return res.status(500).json({ message: "Failed to get quiz." });
  }
};

const getQuizAttemptController = async (req: Request, res: Response) => {
  const quizId = req.params.id;
  if (!quizId) {
    return res.status(401).json({ message: "QuizId not found." });
  }
  try {
    const attempts = await getQuizAttemptById(quizId);
    res.status(200).json(attempts);
  } catch (error: any) {
    console.error("Error geting quiz:", error.message);
    return res.status(500).json({ message: "Failed to get quiz with id." });
  }
};

const submitQuizAnswers = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { answers } = req.body;
  const user = req.user as User;

  if (!user || !user.id) {
    return res.status(401).json({ message: "User not authenticated." });
  }
  try {
    const result = await submitQuizAnswersService(id, user.id, answers);
    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Error submitting quiz:", error.message);
    return res.status(500).json({ message: "Failed to submit quiz answers." });
  }
};

export { getAllQuizController, getQuizByIdController, submitQuizAnswers, getQuizAttemptController, getUserAttemptsController };
