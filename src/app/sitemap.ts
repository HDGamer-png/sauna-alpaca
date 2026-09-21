import type { MetadataRoute } from 'next';
import { RESEARCH_DATA } from '@/fe/data/research';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://saunaalpaca.vercel.app';
  const now = new Date();

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/san-pham`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/san-pham/mua`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/san-pham/thue`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/san-pham/so-sanh`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/nghien-cuu`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/lien-he`, lastModified: now, changeFrequency: 'yearly', priority: 0.8 },
    { url: `${baseUrl}/cau-hoi-thuong-gap`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/chinh-sach-bao-mat`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/dieu-khoan`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/mien-tru-y-te`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/van-chuyen-bao-hanh`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
  ];

  // Dynamic research articles
  const researchRoutes: MetadataRoute.Sitemap = RESEARCH_DATA.map((article) => ({
    url: `${baseUrl}/nghien-cuu/${article.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...researchRoutes];
}
