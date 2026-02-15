import { useState, useRef, useEffect } from "react";
import { searchSymptoms, Symptom } from "@/lib/triage/engine";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SymptomAutocompleteProps {
    onSymptomSelect: (symptoms: string[]) => void;
    selectedSymptoms: string[];
}

export default function SymptomAutocomplete({ onSymptomSelect, selectedSymptoms }: SymptomAutocompleteProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Symptom[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.length > 1) {
            const results = searchSymptoms(query);
            setSuggestions(results.slice(0, 5));
            setShowSuggestions(results.length > 0);
        } else {
            setShowSuggestions(false);
        }
    }, [query]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const addSymptom = (symptom: string) => {
        if (!selectedSymptoms.includes(symptom)) {
            onSymptomSelect([...selectedSymptoms, symptom]);
        }
        setQuery("");
        setShowSuggestions(false);
    };

    const removeSymptom = (symptom: string) => {
        onSymptomSelect(selectedSymptoms.filter((s) => s !== symptom));
    };

    return (
        <div className="space-y-3" ref={containerRef}>
            <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((symptom) => (
                    <Badge key={symptom} variant="secondary" className="pl-2 pr-1 py-1 gap-1">
                        {symptom}
                        <button onClick={() => removeSymptom(symptom)} className="hover:bg-slate-200 rounded-full p-0.5">
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>

            <div className="relative">
                <input
                    type="text"
                    placeholder="Type a symptom (e.g., headache, fever)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />

                {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                        {suggestions.map((s) => (
                            <button
                                key={s.name}
                                onClick={() => addSymptom(s.name)}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                            >
                                <div className="font-semibold text-slate-900 text-sm">{s.name}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                                    <span className={`px-1.5 py-0.5 rounded text-white font-bold ${s.riskLevel === 'high' ? 'bg-red-500' : s.riskLevel === 'moderate' ? 'bg-amber-500' : 'bg-green-500'
                                        }`}>
                                        {s.riskLevel.toUpperCase()}
                                    </span>
                                    {s.description}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
