
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { admin, getUser } from '@/lib/admin';

export async function POST(req) {
  try {
    const user = await getUser(req);

    if (!user) {
      return Response.json(
        { error: 'Please log in first.' },
        { status: 401 }
      );
    }

    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = await req.json();

    if (!orderId || !paymentId || !signature) {
      return Response.json(
        { error: 'Missing payment details.' },
        { status: 400 }
      );
    }

    // Find the order belonging to this student.
    const { data: purchase, error: purchaseError } = await admin
      .from('purchases')
      .select('id, course_id, status')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single();

    if (purchaseError || !purchase) {
      return Response.json(
        { error: 'Purchase record not found.' },
        { status: 404 }
      );
    }

    if (purchase.status === 'paid') {
      return Response.json({ ok: true, message: 'Already verified.' });
    }

    // Verify Razorpay's HMAC signature.
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + '|' + paymentId)
      .digest();

    let received;

    try {
      received = Buffer.from(signature, 'hex');
    } catch {
      return Response.json(
        { error: 'Invalid payment signature.' },
        { status: 400 }
      );
    }

    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(expected, received)
    ) {
      return Response.json(
        { error: 'Invalid payment signature.' },
        { status: 400 }
      );
    }

    // Fetch payment directly from Razorpay.
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const payment = await razorpay.payments.fetch(paymentId);

    // Ensure the payment belongs to this order and has the right amount.
    const { data: course, error: courseError } = await admin
      .from('courses')
      .select('price_inr')
      .eq('id', purchase.course_id)
      .single();

    if (courseError || !course) {
      return Response.json(
        { error: 'Course not found.' },
        { status: 404 }
      );
    }

    if (
      payment.order_id !== orderId ||
      payment.amount !== course.price_inr * 100 ||
      payment.currency !== 'INR' ||
      payment.status !== 'captured'
    ) {
      return Response.json(
        { error: 'Payment is not captured or does not match this order.' },
        { status: 400 }
      );
    }

    // Grant access only after all checks pass.
    const { data: updated, error: updateError } = await admin
      .from('purchases')
      .update({
        status: 'paid',
        payment_id: paymentId,
      })
      .eq('id', purchase.id)
      .eq('user_id', user.id)
      .eq('status', 'created')
      .select('id');

    if (updateError || !updated?.length) {
      console.error('Purchase update error:', updateError);

      return Response.json(
        { error: 'Could not update purchase.' },
        { status: 500 }
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('Payment verification error:', error);

    return Response.json(
      { error: 'Payment verification failed.' },
      { status: 500 }
    );
  }
}
