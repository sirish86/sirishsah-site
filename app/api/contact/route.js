
import { admin } from '@/lib/admin';
import { Resend } from 'resend';

export async function POST(req) {
  try {
    const b = await req.json();

    if (!b.name || !b.phone) {
      return Response.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    const lead = {
      name: String(b.name).trim().slice(0, 100),
      phone: String(b.phone).trim().slice(0, 30),
      need: String(b.need || 'Other').slice(0, 100),
      message: String(b.message || '').slice(0, 2000),
    };

    if (!lead.name || !lead.phone) {
      return Response.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    const { error } = await admin
      .from('leads')
      .insert(lead);

    if (error) {
      console.error('Supabase lead error:', error);

      return Response.json(
        { error: 'Could not save your enquiry' },
        { status: 500 }
      );
    }

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { error: emailError } = await resend.emails.send({
        from: 'Website <onboarding@resend.dev>',
        to: process.env.ADMIN_EMAIL,
        subject: `New lead: ${lead.name}`,
        text: `
Name: ${lead.name}
Phone: ${lead.phone}
Requirement: ${lead.need}
Message: ${lead.message}
        `,
      });

      if (emailError) {
        console.error('Email notification failed:', emailError);
      }
    } catch (emailError) {
      console.error('Resend error:', emailError);
    }

    return Response.json({ ok: true });

  } catch (error) {
    console.error('Contact API error:', error);

    return Response.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
