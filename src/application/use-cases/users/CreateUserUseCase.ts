import { hash } from 'bcrypt';
import { z } from 'zod';
import { User, UserRole } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

const createUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres.'),
  role: z.enum(['PROFESSOR', 'COORDENADOR'], {
    errorMap: () => ({ message: 'Perfil deve ser PROFESSOR ou COORDENADOR.' }),
  }),
});

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreateUserResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
  };
}

/**
 * CreateUserUseCase (Single Responsibility)
 * Only a Coordinator may create users — authorization is enforced at the
 * controller/middleware level. This use case handles the business logic:
 * uniqueness check + password hashing.
 */
export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const { name, email, password, role } = createUserSchema.parse(request);

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Já existe um usuário cadastrado com este e-mail.');
    }

    const SALT_ROUNDS = 12;
    const hashedPassword = await hash(password, SALT_ROUNDS);

    const user: User = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
      status: 'APROVADO',
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }
}
