<<<<<<< Updated upstream
﻿/**
=======
/**
>>>>>>> Stashed changes
 * Testa o envio de email diretamente via SMTP.
 * Roda sem o servidor: node scripts/test-email.js
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM ?? 'no-reply@agendamentosalas.local';
const to   = 'joao.portela03@gmail.com';

console.log('SMTP_HOST :', process.env.SMTP_HOST);
console.log('SMTP_PORT :', process.env.SMTP_PORT);
console.log('SMTP_USER :', user ? user : 'T VAZIO');
console.log('SMTP_PASS :', pass ? `${pass.slice(0, 8)}...` : 'âŒ VAZIO');
console.log('APP_URL   :', process.env.APP_URL);
console.log('FROM      :', from);
console.log('TO        :', to);
console.log('');

if (!user || !pass) {
  console.error('âŒ SMTP_USER ou SMTP_PASS nÃ£o configurados no .env');
  process.exit(1);
}

const APP_URL  = process.env.APP_URL  ?? 'http://localhost:5173';
const APP_NAME = process.env.APP_NAME ?? 'Agendamento de Salas';

// Template de preview â€” simula email de reserva aprovada
const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/><title>Teste</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <tr>
          <td style="background:#16a34a;border-radius:16px 16px 0 0;padding:32px 40px 28px;">
            <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.75);">${APP_NAME}</p>
            <h1 style="margin:8px 0 0;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">âœ… Reserva aprovada!</h1>
          </td>
        </tr>

        <tr>
          <td style="background:#ffffff;padding:36px 40px 28px;">
            <p style="margin:0 0 20px;font-size:16px;color:#334155;">OlÃ¡, <strong>JoÃ£o</strong>!</p>
            <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
<<<<<<< Updated upstream
              Sua solicitaÃ§Ã£o de reserva foi <strong style="color:#16a34a;">aprovada</strong> pelo coordenador. Tudo certo para sua aula!
=======
              Sua solicitação de reserva foi <strong style="color:#16a34a;">aprovada</strong> pelo coordenador. Tudo certo para sua aula!
>>>>>>> Stashed changes
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
              <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                <span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Sala</span><br/>
                <span style="font-size:15px;color:#1e293b;font-weight:500;">Sala 101</span>
              </td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                <span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Data</span><br/>
                <span style="font-size:15px;color:#1e293b;font-weight:500;">24/04/2026</span>
              </td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
                <span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">HorÃ¡rio</span><br/>
                <span style="font-size:15px;color:#1e293b;font-weight:500;">10:00 - 12:00</span>
              </td></tr>
              <tr><td style="padding:8px 0;">
                <span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">Turma</span><br/>
                <span style="font-size:15px;color:#1e293b;font-weight:500;">ADS-3A</span>
              </td></tr>
            </table>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin:20px 0;">
<<<<<<< Updated upstream
              <p style="margin:0;font-size:14px;color:#166534;">ðŸ“Œ Lembre-se de comparecer no horÃ¡rio reservado.</p>
=======
              <p style="margin:0;font-size:14px;color:#166534;">📌 Lembre-se de comparecer no horÃ¡rio reservado.</p>
>>>>>>> Stashed changes
            </div>
          </td>
        </tr>

        <tr>
          <td style="background:#ffffff;padding:0 40px 36px;text-align:center;">
            <a href="${APP_URL}/professor/historicoreservas"
               style="display:inline-block;background:#16a34a;color:#ffffff;font-size:15px;font-weight:600;
                      text-decoration:none;padding:14px 32px;border-radius:10px;">
              Ver minhas reservas
            </a>
          </td>
        </tr>

        <tr><td style="background:#ffffff;padding:0 40px;"><hr style="border:none;border-top:1px solid #e8ecf0;margin:0;"/></td></tr>

        <tr>
          <td style="background:#ffffff;border-radius:0 0 16px 16px;padding:24px 40px 28px;">
            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
              Email automÃ¡tico do sistema <strong>${APP_NAME}</strong>. NÃ£o responda.<br/>
              <a href="${APP_URL}" style="color:#94a3b8;">${APP_URL}</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.sendgrid.net',
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user, pass },
});

transporter.sendMail(
  {
    from,
    to,
    subject: '[Preview] Reserva aprovada - Agendamento de Salas',
    textEncoding: 'base64',
    html,
  },
  (err, info) => {
    if (err) {
      console.error('Falha ao enviar:', err.message);
      console.error('Codigo:', err.code);
      process.exit(1);
    } else {
      console.log('Email enviado com sucesso!');
      console.log('   MessageId:', info.messageId);
      console.log('   Response :', info.response);
    }
  },
);

