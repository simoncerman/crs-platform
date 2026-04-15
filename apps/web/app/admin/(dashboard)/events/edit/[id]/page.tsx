'use client';

import { use } from 'react';
import EventForm from '@/components/admin/EventForm';

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const { id } = use(params);
  
  return <EventForm mode="edit" eventId={id} />;
}
