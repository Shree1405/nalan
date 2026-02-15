export default function AppleIcon() {
    return new Response(null, {
        status: 302,
        headers: {
            Location: '/logo.png',
        },
    });
}
