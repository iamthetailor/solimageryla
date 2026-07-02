import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Escape values before interpolating them into the HTML email templates
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Coerce to a trimmed, single-line string capped at maxLength
const clean = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.replace(/[\r\n]+/g, ' ').trim().slice(0, maxLength) : '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const fullName = clean(body.fullName, 100);
    const phone = clean(body.phone, 30);
    const serviceType = clean(body.serviceType, 60);
    const eventDate = clean(body.eventDate, 20);
    const city = clean(body.city, 100);
    const email = clean(body.email, 254);

    // Validate required fields (email is optional — phone is the priority contact)
    if (!fullName || !phone || !serviceType || !eventDate || !city) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Event date must be an ISO calendar date (YYYY-MM-DD), as produced by the date picker
    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      return NextResponse.json(
        { error: 'Invalid event date' },
        { status: 400 }
      );
    }

    // If an email was provided, it must look like a valid address
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Preferred contact method — constrain to the known radio values (attacker-
    // controllable via a crafted POST and interpolated into the email HTML below).
    const ALLOWED_CONTACT_METHODS = ['Text', 'Call', 'Either'];
    const safeContactMethod = ALLOWED_CONTACT_METHODS.includes(body.contactMethod)
      ? body.contactMethod
      : 'Not specified';

    // Pre-escaped values for safe interpolation into the HTML templates below
    const safe = {
      fullName: escapeHtml(fullName),
      email: escapeHtml(email),
      phone: escapeHtml(phone),
      serviceType: escapeHtml(serviceType),
      eventDate: escapeHtml(eventDate),
      city: escapeHtml(city),
    };

    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
      },
    });

    // Email content for you (the business owner)
    const businessEmailContent = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Send to your own email
      subject: `🎉 New ${serviceType} Inquiry from ${fullName} — Respond within 2 hours!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ceb07e; font-size: 28px; margin: 0; font-weight: 300;">New Consultation Request</h1>
              <div style="width: 60px; height: 2px; background-color: #ceb07e; margin: 15px auto;"></div>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h2 style="color: #333; font-size: 20px; margin-bottom: 15px; font-weight: 400;">Contact Information</h2>
              <p style="margin: 8px 0; color: #555; font-size: 16px;"><strong>Name:</strong> ${safe.fullName}</p>
              <p style="margin: 8px 0; color: #555; font-size: 16px;"><strong>Email:</strong> ${email ? `<a href="mailto:${safe.email}" style="color: #ceb07e; text-decoration: none;">${safe.email}</a>` : 'Not provided'}</p>
              <p style="margin: 8px 0; color: #555; font-size: 16px;"><strong>Phone:</strong> <a href="tel:${safe.phone}" style="color: #ceb07e; text-decoration: none;">${safe.phone}</a></p>
              <p style="margin: 8px 0; color: #555; font-size: 16px;"><strong>Preferred Contact:</strong> ${safeContactMethod}</p>
              <p style="margin: 8px 0; color: #555; font-size: 16px;"><strong>Service:</strong> ${safe.serviceType}</p>
              <p style="margin: 8px 0; color: #555; font-size: 16px;"><strong>Event Date:</strong> ${safe.eventDate}</p>
              <p style="margin: 8px 0; color: #555; font-size: 16px;"><strong>Location:</strong> ${safe.city}</p>
            </div>
            
            <div style="background-color: #ceb07e; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-top: 30px;">
              <p style="margin: 0; font-size: 16px; font-weight: 500;">⚡ Respond within 2 hours for best results!</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #888; font-size: 14px; margin: 0;">
                This inquiry was submitted through your Sol Imagery website contact form.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    // Confirmation email for the client
    const clientEmailContent = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Thank you for your interest in Sol Imagery!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ceb07e; font-size: 28px; margin: 0; font-weight: 300;">Thank You, ${safe.fullName}!</h1>
              <div style="width: 60px; height: 2px; background-color: #ceb07e; margin: 15px auto;"></div>
            </div>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Thanks for reaching out about your ${escapeHtml(serviceType.toLowerCase())} — we're thrilled you're considering Sol Imagery! Your consultation request has been received, and we can't wait to learn more about your vision.
            </p>
            
            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="color: #333; font-size: 18px; margin-bottom: 15px; font-weight: 400;">What happens next?</h2>
              <ul style="color: #555; font-size: 16px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Our representative Kevin will be reaching out to you via text as soon as possible</li>
                <li style="margin-bottom: 8px;">During our call, we'll discuss your vision, timeline, and package options</li>
                <li style="margin-bottom: 8px;">We'll provide a custom quote tailored to your needs</li>
                <li>If you're ready to move forward, we'll lock in your booking!</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-bottom: 25px;">
              <p style="color: #555; font-size: 16px; margin-bottom: 15px;">In the meantime, follow us for inspiration:</p>
              <a href="https://www.instagram.com/solimageryla/" style="display: inline-block; background-color: #ceb07e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: 500;">Follow @solimageryla</a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
              <p style="color: #888; font-size: 14px; margin: 0;">
                Questions? Reply to this email or call us at <a href="tel:3239497568" style="color: #ceb07e; text-decoration: none;">323.949.7568</a>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    // Always notify the business; only send the client confirmation if they gave an email
    await transporter.sendMail(businessEmailContent);
    if (email) {
      await transporter.sendMail(clientEmailContent);
    }

    return NextResponse.json(
      { message: 'Emails sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
