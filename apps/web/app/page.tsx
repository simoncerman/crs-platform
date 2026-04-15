import { getArticles, getEvents, getProjects, getEventDisplayStatus, API_URL } from '@/lib/api';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import Link from 'next/link';
import { HeroClient } from './components/HeroClient';
import { HomePageSections } from './components/HomePageSections';
import { PageTransition } from './components/PageTransition';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [articles, events, projects] = await Promise.all([
    getArticles({ status: 'published' }),
    getEvents(),
    getProjects(),
  ]);

  const latestArticles = articles.slice(0, 3);
  const upcomingEvents = events
    .filter(e => {
      const ds = getEventDisplayStatus(e);
      return ds === 'upcoming' || ds === 'ongoing';
    })
    .slice(0, 3);
  const activeProjects = projects
    .filter(p => p.status !== 'completed')
    .slice(0, 3);

  const stats = [
    { label: 'Aktualit', value: articles.length.toString() },
    { label: 'Událostí', value: events.length.toString() },
    { label: 'Projektů', value: projects.length.toString() },
  ];

  // Serialize dates for client component
  const serializedArticles = latestArticles.map(article => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImage: article.coverImage,
    publishedAt: article.publishedAt ? format(new Date(article.publishedAt), 'd. MMMM yyyy', { locale: cs }) : null,
  }));

  const serializedEvents = upcomingEvents.map(event => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    status: getEventDisplayStatus(event),
    eventType: event.eventType,
    location: event.location,
    coverImage: event.coverImage,
    startDate: format(new Date(event.startDate), 'd. MMMM yyyy', { locale: cs }),
  }));

  const serializedProjects = activeProjects.map(project => ({
    id: project.id,
    slug: project.slug,
    name: project.name,
    description: project.description,
    category: project.category,
    coverImage: project.coverImage,
    isFeatured: project.isFeatured,
  }));

  return (
    <PageTransition className="min-h-screen bg-deep-space">
      <HeroClient stats={stats} />
      <HomePageSections
        articles={serializedArticles}
        events={serializedEvents}
        projects={serializedProjects}
        apiUrl={API_URL}
      />
    </PageTransition>
  );
}
