import { Router, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, async (req, res: Response) => {
    try {
        const result = await AuthService.register(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

router.post('/login', authRateLimiter, async (req, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        res.json(result);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

router.post('/google', async (req, res: Response) => {
    try {
        const { googleId, email, name, avatar } = req.body;
        const result = await AuthService.googleAuth(googleId, email, name, avatar);
        res.json(result);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

router.post('/otp/send', authRateLimiter, async (req, res: Response) => {
    try {
        const { email } = req.body;
        const { otp } = await AuthService.sendOTP(email);
        await EmailService.sendOTPEmail(email, otp);
        res.json({ message: 'OTP sent successfully' });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

router.post('/otp/verify', async (req, res: Response) => {
    try {
        const { email, otp } = req.body;
        const result = await AuthService.verifyOTP(email, otp);
        res.json(result);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const profile = await AuthService.getProfile(req.user!.id);
        res.json(profile);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

export default router;
