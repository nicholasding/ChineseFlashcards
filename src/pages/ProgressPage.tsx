import { useEffect, useMemo, useState } from 'react';
import { db } from '../db/database';
import type { Character, CharacterProgress } from '../types';

interface CharacterWithProgress {
  character: Character;
  progress: CharacterProgress;
}

// Remove tone marks from pinyin for easier searching
function removeToneMarks(text: string): string {
  if (!text) return '';
  // Normalize to NFD (decomposed form) to separate base characters from diacritics
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function ProgressPage() {
  const [characters, setCharacters] = useState<CharacterWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'learning' | 'mastered'>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadProgress();
  }, [filter]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return characters;
    const qWithoutTones = removeToneMarks(q);
    return characters.filter(({ character }) => {
      return (
        (character.hanzi && character.hanzi.includes(q)) ||
        (character.pinyin && removeToneMarks(character.pinyin.toLowerCase()).includes(qWithoutTones)) ||
        (character.english && character.english.toLowerCase().includes(q)) ||
        (character.id && character.id.toLowerCase().includes(q))
      );
    });
  }, [characters, query]);

  async function loadProgress() {
    try {
      setLoading(true);
      let progressList;

      if (filter === 'all') {
        progressList = await db.progress.toArray();
      } else {
        progressList = await db.progress.where('status').equals(filter).toArray();
      }

      const characterIds = progressList.map((p) => p.characterId);
      const characterMap = await db.characters.bulkGet(characterIds);

      const combined = progressList
        .map((progress, index) => ({
          character: characterMap[index]!,
          progress,
        }))
        .filter((item) => item.character);

      setCharacters(combined);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  }

  const goHome = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Your Progress</h1>
          <button
            onClick={goHome}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            ← Home
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-2 items-center mb-4">
            {(['all', 'learning', 'mastered'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === f
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by character, pinyin, english, or id"
            className="w-full border rounded-lg px-4 py-3 shadow-sm"
          />
          <div className="text-xs text-gray-500 mt-2">Showing {results.length} / {characters.length}</div>
        </div>

        {characters.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            No characters found. Start a quiz to begin learning!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {results.map(({ character, progress }) => (
              <div
                key={character.id}
                className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold">{character.hanzi}</div>
                  <div>
                    <div className="text-sm text-gray-600">{character.pinyin}</div>
                    <div className="text-gray-800">{character.english}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-1 ${
                        progress.status === 'mastered'
                          ? 'bg-green-100 text-green-800'
                          : progress.status === 'learning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {progress.status}
                    </div>
                    <div className="text-sm text-gray-600">
                      Reviews: {progress.reviewCount} / 7
                    </div>
                    <div className="text-xs text-gray-500">
                      Accuracy: {progress.reviewCount > 0
                        ? Math.round((progress.correctCount / progress.reviewCount) * 100)
                        : 0}%
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => (window.location.href = `/quiz?characterId=${character.id}`)}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Quiz
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
