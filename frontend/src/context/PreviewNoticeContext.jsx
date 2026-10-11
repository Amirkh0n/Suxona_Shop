import { createContext, useCallback, useContext, useRef, useState } from 'react';

// A tiny toast for UI-only affordances (filters, sort, color/size variants,
// ratings) that the mockup shows but schema.yml's API has no endpoint for.
// Clicking them should say so plainly rather than pretend to do something.
const PreviewNoticeContext = createContext(null);

export function PreviewNoticeProvider({ children }) {
  const [message, setMessage] = useState(null);
  const timerRef = useRef(null);

  const notify = useCallback((text = "Bu funksiya hali backend bilan ulanmagan — demo ko'rinish.") => {
    clearTimeout(timerRef.current);
    setMessage(text);
    timerRef.current = setTimeout(() => setMessage(null), 2400);
  }, []);

  return (
    <PreviewNoticeContext.Provider value={{ notify }}>
      {children}
      {message && (
        <div className="preview-toast" role="status">
          {message}
        </div>
      )}
    </PreviewNoticeContext.Provider>
  );
}

export function usePreviewNotice() {
  const ctx = useContext(PreviewNoticeContext);
  if (!ctx) throw new Error('usePreviewNotice must be used within PreviewNoticeProvider');
  return ctx;
}
