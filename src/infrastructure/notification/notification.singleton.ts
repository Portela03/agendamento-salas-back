/**
 * Composition root for notification-related singletons.
 * Import `notificationService` wherever a use case needs it.
 */
import { prismaClient } from '../database/prisma/prismaClient';
import { PrismaNotificacaoRepository } from '../database/prisma/PrismaNotificacaoRepository';
import { PrismaUserRepository } from '../database/prisma/PrismaUserRepository';
import { EmailService } from '../email/email.service';
import { NotificationService } from './notification.service';

const notificacaoRepository = new PrismaNotificacaoRepository(prismaClient);
const userRepository = new PrismaUserRepository(prismaClient);
const emailService = new EmailService();

export const notificationService = new NotificationService(
  notificacaoRepository,
  userRepository,
  emailService,
);
