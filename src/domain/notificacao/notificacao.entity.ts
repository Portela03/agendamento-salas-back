export type NotificacaoType =
  | 'NOVO_USUARIO'
  | 'USUARIO_APROVADO'
  | 'NOVA_RESERVA'
  | 'RESERVA_APROVADA'
  | 'RESERVA_REJEITADA';

export class Notificacao {
  id?: string;
  userId: string;
  message: string;
  type: NotificacaoType;
  read: boolean;
  createdAt: Date;

  constructor(props: {
    id?: string;
    userId: string;
    message: string;
    type: NotificacaoType;
    read?: boolean;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.message = props.message;
    this.type = props.type;
    this.read = props.read ?? false;
    this.createdAt = props.createdAt ?? new Date();
  }
}
