import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter | null {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      console.warn('[EmailService] SMTP_USER ou SMTP_PASS não configurados — emails desativados.');
      return null;
    }

    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST ?? 'smtp.sendgrid.net',
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
      });
    }

    return this.transporter;
  }

  async sendMail(to: string | string[], subject: string, html: string): Promise<void> {
    const transporter = this.getTransporter();
    if (!transporter) return;

    const from = process.env.SMTP_FROM ?? '"Agendamento de Salas" <no-reply@agendamentosalas.local>';
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        // textEncoding: 'base64' força o corpo em base64, garantindo
        // que acentos e emojis sejam entregues corretamente em qualquer cliente.
        textEncoding: 'base64',
        html,
      });
      console.log(`[EmailService] ✅ Email enviado para: ${Array.isArray(to) ? to.join(', ') : to} | Assunto: ${subject}`);
    } catch (err) {
      // Log the error but do not crash the request — email is non-critical
      console.error('[EmailService] Falha ao enviar email:', err);
    }
  }
}
