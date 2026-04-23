import { INotificationService } from '../../application/notification/notification.service.interface';
import { User } from '../../domain/entities/User';
import { INotificacaoRepository } from '../../domain/notificacao/notificacao-repository.interface';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Reserva } from '../../domain/reserva/reserva.entity';
import { EmailService } from '../email/email.service';

export class NotificationService implements INotificationService {
  constructor(
    private readonly notificacaoRepository: INotificacaoRepository,
    private readonly userRepository: IUserRepository,
    private readonly emailService: EmailService,
  ) {}

  // ── New user registered — notify all coordinators ─────────────────────────

  async notifyNewUser(user: User): Promise<void> {
    const coordinators = await this.userRepository.findAllByRole('COORDENADOR');
    const message = `Novo usuário "${user.name}" (${user.role}) aguarda aprovação.`;

    await Promise.all(
      coordinators.map(async (coord) => {
        await this.notificacaoRepository.create({
          userId: coord.id,
          message,
          type: 'NOVO_USUARIO',
        });
        await this.emailService.sendMail(
          coord.email,
          '[Agendamento de Salas] Novo usuário aguardando aprovação',
          `<p>Olá, <strong>${coord.name}</strong>!</p>
           <p>O usuário <strong>${user.name}</strong> (${user.email}) se registrou como <strong>${user.role}</strong> e aguarda sua aprovação.</p>
           <p>Acesse o sistema para aprovar ou recusar o cadastro.</p>`,
        );
      }),
    );
  }

  // ── User approved — notify the professor ─────────────────────────────────

  async notifyUserApproved(user: User): Promise<void> {
    const message = 'Seu cadastro foi aprovado! Você já pode acessar o sistema.';

    await this.notificacaoRepository.create({
      userId: user.id,
      message,
      type: 'USUARIO_APROVADO',
    });

    await this.emailService.sendMail(
      user.email,
      '[Agendamento de Salas] Cadastro aprovado!',
      `<p>Olá, <strong>${user.name}</strong>!</p>
       <p>Seu cadastro no sistema de agendamento de salas foi <strong>aprovado</strong>.</p>
       <p>Você já pode fazer login e solicitar reservas de salas.</p>`,
    );
  }

  // ── New reservation — notify all coordinators ────────────────────────────

  async notifyNewReservation(reserva: Reserva): Promise<void> {
    const professor = await this.userRepository.findById(reserva.professorId);
    const professorNome = professor?.name ?? reserva.professorNome ?? 'Professor';
    const salaNome = reserva.salaNome ?? reserva.salaId;
    const dataFormatada = new Date(reserva.data).toLocaleDateString('pt-BR');
    const message = `Nova solicitação de reserva de "${salaNome}" por ${professorNome} em ${dataFormatada} (${reserva.horario}).`;

    const coordinators = await this.userRepository.findAllByRole('COORDENADOR');

    await Promise.all(
      coordinators.map(async (coord) => {
        await this.notificacaoRepository.create({
          userId: coord.id,
          message,
          type: 'NOVA_RESERVA',
        });
        await this.emailService.sendMail(
          coord.email,
          '[Agendamento de Salas] Nova solicitação de reserva',
          `<p>Olá, <strong>${coord.name}</strong>!</p>
           <p>O professor <strong>${professorNome}</strong> solicitou reserva da sala <strong>${salaNome}</strong>:</p>
           <ul>
             <li><strong>Data:</strong> ${dataFormatada}</li>
             <li><strong>Horário:</strong> ${reserva.horario}</li>
             <li><strong>Turma:</strong> ${reserva.turma}</li>
           </ul>
           <p>Acesse o sistema para aprovar ou rejeitar a solicitação.</p>`,
        );
      }),
    );
  }

  // ── Reservation approved — notify the professor ──────────────────────────

  async notifyReservaAprovada(reserva: Reserva): Promise<void> {
    const professor = await this.userRepository.findById(reserva.professorId);
    if (!professor) return;

    const salaNome = reserva.salaNome ?? reserva.salaId;
    const dataFormatada = new Date(reserva.data).toLocaleDateString('pt-BR');
    const message = `Sua reserva da sala "${salaNome}" em ${dataFormatada} (${reserva.horario}) foi APROVADA.`;

    await this.notificacaoRepository.create({
      userId: professor.id,
      message,
      type: 'RESERVA_APROVADA',
    });

    await this.emailService.sendMail(
      professor.email,
      '[Agendamento de Salas] Reserva aprovada!',
      `<p>Olá, <strong>${professor.name}</strong>!</p>
       <p>Sua solicitação de reserva foi <strong style="color:green">APROVADA</strong>.</p>
       <ul>
         <li><strong>Sala:</strong> ${salaNome}</li>
         <li><strong>Data:</strong> ${dataFormatada}</li>
         <li><strong>Horário:</strong> ${reserva.horario}</li>
         <li><strong>Turma:</strong> ${reserva.turma}</li>
       </ul>`,
    );
  }

  // ── Reservation rejected — notify the professor ──────────────────────────

  async notifyReservaRejeitada(reserva: Reserva): Promise<void> {
    const professor = await this.userRepository.findById(reserva.professorId);
    if (!professor) return;

    const salaNome = reserva.salaNome ?? reserva.salaId;
    const dataFormatada = new Date(reserva.data).toLocaleDateString('pt-BR');
    const justificativa = reserva.justificativa ?? 'Sem justificativa informada.';
    const message = `Sua reserva da sala "${salaNome}" em ${dataFormatada} (${reserva.horario}) foi REJEITADA. Motivo: ${justificativa}`;

    await this.notificacaoRepository.create({
      userId: professor.id,
      message,
      type: 'RESERVA_REJEITADA',
    });

    await this.emailService.sendMail(
      professor.email,
      '[Agendamento de Salas] Reserva rejeitada',
      `<p>Olá, <strong>${professor.name}</strong>!</p>
       <p>Sua solicitação de reserva foi <strong style="color:red">REJEITADA</strong>.</p>
       <ul>
         <li><strong>Sala:</strong> ${salaNome}</li>
         <li><strong>Data:</strong> ${dataFormatada}</li>
         <li><strong>Horário:</strong> ${reserva.horario}</li>
         <li><strong>Turma:</strong> ${reserva.turma}</li>
       </ul>
       <p><strong>Motivo:</strong> ${justificativa}</p>`,
    );
  }
}
