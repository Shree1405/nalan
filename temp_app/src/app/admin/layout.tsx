import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { LogoutButton } from "@/components/LogoutButton"
import Image from "next/image"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
            <header className="bg-slate-900 text-white border-b sticky top-0 z-10">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/admin" className="flex items-center gap-2 font-semibold text-lg">
                        <Image src="/naalan-logo.png" alt="Nalan" width={32} height={32} className="object-contain" />
                        <span>Nalan Admin</span>
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link href="/admin" className="text-sm font-medium hover:text-slate-300 transition-colors">
                            Overview
                        </Link>
                        <Link href="/admin/settings" className="text-sm font-medium hover:text-slate-300 transition-colors">
                            Settings
                        </Link>
                        <Link href="/profile">
                            <Button variant="secondary" size="sm">
                                <User className="h-4 w-4 mr-2" />
                                Profile
                            </Button>
                        </Link>
                        <LanguageSwitcher />
                        <LogoutButton />
                    </nav>
                </div>
            </header>
            <main className="flex-1 container mx-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    )
}
