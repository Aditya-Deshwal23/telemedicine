import { Router, Response } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/book', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const appointment = await AppointmentService.bookAppointment({ ...req.body, patientId: req.user!.id });
        res.status(201).json(appointment);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.query;
        const appointments = await AppointmentService.getAppointments(req.user!.id, req.user!.role, status as string);
        res.json(appointments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { prisma } = await import('../index');
        const appointment = await prisma.appointment.findUnique({
            where: { id: req.params.id },
            include: {
                doctor: { include: { user: { select: { name: true, avatar: true, email: true } } } },
                patient: { include: { user: { select: { name: true, avatar: true, email: true } } } },
                prescription: true,
                payment: true,
                messages: { orderBy: { createdAt: 'asc' }, take: 50 },
            },
        });
        if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
        res.json(appointment);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        const appointment = await AppointmentService.updateStatus(req.params.id, status, req.user!.id);
        res.json(appointment);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

export default router;
