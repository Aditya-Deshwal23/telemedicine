import { Router, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/create-order', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { appointmentId } = req.body;
        const order = await PaymentService.createOrder(appointmentId, req.user!.id);
        res.json(order);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

router.post('/verify', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const payment = await PaymentService.verifyPayment(req.body);
        res.json({ success: true, payment });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

export default router;
