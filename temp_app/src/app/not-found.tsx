
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <h2 className="text-4xl font-bold">404</h2>
            <p className="text-xl font-medium">Page Not Found</p>
            <p className="text-muted-foreground">
                Could not find the requested resource.
            </p>
            <Link href="/">
                <Button>Return Home</Button>
            </Link>
        </div>
    );
}
