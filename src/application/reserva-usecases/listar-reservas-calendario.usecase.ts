import { CalendarioFiltros, ReservaRepository } from "../../domain/reserva/reserva-repository.interface";

export class ListarReservasCalendarioUseCase {
  constructor(private reservaRepository: ReservaRepository) {}

  async execute(filtros: CalendarioFiltros) {
    return this.reservaRepository.findByCalendario(filtros);
  }
}
