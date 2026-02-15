"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity, Stethoscope, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations('homepage');

  // Redirect based on role
  if (session?.user) {
    if (session.user.role === "PATIENT") {
      router.push("/patient");
      return null;
    }
    if (session.user.role === "DOCTOR") {
      router.push("/doctor");
      return null;
    }
    if (session.user.role === "ADMIN") {
      router.push("/admin");
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 flex flex-col">
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Image src="/naalan-logo.png" alt="Nalan" width={40} height={40} className="object-contain" />
          <span>Nalan</span>
        </div>
        <LanguageSwitcher />
      </header>

      <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center space-y-8">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            {t('title')} <span className="text-primary">{t('titleHighlight')}</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-12">

          {/* Patient Card */}
          <Card className="hover:shadow-lg transition-shadow border-primary/20">
            <CardHeader>
              <Activity className="h-10 w-10 text-primary mb-2" />
              <CardTitle>{t('patientCard.title')}</CardTitle>
              <CardDescription>{t('patientCard.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href="/patient">{t('patientCard.button')}</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Doctor Card */}
          <Card className="hover:shadow-lg transition-shadow border-blue-500/20">
            <CardHeader>
              <Stethoscope className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>{t('doctorCard.title')}</CardTitle>
              <CardDescription>{t('doctorCard.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/doctor">{t('doctorCard.button')}</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Admin Card */}
          <Card className="hover:shadow-lg transition-shadow border-slate-500/20">
            <CardHeader>
              <ShieldAlert className="h-10 w-10 text-slate-600 mb-2" />
              <CardTitle>{t('adminCard.title')}</CardTitle>
              <CardDescription>{t('adminCard.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="secondary" size="lg">
                <Link href="/admin">{t('adminCard.button')}</Link>
              </Button>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  )
}
