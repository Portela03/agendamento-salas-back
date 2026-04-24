/**
 * test-notificacoes.js
 *
 * Script de teste end-to-end para o sistema de notificações.
 * Executa com o servidor já rodando:
 *
 *   node scripts/test-notificacoes.js
 *
 * O que é testado:
 *  1. Professor se registra       → coordenador recebe notif NOVO_USUARIO + email
 *  2. Coordenador loga            → GET /notificacoes (deve ter 1 não lida)
 *  3. Coordenador aprova professor → professor recebe notif USUARIO_APROVADO + email
 *  4. Professor loga              → GET /notificacoes (deve ter 1 não lida)
 *  5. Professor cria reserva      → coordenador recebe notif NOVA_RESERVA + email
 *  6. Coordenador aprova reserva  → professor recebe notif RESERVA_APROVADA + email
 *  7. Professor verifica notif    → GET /notificacoes (deve ter 2 não lidas: USUARIO_APROVADO + RESERVA_APROVADA)
 *  8. Professor marca como lidas  → PATCH /notificacoes/read-all
 *  9. Professor verifica novamente → 0 não lidas
 */

// ── Config ────────────────────────────────────────────────────────────────────

const BASE = 'http://localhost:3333/api';

// Credenciais do coordenador já existente (bootstrapped)
const COORD_EMAIL = process.env.FIRST_COORDINATOR_EMAIL ?? 'coordenador@fatec.sp.gov.br';
const COORD_PASS  = process.env.FIRST_COORDINATOR_PASSWORD ?? 'admin123';

// Professor de teste (será criado e depois pode ser deixado no banco)
const PROF_EMAIL = `prof.teste.${Date.now()}@test.com`;
const PROF_PASS  = 'senha123';
const PROF_NAME  = 'Professor Teste Notif';

// ── Helpers ───────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function ok(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  return { status: res.status, data };
}

// ── Steps ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n🧪 Teste de Notificações — Sistema de Agendamento de Salas');
  console.log('='.repeat(60));

  // ── 1. Coordenador loga ────────────────────────────────────────────────────
  console.log('\n[1] Login do coordenador');
  const coordLogin = await req('POST', '/auth/login', { email: COORD_EMAIL, password: COORD_PASS });
  ok('HTTP 200', coordLogin.status === 200, `status=${coordLogin.status}`);
  ok('Token recebido', !!coordLogin.data?.token);
  const coordToken = coordLogin.data?.token;
  if (!coordToken) { console.error('\n⛔ Coordenador não conseguiu logar. Abortando.'); process.exit(1); }

  // Captura contagem inicial de notificações do coordenador
  const coordNotifsAntes = await req('GET', '/notificacoes', null, coordToken);
  const coordUnreadAntes = (coordNotifsAntes.data ?? []).filter(n => !n.read).length;

  // ── 2. Professor se registra ───────────────────────────────────────────────
  console.log('\n[2] Registro do professor');
  const register = await req('POST', '/users/register', {
    name: PROF_NAME,
    email: PROF_EMAIL,
    password: PROF_PASS,
    role: 'PROFESSOR',
  });
  ok('HTTP 201', register.status === 201, `status=${register.status}`);
  ok('Status PENDENTE', register.data?.user?.status === 'PENDENTE');
  const profUserId = register.data?.user?.id;

  // ── 3. Coordenador verifica notificação de novo usuário ───────────────────
  console.log('\n[3] Coordenador verifica notificação NOVO_USUARIO');
  // Aguarda um instante para o async void do use case completar
  await new Promise(r => setTimeout(r, 800));
  const coordNotifsDepois = await req('GET', '/notificacoes', null, coordToken);
  ok('HTTP 200', coordNotifsDepois.status === 200);
  const coordUnreadDepois = (coordNotifsDepois.data ?? []).filter(n => !n.read).length;
  ok('Coordenador recebeu 1+ notificação nova', coordUnreadDepois > coordUnreadAntes,
    `antes=${coordUnreadAntes} depois=${coordUnreadDepois}`);
  const novoUsuarioNotif = (coordNotifsDepois.data ?? []).find(n => n.type === 'NOVO_USUARIO' && !n.read);
  ok('Tipo NOVO_USUARIO presente', !!novoUsuarioNotif, JSON.stringify(novoUsuarioNotif));

  // ── 4. Coordenador aprova o professor ─────────────────────────────────────
  console.log('\n[4] Coordenador aprova o professor');
  if (!profUserId) { console.error('  ⛔ profUserId não disponível. Abortando.'); process.exit(1); }
  const approve = await req('PATCH', `/users/${profUserId}/approve`, null, coordToken);
  ok('HTTP 200', approve.status === 200, `status=${approve.status}`);
  ok('Status APROVADO', approve.data?.user?.status === 'APROVADO');

  // ── 5. Professor loga ──────────────────────────────────────────────────────
  console.log('\n[5] Login do professor');
  await new Promise(r => setTimeout(r, 800));
  const profLogin = await req('POST', '/auth/login', { email: PROF_EMAIL, password: PROF_PASS });
  ok('HTTP 200', profLogin.status === 200, `status=${profLogin.status}`);
  ok('Token recebido', !!profLogin.data?.token);
  const profToken = profLogin.data?.token;
  if (!profToken) { console.error('\n⛔ Professor não conseguiu logar. Abortando.'); process.exit(1); }

  // ── 6. Professor verifica notif de aprovação de conta ────────────────────
  console.log('\n[6] Professor verifica notificação USUARIO_APROVADO');
  const profNotifs1 = await req('GET', '/notificacoes', null, profToken);
  ok('HTTP 200', profNotifs1.status === 200);
  const profUnread1 = (profNotifs1.data ?? []).filter(n => !n.read);
  ok('Professor tem notificação não lida', profUnread1.length > 0);
  ok('Tipo USUARIO_APROVADO presente', profUnread1.some(n => n.type === 'USUARIO_APROVADO'));

  // ── 7. Professor busca uma sala disponível ────────────────────────────────
  console.log('\n[7] Buscando sala disponível para reserva');
  const salas = await req('GET', '/salas', null, profToken);
  ok('HTTP 200 em /salas', salas.status === 200);
  const salaDisponivel = (salas.data ?? []).find(s => s.status === 'DISPONIVEL');
  ok('Sala disponível encontrada', !!salaDisponivel, `total=${salas.data?.length ?? 0}`);

  // ── 8. Professor cria reserva ─────────────────────────────────────────────
  console.log('\n[8] Professor cria reserva');

  // Data: daqui a 7 dias + hora aleatória para evitar conflito com execuções anteriores
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 7 + Math.floor(Math.random() * 20));
  amanha.setHours(12, 0, 0, 0);

  // Horário aleatório entre 06h e 22h em slots de 2h para garantir não conflito
  const startHour = 6 + (Math.floor(Math.random() * 8) * 2); // 6,8,10,12,14,16,18,20
  const horarioInicio = `${String(startHour).padStart(2, '0')}:00`;
  const horarioFim    = `${String(startHour + 2).padStart(2, '0')}:00`;

  let reservaId = null;
  if (salaDisponivel) {
    const coordUnreadAntesReserva = (await req('GET', '/notificacoes', null, coordToken)).data?.filter(n => !n.read).length ?? 0;

    const criarReserva = await req('POST', '/reservas', {
      classId: salaDisponivel.id,
      data: amanha.toISOString(),
      horarioInicio,
      horarioFim,
      turma: 'ADS-3A',
    }, profToken);
    ok('HTTP 201', criarReserva.status === 201, `status=${criarReserva.status} msg=${criarReserva.data?.message}`);
    reservaId = criarReserva.data?.id;

    // ── 9. Coordenador verifica notif NOVA_RESERVA ───────────────────────
    console.log('\n[9] Coordenador verifica notificação NOVA_RESERVA');
    await new Promise(r => setTimeout(r, 800));
    const coordNotifsReserva = await req('GET', '/notificacoes', null, coordToken);
    const coordUnreadDepoisReserva = (coordNotifsReserva.data ?? []).filter(n => !n.read).length;
    ok('Coordenador recebeu notificação nova', coordUnreadDepoisReserva > coordUnreadAntesReserva,
      `antes=${coordUnreadAntesReserva} depois=${coordUnreadDepoisReserva}`);
    ok('Tipo NOVA_RESERVA presente', (coordNotifsReserva.data ?? []).some(n => n.type === 'NOVA_RESERVA' && !n.read));
  } else {
    console.log('  ⚠️  Sem sala disponível — pulando teste de reserva');
  }

  // ── 10. Coordenador aprova a reserva ──────────────────────────────────────
  if (reservaId) {
    console.log('\n[10] Coordenador aprova a reserva');
    const profUnreadAntesAprova = (await req('GET', '/notificacoes', null, profToken)).data?.filter(n => !n.read).length ?? 0;

    const aprovar = await req('PATCH', `/reservas/${reservaId}/aprovar`, null, coordToken);
    ok('HTTP 200', aprovar.status === 200, `status=${aprovar.status}`);
    ok('Status APROVADA', aprovar.data?.status === 'APROVADA');

    // ── 11. Professor verifica notif RESERVA_APROVADA ───────────────────────
    console.log('\n[11] Professor verifica notificação RESERVA_APROVADA');
    await new Promise(r => setTimeout(r, 800));
    const profNotifs2 = await req('GET', '/notificacoes', null, profToken);
    const profUnread2 = (profNotifs2.data ?? []).filter(n => !n.read);
    ok('Professor tem notificação nova', profUnread2.length > profUnreadAntesAprova,
      `antes=${profUnreadAntesAprova} depois=${profUnread2.length}`);
    ok('Tipo RESERVA_APROVADA presente', profUnread2.some(n => n.type === 'RESERVA_APROVADA'));
  }

  // ── 12. Professor marca todas como lidas ──────────────────────────────────
  console.log('\n[12] Professor marca todas as notificações como lidas');
  const markRead = await req('PATCH', '/notificacoes/read-all', null, profToken);
  ok('HTTP 200', markRead.status === 200, `status=${markRead.status}`);

  const profNotifsFinais = await req('GET', '/notificacoes', null, profToken);
  const profUnreadFinal = (profNotifsFinais.data ?? []).filter(n => !n.read).length;
  ok('0 não lidas após marcar como lidas', profUnreadFinal === 0, `não lidas=${profUnreadFinal}`);

  // ── Resultado ─────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log(`Resultado: ${passed} ✅  ${failed} ❌`);
  if (failed === 0) {
    console.log('🎉 Todos os testes passaram! Verifique também a caixa de entrada do email.');
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique se o servidor está rodando na porta 3333.');
  }
  console.log('');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('\n⛔ Erro inesperado:', err.message);
  process.exit(1);
});
