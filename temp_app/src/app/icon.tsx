import { ImageResponse } from 'next/og'

export const size = {
    width: 32,
    height: 32,
}

export const contentType = 'image/png'

export default async function Icon() {
    // Return the Nalan logo
    return new Response(
        await fetch(new URL('/naalan-logo.png', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000')).then(res => res.arrayBuffer()),
        {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=0, must-revalidate',
            },
        }
    )
}
