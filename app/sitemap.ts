import { MetadataRoute } from 'next';
import { i18n } from '../lib/i18n-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://firstspawn.com';

    const staticRoutes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1.0,
        },
        // Locale specific routes
        ...i18n.locales.map(locale => ({
            url: `${baseUrl}/${locale}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1.0,
        })),
        ...i18n.locales.map(locale => ({
            url: `${baseUrl}/${locale}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        })),
    ];

    return staticRoutes;
}