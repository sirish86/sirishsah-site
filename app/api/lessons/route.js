
import { admin, getUser } from '@/lib/admin';

export async function GET(req) {
  try {
    const user = await getUser(req);

    if (!user) {
      return Response.json(
        { error: 'Please log in first.' },
        { status: 401 }
      );
    }

    // Check whether this student has paid.
    const { data: purchases, error: purchaseError } = await admin
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', 'web-dev')
      .eq('status', 'paid')
      .limit(1);

    if (purchaseError) {
      return Response.json(
        { error: 'Unable to check purchase.' },
        { status: 500 }
      );
    }

    if (!purchases?.length) {
      return Response.json(
        { error: 'Buy the course to watch the lessons.' },
        { status: 403 }
      );
    }

    const { data: lessons, error: lessonError } = await admin
      .from('lessons')
      .select('id, title, video_url')
      .eq('course_id', 'web-dev')
      .order('position');

    if (lessonError) {
      return Response.json(
        { error: 'Unable to load lessons.' },
        { status: 500 }
      );
    }

    return Response.json({ lessons: lessons || [] });
  } catch (error) {
    console.error('Lessons error:', error);

    return Response.json(
      { error: 'Unable to load course lessons.' },
      { status: 500 }
    );
  }
}

