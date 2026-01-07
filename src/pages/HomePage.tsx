import { useEffect, useState } from 'react';
import { getStats } from '../services/quizService';

export function HomePage() {
  const [stats, setStats] = useState({
    totalCharacters: 0,
    started: 0,
    mastered: 0,
    learning: 0,
    dueToday: 0,
    accuracy: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showPinyin, setShowPinyin] = useState<boolean>(() => {
    try {
      const v = window.localStorage.getItem('showPinyin');
      return v === null ? true : v === 'true';
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const startQuiz = () => {
    navigate('/quiz');
  };

  const viewProgress = () => {
    navigate('/progress');
  };

  function navigate(path: string) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-4">
          <a
            href="/dev-edit"
            className="px-3 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 text-sm"
          >
            dev edit
          </a>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Chinese Flashcards
          </h1>
          <p className="text-xl text-gray-600">
            Learn Chinese characters through spaced repetition
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {stats.dueToday}
            </div>
            <div className="text-gray-600">Due Today</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {stats.mastered}
            </div>
            <div className="text-gray-600">Mastered</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {stats.learning}
            </div>
            <div className="text-gray-600">Learning</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <div className="text-gray-600 mb-1">Total Characters</div>
              <div className="text-3xl font-bold text-gray-800">
                {stats.totalCharacters}
              </div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Accuracy</div>
              <div className="text-3xl font-bold text-gray-800">
                {stats.accuracy}%
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={startQuiz}
                disabled={stats.totalCharacters === 0}
                className={`flex-1 py-6 text-2xl font-bold rounded-xl transition-all ${
                  stats.totalCharacters > 0
                    ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {stats.totalCharacters > 0 ? 'Start Quiz' : 'No Characters Available'}
              </button>

              <button
                onClick={() => {
                  const v = !showPinyin;
                  try {
                    window.localStorage.setItem('showPinyin', String(v));
                  } catch (e) {
                    /* ignore */
                  }
                  setShowPinyin(v);
                }}
                className={`px-4 py-3 rounded-xl border ${
                  showPinyin ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                {showPinyin ? 'Pinyin: On' : 'Pinyin: Off'}
              </button>
            </div>

            <button
              onClick={viewProgress}
              className="w-full py-4 text-xl bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
            >
              View Progress
            </button>
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm">
          Practice daily to master Chinese characters through spaced repetition
        </div>
      </div>
    </div>
  );
}
