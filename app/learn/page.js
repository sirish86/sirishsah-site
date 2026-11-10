
'use client';

import { useEffect, useState } from 'react';
import { token } from '@/lib/supabase';

export default function Learn() {
  const [lessons, setLessons] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLessons() {
      try {
        const accessToken = await token();

        if (!accessToken) {
          setErr('Please log in to access your course.');
          return;
        }

        const response = await fetch('/api/lessons', {
          headers: {
            Authorization: 'Bearer ' + accessToken,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Unable to load lessons.');
        }

        setLessons(result.lessons || []);
      } catch (error) {
        setErr(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadLessons();
  }, []);

  return (
    <main className="wrap">
      <h1>My Course</h1>

      {loading && <p>Loading your lessons...</p>}

      {err && <p role="alert">{err}</p>}

      {!loading && !err && lessons.length === 0 && (
        <p>No lessons have been added yet.</p>
      )}

      {lessons.map((lesson) => (
        <section className="card" key={lesson.id}>
          <h3>{lesson.title}</h3>

          <iframe
            src={lesson.video_url}
            title={lesson.title}
            width="100%"
            height="360"
            allowFullScreen
          />
        </section>
      ))}
    </main>
  );
}
