
'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();

    const form = e.target;
    const body = JSON.stringify(
      Object.fromEntries(new FormData(form).entries())
    );

    setLoading(true);
    setMsg('');

    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });

      const data = await r.json();

      if (r.ok) {
        setMsg('Thanks! I will reply soon.');
        form.reset();
      } else {
        setMsg(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setMsg('Network error. Please message me on WhatsApp.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label>
        Your name
        <input
          name="name"
          type="text"
          placeholder="Enter your name"
          required
        />
      </label>

      <label>
        Phone number
        <input
          name="phone"
          type="tel"
          placeholder="Enter your phone number"
          required
        />
      </label>

      <label>
        What do you need?
        <select name="need">
          <option>A website</option>
          <option>A mobile app</option>
          <option>The course</option>
          <option>Other</option>
        </select>
      </label>

      <label>
        Tell me more
        <textarea
          name="message"
          placeholder="Describe your requirements..."
          rows="5"
        />
      </label>

      <button
        className="btn pri"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send message'}
      </button>

      <p role="status">{msg}</p>
    </form>
  );
}
