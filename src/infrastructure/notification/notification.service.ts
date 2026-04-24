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
    const coordinators = await this.userRepository.findAllByRole("COORDENADOR");
    const message = `Novo usuário "${user.name}" aguarda Aprovação de cadastro.`;

    await Promise.all(
      coordinators.map(async (coord) => {
        await this.notificacaoRepository.create({
          userId: coord.id,
          message,
          type: "NOVO_USUARIO",
        });
        await this.emailService.sendMail(
          coord.email,
          "Novo cadastro aguardando Aprovação",
          emailNovoUsuario(coord, user),
        );
      }),
    );
  }

  async notifyUserApproved(user: User): Promise<void> {
    const message =
      "Seu cadastro foi aprovado! VocÃª jÃ¡ pode acessar o sistema.";

    await this.notificacaoRepository.create({
      userId: user.id,
      message,
      type: "USUARIO_APROVADO",
    });

    await this.emailService.sendMail(
      user.email,
      "Seu acesso foi liberado!",
      emailUsuarioAprovado(user),
    );
  }

  async notifyNewReservation(reserva: Reserva): Promise<void> {
    const professor = await this.userRepository.findById(reserva.professorId);
    const professorNome =
      professor?.name ?? reserva.professorNome ?? "Professor";
    const salaNome = reserva.salaNome ?? reserva.salaId;
    const dataFormatada = new Date(reserva.data).toLocaleDateString("pt-BR");
    const message = `Nova solicitação de reserva da sala "${salaNome}" por ${professorNome} em ${dataFormatada} (${reserva.horario}).`;

    const coordinators = await this.userRepository.findAllByRole("COORDENADOR");

    await Promise.all(
      coordinators.map(async (coord) => {
        await this.notificacaoRepository.create({
          userId: coord.id,
          message,
          type: "NOVA_RESERVA",
        });
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
      }),
    );
  }

  async notifyReservaAprovada(reserva: Reserva): Promise<void> {
    const professor = await this.userRepository.findById(reserva.professorId);
    if (!professor) return;

    const salaNome = reserva.salaNome ?? reserva.salaId;
    const dataFormatada = new Date(reserva.data).toLocaleDateString("pt-BR");
    const message = `Sua reserva da sala "${salaNome}" em ${dataFormatada} (${reserva.horario}) foi APROVADA.`;

    await this.notificacaoRepository.create({
      userId: professor.id,
      message,
      type: "RESERVA_APROVADA",
    });

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
  }

  async notifyReservaRejeitada(reserva: Reserva): Promise<void> {
    const professor = await this.userRepository.findById(reserva.professorId);
    if (!professor) return;

    const salaNome = reserva.salaNome ?? reserva.salaId;
    const dataFormatada = new Date(reserva.data).toLocaleDateString("pt-BR");
    const justificativa =
      reserva.justificativa ?? "Sem justificativa informada.";
    const message = `Sua reserva da sala "${salaNome}" em ${dataFormatada} (${reserva.horario}) foi REJEITADA. Motivo: ${justificativa}`;

    await this.notificacaoRepository.create({
      userId: professor.id,
      message,
      type: "RESERVA_REJEITADA",
    });

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
  }
}
