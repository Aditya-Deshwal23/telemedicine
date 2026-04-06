'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, ArrowRight, X, Sparkles, Loader2, Thermometer } from 'lucide-react';
import { aiAPI } from '@/lib/api';

export default function SymptomChecker() {
    const [symptomInput, setSymptomInput] = useState('');
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const addSymptom = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
            setSymptoms([...symptoms, symptomInput.trim()]);
            setSymptomInput('');
        }
    };

    const removeSymptom = (sym: string) => {
        setSymptoms(symptoms.filter(s => s !== sym));
    };

    const analyzeSymptoms = async () => {
        if (symptoms.length === 0) return;
        setLoading(true);
        try {
            const { data } = await aiAPI.checkSymptoms(symptoms);
            setResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
            <div className="max-w-3xl w-full">
                {/* Header content */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-4">
                        <Brain className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Symptom Checker</h1>
                    <p className="text-gray-600">Enter how you're feeling and our AI will recommend the right specialist.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-t-4 border-t-purple-500 shadow-md">
                        <CardHeader><CardTitle className="text-lg">What are your symptoms?</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={addSymptom} className="flex gap-2 mb-4">
                                <Input
                                    placeholder="e.g. Fever, Headache, Nausea"
                                    value={symptomInput}
                                    onChange={(e) => setSymptomInput(e.target.value)}
                                />
                                <Button type="button" onClick={addSymptom} variant="secondary">Add</Button>
                            </form>

                            <div className="flex flex-wrap gap-2 mb-6 min-h-[100px] p-4 bg-gray-50 border rounded-md">
                                {symptoms.length === 0 ? (
                                    <p className="text-sm text-gray-400 m-auto text-center">Type a symptom above and click Add</p>
                                ) : (
                                    symptoms.map(sym => (
                                        <Badge key={sym} variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-1 bg-white border shadow-sm">
                                            <Thermometer className="w-3 h-3 text-purple-500" /> {sym}
                                            <button onClick={() => removeSymptom(sym)} className="ml-1 hover:text-red-500 rounded-full hover:bg-gray-100 p-0.5"><X className="w-3 h-3" /></button>
                                        </Badge>
                                    ))
                                )}
                            </div>

                            <Button
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={analyzeSymptoms}
                                disabled={symptoms.length === 0 || loading}
                            >
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                Analyze Symptoms
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className={`transition-all duration-500 ${result ? 'opacity-100 translate-x-0 border-t-4 border-t-teal-500 shadow-md' : 'opacity-50 blur-[2px] pointer-events-none border-t-4 border-t-gray-300'}`}>
                        <CardHeader><CardTitle className="text-lg">AI Recommendation</CardTitle></CardHeader>
                        <CardContent>
                            {result ? (
                                <div className="space-y-6">
                                    {result.recommendations.map((rec: any, i: number) => (
                                        <div key={i} className={`p-4 rounded-lg border ${i === 0 ? 'bg-teal-50 border-teal-200' : 'bg-white'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className={`font-bold text-lg ${i === 0 ? 'text-teal-800' : 'text-gray-900'}`}>{rec.specialization}</h3>
                                                <Badge variant={i === 0 ? 'default' : 'secondary'} className={i === 0 ? 'bg-teal-600' : ''}>
                                                    {Math.round(rec.confidence)}% Match
                                                </Badge>
                                            </div>
                                            {rec.matchedSymptoms.length > 0 && (
                                                <p className="text-xs text-gray-600">
                                                    <strong>Matched:</strong> {rec.matchedSymptoms.join(', ')}
                                                </p>
                                            )}
                                            {i === 0 && (
                                                <Link href={`/doctors?specialization=${encodeURIComponent(rec.specialization)}`} className="block mt-4">
                                                    <Button className="w-full gradient-primary text-white shadow-sm">
                                                        Find a {rec.specialization} <ArrowRight className="w-4 h-4 ml-2" />
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                    <div className="text-xs text-gray-500 text-center flex items-start gap-2 bg-yellow-50 p-2 rounded border border-yellow-100">
                                        <span className="text-yellow-600 font-bold">Disclaimer:</span> {result.disclaimer}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-gray-400 text-center">
                                    <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                                    <p>Add symptoms and click Analyze to get AI recommendations</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
