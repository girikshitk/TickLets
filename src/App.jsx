import { useState, useEffect } from 'react';
import Header from './Header.jsx';
import Carousel from './Carousel.jsx';
import { fetchModels, resolveModelUrl, localFallbackUrl } from './supabase.js';

export default function App() {
  const [models, setModels] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchModels().then((rows) => {
      if (cancelled) return;
      const withUrls = rows.map((m) => ({
        ...m,
        url: resolveModelUrl(m.file_path),
        fallback: localFallbackUrl(m.file_path),
      }));
      setModels(withUrls);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="app">
      <Header />
      <main className="stage">
        {models ? (
          <Carousel models={models} />
        ) : (
          <div className="boot-loader">
            <div className="loader-ring" />
            <span>Preparing the reel…</span>
          </div>
        )}
      </main>
    </div>
  );
}
