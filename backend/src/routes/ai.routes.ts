import { Router, Response } from 'express';
import { AIService } from '../services/ai.service';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/symptom-check', async (req, res: Response) => {
    try {
        const { symptoms } = req.body;
        if (!symptoms || !Array.isArray(symptoms)) return res.status(400).json({ error: 'Symptoms array required' });
        const result = AIService.checkSymptoms(symptoms);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/analyze-report', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { reportText } = req.body;
        if (!reportText) return res.status(400).json({ error: 'Report text required' });
        const result = AIService.analyzeReport(reportText);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/generate-prescription', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { notes } = req.body;
        if (!notes) return res.status(400).json({ error: 'Notes required' });
        const result = AIService.generatePrescription(notes);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
