import nodemailer from 'nodemailer';
import { prisma } from '@/app/lib/prisma';

/**
 * Email configuration and utility functions
 * Handles sending password reset emails and other email notifications
 */

/**
 * Fetch SMTP config from the database
 */
async function getSmtpConfig() {
  const keys = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM',
  ];
  const configs = await prisma.configuration.findMany({
    where: { key: { in: keys } },
  });
  const configMap = Object.fromEntries(configs.map((c: { key: string, value: string }) => [c.key, c.value]));
  return {
    host: configMap.SMTP_HOST,
    port: parseInt(configMap.SMTP_PORT || '587'),
    user: configMap.SMTP_USER,
    pass: configMap.SMTP_PASS,
    from: configMap.SMTP_FROM,
  };
}

/**
 * Create reusable transporter object using SMTP transport
 */
async function createTransporter() {
  const config = await getSmtpConfig();
  if (!config.host || !config.user || !config.pass) {
    throw new Error('Missing required SMTP configuration values: SMTP_HOST, SMTP_USER, SMTP_PASS');
  }
  console.log('Creating SMTP transporter with config:', {
    host: config.host,
    port: config.port,
    user: config.user,
    from: config.from,
    passLength: config.pass ? config.pass.length : 0
  });
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: false,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  });
}

/**
 * Send password reset email
 * @param to - Recipient email address
 * @param resetToken - Password reset token
 * @param username - User's username
 * @param language - Language for email content ('en' or 'es')
 */
export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
  username: string,
  language: string = 'en'
) => {
  const config = await getSmtpConfig();
  const transporter = await createTransporter();
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
  const emailContent = {
    en: {
      subject: 'Password Reset Request - NexusTracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${username},</p>
          <p>We received a request to reset your password for your NexusTracker account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The NexusTracker Team</p>
        </div>
      `
    },
    es: {
      subject: 'Solicitud de Restablecimiento de Contraseña - NexusTracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Solicitud de Restablecimiento de Contraseña</h2>
          <p>Hola ${username},</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de NexusTracker.</p>
          <p>Haz clic en el botón de abajo para restablecer tu contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>Este enlace expirará en 1 hora por razones de seguridad.</p>
          <p>Si no solicitaste este restablecimiento de contraseña, por favor ignora este correo.</p>
          <p>Saludos,<br>El Equipo de NexusTracker</p>
        </div>
      `
    }
  };
  const content = emailContent[language as keyof typeof emailContent] || emailContent.en;
  const mailOptions = {
    from: config.from || config.user,
    to,
    subject: content.subject,
    html: content.html,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

export const sendVerificationEmail = async (
  to: string,
  verificationToken: string,
  username: string,
  language: string = 'en'
) => {
  const config = await getSmtpConfig();
  const transporter = await createTransporter();
  const verifyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;
  const emailContent = {
    en: {
      subject: 'Verify Your Email - NexusTracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verify Your Email</h2>
          <p>Hello ${username},</p>
          <p>Thank you for registering at NexusTracker. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" 
               style="background-color: #28a745; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verifyUrl}</p>
          <p>This link will expire in 24 hours for security reasons.</p>
          <p>If you did not register, please ignore this email.</p>
          <p>Best regards,<br>The NexusTracker Team</p>
        </div>
      `
    },
    es: {
      subject: 'Verifica tu correo electrónico - NexusTracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verifica tu correo electrónico</h2>
          <p>Hola ${username},</p>
          <p>Gracias por registrarte en NexusTracker. Por favor verifica tu correo electrónico haciendo clic en el botón de abajo:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" 
               style="background-color: #28a745; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verificar correo
            </a>
          </div>
          <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #666;">${verifyUrl}</p>
          <p>Este enlace expirará en 24 horas por razones de seguridad.</p>
          <p>Si no te registraste, por favor ignora este correo.</p>
          <p>Saludos,<br>El Equipo de NexusTracker</p>
        </div>
      `
    }
  };
  const content = emailContent[language as keyof typeof emailContent] || emailContent.en;
  const mailOptions = {
    from: config.from || config.user,
    to,
    subject: content.subject,
    html: content.html,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendEmailChangeSecurityAlert = async (
  to: string,
  oldEmail: string,
  newEmail: string,
  username: string,
  language: string = 'en'
) => {
  const config = await getSmtpConfig();
  const transporter = await createTransporter();
  // Fetch support email from configuration
  let supportEmail: string | undefined;
  const supportConfig = await prisma.configuration.findUnique({ where: { key: 'SUPPORT_EMAIL' } });
  supportEmail = supportConfig?.value || config.from || config.user;

  // Generate a password reset token for the old email
  const user = await prisma.user.findFirst({ where: { email: oldEmail } });
  if (!user) throw new Error('User not found for password reset token');
  const crypto = await import('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      email: oldEmail,
      token: resetToken,
      expires,
    }
  });
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

  const emailContent = {
    en: {
      subject: 'Security Alert: Your Email Was Changed - NexusTracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c00;">Security Alert: Email Change</h2>
          <p>Hello ${username},</p>
          <p>Your NexusTracker account email was changed from <b>${oldEmail}</b> to <b>${newEmail}</b> by an administrator.</p>
          <p>If you did <b>not</b> request this change, please <a href="mailto:${supportEmail}">contact support</a> immediately and reset your password to protect your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>Best regards,<br>The NexusTracker Team</p>
        </div>
      `
    },
    es: {
      subject: 'Alerta de Seguridad: Tu correo fue cambiado - NexusTracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c00;">Alerta de Seguridad: Cambio de Correo</h2>
          <p>Hola ${username},</p>
          <p>El correo de tu cuenta de NexusTracker fue cambiado de <b>${oldEmail}</b> a <b>${newEmail}</b> por un administrador.</p>
          <p>Si <b>no</b> solicitaste este cambio, por favor <a href="mailto:${supportEmail}">contacta al soporte</a> inmediatamente y restablece tu contraseña para proteger tu cuenta.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>Este enlace expirará en 1 hora por razones de seguridad.</p>
          <p>Saludos,<br>El Equipo de NexusTracker</p>
        </div>
      `
    }
  };
  const content = emailContent[language as keyof typeof emailContent] || emailContent.en;
  const mailOptions = {
    from: config.from || config.user,
    to,
    subject: content.subject,
    html: content.html,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('Security alert email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending security alert email:', error);
    throw new Error('Failed to send security alert email');
  }
}; 