import { Notificacao, NotificacaoType } from './notificacao.entity';

export interface CreateNotificacaoData {
  userId: string;
  message: string;
  type: NotificacaoType;
}

export interface INotificacaoRepository {
  create(data: CreateNotificacaoData): Promise<Notificacao>;
  findByUserId(userId: string, unreadOnly?: boolean): Promise<Notificacao[]>;
  markAllAsRead(userId: string): Promise<void>;
}
