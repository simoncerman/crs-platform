import { Suspense } from 'react';
import MemberForm from '@/components/admin/MemberForm';

export default function NewMemberPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="text-stellar-white text-xl">Načítání...</div></div>}>
      <MemberForm mode="create" />
    </Suspense>
  );
}
