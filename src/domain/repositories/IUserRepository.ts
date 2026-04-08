import { User, UserRole, UserStatus } from '../entities/User';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status?: UserStatus;
}

/**
 * IUserRepository — interface (port) that defines the contract for user
 * persistence operations. Concrete implementations live in the
 * infrastructure layer (e.g. PrismaUserRepository).
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  listPendingUsers(): Promise<User[]>;
  approveUser(id: string): Promise<User | null>;
  countUsers(): Promise<number>;
  create(data: CreateUserData): Promise<User>;
}
