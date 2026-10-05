const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM || 'Campus Connect <onboarding@resend.dev>';

const sendWelcomeEmail = async ({ to, name }) => {
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: 'Welcome to Campus Connect 🎓',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #14213d;">Welcome, ${name}!</h2>
          <p style="color: #333; line-height: 1.6;">
            Your Campus Connect account is ready. Post to the feed, join your department
            or club's group, and start connecting with classmates.
          </p>
          <p style="color: #333; line-height: 1.6;">
            Jump back in any time at
            <a href="${process.env.CLIENT_URL}" style="color: #d64550;">${process.env.CLIENT_URL}</a>.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 32px;">
            You're receiving this because you created a Campus Connect account.
          </p>
        </div>
      `,
    });
  } catch (err) {
    // Never let a failed email break signup
    console.error('Failed to send welcome email:', err.message);
  }
};

module.exports = { sendWelcomeEmail };