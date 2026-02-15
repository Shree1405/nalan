"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"
import { triggerSOS } from "@/app/actions/sos"
import { toast } from "@/components/ui/use-toast"

export function SOSButton() {
    const [isLoading, setIsLoading] = useState(false)

    async function handleSOS() {
        // Confirmation dialog
        if (!confirm("Are you sure you want to send an emergency SOS?")) return

        setIsLoading(true)

        // Get location if possible (optional)
        let latitude, longitude
        if ("geolocation" in navigator) {
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                })
                latitude = position.coords.latitude
                longitude = position.coords.longitude
            } catch (e) {
                console.log("Location access denied or timed out")
            }
        }

        const result = await triggerSOS(latitude, longitude)

        if (result.success) {
            toast({
                title: "SOS Sent!",
                description: result.message,
                variant: "destructive",
            })
        } else {
            toast({
                title: "Error",
                description: result.message,
                variant: "destructive",
            })
        }

        setIsLoading(false)
    }

    return (
        <Button
            variant="destructive"
            size="lg"
            className="w-full h-24 text-2xl font-bold animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.7)] hover:shadow-[0_0_25px_rgba(239,68,68,1)] border-4 border-red-600"
            onClick={handleSOS}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            ) : (
                <AlertCircle className="mr-2 h-8 w-8" />
            )}
            EMERGENCY SOS
        </Button>
    )
}
