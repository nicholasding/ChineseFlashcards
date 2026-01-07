import { useState } from 'react';
import { useQuiz } from '../hooks/useQuiz';
import { QuizCard } from '../components/QuizCard';

export function QuizPage() {
  const {
    currentQuestion,
    currentIndex,
    score,
    loading,
    showResult,
    isComplete,
    questions,
    answerQuestion,
    nextQuestion,
  } = useQuiz(10);

  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-gray-600">Loading quiz...</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl text-gray-600 mb-4">
            No characters available for review
          </div>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    answerQuestion(answer);
  };

  const handleNext = () => {
    setSelectedAnswer('');
    if (isComplete) {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      nextQuestion();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg text-gray-600">
            Question {currentIndex + 1} of {questions.length}
          </div>
          <div className="text-lg font-bold text-blue-600">
            Score: {score}/{questions.length}
          </div>
        </div>

        <QuizCard
          character={currentQuestion.character}
          options={currentQuestion.options}
          onAnswer={handleAnswer}
          showResult={showResult}
          selectedAnswer={selectedAnswer}
          correctAnswer={currentQuestion.correctAnswer}
        />

        {showResult && (
          <div className="text-center mt-6">
            {isComplete ? (
              <div className="space-y-4">
                <div className="text-2xl font-bold text-gray-800">
                  Quiz Complete!
                </div>
                <div className="text-xl text-gray-600">
                  Final Score: {score} / {questions.length}
                </div>
                <button
                  onClick={handleNext}
                  className="px-8 py-4 text-xl bg-blue-500 text-white rounded-xl hover:bg-blue-600 active:scale-95 transition-transform"
                >
                  Return Home
                </button>
              </div>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-4 text-xl bg-blue-500 text-white rounded-xl hover:bg-blue-600 active:scale-95 transition-transform"
              >
                Next Question →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
