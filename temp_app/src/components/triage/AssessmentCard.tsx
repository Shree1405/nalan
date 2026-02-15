import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface AssessmentCardProps {
    data: any;
    isAlert?: boolean;
}

export default function AssessmentCard({ data, isAlert = false }: AssessmentCardProps) {
    const { risk, diseases, guidance, confidence, symptom_analysis, disease_probability } = data;

    // Detailed AI Analysis (High Risk)
    if (symptom_analysis && disease_probability) {
        return (
            <div className="space-y-4 w-full">
                <div className="flex items-center gap-2 text-red-600 font-bold text-lg border-b border-red-100 pb-2">
                    <AlertTriangle className="h-6 w-6" />
                    High Risk Analysis
                </div>

                {/* Disease Probability */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <h3 className="font-bold text-red-800 text-lg">{disease_probability.name}</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-bold text-red-600">{disease_probability.probability}</span>
                        <span className="text-sm text-red-400">Probability</span>
                    </div>
                    {disease_probability.description && (
                        <p className="text-sm text-red-700 mt-2">{disease_probability.description}</p>
                    )}
                </div>

                {/* Symptom Breakdown Table */}
                <div className="overflow-x-auto">
                    <h4 className="font-semibold text-slate-700 mb-2 text-sm uppercase tracking-wider">Symptom Analysis</h4>
                    <div className="border rounded-lg overflow-hidden text-sm min-w-[300px]">
                        <div className="grid grid-cols-4 bg-slate-100 p-2 font-medium text-slate-600">
                            <div className="col-span-1 text-xs">Symptom</div>
                            <div className="text-center text-xs">Sev.</div>
                            <div className="text-center text-xs">Risk</div>
                            <div className="text-center text-xs">Pri.</div>
                        </div>
                        {symptom_analysis.map((s: any, i: number) => (
                            <div key={i} className="grid grid-cols-4 p-2 border-t border-slate-100 items-center">
                                <div className="col-span-1 font-medium truncate">{s.symptom}</div>
                                <div className="text-center">{s.severity}/10</div>
                                <div className={`text-center font-bold ${s.risk === 'High' ? 'text-red-600' : 'text-slate-600'}`}>{s.risk}</div>
                                <div className="text-center text-[10px] px-1 py-0.5 bg-slate-50 rounded border truncate">{s.priority}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Guidance */}
                {guidance && (
                    <div className="grid grid-cols-1 gap-3 mt-4">
                        <div className="bg-green-50 p-3 rounded border border-green-100">
                            <p className="font-bold text-green-800 mb-2 text-xs uppercase">To Do</p>
                            <ul className="list-disc pl-4 text-sm text-green-700 space-y-1">
                                {guidance.dos?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                        <div className="bg-red-50 p-3 rounded border border-red-100">
                            <p className="font-bold text-red-800 mb-2 text-xs uppercase">Avoid</p>
                            <ul className="list-disc pl-4 text-sm text-red-700 space-y-1">
                                {guidance.donts?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                        {guidance.remedies?.length > 0 && (
                            <div className="bg-blue-50 p-3 rounded border border-blue-100">
                                <p className="font-bold text-blue-800 mb-2 text-xs uppercase">Remedies</p>
                                <ul className="list-disc pl-4 text-sm text-blue-700 space-y-1">
                                    {guidance.remedies.map((item: string, i: number) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (isAlert) {
        return (
            <div className="space-y-3 p-1">
                <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
                    <AlertTriangle className="h-6 w-6" />
                    High Risk Detected
                </div>
                <p className="text-slate-700 text-sm">Your symptoms suggest a potential medical emergency or serious condition.</p>
            </div>
        );
    }

    const riskColor = risk === "high" ? "text-red-600" : risk === "moderate" ? "text-amber-600" : "text-green-600";
    const RiskIcon = risk === "high" ? AlertTriangle : risk === "moderate" ? Info : CheckCircle;

    return (
        <div className="space-y-4 min-w-[240px]">
            {/* Risk Level */}
            <div className="flex items-center gap-2 border-b pb-2">
                <RiskIcon className={`h-5 w-5 ${riskColor}`} />
                <span className={`font-bold capitalize ${riskColor}`}>{risk} Risk</span>
                <span className="text-[10px] text-slate-400 ml-auto">{confidence}% Conf.</span>
            </div>

            {/* Conditions */}
            {diseases && diseases.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Probable Conditions</p>
                    <div className="flex flex-wrap gap-1.5">
                        {diseases.map((d: any, i: number) => (
                            <div key={i} className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-700 font-medium border border-slate-200">
                                {d.name} <span className="text-[10px] text-slate-400">({d.likelihood})</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Guidance */}
            {guidance && (
                <div className="grid grid-cols-1 gap-2">
                    <div className="bg-green-50 p-2 rounded border border-green-100">
                        <p className="text-[10px] font-bold text-green-700 mb-1 uppercase">To Do</p>
                        <ul className="list-disc pl-4 text-xs text-green-800 space-y-0.5">
                            {guidance.dos?.slice(0, 3).map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <div className="bg-red-50 p-2 rounded border border-red-100">
                        <p className="text-[10px] font-bold text-red-700 mb-1 uppercase">Avoid</p>
                        <ul className="list-disc pl-4 text-xs text-red-800 space-y-0.5">
                            {guidance.donts?.slice(0, 3).map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    {guidance.remedies?.length > 0 && (
                        <div className="bg-blue-50 p-2 rounded border border-blue-100">
                            <p className="text-[10px] font-bold text-blue-700 mb-1 uppercase">Remedies</p>
                            <ul className="list-disc pl-4 text-xs text-blue-800 space-y-0.5">
                                {guidance.remedies.slice(0, 3).map((item: string, i: number) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
