import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'ta', 'hi'];

export default getRequestConfig(async ({ locale }) => {
    // Use default locale if invalid locale is provided
    const validLocale = locales.includes(locale as any) ? locale : 'en';

    return {
        locale: validLocale as string,
        messages: (await import(`../../messages/${validLocale}.json`)).default
    };
});
