
import { admin, getUser } from '@/lib/admin';

export async function GET(req) {
  const u = await getUser(req);

  if (
    !u ||
    u.email?.toLowerCase() !==
    process.env.ADMIN_EMAIL?.toLowerCase()
  ) {
    return Response.json(
      { error: 'Not allowed' },
      { status: 403 }
    );
  }

  const { data, error } = await admin
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json(
      { error: 'Could not retrieve leads' },
      { status: 500 }
    );
  }

  return Response.json({ leads: data });
}
