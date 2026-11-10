
'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { token } from '@/lib/supabase';

export default function Course() {
  const router = useRouter();

  const [scriptReady, setScriptReady] = useState(false);
  const [loading, setLoading] = useState(false);

  async function buy() {
    if (loading) return;

    setLoading(true);

    try {
      const accessToken = await token();

      if (!accessToken) {
        router.push('/login');
        return;
      }

      if (!scriptReady || !window.Razorpay) {
        alert('Payment system is still loading. Please try again.');
        return;
      }

      // Ask our server to create the order.
      const response = await fetch('/api/pay/order', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      });

      const order = await response.json();

      if (!response.ok) {
        throw new Error(order.error || 'Could not create payment order.');
      }

      const checkout = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: 'Nexify',
        description: 'Website Development Course',

        handler: async function (paymentResponse) {
          try {
            const verification = await fetch('/api/pay/verify', {
              method: 'POST',
              headers: {
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(paymentResponse),
            });

            const result = await verification.json();

            if (!verification.ok) {
              throw new Error(
                result.error || 'Payment verification failed.'
              );
            }

            router.push('/learn');
          } catch (error) {
            alert(
              error.message +
              ' If money was deducted, contact support with your payment ID: ' +
              paymentResponse.razorpay_payment_id
            );
          }
        },

        modal: {
          ondismiss: function () {
            console.log('Razorpay checkout closed.');
          },
        },

        theme: {
          color: '#2563eb',
        },
      });

      checkout.on('payment.failed', function (response) {
        alert(
          response.error.description ||
          'Payment failed. Please try again.'
        );
      });

      checkout.open();
    } catch (error) {
      alert(error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="wrap">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />

      <h1>Website Development Course</h1>

      <p>
        Learn to build and launch real websites from scratch.
        Go from the basics to creating and deploying real projects.
      </p>

      <section className="card">
        <h2>What you will learn</h2>
        <ul>
          <li>HTML, CSS and JavaScript fundamentals</li>
          <li>Responsive website development</li>
          <li>Frontend and backend development</li>
          <li>Database and authentication integration</li>
          <li>Website deployment and hosting</li>
        </ul>

        <h2>Course price: ₹4,999</h2>

        <button
          className="btn pri"
          type="button"
          onClick={buy}
          disabled={loading}
        >
          {loading ? 'Please wait...' : 'Buy now'}
        </button>

        {!scriptReady && <p>Loading secure payment checkout...</p>}
      </section>
    </main>
  );
}
