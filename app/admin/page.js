
'use client';

import { useEffect, useState } from 'react';
import { token } from '@/lib/supabase';

export default function Admin() {
  const [leads, setLeads] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeads() {
      try {
        const t = await token();

        if (!t) {
          setErr('Please log in using your admin account.');
          return;
        }

        const r = await fetch('/api/admin/leads', {
          headers: {
            Authorization: 'Bearer ' + t,
          },
        });

        const d = await r.json();

        if (r.ok) {
          setLeads(d.leads || []);
        } else {
          setErr(d.error || 'Could not load leads.');
        }
      } catch (error) {
        setErr('Unable to connect to the server.');
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, []);

  return (
    <div className="wrap">
      <h1>My Leads</h1>
      <p>Customer enquiries received through your website.</p>

      {loading && <p>Loading enquiries...</p>}

      {err && <p role="alert">{err}</p>}

      {!loading && !err && leads.length === 0 && (
        <p>No enquiries received yet.</p>
      )}

      <div className="grid">
        {leads.map((l) => (
          <div className="card" key={l.id}>
            <h3>{l.name}</h3>

            <p><b>Phone:</b> {l.phone}</p>

            <p><b>Requirement:</b> {l.need}</p>

            <p><b>Message:</b> {l.message}</p>

            <p>
              <small>
                {new Date(l.created_at).toLocaleString()}
              </small>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
