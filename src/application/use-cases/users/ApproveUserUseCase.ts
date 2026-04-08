import { z } from 'zod';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

const approveSchema = z.object({
  userId: z.string().uuid('ID de usuário inválido.'),
});

export interface ApproveUserRequest {
  userId: string;
}

export interface ApproveUserResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    approvedAt: Date | null | undefined;
  };
}

export class ApproveUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(request: ApproveUserRequest): Promise<ApproveUserResponse> {
    const { userId } = approveSchema.parse(request);

    const user = await this.userRepository.approveUser(userId);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        approvedAt: user.approvedAt,
      },
    };
  }
}
