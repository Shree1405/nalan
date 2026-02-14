import { usePatients } from "@/hooks/use-patients";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { format } from "date-fns";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Patients() {
  const { data: patients, isLoading } = usePatients();
  const [search, setSearch] = useState("");

  const filteredPatients = patients?.filter(p => 
    p.id.toString().includes(search) || 
    p.symptoms.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Patient Registry</h1>
          <p className="text-muted-foreground mt-1">History of all assessed patients and their triage data.</p>
        </div>
        <Link href="/triage">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Triage New Patient
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="px-6 py-4 border-b bg-slate-50/50">
          <div className="flex items-center gap-2 w-full max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by ID or symptoms..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Demographics</TableHead>
                <TableHead>Vitals (HR / BP / Temp)</TableHead>
                <TableHead>Symptoms</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1,2,3,4,5].map(i => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredPatients?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No patients found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients?.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-900">#{patient.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{patient.age} yrs</div>
                      <div className="text-xs text-muted-foreground">{patient.gender}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-semibold text-rose-600">{patient.heartRate} bpm</span>
                        <span className="mx-2 text-slate-300">|</span>
                        <span className="text-slate-700">{patient.systolic}/{patient.diastolic}</span>
                        <span className="mx-2 text-slate-300">|</span>
                        <span className="text-orange-600">{patient.temperature}°C</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {patient.symptoms.slice(0, 3).map((s, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                            {s}
                          </span>
                        ))}
                        {patient.symptoms.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                            +{patient.symptoms.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {patient.createdAt ? format(new Date(patient.createdAt), 'MMM d, h:mm a') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Details</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
