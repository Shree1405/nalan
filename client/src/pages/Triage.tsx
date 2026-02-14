import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPatientSchema } from "@shared/schema";
import { useTriageAssess, useEmergencyOverride } from "@/hooks/use-triage";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Activity, AlertOctagon, ArrowRight, BrainCircuit, HeartPulse, Thermometer } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// We need to extend/transform the schema slightly for the form UI (handling arrays as strings initially if needed, but react-hook-form can handle arrays)
const formSchema = insertPatientSchema.extend({
  symptoms: z.string().min(1, "Please enter at least one symptom"), // Treat as comma separated string for simple input
  conditions: z.string(), // Treat as comma separated string
});

type FormValues = z.infer<typeof formSchema>;

export default function Triage() {
  const assessMutation = useTriageAssess();
  const emergencyMutation = useEmergencyOverride();
  const [assessmentResult, setAssessmentResult] = useState<any | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 0,
      gender: "Male",
      systolic: 120,
      diastolic: 80,
      heartRate: 75,
      temperature: 37.0,
      symptoms: "",
      conditions: "",
    },
  });

  function onSubmit(values: FormValues) {
    // Transform comma-separated strings back to arrays
    const payload = {
      ...values,
      symptoms: values.symptoms.split(',').map(s => s.trim()).filter(Boolean),
      conditions: values.conditions.split(',').map(c => c.trim()).filter(Boolean),
    };

    assessMutation.mutate(payload, {
      onSuccess: (data) => {
        setAssessmentResult(data);
      },
    });
  }

  const handleEmergency = () => {
    emergencyMutation.mutate();
  };

  const resetTriage = () => {
    setAssessmentResult(null);
    form.reset();
  };

  if (assessmentResult) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-white p-4 rounded-full shadow-lg border-4 border-primary/10">
            <BrainCircuit className="w-12 h-12 text-primary" />
          </div>
        </div>

        <Card className="shadow-xl border-t-8 border-t-primary overflow-hidden">
          <CardHeader className="text-center pb-2">
            <h2 className="text-3xl font-display font-bold text-slate-900">Assessment Complete</h2>
            <p className="text-muted-foreground">AI Analysis Report for Patient #{assessmentResult.patientId}</p>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="flex flex-col md:flex-row justify-center items-center gap-6">
              <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100 w-full md:w-1/3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Risk Level</p>
                <RiskBadge level={assessmentResult.riskLevel} className="text-lg px-4 py-1" />
              </div>
              
              <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100 w-full md:w-1/3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Confidence</p>
                <div className="text-3xl font-bold text-slate-900">{(assessmentResult.confidenceScore * 100).toFixed(1)}%</div>
              </div>

              <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100 w-full md:w-1/3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Department</p>
                <div className="text-xl font-bold text-primary">{assessmentResult.recommendedDepartment}</div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                AI Analysis Factors
              </h3>
              <div className="grid gap-3">
                {assessmentResult.explanation.map((reason: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-slate-700">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 p-6 flex justify-between items-center">
            <Button variant="outline" onClick={resetTriage}>Start New Triage</Button>
            <Button onClick={() => window.print()}>Print Report</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Patient Triage</h1>
          <p className="text-muted-foreground mt-1">Enter patient vitals and symptoms for AI assessment.</p>
        </div>
        <Button 
          variant="destructive" 
          onClick={handleEmergency}
          className="shadow-lg shadow-red-500/20 hover:shadow-red-500/30 animate-pulse"
        >
          <AlertOctagon className="mr-2 h-4 w-4" />
          EMERGENCY OVERRIDE
        </Button>
      </div>

      <Card className="shadow-md border-slate-200">
        <CardContent className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Demographics Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                  Demographics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-10">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Vitals Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                  Vital Signs
                </h3>
                
                <div className="pl-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="heartRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex justify-between">
                            <span className="flex items-center gap-2"><HeartPulse className="w-4 h-4 text-rose-500" /> Heart Rate (BPM)</span>
                            <span className="font-mono font-bold text-slate-600">{field.value}</span>
                          </FormLabel>
                          <FormControl>
                            <Slider
                              min={30}
                              max={200}
                              step={1}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              className="py-4"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex justify-between">
                            <span className="flex items-center gap-2"><Thermometer className="w-4 h-4 text-orange-500" /> Temperature (°C)</span>
                            <span className="font-mono font-bold text-slate-600">{field.value}°</span>
                          </FormLabel>
                          <FormControl>
                            <Slider
                              min={35}
                              max={42}
                              step={0.1}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              className="py-4"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="systolic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Systolic (mmHg)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="pl-8" />
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">SYS</div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="diastolic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diastolic (mmHg)</FormLabel>
                          <FormControl>
                             <div className="relative">
                              <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="pl-8" />
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">DIA</div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Clinical Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span>
                  Clinical Presentation
                </h3>
                <div className="pl-10 space-y-6">
                  <FormField
                    control={form.control}
                    name="symptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Presenting Symptoms</FormLabel>
                        <FormDescription>Comma separated (e.g., chest pain, shortness of breath)</FormDescription>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter symptoms..." 
                            className="resize-none min-h-[80px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pre-existing Conditions</FormLabel>
                        <FormDescription>Known history (e.g., diabetes, hypertension)</FormDescription>
                        <FormControl>
                          <Input placeholder="Enter conditions..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full md:w-auto min-w-[200px] text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                  disabled={assessMutation.isPending}
                >
                  {assessMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Analyze Patient <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
