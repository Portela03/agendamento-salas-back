export type UserRole = 'PROFESSOR' | 'COORDENADOR';
export type UserStatus = 'PENDENTE' | 'APROVADO';

export interface UserProps {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Entity — encapsulates business rules for a system user.
 */
export class User {
  private readonly props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get approvedAt(): Date | null | undefined {
    return this.props.approvedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isCoordenador(): boolean {
    return this.props.role === 'COORDENADOR';
  }

  isProfessor(): boolean {
    return this.props.role === 'PROFESSOR';
  }

  isApproved(): boolean {
    return this.props.status === 'APROVADO';
  }

  toPublic(): Omit<UserProps, 'password'> {
    const { password: _, ...publicData } = this.props;
    return publicData;
  }
}
