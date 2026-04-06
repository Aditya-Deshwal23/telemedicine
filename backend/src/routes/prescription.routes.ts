import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { appointmentId, diagnosis, medications, instructions, followUpDate } = req.body;
        const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
        if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

        const doctor = await prisma.doctor.findFirst({ where: { userId: req.user!.id } });
        if (!doctor) return res.status(403).json({ error: 'Only doctors can create prescriptions' });

        const prescription = await prisma.prescription.create({
            data: { appointmentId, doctorId: doctor.id, patientId: appointment.patientId, diagnosis, medications, instructions, followUpDate: followUpDate ? new Date(followUpDate) : null },
            include: { doctor: { include: { user: { select: { name: true } } } }, patient: { include: { user: { select: { name: true } } } } },
        });
        res.status(201).json(prescription);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/appointment/:appointmentId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const prescription = await prisma.prescription.findUnique({
            where: { appointmentId: req.params.appointmentId },
            include: { doctor: { include: { user: { select: { name: true } } } }, patient: { include: { user: { select: { name: true } } } } },
        });
        if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
        res.json(prescription);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/patient', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const patient = await prisma.patient.findFirst({ where: { userId: req.user!.id } });
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        const prescriptions = await prisma.prescription.findMany({
            where: { patientId: patient.id },
            include: { doctor: { include: { user: { select: { name: true } } } }, appointment: { select: { dateTime: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(prescriptions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
