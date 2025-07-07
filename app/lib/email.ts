import nodemailer from 'nodemailer';

/**
 * Email configuration and utility functions
 * Handles sending password reset emails and other email notifications
 */

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Get environment variables
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM
  };
  
  // Validate required environment variables
  if (!config.host || !config.user || !config.pass) {
    throw new Error('Missing required SMTP environment variables: SMTP_HOST, SMTP_USER, SMTP_PASS');
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
};

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
  const transporter = createTransporter();
  
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
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
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