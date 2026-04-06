import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const patient = await prisma.patient.findFirst({
            where: { userId: req.user!.id },
            include: { user: { select: { name: true, email: true, avatar: true, phone: true } } },
        });
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        res.json(patient);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { dateOfBirth, gender, bloodGroup, allergies, medicalHistory, address, emergencyContact, name, phone } = req.body;
        if (name || phone) {
            await prisma.user.update({ where: { id: req.user!.id }, data: { ...(name && { name }), ...(phone && { phone }) } });
        }
        const patient = await prisma.patient.update({
            where: { userId: req.user!.id },
            data: { dateOfBirth, gender, bloodGroup, allergies, medicalHistory, address, emergencyContact },
            include: { user: { select: { name: true, email: true, avatar: true, phone: true } } },
        });
        res.json(patient);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/health-timeline', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const patient = await prisma.patient.findFirst({ where: { userId: req.user!.id } });
        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        const [appointments, prescriptions, reports] = await Promise.all([
            prisma.appointment.findMany({
                where: { patientId: patient.id },
                include: { doctor: { include: { user: { select: { name: true } } } } },
                orderBy: { dateTime: 'desc' },
            }),
            prisma.prescription.findMany({
                where: { patientId: patient.id },
                include: { doctor: { include: { user: { select: { name: true } } } } },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.report.findMany({ where: { patientId: patient.id }, orderBy: { uploadedAt: 'desc' } }),
        ]);

        const timeline = [
            ...appointments.map(a => ({ type: 'appointment', date: a.dateTime, data: a })),
            ...prescriptions.map(p => ({ type: 'prescription', date: p.createdAt, data: p })),
            ...reports.map(r => ({ type: 'report', date: r.uploadedAt, data: r })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        res.json(timeline);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
