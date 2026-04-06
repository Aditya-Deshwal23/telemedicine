import nodemailer from 'nodemailer';
import { config } from '../config';
import logger from '../utils/logger';

const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: false,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
});

export class EmailService {
    static async sendOTPEmail(email: string, otp: string) {
        try {
            await transporter.sendMail({
                from: `"MediConnect" <${config.smtp.from}>`,
                to: email,
                subject: 'Your OTP for MediConnect Login',
                html: `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
            <h2 style="color:#0F766E;">MediConnect</h2>
            <p>Your one-time password is:</p>
            <h1 style="color:#0F766E;letter-spacing:8px;text-align:center;background:#F0FDFA;padding:20px;border-radius:8px;">${otp}</h1>
            <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
          </div>`,
            });
        } catch (error) {
            logger.error('Email send failed:', error);
        }
    }

    static async sendAppointmentConfirmation(email: string, data: { doctorName: string; dateTime: string; amount: number }) {
        try {
            await transporter.sendMail({
                from: `"MediConnect" <${config.smtp.from}>`,
                to: email,
                subject: 'Appointment Confirmed - MediConnect',
                html: `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
            <h2 style="color:#0F766E;">Appointment Confirmed ✅</h2>
            <p><strong>Doctor:</strong> ${data.doctorName}</p>
            <p><strong>Date & Time:</strong> ${new Date(data.dateTime).toLocaleString()}</p>
            <p><strong>Amount Paid:</strong> ₹${data.amount}</p>
            <p>You will receive a video call link before your appointment.</p>
          </div>`,
            });
        } catch (error) {
            logger.error('Email send failed:', error);
        }
    }

    static async sendAppointmentReminder(email: string, data: { doctorName: string; dateTime: string; roomId: string }) {
        try {
            await transporter.sendMail({
                from: `"MediConnect" <${config.smtp.from}>`,
                to: email,
                subject: 'Appointment Reminder - MediConnect',
                html: `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
            <h2 style="color:#0F766E;">Appointment Reminder 🔔</h2>
            <p>Your appointment with <strong>Dr. ${data.doctorName}</strong> is coming up.</p>
            <p><strong>Time:</strong> ${new Date(data.dateTime).toLocaleString()}</p>
            <a href="${config.frontendUrl}/consultation/${data.roomId}" 
               style="display:inline-block;background:#0F766E;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:10px;">
              Join Consultation
            </a>
          </div>`,
            });
        } catch (error) {
            logger.error('Email send failed:', error);
        }
    }
}
