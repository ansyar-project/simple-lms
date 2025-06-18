/*
  Warnings:

  - You are about to drop the column `answers` on the `quiz_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `attempted_at` on the `quiz_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `lesson_id` on the `quiz_attempts` table. All the data in the column will be lost.
  - Added the required column `quiz_id` to the `quiz_attempts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_points` to the `quiz_attempts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANK', 'ESSAY', 'SHORT_ANSWER');

-- DropForeignKey
ALTER TABLE "quiz_attempts" DROP CONSTRAINT "quiz_attempts_lesson_id_fkey";

-- AlterTable
ALTER TABLE "quiz_attempts" DROP COLUMN "answers",
DROP COLUMN "attempted_at",
DROP COLUMN "lesson_id",
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "passed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quiz_id" TEXT NOT NULL,
ADD COLUMN     "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "time_spent" INTEGER,
ADD COLUMN     "total_points" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "time_limit" INTEGER,
    "attempts_allowed" INTEGER NOT NULL DEFAULT 1,
    "shuffle_questions" BOOLEAN NOT NULL DEFAULT false,
    "show_results" BOOLEAN NOT NULL DEFAULT true,
    "passing_score" DOUBLE PRECISION,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB,
    "correct_answer" JSONB NOT NULL,
    "explanation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_answers" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "points_earned" INTEGER NOT NULL,

    CONSTRAINT "question_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "question_answers_attempt_id_question_id_key" ON "question_answers"("attempt_id", "question_id");

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
