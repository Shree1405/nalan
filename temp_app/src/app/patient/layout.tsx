import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { Chatbot } from "@/components/Chatbot"
import { LogoutButton } from "@/components/LogoutButton"
import Image from "next/image"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/patient" className="flex items-center gap-2 font-semibold">
                        <Image src="/naalan-logo.png" alt="Nalan" width={32} height={32} className="object-contain" />
                        <span>Nalan Triage</span>
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link href="/patient" className="text-sm font-medium hover:underline">
                            Dashboard
                        </Link>
                        <Link href="/history" className="text-sm font-medium hover:underline">
                            History
                        </Link>
                        <Link href="/profile">
                            <Button variant="ghost" size="sm">
                                <User className="h-4 w-4 mr-2" />
                                Profile
                            </Button>
                        </Link>
                        <LanguageSwitcher />
                        <LogoutButton />
                    </nav>
                </div>
            </header>
            <main className="flex-1 container mx-auto px-4 py-8">
                {children}
            </main>
            <Chatbot />
        </div>
    )
}
