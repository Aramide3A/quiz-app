import { Router } from "express";
import {getAllQuizController, getQuizAttemptController, getQuizByIdController, getUserAttemptsController, submitQuizAnswers} from "../controllers/quiz.controller"; // aliased path
import authMiddleware from "../middlewares/auth.middleware"; // aliased path

const router = Router();

router.use(authMiddleware);

router.get("", getAllQuizController);
router.get("/:id", getQuizByIdController);
router.post("/:id/submit", submitQuizAnswers);
router.get("/attempts/user/me", getUserAttemptsController); 
router.get("/attempts/:attemptId", getQuizAttemptController); 

export default router;
