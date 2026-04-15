// API client pro komunikaci s backendem

export const API_URL = typeof window === 'undefined' 
  ? (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  images?: string[];
  status: 'draft' | 'published';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  location: string;
  startDate: string;
  endDate: string;
  coverImage: string | null;
  specialStatus: 'cancelled' | 'postponed' | null;
  eventType: 'launch' | 'test' | 'recruitment' | 'pr' | 'event';
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EventDisplayStatus = 'upcoming' | 'ongoing' | 'past' | 'cancelled' | 'postponed';

/**
 * Compute the display status of an event from its dates and optional special status override.
 */
export function getEventDisplayStatus(event: { startDate: string; endDate: string; specialStatus?: string | null }): EventDisplayStatus {
  if (event.specialStatus === 'cancelled') return 'cancelled';
  if (event.specialStatus === 'postponed') return 'postponed';

  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'ongoing';
  return 'past';
}

export interface Member {
  id: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  tags: string[];
  bio: string | null;
  avatar: string | null;
  linkedIn: string | null;
  github: string | null;
  active: boolean;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  status: 'planning' | 'development' | 'testing' | 'completed';
  startDate: string | null;
  completionDate: string | null;
  coverImage: string | null;
  images: string[];
  isFeatured: boolean;
  published: boolean;
  specs: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

// Články
export async function getArticles(params?: {
  status?: 'draft' | 'published';
  limit?: number;
}): Promise<Article[]> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const url = `${API_URL}/api/articles${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  
  if (!res.ok) {
    throw new Error('Failed to fetch articles');
  }

  const data = await res.json();
  return data.articles || [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const res = await fetch(`${API_URL}/api/articles/slug/${slug}`, {
    next: { revalidate: 60 }
  });
  
  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.article || null;
}

// Události
export async function getEvents(params?: {
  limit?: number;
}): Promise<Event[]> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const url = `${API_URL}/api/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  
  if (!res.ok) {
    throw new Error('Failed to fetch events');
  }

  const data = await res.json();
  return data.events || [];
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const res = await fetch(`${API_URL}/api/events/slug/${slug}`, {
    next: { revalidate: 60 }
  });
  
  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.event || null;
}

// Členové
export async function getMembers(params?: {
  active?: boolean;
  limit?: number;
  tag?: string;
}): Promise<Member[]> {
  const queryParams = new URLSearchParams();
  if (params?.active !== undefined) queryParams.append('active', params.active.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.tag) queryParams.append('tag', params.tag);

  const url = `${API_URL}/api/members${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error('Failed to fetch members');
  }

  const data = await res.json();
  return data.members || [];
}

// Projekty
export async function getProjects(params?: {
  status?: 'planning' | 'development' | 'testing' | 'completed';
  limit?: number;
}): Promise<Project[]> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const url = `${API_URL}/api/projects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  
  if (!res.ok) {
    throw new Error('Failed to fetch projects');
  }

  const data = await res.json();
  return data.projects || [];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const res = await fetch(`${API_URL}/api/projects/slug/${slug}`, {
    next: { revalidate: 60 }
  });
  
  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.project || null;
}
