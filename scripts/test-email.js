/**
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
console.log('SMTP_USER :', user ? user : '❌ VAZIO');
console.log('SMTP_PASS :', pass ? `${pass.slice(0, 8)}...` : '❌ VAZIO');
console.log('FROM      :', from);
console.log('TO        :', to);
console.log('');

if (!user || !pass) {
  console.error('❌ SMTP_USER ou SMTP_PASS não configurados no .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.sendgrid.net',
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user, pass },
});

transporter.sendMail({
  from,
  to,
  subject: '[Agendamento de Salas] Teste de email',
  html: '<p>Se você recebeu isso, o envio de email está funcionando! ✅</p>',
}, (err, info) => {
  if (err) {
    console.error('❌ Falha ao enviar:', err.message);
    console.error('Código:', err.code);
    process.exit(1);
  } else {
    console.log('✅ Email enviado com sucesso!');
    console.log('   MessageId:', info.messageId);
    console.log('   Response :', info.response);
  }
});
