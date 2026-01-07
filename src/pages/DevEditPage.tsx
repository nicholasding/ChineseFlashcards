import { useEffect, useMemo, useState } from 'react';
import hskData from '../data/hsk-characters.json';
import { db } from '../db/database';
import { seedDatabase } from '../db/seed';

type Character = {
  hanzi: string;
  pinyin?: string;
  english?: string;
  hskLevel?: number;
  id?: string;
  [k: string]: any;
};

// Remove tone marks from pinyin for easier searching
function removeToneMarks(text: string): string {
  if (!text) return '';
  // Normalize to NFD (decomposed form) to separate base characters from diacritics
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function DevEditPage() {
  const initialAll = (hskData as any).characters as Character[];
  const [characters, setCharacters] = useState<Character[]>(initialAll);
  const [query, setQuery] = useState('');
  const [showTop, setShowTop] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 200);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    async function load() {
      const count = await db.characters.count();
      if (count === 0) {
        // seed DB if empty then load
        await seedDatabase();
      }
      const fromDb = await db.characters.toArray();
      if (fromDb && fromDb.length > 0) setCharacters(fromDb as Character[]);
    }
    load();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return characters;
    const qWithoutTones = removeToneMarks(q);
    return characters.filter((c) => {
      return (
        (c.hanzi && c.hanzi.includes(q)) ||
        (c.pinyin && removeToneMarks(c.pinyin.toLowerCase()).includes(qWithoutTones)) ||
        (c.english && c.english.toLowerCase().includes(q)) ||
        (c.id && c.id.toLowerCase().includes(q))
      );
    });
  }, [characters, query]);

  function updateCharacterField(id: string | undefined, field: string, value: any) {
    if (!id) return;
    setCharacters((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }

  async function handleApplyChanges() {
    setSaving(true);
    try {
      const updates = characters.filter((c) => c.id);
      await Promise.all(
        updates.map((c) => db.characters.update(c.id as string, c))
      );
      alert('Changes applied.');
      setEditMode(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save changes. See console for details.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Dev Edit — All Characters</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApplyChanges()}
              disabled={!editMode || saving}
              className={`text-sm px-3 py-2 rounded ${!editMode ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
            >
              {saving ? 'Saving...' : 'Apply Changes'}
            </button>
            <button
              onClick={() => setEditMode((s) => !s)}
              className={`text-sm px-3 py-2 rounded ${editMode ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {editMode ? 'Editing' : 'Edit'}
            </button>
            <a
              href="/"
              className="text-sm px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Back
            </a>
          </div>
        </div>

        <div className="sticky top-0 bg-white z-10 py-3 mb-4">
          <div className="max-w-3xl mx-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by character, pinyin, english, or id"
              className="w-full border rounded-lg px-4 py-3 shadow-sm"
            />
            <div className="text-xs text-gray-500 mt-2">Showing {results.length} / {characters.length}</div>
          </div>
        </div>

        <div className="space-y-2">
          {results.map((c) => (
            <div key={c.id || c.hanzi} className="bg-white p-4 rounded shadow-sm flex items-center gap-4">
              <div className="w-24 text-3xl text-center font-bold">{c.hanzi}</div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <div className="text-xs text-gray-500">Pinyin</div>
                  {editMode ? (
                    <input
                      value={c.pinyin || ''}
                      onChange={(e) => updateCharacterField(c.id, 'pinyin', e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    <div className="text-lg font-medium">{c.pinyin || '-'}</div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-500">English</div>
                  {editMode ? (
                    <input
                      value={c.english || ''}
                      onChange={(e) => updateCharacterField(c.id, 'english', e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    <div className="text-lg">{c.english || '-'}</div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-500">HSK / ID</div>
                  <div className="flex items-center gap-2">
                    {editMode ? (
                      <select
                        value={c.hskLevel ?? ''}
                        onChange={(e) => updateCharacterField(c.id, 'hskLevel', e.target.value ? Number(e.target.value) : undefined)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="">-</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    ) : (
                      <div className="text-lg">{c.hskLevel ?? '-'}</div>
                    )}
                    <div className="text-sm text-gray-500">•</div>
                    <div className="text-lg">{c.id || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fixed top-right buttons that appear after scrolling */}
        <div className={`fixed top-4 right-4 z-50 transition-opacity ${showTop ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center gap-2 bg-white rounded shadow p-2">
            <button
              onClick={() => handleApplyChanges()}
              disabled={!editMode || saving}
              className={`text-sm px-3 py-2 rounded ${!editMode ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
            >
              {saving ? 'Saving...' : 'Apply'}
            </button>
            <button
              onClick={() => setEditMode((s) => !s)}
              className={`text-sm px-3 py-2 rounded ${editMode ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {editMode ? 'Editing' : 'Edit'}
            </button>
            <a href="/" className="text-sm px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">Back</a>
          </div>
        </div>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-full shadow-lg bg-blue-600 text-white transition-opacity ${showTop ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          Jump to top
        </button>
      </div>
    </div>
  );
}

export default DevEditPage;
