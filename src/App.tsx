import { useEffect, useState } from 'react';
import { HomePage } from './pages/HomePage';
import { QuizPage } from './pages/QuizPage';
import { ProgressPage } from './pages/ProgressPage';
import { DevEditPage } from './pages/DevEditPage';
import { seedDatabase } from './db/seed';

type Route = 'home' | 'quiz' | 'progress' | 'dev-edit';

function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [initialized, setInitialized] = useState(false);
  const [navigationKey, setNavigationKey] = useState(0);

  useEffect(() => {
    initApp();
    handleRouting();
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, []);

  async function initApp() {
    try {
      await seedDatabase();
      setInitialized(true);
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

  function handleRouting() {
    const path = window.location.pathname;
    if (path === '/quiz') {
      setCurrentRoute('quiz');
    } else if (path === '/progress') {
      setCurrentRoute('progress');
    } else if (path === '/dev-edit') {
      setCurrentRoute('dev-edit');
    } else {
      setCurrentRoute('home');
      // Increment key to force HomePage to remount and reload stats
      setNavigationKey(prev => prev + 1);
    }
  }

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor =
        target.tagName === 'A'
          ? (target as HTMLAnchorElement)
          : (target.closest('a') as HTMLAnchorElement | null);

      if (!anchor) return;

      const hrefAttr = anchor.getAttribute('href');
      if (!hrefAttr) return;

      // Allow external links, mailto:, and links opening in new tab
      try {
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin !== window.location.origin) return;
      } catch (err) {
        // If URL constructor fails, skip handling
        return;
      }

      if (anchor.target === '_blank') return;

      e.preventDefault();
      window.history.pushState({}, '', hrefAttr);
      handleRouting();
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-2xl text-gray-600">Initializing...</div>
      </div>
    );
  }

  return (
    <>
      {currentRoute === 'home' && <HomePage key={navigationKey} />}
      {currentRoute === 'quiz' && <QuizPage />}
      {currentRoute === 'progress' && <ProgressPage />}
      {currentRoute === 'dev-edit' && <DevEditPage />}
    </>
  );
}

export default App;
