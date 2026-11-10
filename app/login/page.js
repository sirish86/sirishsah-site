
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function go(mode) {
    setMsg('');

    if (!email.trim()) {
      setMsg('Please enter your email address.');
      return;
    }

    if (password.length < 6) {
      setMsg('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'up') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data.session) {
          router.push('/course');
        } else {
          setMsg(
            'Account created. Please check your email to confirm your account before logging in.'
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        router.push('/course');
      }
    } catch (error) {
      setMsg(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap">
      <h1>Log in or create an account</h1>

      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </label>

        <label>
          Password (6 or more characters)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            minLength={6}
            required
          />
        </label>

        <div className="row">
          <button
            type="button"
            className="btn pri"
            disabled={loading}
            onClick={() => go('in')}
          >
            {loading ? 'Please wait...' : 'Log in'}
          </button>

          <button
            type="button"
            className="btn ghost"
            disabled={loading}
            onClick={() => go('up')}
          >
            Create account
          </button>
        </div>

        <p role="alert">{msg}</p>
      </form>
    </div>
  );
}
