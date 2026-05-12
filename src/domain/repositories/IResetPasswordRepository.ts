import { ResetPassword } from '../entities/ResetPassword';

export interface ResetPasswordData {
    id:        string;   
    userId:    string;
    tokenHash: string;
    expireAt:  Date;
    used:      boolean;
    createdAt: Date; 
}

export interface IResetPasswordRepository {
    create(data: Omit<ResetPasswordData, 'id' | 'createdAt' | 'used' > & { id?: string }): Promise<ResetPassword>;
    findById(id: string): Promise<ResetPassword | null>;
    findByTokenHash(tokenHash: string): Promise<ResetPassword | null>;
    markUsed(id: string): Promise<ResetPassword>;
    listUsed(): Promise<ResetPassword[]>;
}