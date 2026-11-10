
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

    // Always fetch the price from Supabase.
    const { data: course, error: courseError } = await admin
      .from('courses')
      .select('id, title, price_inr')
      .eq('id', 'web-dev')
      .single();

    if (courseError || !course) {
      return Response.json(
        { error: 'Course not found.' },
        { status: 404 }
      );
    }

    if (!Number.isInteger(course.price_inr) || course.price_inr <= 0) {
      return Response.json(
        { error: 'Invalid course price.' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: course.price_inr * 100,
      currency: 'INR',
      receipt: 'wd_' + Date.now(),
      notes: {
        user_id: user.id,
        course_id: course.id,
      },
    });

    // Save the pending purchase against this authenticated student.
    const { error: purchaseError } = await admin
      .from('purchases')
      .insert({
        user_id: user.id,
        course_id: course.id,
        order_id: order.id,
        status: 'created',
      });

    if (purchaseError) {
      console.error('Purchase insert error:', purchaseError);

      return Response.json(
        { error: 'Could not create purchase record.' },
        { status: 500 }
      );
    }

    return Response.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Order creation error:', error);

    return Response.json(
      { error: 'Unable to create payment order.' },
      { status: 500 }
    );
  }
}
