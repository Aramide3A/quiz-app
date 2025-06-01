import { PrismaClient, QuizYear } from '@prisma/client';

const prisma = new PrismaClient();

const getSampleQuestions = () => [
  {
    text: "What does CPU stand for?",
    options: [
      { text: "Central Processing Unit", isCorrect: true },
      { text: "Computer Power Unit", isCorrect: false },
      { text: "Central Performance Utility", isCorrect: false },
      { text: "Control Processing Unit", isCorrect: false },
    ],
  },
  {
    text: "Which language is used for styling web pages?",
    options: [
      { text: "HTML", isCorrect: false },
      { text: "CSS", isCorrect: true },
      { text: "Java", isCorrect: false },
      { text: "Python", isCorrect: false },
    ],
  },
  {
    text: "What is the binary of 5?",
    options: [
      { text: "101", isCorrect: true },
      { text: "110", isCorrect: false },
      { text: "1001", isCorrect: false },
      { text: "111", isCorrect: false },
    ],
  },
  {
    text: "Which of the following is an input device?",
    options: [
      { text: "Monitor", isCorrect: false },
      { text: "Keyboard", isCorrect: true },
      { text: "Printer", isCorrect: false },
      { text: "Speaker", isCorrect: false },
    ],
  },
  {
    text: "What does HTTP stand for?",
    options: [
      { text: "HyperText Transfer Protocol", isCorrect: true },
      { text: "Hyper Transfer Text Protocol", isCorrect: false },
      { text: "HyperText Translation Protocol", isCorrect: false },
      { text: "Hyper Transfer Terminal Protocol", isCorrect: false },
    ],
  },
];

async function clearData() {
  await prisma.userAnswer.deleteMany();
  await prisma.userQuizAttempt.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
}

async function createQuizzes() {
  for (const year of Object.values(QuizYear)) {
    const yearNumber = year.split("_")[1]; // YEAR_1 -> 1
    for (let i = 1; i <= 3; i++) {
      const quizCode = `CSC${yearNumber}0${i}`;
      const quiz = await prisma.quiz.create({
        data: {
          title: quizCode,
          description: `This is quiz ${i} for year ${yearNumber}`,
          year: year as QuizYear,
          questions: {
            create: getSampleQuestions().map((q) => ({
              text: q.text,
              options: {
                create: q.options,
              },
            })),
          },
        },
      });
      console.log(`Created quiz: ${quiz.title}`);
    }
  }
}

async function main() {
  console.log("🧹 Clearing existing data...");
  await clearData();

  console.log("🌱 Seeding quizzes...");
  await createQuizzes();

  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
