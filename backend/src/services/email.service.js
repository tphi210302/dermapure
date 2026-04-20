'use strict';

/**
 * Email service — sends transactional email via Resend.
 *
 * Setup:
 *   1. Sign up at https://resend.com (free 3000 emails/month)
 *   2. Create an API key → set RESEND_API_KEY env var
 *   3. Optionally verify your domain and set EMAIL_FROM="DermaPure <no-reply@yourdomain.com>"
 *      (Without a verified domain, use the default sender `onboarding@resend.dev`.)
 *
 * If RESEND_API_KEY is not set, emails are logged to the console instead of sent —
 * handy for local development.
 */

let resend = null;
try {
  if (process.env.RESEND_API_KEY) {
    // Lazy require so the app doesn't crash if the package isn't installed yet
    const { Resend } = require('resend');
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (err) {
  console.warn('[email] resend package not installed — falling back to console logs');
}

const FROM = process.env.EMAIL_FROM || 'DermaPure <onboarding@resend.dev>';

const send = async ({ to, subject, html, text }) => {
  if (!resend) {
    console.log('\n[email:DEV]', { to, subject, preview: (text || html || '').slice(0, 300) });
    return { dev: true };
  }
  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html, text });
    if (error) {
      console.error('[email] Resend error:', error);
      return { error };
    }
    return { id: data?.id };
  } catch (err) {
    console.error('[email] Send failed:', err?.message);
    return { error: err };
  }
};

const sendPasswordReset = async ({ to, name, resetUrl }) => {
  const subject = 'Đặt lại mật khẩu DermaPure';
  const html = `
<!doctype html>
<html>
<body style="font-family:Arial,sans-serif;background:#f8fafc;margin:0;padding:24px;color:#111827;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:linear-gradient(135deg,#e11d48,#f43f5e);padding:24px;text-align:center;color:#fff;">
      <div style="font-size:22px;font-weight:800;">✚ DermaPure</div>
      <div style="font-size:13px;opacity:.85;margin-top:4px;">Dược mỹ phẩm chính hãng</div>
    </div>
    <div style="padding:24px;">
      <h2 style="margin:0 0 12px;font-size:18px;">Xin chào ${escapeHtml(name || 'bạn')},</h2>
      <p style="margin:0 0 16px;color:#4b5563;font-size:14px;line-height:1.6;">
        Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản này. Nhấn vào nút dưới để tạo mật khẩu mới (link hết hạn sau <strong>30 phút</strong>).
      </p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${resetUrl}" style="display:inline-block;background:#e11d48;color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:10px;font-size:14px;">
          Đặt lại mật khẩu
        </a>
      </p>
      <p style="margin:0 0 8px;color:#6b7280;font-size:12px;">Hoặc copy link này vào trình duyệt:</p>
      <p style="word-break:break-all;font-family:monospace;background:#f3f4f6;padding:10px;border-radius:8px;font-size:12px;color:#374151;">${resetUrl}</p>
      <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;">Nếu bạn không yêu cầu đặt lại mật khẩu, có thể bỏ qua email này — tài khoản của bạn vẫn an toàn.</p>
    </div>
    <div style="padding:16px 24px;background:#f9fafb;color:#9ca3af;font-size:11px;text-align:center;border-top:1px solid #e5e7eb;">
      © ${new Date().getFullYear()} DermaPure · Email tự động, vui lòng không trả lời.
    </div>
  </div>
</body>
</html>`;
  const text = `Xin chào ${name || 'bạn'},\n\nNhấn vào link sau để đặt lại mật khẩu (hết hạn sau 30 phút):\n${resetUrl}\n\nNếu không phải bạn, bỏ qua email này.`;
  return send({ to, subject, html, text });
};

const escapeHtml = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = { send, sendPasswordReset };
