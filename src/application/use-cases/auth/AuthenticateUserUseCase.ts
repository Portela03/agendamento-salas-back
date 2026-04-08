import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { z } from 'zod';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

const authenticateSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres.'),
});

export interface AuthenticateUserRequest {
  email: string;
  password: string;
}

export interface AuthenticateUserResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

/**
 * AuthenticateUserUseCase (Single Responsibility)
 * Validates credentials, generates a JWT and returns user data.
 */
export class AuthenticateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(request: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    const { email, password } = authenticateSchema.parse(request);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('E-mail ou senha inválidos.');
    }

    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('E-mail ou senha inválidos.');
    }

    if (!user.isApproved()) {
      throw new Error('Seu cadastro está pendente de aprovação do coordenador.');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET não configurado.');
    }

    // Cast needed because SignOptions.expiresIn is the branded ms.StringValue type
    const expiresIn = (process.env.JWT_EXPIRES_IN ?? '8h') as unknown as number;
    const token = sign(
      { sub: user.id, role: user.role },
      jwtSecret,
      { expiresIn },
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
