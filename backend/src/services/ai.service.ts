export class AIService {
    private static symptomSpecializationMap: Record<string, string[]> = {
        'General Physician': ['fever', 'cold', 'cough', 'headache', 'fatigue', 'body pain', 'weakness', 'nausea', 'vomiting', 'diarrhea', 'weight loss', 'weight gain'],
        'Cardiologist': ['chest pain', 'heart palpitations', 'shortness of breath', 'high blood pressure', 'dizziness', 'swollen legs', 'irregular heartbeat'],
        'Dermatologist': ['rash', 'acne', 'skin irritation', 'itching', 'hair loss', 'eczema', 'psoriasis', 'skin discoloration', 'moles', 'dry skin'],
        'Orthopedic': ['joint pain', 'back pain', 'knee pain', 'fracture', 'muscle pain', 'arthritis', 'neck pain', 'shoulder pain', 'sports injury'],
        'Neurologist': ['migraine', 'seizures', 'numbness', 'memory loss', 'tremors', 'paralysis', 'nerve pain', 'tingling', 'vertigo'],
        'Psychiatrist': ['anxiety', 'depression', 'insomnia', 'stress', 'panic attacks', 'mood swings', 'addiction', 'ptsd', 'ocd'],
        'ENT Specialist': ['ear pain', 'hearing loss', 'sore throat', 'tonsillitis', 'sinus', 'nasal congestion', 'snoring', 'nosebleed'],
        'Gynecologist': ['irregular periods', 'pregnancy', 'pelvic pain', 'menstrual pain', 'pcos', 'fertility issues', 'breast pain'],
        'Pediatrician': ['child fever', 'growth issues', 'vaccination', 'child rash', 'developmental delay', 'childhood infections'],
        'Ophthalmologist': ['eye pain', 'blurred vision', 'red eye', 'dry eyes', 'vision loss', 'eye infection', 'watery eyes'],
        'Gastroenterologist': ['stomach pain', 'acid reflux', 'bloating', 'constipation', 'liver pain', 'jaundice', 'ulcer', 'ibs'],
        'Pulmonologist': ['asthma', 'breathing difficulty', 'chronic cough', 'wheezing', 'sleep apnea', 'pneumonia', 'bronchitis'],
        'Endocrinologist': ['diabetes', 'thyroid', 'hormonal imbalance', 'pcos', 'obesity', 'calcium deficiency'],
        'Urologist': ['urinary infection', 'kidney stone', 'blood in urine', 'frequent urination', 'prostate issues'],
        'Dentist': ['toothache', 'gum bleeding', 'cavity', 'jaw pain', 'bad breath', 'mouth ulcer', 'teeth sensitivity'],
    };

    static checkSymptoms(symptoms: string[]) {
        const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim());
        const scores: Record<string, { score: number; matchedSymptoms: string[] }> = {};

        for (const [specialization, keywords] of Object.entries(this.symptomSpecializationMap)) {
            const matched: string[] = [];
            for (const symptom of normalizedSymptoms) {
                for (const keyword of keywords) {
                    if (symptom.includes(keyword) || keyword.includes(symptom)) {
                        matched.push(keyword);
                    }
                }
            }
            if (matched.length > 0) {
                scores[specialization] = { score: matched.length, matchedSymptoms: [...new Set(matched)] };
            }
        }

        const sorted = Object.entries(scores)
            .sort(([, a], [, b]) => b.score - a.score)
            .map(([specialization, data]) => ({
                specialization,
                confidence: Math.min(data.score / normalizedSymptoms.length, 1) * 100,
                matchedSymptoms: data.matchedSymptoms,
            }));

        if (sorted.length === 0) {
            return {
                recommendations: [{ specialization: 'General Physician', confidence: 50, matchedSymptoms: [] }],
                disclaimer: 'This is an AI-powered suggestion. Please consult a qualified doctor for accurate diagnosis.',
            };
        }

        return {
            recommendations: sorted.slice(0, 3),
            disclaimer: 'This is an AI-powered suggestion. Please consult a qualified doctor for accurate diagnosis.',
        };
    }

    static analyzeReport(reportText: string) {
        const parameters: Record<string, { value: string; normal: string; status: string; explanation: string }> = {};
        const lines = reportText.split('\n');

        const commonParams: Record<string, { min: number; max: number; unit: string; explanation: string }> = {
            'hemoglobin': { min: 12, max: 17, unit: 'g/dL', explanation: 'Hemoglobin carries oxygen in your blood. Low levels may indicate anemia.' },
            'wbc': { min: 4000, max: 11000, unit: '/mcL', explanation: 'White blood cells fight infection. High counts may indicate infection or inflammation.' },
            'rbc': { min: 4.2, max: 6.1, unit: 'million/mcL', explanation: 'Red blood cells carry oxygen. Low counts may indicate anemia.' },
            'platelet': { min: 150000, max: 400000, unit: '/mcL', explanation: 'Platelets help blood clotting. Low counts may cause bleeding issues.' },
            'glucose': { min: 70, max: 100, unit: 'mg/dL', explanation: 'Blood sugar level. High values may indicate diabetes.' },
            'cholesterol': { min: 0, max: 200, unit: 'mg/dL', explanation: 'Total cholesterol. High levels increase heart disease risk.' },
            'creatinine': { min: 0.6, max: 1.2, unit: 'mg/dL', explanation: 'Measures kidney function. High values may indicate kidney problems.' },
            'thyroid': { min: 0.4, max: 4.0, unit: 'mIU/L', explanation: 'TSH level. Abnormal values indicate thyroid disorders.' },
        };

        for (const line of lines) {
            for (const [param, range] of Object.entries(commonParams)) {
                if (line.toLowerCase().includes(param)) {
                    const numMatch = line.match(/[\d.]+/);
                    if (numMatch) {
                        const value = parseFloat(numMatch[0]);
                        let status = 'Normal';
                        if (value < range.min) status = 'Low';
                        else if (value > range.max) status = 'High';

                        parameters[param] = {
                            value: `${value} ${range.unit}`,
                            normal: `${range.min} - ${range.max} ${range.unit}`,
                            status,
                            explanation: range.explanation,
                        };
                    }
                }
            }
        }

        return {
            parameters,
            summary: Object.keys(parameters).length > 0
                ? 'Report analysis complete. Please review the findings with your doctor.'
                : 'Could not extract specific parameters. Please upload a clearer report or consult your doctor.',
            disclaimer: 'This AI analysis is for informational purposes only. Always consult a qualified healthcare professional.',
        };
    }

    static generatePrescription(notes: string) {
        const lines = notes.split('\n').filter(l => l.trim());
        const medications: any[] = [];
        const diagnosis: string[] = [];
        const instructions: string[] = [];

        for (const line of lines) {
            const lower = line.toLowerCase().trim();
            if (lower.startsWith('rx:') || lower.startsWith('med:') || lower.startsWith('tab:') || lower.startsWith('cap:')) {
                medications.push({ name: line.replace(/^(rx:|med:|tab:|cap:)\s*/i, '').trim(), dosage: '', frequency: '', duration: '' });
            } else if (lower.startsWith('dx:') || lower.startsWith('diagnosis:')) {
                diagnosis.push(line.replace(/^(dx:|diagnosis:)\s*/i, '').trim());
            } else if (lower.startsWith('note:') || lower.startsWith('advice:') || lower.startsWith('instruction:')) {
                instructions.push(line.replace(/^(note:|advice:|instruction:)\s*/i, '').trim());
            } else if (medications.length > 0 && (lower.includes('mg') || lower.includes('ml') || lower.includes('daily') || lower.includes('twice') || lower.includes('thrice'))) {
                const lastMed = medications[medications.length - 1];
                if (!lastMed.dosage) lastMed.dosage = line.trim();
                else if (!lastMed.frequency) lastMed.frequency = line.trim();
            } else {
                diagnosis.push(line.trim());
            }
        }

        return {
            diagnosis: diagnosis.join(', '),
            medications,
            instructions: instructions.join('. '),
            generatedAt: new Date().toISOString(),
        };
    }
}
