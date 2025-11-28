import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, phone, weddingDate, dreamWedding } = body;

    // Validate required fields
    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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
      subject: `New Wedding Consultation Request from ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ceb07e; font-size: 28px; margin: 0; font-weight: 300;">New Consultation Request</h1>
              <div style="width: 60px; height: 2px; background-color: #ceb07e; margin: 15px auto;"></div>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h2 style="color: #333; font-size: 20px; margin-bottom: 15px; font-weight: 400;">Contact Information</h2>
              <p style="margin: 8px 0; color: #555; font-size: 16px;"><strong>Name:</strong> ${fullName}</p>
              <p style="margin: 8px 0; color: #555; font-size: 16px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #ceb07e; text-decoration: none;">${email}</a></p>
              <p style="margin: 8px 0; color: #555; font-size: 16px;"><strong>Phone:</strong> <a href="tel:${phone}" style="color: #ceb07e; text-decoration: none;">${phone}</a></p>
              ${weddingDate ? `<p style="margin: 8px 0; color: #555; font-size: 16px;"><strong>Wedding Date:</strong> ${weddingDate}</p>` : ''}
            </div>
            
            ${dreamWedding ? `
            <div style="margin-bottom: 25px;">
              <h2 style="color: #333; font-size: 20px; margin-bottom: 15px; font-weight: 400;">Wedding Vision</h2>
              <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; border-left: 4px solid #ceb07e;">
                <p style="margin: 0; color: #555; font-size: 16px; line-height: 1.6; font-style: italic;">"${dreamWedding}"</p>
              </div>
            </div>
            ` : ''}
            
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
              <h1 style="color: #ceb07e; font-size: 28px; margin: 0; font-weight: 300;">Thank You, ${fullName}!</h1>
              <div style="width: 60px; height: 2px; background-color: #ceb07e; margin: 15px auto;"></div>
            </div>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              We're thrilled that you're considering Sol Imagery for your special day! Your consultation request has been received, and we can't wait to learn more about your vision.
            </p>
            
            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="color: #333; font-size: 18px; margin-bottom: 15px; font-weight: 400;">What happens next?</h2>
              <ul style="color: #555; font-size: 16px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">We'll reach out to you within 24 hours to schedule your free consultation</li>
                <li style="margin-bottom: 8px;">During our call, we'll discuss your vision, timeline, and package options</li>
                <li style="margin-bottom: 8px;">We'll provide a custom quote tailored to your needs</li>
                <li>If you're ready to move forward, we'll secure your date!</li>
              </ul>
            </div>
            
            <div style="background-color: #ceb07e; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
              <p style="margin: 0; font-size: 16px; font-weight: 500;">📞 Expect our call within 2 hours!</p>
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

    // Send both emails
    await transporter.sendMail(businessEmailContent);
    await transporter.sendMail(clientEmailContent);

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
