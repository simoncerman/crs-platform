import Link from 'next/link';
import { PartneriClient } from './PartneriClient';
import { PageTransition } from '../components/PageTransition';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Partneři | Czech Rocket Society',
  description: 'Naši partneři, kteří podporují rozvoj české raketové techniky a kosmonautiky.',
};

interface Partner {
  id: string;
  name: string;
  tier: 'diamond' | 'gold' | 'silver';
  logo: string | null;
  description: string | null;
  fullDescription: string | null;
  heroImage: string | null;
  website: string | null;
  order: number;
  published: boolean;
}

async function getPartners() {
  try {
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/partners`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch partners');
    return await response.json();
  } catch (error) {
    console.error('Error fetching partners:', error);
    return { diamond: [], gold: [], silver: [] };
  }
}

export default async function PartnersPage() {
  const partners = await getPartners();
  return <PageTransition><PartneriClient partners={partners} /></PageTransition>;
}
