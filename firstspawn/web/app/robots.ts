import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // 1. Check if we are in production.
  // You don't want Google indexing your "vercel-app-r43.app" preview URLs.
  const isProduction = process.env.VERCEL_ENV === 'production'; 
  
  // Or use your own env variable: process.env.NEXT_PUBLIC_SITE_URL === 'https://yourdomain.com'

  if (!isProduction) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/', // Block EVERYTHING if not production
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 2. Block the parts of the app that are behind login or still broken
      disallow: [
        '/dashboard/', 
        '/admin/', 
        '/account/', 
        '/api/',      // Don't waste crawl budget on backend API routes
        '/private/',
      ],
    },
    // 3. Point to your sitemap (Crucial)
    sitemap: 'https://firstspawn.com/sitemap.xml',
  };
}