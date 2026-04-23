import { hash } from 'bcrypt';
import { z } from 'zod';
import { UserRole } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { INotificationService } from '../../notification/notification.service.interface';

const registerUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres.'),
  role: z.enum(['PROFESSOR', 'COORDENADOR'], {
    errorMap: () => ({ message: 'Perfil deve ser PROFESSOR ou COORDENADOR.' }),
  }),
});

export interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterUserResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: 'PENDENTE';
    createdAt: Date;
  };
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly notificationService?: INotificationService,
  ) {}

  async execute(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    const { name, email, password, role } = registerUserSchema.parse(request);

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Já existe um usuário cadastrado com este e-mail.');
    }

    const hashedPassword = await hash(password, 12);

    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
      status: 'PENDENTE',
    });

    void this.notificationService?.notifyNewUser(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: 'PENDENTE',
        createdAt: user.createdAt,
      },
    };
  }
}
