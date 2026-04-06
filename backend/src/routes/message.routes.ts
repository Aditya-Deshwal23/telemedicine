import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/:receiverId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: req.user!.id, receiverId: req.params.receiverId },
                    { senderId: req.params.receiverId, receiverId: req.user!.id },
                ],
            },
            orderBy: { createdAt: 'asc' },
            take: 100,
        });
        res.json(messages);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { receiverId, content, type, fileUrl, appointmentId } = req.body;
        const message = await prisma.message.create({
            data: { senderId: req.user!.id, receiverId, content, type: type || 'text', fileUrl, appointmentId },
        });
        res.status(201).json(message);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/read/:senderId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.message.updateMany({
            where: { senderId: req.params.senderId, receiverId: req.user!.id, isRead: false },
            data: { isRead: true },
        });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
