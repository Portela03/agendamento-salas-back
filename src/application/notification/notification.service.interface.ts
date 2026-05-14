import { User } from '../../domain/entities/User';
import { Reserva } from '../../domain/reserva/reserva.entity';

export interface INotificationService {
  notifyNewUser(user: User): Promise<void>;
  notifyUserApproved(user: User): Promise<void>;
  notifyNewReservation(reserva: Reserva): Promise<void>;
  notifyNewReservationSeries?(reservas: Reserva[]): Promise<void>;
  notifyReservaAprovada(reserva: Reserva): Promise<void>;
  notifyReservaSerieAprovada?(reservas: Reserva[]): Promise<void>;
  notifyReservaRejeitada(reserva: Reserva): Promise<void>;
  enviarResetSenha(email: String, token:String): Promise<void>;
}
