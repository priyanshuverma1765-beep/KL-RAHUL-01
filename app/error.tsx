"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="error-page">
      <div>
        <span>Archive error</span>
        <h1>PLAY INTERRUPTED.</h1>
        <p>Something unexpected stopped this view. Retry the section without losing the rest of the archive.</p>
        <button type="button" onClick={reset}>Try again</button>
      </div>
    </main>
  );
}
