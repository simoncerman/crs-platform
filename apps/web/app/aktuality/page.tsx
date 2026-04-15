import { getArticles, API_URL } from '@/lib/api';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import Link from 'next/link';
import { AktualityClient } from './AktualityClient';
import { PageTransition } from '../components/PageTransition';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Aktuality | Czech Rocket Society',
  description: 'Nejnovější zprávy a aktuality z Czech Rocket Society',
};

export default async function AktualityPage() {
  const articles = await getArticles({ status: 'published' });

  const serialized = articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImage: article.coverImage,
    publishedAt: article.publishedAt
      ? format(new Date(article.publishedAt), 'd. MMMM yyyy', { locale: cs })
      : format(new Date(article.createdAt), 'd. MMMM yyyy', { locale: cs }),
  }));

  return <PageTransition><AktualityClient articles={serialized} apiUrl={API_URL} /></PageTransition>;
}
