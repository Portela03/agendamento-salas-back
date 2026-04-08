import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export interface ListPendingUsersResponse {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: Date;
  }>;
}

export class ListPendingUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<ListPendingUsersResponse> {
    const users = await this.userRepository.listPendingUsers();

    return {
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      })),
    };
  }
}
