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
}
