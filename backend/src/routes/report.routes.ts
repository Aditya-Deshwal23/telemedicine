import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { StorageService } from '../services/storage.service';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.post('/upload', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const patient = await prisma.patient.findFirst({ where: { userId: req.user!.id } });
        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        const { url } = await StorageService.uploadBuffer(req.file.buffer, 'telemedicine/reports');
        const report = await prisma.report.create({
            data: { patientId: patient.id, title: req.body.title || req.file.originalname, type: req.body.type || 'general', fileUrl: url },
        });
        res.status(201).json(report);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/patient', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const patient = await prisma.patient.findFirst({ where: { userId: req.user!.id } });
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        const reports = await prisma.report.findMany({ where: { patientId: patient.id }, orderBy: { uploadedAt: 'desc' } });
        res.json(reports);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:patientId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const reports = await prisma.report.findMany({ where: { patientId: req.params.patientId }, orderBy: { uploadedAt: 'desc' } });
        res.json(reports);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
