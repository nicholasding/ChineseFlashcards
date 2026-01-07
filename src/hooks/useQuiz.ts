import { useState, useEffect } from 'react';
import { db } from '../db/database';
import type { QuizQuestion } from '../types';
import { getDueCharacters, generateQuestion, submitAnswer } from '../services/quizService';

export function useQuiz(questionsCount: number = 10) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    loadQuiz();
  }, []);

  async function loadQuiz() {
    try {
      setLoading(true);
      const dueCharacters = await getDueCharacters(questionsCount);
      const allCharacters = await db.characters.toArray();

      const quizQuestions = dueCharacters.map((char) =>
        generateQuestion(char, allCharacters)
      );

      setQuestions(quizQuestions);
      setCurrentIndex(0);
      setScore(0);
      setAnswers([]);
      setShowResult(false);
      setLastAnswerCorrect(null);
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setLoading(false);
    }
  }

  async function answerQuestion(selectedAnswer: string) {
    if (currentIndex >= questions.length) return;

    const currentQuestion = questions[currentIndex];
    const correct = selectedAnswer === currentQuestion.correctAnswer;

    await submitAnswer(currentQuestion.character.id, correct);

    setAnswers((prev) => [...prev, correct]);
    setLastAnswerCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore((s) => s + 1);
    }
  }

  function nextQuestion() {
    setShowResult(false);
    setLastAnswerCorrect(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }

  function restartQuiz() {
    loadQuiz();
  }

  const isComplete = currentIndex >= questions.length - 1 && showResult;
  const currentQuestion = questions[currentIndex];

  return {
    questions,
    currentQuestion,
    currentIndex,
    score,
    answers,
    loading,
    showResult,
    lastAnswerCorrect,
    isComplete,
    answerQuestion,
    nextQuestion,
    restartQuiz,
  };
}
