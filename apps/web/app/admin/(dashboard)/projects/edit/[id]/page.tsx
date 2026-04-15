'use client';

import { use } from 'react';
import ProjectForm from '@/components/admin/ProjectForm';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = use(params);
  
  return <ProjectForm mode="edit" projectId={id} />;
}
