import { prisma } from '../index';
import { AppError } from '../middleware/errorHandler';
import { addMinutes } from 'date-fns';

export class AppointmentService {
    static async bookAppointment(data: {
        patientId: string;
        doctorId: string;
        dateTime: string;
        symptoms?: string;
    }) {
        const doctor = await prisma.doctor.findUnique({ where: { id: data.doctorId } });
        if (!doctor) throw new AppError('Doctor not found', 404);
        if (!doctor.isApproved) throw new AppError('Doctor is not approved yet', 400);

        const appointmentDate = new Date(data.dateTime);
        const endTime = addMinutes(appointmentDate, doctor.consultationDuration);

        // Check for conflicts
        const conflict = await prisma.appointment.findFirst({
            where: {
                doctorId: data.doctorId,
                status: { in: ['PENDING', 'CONFIRMED'] },
                dateTime: { lt: endTime },
                endTime: { gt: appointmentDate },
            },
        });
        if (conflict) throw new AppError('This time slot is not available', 409);

        const patient = await prisma.patient.findFirst({ where: { userId: data.patientId } });
        if (!patient) throw new AppError('Patient profile not found', 404);

        const appointment = await prisma.appointment.create({
            data: {
                patientId: patient.id,
                doctorId: data.doctorId,
                dateTime: appointmentDate,
                endTime,
                symptoms: data.symptoms,
                roomId: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            },
            include: {
                doctor: { include: { user: { select: { name: true, email: true } } } },
                patient: { include: { user: { select: { name: true, email: true } } } },
            },
        });

        return appointment;
    }

    static async getAppointments(userId: string, role: string, status?: string) {
        const where: any = {};
        if (role === 'DOCTOR') {
            const doctor = await prisma.doctor.findFirst({ where: { userId } });
            if (!doctor) throw new AppError('Doctor not found', 404);
            where.doctorId = doctor.id;
        } else if (role === 'PATIENT') {
            const patient = await prisma.patient.findFirst({ where: { userId } });
            if (!patient) throw new AppError('Patient not found', 404);
            where.patientId = patient.id;
        }
        if (status) where.status = status;

        return prisma.appointment.findMany({
            where,
            include: {
                doctor: { include: { user: { select: { name: true, avatar: true } } } },
                patient: { include: { user: { select: { name: true, avatar: true } } } },
                payment: true,
            },
            orderBy: { dateTime: 'desc' },
        });
    }

    static async updateStatus(appointmentId: string, status: string, userId: string) {
        const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
        if (!appointment) throw new AppError('Appointment not found', 404);

        return prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: status as any },
            include: {
                doctor: { include: { user: { select: { name: true, email: true } } } },
                patient: { include: { user: { select: { name: true, email: true } } } },
            },
        });
    }

    static async getDoctorSlots(doctorId: string, date: string) {
        const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
        if (!doctor) throw new AppError('Doctor not found', 404);

        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const booked = await prisma.appointment.findMany({
            where: {
                doctorId,
                dateTime: { gte: dayStart, lte: dayEnd },
                status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
            },
            select: { dateTime: true, endTime: true },
        });

        return { slots: doctor.availableSlots, bookedSlots: booked, duration: doctor.consultationDuration };
    }
}
