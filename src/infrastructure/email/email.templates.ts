/**
 * Helpers de template HTML para emails transacionais.
 * O layout usa CSS inline para máxima compatibilidade entre clientes de email.
 */

const APP_URL = process.env.APP_URL ?? 'http://localhost:5173';
const APP_NAME = process.env.APP_NAME ?? 'Agendamento de Salas';

// ── Layout base ───────────────────────────────────────────────────────────────

function base(opts: {
  title: string;
  preheader: string;
  accentColor: string;
  accentLabel: string;
  accentIcon: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- preheader hidden text -->
  <span style="display:none;max-height:0;overflow:hidden;">${opts.preheader}</span>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:${opts.accentColor};border-radius:16px 16px 0 0;padding:32px 40px 28px;">
              <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.75);">${APP_NAME}</p>
              <h1 style="margin:8px 0 0;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">${opts.accentIcon} ${opts.accentLabel}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:36px 40px 28px;">
              ${opts.body}
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="background:#ffffff;padding:0 40px 36px;text-align:center;">
              <a href="${opts.ctaUrl}"
                 style="display:inline-block;background:${opts.accentColor};color:#ffffff;font-size:15px;font-weight:600;
                        text-decoration:none;padding:14px 32px;border-radius:10px;letter-spacing:0.02em;">
                ${opts.ctaLabel}
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="background:#ffffff;padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e8ecf0;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#ffffff;border-radius:0 0 16px 16px;padding:24px 40px 28px;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                Este é um email automático do sistema <strong>${APP_NAME}</strong>. Não responda a este email.<br/>
                <a href="${APP_URL}" style="color:#94a3b8;">${APP_URL}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Bloco de detalhe (linha chave/valor) ──────────────────────────────────────

function detailRow(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
      <span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">${label}</span><br/>
      <span style="font-size:15px;color:#1e293b;font-weight:500;">${value}</span>
    </td>
  </tr>`;
}

function detailTable(rows: Array<[string, string]>): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    ${rows.map(([l, v]) => detailRow(l, v)).join('')}
  </table>`;
}

// ── Templates específicos ─────────────────────────────────────────────────────

export function emailNovoUsuario(coord: { name: string }, user: { name: string; email: string; role: string }): string {
  const roleLabel = user.role === 'PROFESSOR' ? 'Professor' : 'Coordenador';
  return base({
    title: 'Novo cadastro aguardando aprovação',
    preheader: `${user.name} se registrou e aguarda sua aprovação.`,
    accentColor: '#0f766e',
    accentLabel: 'Novo cadastro pendente',
    accentIcon: '👤',
    ctaLabel: 'Revisar cadastro',
    ctaUrl: `${APP_URL}/coordenador`,
    body: `
      <p style="margin:0 0 20px;font-size:16px;color:#334155;">Olá, <strong>${coord.name}</strong>!</p>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
        Um novo usuário se cadastrou no sistema e aguarda sua aprovação para ter acesso.
      </p>
      ${detailTable([
        ['Nome', user.name],
        ['E-mail', user.email],
        ['Perfil', roleLabel],
      ])}
      <p style="margin:20px 0 0;font-size:14px;color:#64748b;line-height:1.6;">
        Acesse o painel de coordenação para aprovar ou recusar o cadastro.
      </p>
    `,
  });
}

export function emailUsuarioAprovado(user: { name: string }): string {
  return base({
    title: 'Seu acesso foi liberado!',
    preheader: 'Boas-vindas! Seu cadastro foi aprovado e você já pode acessar o sistema.',
    accentColor: '#16a34a',
    accentLabel: 'Acesso liberado!',
    accentIcon: '✅',
    ctaLabel: 'Acessar o sistema',
    ctaUrl: APP_URL,
    body: `
      <p style="margin:0 0 20px;font-size:16px;color:#334155;">Olá, <strong>${user.name}</strong>!</p>
      <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">
        Boa notícia! Seu cadastro foi <strong style="color:#16a34a;">aprovado</strong> pelo coordenador.
        Você já pode fazer login e começar a solicitar reservas de salas.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;font-size:14px;color:#166534;">
          🎓 Use suas credenciais cadastradas para entrar. Se tiver dúvidas, entre em contato com a coordenação.
        </p>
      </div>
    `,
  });
}

export function emailNovaReserva(
  coord: { name: string },
  opts: { professorNome: string; salaNome: string; data: string; horario: string; turma: string },
): string {
  return base({
    title: 'Nova solicitação de reserva de sala',
    preheader: `${opts.professorNome} solicitou a sala ${opts.salaNome} em ${opts.data}.`,
    accentColor: '#0f766e',
    accentLabel: 'Nova solicitação de reserva',
    accentIcon: '📅',
    ctaLabel: 'Analisar solicitação',
    ctaUrl: `${APP_URL}/coordenador`,
    body: `
      <p style="margin:0 0 20px;font-size:16px;color:#334155;">Olá, <strong>${coord.name}</strong>!</p>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
        Uma nova solicitação de reserva foi registrada e aguarda sua análise.
      </p>
      ${detailTable([
        ['Professor', opts.professorNome],
        ['Sala', opts.salaNome],
        ['Data', opts.data],
        ['Horário', opts.horario],
        ['Turma', opts.turma],
      ])}
      <p style="margin:20px 0 0;font-size:14px;color:#64748b;line-height:1.6;">
        Acesse o painel para aprovar ou rejeitar a solicitação.
      </p>
    `,
  });
}

export function emailReservaAprovada(
  professor: { name: string },
  opts: { salaNome: string; data: string; horario: string; turma: string },
): string {
  return base({
    title: 'Sua reserva foi aprovada!',
    preheader: `Reserva da sala ${opts.salaNome} em ${opts.data} aprovada.`,
    accentColor: '#16a34a',
    accentLabel: 'Reserva aprovada!',
    accentIcon: '✅',
    ctaLabel: 'Ver minhas reservas',
    ctaUrl: `${APP_URL}/professor/historicoreservas`,
    body: `
      <p style="margin:0 0 20px;font-size:16px;color:#334155;">Olá, <strong>${professor.name}</strong>!</p>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
        Sua solicitação de reserva foi <strong style="color:#16a34a;">aprovada</strong> pelo coordenador. Tudo certo para sua aula!
      </p>
      ${detailTable([
        ['Sala', opts.salaNome],
        ['Data', opts.data],
        ['Horário', opts.horario],
        ['Turma', opts.turma],
      ])}
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;font-size:14px;color:#166534;">
          📌 Lembre-se de comparecer no horário reservado. Em caso de cancelamento, comunique a coordenação com antecedência.
        </p>
      </div>
    `,
  });
}

export function emailReservaRejeitada(
  professor: { name: string },
  opts: { salaNome: string; data: string; horario: string; turma: string; justificativa: string },
): string {
  return base({
    title: 'Solicitação de reserva não aprovada',
    preheader: `Sua reserva da sala ${opts.salaNome} em ${opts.data} não foi aprovada.`,
    accentColor: '#dc2626',
    accentLabel: 'Reserva não aprovada',
    accentIcon: '❌',
    ctaLabel: 'Fazer nova solicitação',
    ctaUrl: `${APP_URL}/professor/reservas`,
    body: `
      <p style="margin:0 0 20px;font-size:16px;color:#334155;">Olá, <strong>${professor.name}</strong>!</p>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
        Infelizmente sua solicitação de reserva não foi aprovada pelo coordenador neste momento.
      </p>
      ${detailTable([
        ['Sala', opts.salaNome],
        ['Data', opts.data],
        ['Horário', opts.horario],
        ['Turma', opts.turma],
      ])}
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#991b1b;">Motivo</p>
        <p style="margin:0;font-size:15px;color:#7f1d1d;">${opts.justificativa}</p>
      </div>
      <p style="margin:20px 0 0;font-size:14px;color:#64748b;line-height:1.6;">
        Você pode fazer uma nova solicitação para outro horário ou sala disponível.
      </p>
    `,
  });
}
