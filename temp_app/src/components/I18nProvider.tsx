"use client"

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, useEffect, useState } from 'react';

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState('en');
    const [messages, setMessages] = useState<any>(null);

    useEffect(() => {
        // Get locale from localStorage or default to 'en'
        const savedLocale = localStorage.getItem('locale') || 'en';
        setLocale(savedLocale);

        // Load messages for the locale
        import(`../../messages/${savedLocale}.json`)
            .then((msgs) => setMessages(msgs.default))
            .catch(() => {
                // Fallback to English if locale file not found
                import(`../../messages/en.json`).then((msgs) => setMessages(msgs.default));
            });
    }, []);

    // Listen for locale changes
    useEffect(() => {
        const handleLocaleChange = (e: CustomEvent) => {
            const newLocale = e.detail.locale;
            setLocale(newLocale);
            localStorage.setItem('locale', newLocale);

            import(`../../messages/${newLocale}.json`)
                .then((msgs) => setMessages(msgs.default))
                .catch(() => {
                    import(`../../messages/en.json`).then((msgs) => setMessages(msgs.default));
                });
        };

        window.addEventListener('localeChange' as any, handleLocaleChange);
        return () => window.removeEventListener('localeChange' as any, handleLocaleChange);
    }, []);

    if (!messages) {
        return null;
    }

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
