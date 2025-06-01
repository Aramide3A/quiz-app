import { User } from "@prisma/client";
import prisma from "../utils/prisma";

const getAllQUiz = async (queryParam: object) => {
  const quizzes = await prisma.quiz.findMany({
    where: queryParam,
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });
  return quizzes;
};

const getQuizById = async (id: string) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        include: {
          options: {
            select: {
              id: true,
              text: true,
            },
          },
        },
      },
    },
  });
  return quiz;
};

const getUserAttemps = async (userId: string) => {
  const attempts = await prisma.userQuizAttempt.findMany({
    where: { userId },
    include: {
      quiz: {
        select: {
          title: true,
          description: true,
        },
      },
      answers: {
        select: {
          questionId: true,
          selectedOptionId: true,
          isCorrect: true,
        },
      },
    },
  });
  return attempts;
};

const getQuizAttemptById = async (attemptId: string) => {
  const attempt = await prisma.userQuizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        select: {
          title: true,
          description: true,
        },
      },
      answers: {
        select: {
          questionId: true,
          selectedOptionId: true,
          isCorrect: true,
        },
      },
    },  
  })
  return attempt;
}
type AnswerSubmission = {
  questionId: string;
  selectedOptionId: string;
};

const submitQuizAnswersService = async (
  quizId: string,
  userId: string,
  answers: AnswerSubmission[]
) => {
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    throw new Error("No answers provided.");
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: { options: true },
      },
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found.");
  }

  let score = 0;
  const userAnswersData: {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }[] = [];
  const detailedResults = [];

  for (const userAnswer of answers) {
    const question = quiz.questions.find((q) => q.id === userAnswer.questionId);
    if (!question) continue;

    const selectedOption = question.options.find(
      (o) => o.id === userAnswer.selectedOptionId
    );
    const correctOption = question.options.find((o) => o.isCorrect);

    const isCorrect = selectedOption?.isCorrect ?? false;
    if (isCorrect) score++;

    userAnswersData.push({
      questionId: question.id,
      selectedOptionId: userAnswer.selectedOptionId,
      isCorrect,
    });

    detailedResults.push({
      questionId: question.id,
      questionText: question.text,
      selectedOptionId: userAnswer.selectedOptionId,
      selectedOptionText: selectedOption?.text ?? "Invalid/Missing Option",
      correctOptionText: correctOption?.text ?? "N/A",
      isCorrect,
    });
  }

  const attempt = await prisma.userQuizAttempt.create({
    data: {
      userId: userId,
      quizId: quiz.id,
      score: score,
      answers: {
        create: userAnswersData,
      },
    },
  });

  return {
    message: "Quiz submitted successfully.",
    attemptId: attempt.id,
    score: attempt.score,
    totalQuestions: quiz.questions.length,
    quizTitle: quiz.title,
    detailedResults,
  };
};

export { getAllQUiz, getQuizById,getUserAttemps,getQuizAttemptById, submitQuizAnswersService };
