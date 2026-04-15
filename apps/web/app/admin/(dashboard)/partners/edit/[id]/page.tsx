import PartnerForm from '@/components/admin/PartnerForm';

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PartnerForm mode="edit" partnerId={id} />;
}
