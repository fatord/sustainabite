"use client";

import { getRandomQuiz, type QuizQuestion } from "@/lib/quiz-bank";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
  Circle,
  CircleDot,
} from "lucide-react";
import AppNavbar from "@/components/app-navbar";

export default function QuizPage() {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setQuizQuestions(getRandomQuiz(5));
  }, []);

  const regenerateQuiz = () => {
    setQuizQuestions(getRandomQuiz(5));
  };

  const handleAnswerChange = (questionId: number, answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    quizQuestions.forEach((question, i) => {
      if (answers[i] === question.answer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  const handleTryAgain = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    regenerateQuiz();
  };

  const getAnswerStatus = (questionIndex: number, optionIndex: number) => {
    if (!submitted) return null;
    const userAnswer = answers[questionIndex];
    if (optionIndex === quizQuestions[questionIndex].answer) return "correct";
    if (optionIndex === userAnswer) return "incorrect";
    return null;
  };

  const allQuestionsAnswered = quizQuestions.every((_, idx) => answers[idx] !== undefined);

  const progressPercent = (Object.keys(answers).length / quizQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-background-secondary flex flex-col relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#9089fc] to-[#ff80b5] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#9089fc] to-[#ff80b5] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}
        />
      </div>

      <AppNavbar />

      <div className="flex-1 flex flex-col items-center pt-16 px-4">
        <div className="w-full max-w-xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-flex p-2 rounded-full bg-accent/10">
              <Trophy className="h-10 w-10 text-accent" />
            </span>
            <h1 className="text-4xl font-bold text-text-primary pt-1">Knowledge Quiz</h1>
          </div>
          <p className="text-center text-text-secondary mb-6 text-lg">
            Test your knowledge with these quick questions!
          </p>

          {!submitted && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-text-secondary mb-1">
                <span>Progress</span>
                <span>{Object.keys(answers).length} of {quizQuestions.length}</span>
              </div>
              <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                <div
                  className="bg-accent h-3 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {submitted && (
            <Card className="p-8 w-full bg-background shadow-lg rounded-2xl mb-8 animate-in fade-in-30 text-center">
              <div className="flex justify-center mb-3">
                <Trophy className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary">Quiz Complete!</h2>
              <p className="text-lg text-text-secondary mb-2">
                You scored <span className="text-accent font-semibold">{score}</span> out of {quizQuestions.length}
              </p>
              <p className="text-md text-text-secondary italic">
                {score === 5
                  ? "Perfect! You're a sustainability expert!"
                  : score >= 3
                  ? "Great job! You really know your stuff."
                  : score === 2
                  ? "Not bad! Keep learning more about sustainability."
                  : "Looks like it's time to brush up on your sustainability knowledge!"}
              </p>
            </Card>
          )}

          <div className="flex flex-col gap-8">
            {quizQuestions.map((question, index) => (
              <Card key={index} className="p-6 md:p-8 rounded-3xl bg-white shadow-xl border-0 flex flex-col gap-2 transition-shadow duration-300 hover:shadow-2xl animate-in fade-in-25">
                <h3 className="text-lg md:text-2xl font-semibold text-text-primary mb-5 tracking-tight">
                  Q{index + 1}. {question.question}
                </h3>
                <div className="flex flex-col gap-4">
                  {question.choices.map((option, idx) => {
                    const isSelected = answers[index] === idx;
                    const status = getAnswerStatus(index, idx);
                    const base =
                      "group flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200 border border-border hover:border-accent hover:bg-accent/10 text-base font-medium select-none";
                    const checked = isSelected && !submitted ? "ring-2 ring-accent bg-accent/10 shadow-accent-sm" : "";
                    const correct = status === "correct" ? "border-green-500 bg-green-50 text-green-700 shadow-green-100" : "";
                    const incorrect = status === "incorrect" ? "border-red-500 bg-red-50 text-red-700 shadow-red-100" : "";

                    return (
                      <label
                        key={idx}
                        htmlFor={`q-${index}-${idx}`}
                        className={`relative ${base} ${checked} ${correct} ${incorrect} ${submitted ? "opacity-90" : "hover:scale-[1.025]"}`}
                        style={{ minHeight: 48 }}
                        tabIndex={0}
                        onClick={() => {
                          if (!submitted) handleAnswerChange(index, idx);
                        }}
                        onKeyDown={e => {
                          if ((e.key === "Enter" || e.key === " ") && !submitted) handleAnswerChange(index, idx);
                        }}
                      >
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 text-accent">
                          {submitted ? (
                            status === "correct" ? (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : status === "incorrect" ? (
                              <XCircle className="h-6 w-6 text-red-500" />
                            ) : (
                              <Circle className="h-6 w-6 text-border" />
                            )
                          ) : isSelected ? (
                            <CircleDot className="h-6 w-6 text-accent" />
                          ) : (
                            <Circle className="h-6 w-6 text-border" />
                          )}
                        </span>
                        <span className="flex-1 text-base md:text-lg leading-snug">{option}</span>
                        <input
                          type="radio"
                          className="absolute left-0 top-0 opacity-0 w-full h-full"
                          name={`q-${index}`}
                          value={idx}
                          checked={isSelected}
                          onChange={() => {}}
                          disabled={submitted}
                          aria-checked={isSelected}
                        />
                      </label>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-4">
            {!submitted ? (
              <Button
                onClick={handleSubmit}
                disabled={!allQuestionsAnswered}
                className="w-full max-w-sm text-lg py-4 rounded-2xl font-semibold bg-accent hover:bg-accent/90 text-accent-foreground shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Submit Answers
              </Button>
            ) : (
              <Button
                onClick={handleTryAgain}
                className="w-full max-w-sm text-lg py-4 rounded-2xl font-semibold bg-accent hover:bg-accent/90 text-accent-foreground shadow-md transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" /> Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
