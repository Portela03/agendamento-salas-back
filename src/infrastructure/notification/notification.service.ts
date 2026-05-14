import { INotificationService } from "../../application/notification/notification.service.interface";
import { User } from "../../domain/entities/User";
import { INotificacaoRepository } from "../../domain/notificacao/notificacao-repository.interface";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { Reserva } from "../../domain/reserva/reserva.entity";
import { EmailService } from "../email/email.service";
import {
  emailNovoUsuario,
  emailUsuarioAprovado,
  emailNovaReserva,
  emailReservaAprovada,
  emailReservaRejeitada,
  emailEsqueceuSenha,
} from "../email/email.templates";

export class NotificationService implements INotificationService {
  constructor(
    private readonly notificacaoRepository: INotificacaoRepository,
    private readonly userRepository: IUserRepository,
    private readonly emailService: EmailService,
  ) {}

  async notifyNewUser(user: User): Promise<void> {
    let coordinators: User[] = [];
    try {
      coordinators = await this.userRepository.findAllByRole("COORDENADOR");
    } catch (err) {
      console.error('[NotificationService] notifyNewUser: falha ao buscar coordenadores:', err);
      return;
    }

    const message = `Novo usuário "${user.name}" aguarda Aprovação de cadastro.`;

    await Promise.all(
      coordinators.map(async (coord) => {
        try {
          await this.notificacaoRepository.create({
            userId: coord.id,
            message,
            type: "NOVO_USUARIO",
          });
        } catch (err) {
          console.error(`[NotificationService] notifyNewUser: falha ao criar notificação para coordenador ${coord.email}:`, err);
        }

        try {
          await this.emailService.sendMail(
            coord.email,
            "Novo cadastro aguardando Aprovação",
            emailNovoUsuario(coord, user),
          );
        } catch (err) {
          console.error(`[NotificationService] notifyNewUser: falha ao enviar email para ${coord.email}:`, err);
        }
      }),
    );
  }

  async notifyUserApproved(user: User): Promise<void> {
    const message =
      "Seu cadastro foi aprovado! Você já pode acessar o sistema.";

    try {
      await this.notificacaoRepository.create({
        userId: user.id,
        message,
        type: "USUARIO_APROVADO",
      });
    } catch (err) {
      console.error(`[NotificationService] notifyUserApproved: falha ao criar notificação para ${user.email}:`, err);
    }

    try {
      await this.emailService.sendMail(
        user.email,
        "Seu acesso foi liberado!",
        emailUsuarioAprovado(user),
      );
    } catch (err) {
      console.error(`[NotificationService] notifyUserApproved: falha ao enviar email para ${user.email}:`, err);
    }
  }

  async notifyNewReservation(reserva: Reserva): Promise<void> {
    let professor: User | null = null;
    try {
      professor = await this.userRepository.findById(reserva.professorId);
    } catch (err) {
      console.error('[NotificationService] notifyNewReservation: falha ao buscar professor:', err);
    }

    const professorNome =
      professor?.name ?? reserva.professorNome ?? "Professor";
    const salaNome = reserva.salaNome ?? reserva.salaId;
    const dataFormatada = new Date(reserva.data).toLocaleDateString("pt-BR");
    const message = `Nova solicitação de reserva da sala "${salaNome}" por ${professorNome} em ${dataFormatada} (${reserva.horario}).`;

    let coordinators: User[] = [];
    try {
      coordinators = await this.userRepository.findAllByRole("COORDENADOR");
    } catch (err) {
      console.error('[NotificationService] notifyNewReservation: falha ao buscar coordenadores:', err);
      return;
    }

    await Promise.all(
      coordinators.map(async (coord) => {
        try {
          await this.notificacaoRepository.create({
            userId: coord.id,
            message,
            type: "NOVA_RESERVA",
          });
        } catch (err) {
          console.error(`[NotificationService] notifyNewReservation: falha ao criar notificação para coordenador ${coord.email}:`, err);
        }

        try {
          await this.emailService.sendMail(
            coord.email,
            "Nova solicitação de reserva de sala",
            emailNovaReserva(coord, {
              professorNome,
              salaNome,
              data: dataFormatada,
              horario: reserva.horario,
              turma: reserva.turma,
            }),
          );
        } catch (err) {
          console.error(`[NotificationService] notifyNewReservation: falha ao enviar email para ${coord.email}:`, err);
        }
      }),
    );
  }

  async notifyNewReservationSeries(reservas: Reserva[]): Promise<void> {
    if (reservas.length === 0) return;

    const primeiraReserva = reservas[0];
    let professor: User | null = null;
    try {
      professor = await this.userRepository.findById(primeiraReserva.professorId);
    } catch (err) {
      console.error('[NotificationService] notifyNewReservationSeries: falha ao buscar professor:', err);
    }

    const professorNome = professor?.name ?? primeiraReserva.professorNome ?? "Professor";
    const salaNome = primeiraReserva.salaNome ?? primeiraReserva.salaId;
    const primeiraData = new Date(primeiraReserva.data).toLocaleDateString("pt-BR");
    const ultimaData = new Date(reservas[reservas.length - 1].data).toLocaleDateString("pt-BR");
    const message = `Nova solicitação semestral de ${reservas.length} reservas da sala "${salaNome}" por ${professorNome}, de ${primeiraData} a ${ultimaData} (${primeiraReserva.horario}).`;

    let coordinators: User[] = [];
    try {
      coordinators = await this.userRepository.findAllByRole("COORDENADOR");
    } catch (err) {
      console.error('[NotificationService] notifyNewReservationSeries: falha ao buscar coordenadores:', err);
      return;
    }

    await Promise.all(
      coordinators.map(async (coord) => {
        try {
          await this.notificacaoRepository.create({
            userId: coord.id,
            message,
            type: "NOVA_RESERVA",
          });
        } catch (err) {
          console.error(`[NotificationService] notifyNewReservationSeries: falha ao criar notificação para coordenador ${coord.email}:`, err);
        }
      }),
    );
  }

  async notifyReservaAprovada(reserva: Reserva): Promise<void> {
    const professor = await this.userRepository.findById(reserva.professorId);
    if (!professor) return;

    const salaNome = reserva.salaNome ?? reserva.salaId;
    const dataFormatada = new Date(reserva.data).toLocaleDateString("pt-BR");
    const message = `Sua reserva da sala "${salaNome}" em ${dataFormatada} (${reserva.horario}) foi APROVADA.`;

    try {
      await this.notificacaoRepository.create({
        userId: professor.id,
        message,
        type: "RESERVA_APROVADA",
      });
    } catch (err) {
      console.error(`[NotificationService] notifyReservaAprovada: falha ao criar notificação para ${professor.email}:`, err);
    }

    try {
      await this.emailService.sendMail(
        professor.email,
        "Sua reserva foi aprovada!",
        emailReservaAprovada(professor, {
          salaNome,
          data: dataFormatada,
          horario: reserva.horario,
          turma: reserva.turma,
        }),
      );
    } catch (err) {
      console.error(`[NotificationService] notifyReservaAprovada: falha ao enviar email para ${professor.email}:`, err);
    }
  }

  async notifyReservaSerieAprovada(reservas: Reserva[]): Promise<void> {
    if (reservas.length === 0) return;
    const primeiraReserva = reservas[0];
    const professor = await this.userRepository.findById(primeiraReserva.professorId);
    if (!professor) return;
    const salaNome = primeiraReserva.salaNome ?? primeiraReserva.salaId;
    const primeiraData = new Date(primeiraReserva.data).toLocaleDateString("pt-BR");
    const ultimaData = new Date(reservas[reservas.length - 1].data).toLocaleDateString("pt-BR");
    const message = `Sua reserva semestral da sala "${salaNome}" de ${primeiraData} a ${ultimaData} (${primeiraReserva.horario}) foi APROVADA.`;
    try {
      await this.notificacaoRepository.create({
        userId: professor.id,
        message,
        type: "RESERVA_APROVADA",
      });
    } catch (err) {}
    try {
      await this.emailService.sendMail(
        professor.email,
        "Sua reserva semestral foi aprovada!",
        emailReservaAprovada(professor, {
          salaNome,
          data: `${primeiraData} a ${ultimaData} (${reservas.length} datas)`,
          horario: primeiraReserva.horario,
          turma: primeiraReserva.turma,
        }),
      );
    } catch (err) {}
  }

  async notifyReservaRejeitada(reserva: Reserva): Promise<void> {
    const professor = await this.userRepository.findById(reserva.professorId);
    if (!professor) return;

    const salaNome = reserva.salaNome ?? reserva.salaId;
    const dataFormatada = new Date(reserva.data).toLocaleDateString("pt-BR");
    const justificativa =
      reserva.justificativa ?? "Sem justificativa informada.";
    const message = `Sua reserva da sala "${salaNome}" em ${dataFormatada} (${reserva.horario}) foi REJEITADA. Motivo: ${justificativa}`;

    try {
      await this.notificacaoRepository.create({
        userId: professor.id,
        message,
        type: "RESERVA_REJEITADA",
      });
    } catch (err) {
      console.error(`[NotificationService] notifyReservaRejeitada: falha ao criar notificação para ${professor.email}:`, err);
    }

    try {
      await this.emailService.sendMail(
        professor.email,
        "Solicitação de reserva não aprovada",
        emailReservaRejeitada(professor, {
          salaNome,
          data: dataFormatada,
          horario: reserva.horario,
          turma: reserva.turma,
          justificativa,
        }),
      );
    } catch (err) {
      console.error(`[NotificationService] notifyReservaRejeitada: falha ao enviar email para ${professor.email}:`, err);
    }
  }

  async enviarResetSenha (email: string, token: string): Promise<void> {
    let user: User | null = null;

    try {
      user = await this.userRepository.findByEmail(email);
    } catch (err) {
      console.error("[NotificationService] notifyResetSenha: falha ao buscar usuário por email:", err);
      return;
    }

    if (!user) {
      console.warn(`[NotificationService] notifyResetSenha: usuário não encontrado (${email}).`);
      return;
    }

    if (user.status !== "APROVADO") {
      console.warn(`[NotificationService] notifyResetSenha: usuário não aprovado (${email}).`);
      return;
    }

    try {
      await this.emailService.sendMail(
        user.email,
        "Redefinição de senha",
        emailEsqueceuSenha(user.name, token),
      );
    } catch (err) {
      console.error(`[NotificationService] notifyResetSenha: falha ao enviar email para ${user.email}:`, err);
    }
  };  
}
