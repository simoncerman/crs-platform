import MemberForm from '@/components/admin/MemberForm';

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MemberForm mode="edit" memberId={id} />;
}
