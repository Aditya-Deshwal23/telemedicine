import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../index';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

const razorpay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
});

export class PaymentService {
    static async createOrder(appointmentId: string, userId: string) {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { doctor: true, patient: { include: { user: true } } },
        });
        if (!appointment) throw new AppError('Appointment not found', 404);

        const amount = appointment.doctor.fee * 100; // Convert to paise
        const order = await razorpay.orders.create({
            amount,
            currency: 'INR',
            receipt: `appt_${appointmentId}`,
            notes: { appointmentId, patientId: appointment.patientId },
        });

        await prisma.payment.create({
            data: {
                appointmentId,
                amount: appointment.doctor.fee,
                razorpayOrderId: order.id,
                status: 'PENDING',
            },
        });

        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: config.razorpay.keyId,
        };
    }

    static async verifyPayment(data: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
    }) {
        const body = data.razorpayOrderId + '|' + data.razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', config.razorpay.keySecret)
            .update(body)
            .digest('hex');

        if (expectedSignature !== data.razorpaySignature) {
            throw new AppError('Payment verification failed', 400);
        }

        const payment = await prisma.payment.update({
            where: { razorpayOrderId: data.razorpayOrderId },
            data: {
                razorpayPaymentId: data.razorpayPaymentId,
                razorpaySignature: data.razorpaySignature,
                status: 'COMPLETED',
            },
        });

        // Confirm the appointment after payment
        await prisma.appointment.update({
            where: { id: payment.appointmentId },
            data: { status: 'CONFIRMED' },
        });

        return payment;
    }
}
