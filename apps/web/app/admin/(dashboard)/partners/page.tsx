'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { adminFetch } from '@/lib/admin-fetch';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Partner {
  id: string;
  name: string;
  tier: 'diamond' | 'gold' | 'silver';
  logo: string | null;
  description: string | null;
  website: string | null;
  order: number;
  published: boolean;
}

type Tier = 'diamond' | 'gold' | 'silver';

const tierConfig: { key: Tier; label: string; color: string; border: string }[] = [
  { key: 'diamond', label: 'Diamond', color: 'text-aurora-cyan', border: 'border-aurora-cyan/30' },
  { key: 'gold', label: 'Gold', color: 'text-crs-ignition', border: 'border-crs-ignition/30' },
  { key: 'silver', label: 'Silver', color: 'text-stellar-white/70', border: 'border-stellar-white/20' },
];

// ─── Sortable Row ──────────────────────────────────────────────────
function SortablePartnerRow({
  partner,
  onDelete,
  onTogglePublished,
}: {
  partner: Partner;
  onDelete: (id: string, name: string) => void;
  onTogglePublished: (p: Partner) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: partner.id,
    data: { tier: partner.tier },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-stellar-white/5 transition-colors group">
      <td className="px-3 py-3 w-10">
        <button
          type="button"
          className="p-1 rounded cursor-grab active:cursor-grabbing text-stellar-white/20 hover:text-stellar-white/50 transition-colors touch-none"
          {...attributes}
          {...listeners}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          </svg>
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {partner.logo && (
            <div className="w-9 h-9 rounded bg-stellar-white/90 p-0.5 shrink-0">
              <img src={partner.logo} alt="" className="w-full h-full object-contain" />
            </div>
          )}
          <div className="min-w-0">
            <Link
              href={`/admin/partners/edit/${partner.id}`}
              className="text-stellar-white font-medium hover:text-aurora-cyan transition-colors text-sm"
            >
              {partner.name}
            </Link>
            {partner.website && (
              <p className="text-stellar-white/30 text-xs truncate">{partner.website}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onTogglePublished(partner)}
            className={`px-2 py-1 rounded text-xs font-medium border mr-3 ${
              partner.published
                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                : 'bg-stellar-white/20 text-stellar-white/40 border-stellar-white/30'
            }`}
          >
            {partner.published ? 'Publikováno' : 'Skrytý'}
          </button>
          <Link href={`/admin/partners/edit/${partner.id}`} className="text-aurora-cyan hover:text-white transition-colors text-sm">
            Upravit
          </Link>
          <span className="text-stellar-white/20 mx-1">·</span>
          <button onClick={() => onDelete(partner.id, partner.name)} className="text-stellar-white/60 hover:text-red-400 transition-colors text-sm">
            Smazat
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Drag Overlay (the ghost that follows cursor) ───────────────
function DragOverlayRow({ partner }: { partner: Partner }) {
  return (
    <div className="bg-deep-space border border-aurora-cyan/50 rounded-lg px-4 py-3 shadow-lg shadow-aurora-cyan/10 flex items-center gap-3 w-[400px]">
      {partner.logo && (
        <div className="w-8 h-8 rounded bg-stellar-white/90 p-0.5 shrink-0">
          <img src={partner.logo} alt="" className="w-full h-full object-contain" />
        </div>
      )}
      <span className="text-stellar-white font-medium text-sm">{partner.name}</span>
      <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-medium border bg-aurora-cyan/20 text-aurora-cyan border-aurora-cyan/50 uppercase">
        {partner.tier}
      </span>
    </div>
  );
}

// ─── Tier Section (droppable) ───────────────────────────────────
function TierSection({
  tier,
  label,
  color,
  border,
  partners,
  onDelete,
  onTogglePublished,
}: {
  tier: Tier;
  label: string;
  color: string;
  border: string;
  partners: Partner[];
  onDelete: (id: string, name: string) => void;
  onTogglePublished: (p: Partner) => void;
}) {
  const { setNodeRef } = useSortable({
    id: `tier-${tier}`,
    data: { type: 'tier', tier },
    disabled: true,
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h2 className={`text-lg font-bold ${color}`}>{label}</h2>
        <span className="text-stellar-white/30 text-sm">({partners.length})</span>
        <div className={`h-px flex-1 border-t ${border}`} />
      </div>

      <div ref={setNodeRef} className="bg-deep-space/50 border border-stellar-white/10 rounded-xl overflow-hidden min-h-[52px]">
        {partners.length === 0 ? (
          <div className="px-4 py-6 text-center text-stellar-white/20 text-sm border-2 border-dashed border-stellar-white/10 rounded-xl m-1">
            Přetáhněte partnera sem
          </div>
        ) : (
          <SortableContext items={partners.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <tbody className="divide-y divide-stellar-white/10">
                {partners.map((partner) => (
                  <SortablePartnerRow
                    key={partner.id}
                    partner={partner}
                    onDelete={onDelete}
                    onTogglePublished={onTogglePublished}
                  />
                ))}
              </tbody>
            </table>
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────
export default function PartnersListPage() {
  const { data: session } = useSession();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const loadPartners = async () => {
    try {
      const headers: HeadersInit = {};
      if (session?.accessToken) headers['Authorization'] = `Bearer ${session.accessToken}`;

      const response = await fetch(`${API_URL}/api/partners`, { headers });
      if (!response.ok) throw new Error('Nepodařilo se načíst partnery');

      const data = await response.json();
      setPartners([...(data.diamond || []), ...(data.gold || []), ...(data.silver || [])]);
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) loadPartners();
  }, [session]);

  const getForTier = (tier: Tier) =>
    partners.filter(p => p.tier === tier).sort((a, b) => a.order - b.order);

  // Find which tier a partner belongs to
  const findTier = (id: string): Tier | null => {
    const p = partners.find(p => p.id === id);
    return p ? p.tier : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activePartner = partners.find(p => p.id === active.id);
    if (!activePartner) return;

    // Determine target tier
    let overTier: Tier | null = null;

    if (typeof over.id === 'string' && over.id.startsWith('tier-')) {
      overTier = over.id.replace('tier-', '') as Tier;
    } else {
      const overPartner = partners.find(p => p.id === over.id);
      if (overPartner) overTier = overPartner.tier;
    }

    if (!overTier || activePartner.tier === overTier) return;

    // Move to new tier
    setPartners(prev => {
      const updated = prev.map(p => ({ ...p }));
      const idx = updated.findIndex(p => p.id === active.id);
      if (idx === -1) return prev;

      const maxOrder = updated.filter(p => p.tier === overTier && p.id !== active.id)
        .reduce((max, p) => Math.max(max, p.order), -1);

      updated[idx].tier = overTier!;
      updated[idx].order = maxOrder + 1;
      return updated;
    });
    setHasChanges(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activePartner = partners.find(p => p.id === active.id);
    const overPartner = partners.find(p => p.id === over.id);

    if (!activePartner) return;

    // Same tier reorder
    if (overPartner && activePartner.tier === overPartner.tier) {
      const tier = activePartner.tier;
      const tierItems = getForTier(tier);
      const oldIndex = tierItems.findIndex(p => p.id === active.id);
      const newIndex = tierItems.findIndex(p => p.id === over.id);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      // Reorder
      const reordered = [...tierItems];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      setPartners(prev => {
        const updated = prev.map(p => ({ ...p }));
        reordered.forEach((item, i) => {
          const idx = updated.findIndex(u => u.id === item.id);
          if (idx !== -1) updated[idx].order = i;
        });
        return updated;
      });
      setHasChanges(true);
    }
  };

  const handleSaveOrder = async () => {
    if (!session?.accessToken) return;
    setIsSaving(true);
    try {
      const payload = partners.map(p => ({ id: p.id, tier: p.tier, order: p.order }));
      const response = await adminFetch(`${API_URL}/api/partners/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        accessToken: session.accessToken,
        body: JSON.stringify({ partners: payload }),
      });
      if (!response.ok) throw new Error('Nepodařilo se uložit pořadí');
      setHasChanges(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Opravdu chcete smazat partnera "${name}"?`)) return;
    try {
      if (!session?.accessToken) throw new Error('Nejste přihlášen');
      const response = await adminFetch(`${API_URL}/api/partners/${id}`, {
        method: 'DELETE',
        accessToken: session.accessToken,
      });
      if (!response.ok) throw new Error('Nepodařilo se smazat');
      await loadPartners();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTogglePublished = async (partner: Partner) => {
    try {
      if (!session?.accessToken) throw new Error('Nejste přihlášen');
      const response = await adminFetch(`${API_URL}/api/partners/${partner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        accessToken: session.accessToken,
        body: JSON.stringify({ published: !partner.published }),
      });
      if (!response.ok) throw new Error('Nepodařilo se aktualizovat');
      await loadPartners();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const activePartner = activeId ? partners.find(p => p.id === activeId) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-stellar-white text-xl">Načítání...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-stellar-white">Partneři</h1>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              onClick={handleSaveOrder}
              disabled={isSaving}
              className="bg-aurora-cyan hover:bg-aurora-cyan/80 text-deep-space font-bold px-5 py-3 rounded-lg transition-all disabled:opacity-50"
            >
              {isSaving ? 'Ukládání...' : 'Uložit pořadí'}
            </button>
          )}
          <Link
            href="/admin/partners/new"
            className="bg-cosmic-blue/20 hover:bg-cosmic-blue/30 text-aurora-cyan border border-cosmic-blue/30 hover:border-aurora-cyan/50 font-semibold px-6 py-3 rounded-lg transition-all flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Nový partner
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">{error}</div>
      )}

      {hasChanges && (
        <div className="bg-aurora-cyan/10 border border-aurora-cyan/30 rounded-lg px-4 py-2 text-aurora-cyan text-sm">
          Máte neuložené změny pořadí.
        </div>
      )}

      {partners.length === 0 ? (
        <div className="bg-deep-space/50 border border-stellar-white/10 rounded-xl p-12 text-center">
          <p className="text-stellar-white/50 mb-4">Zatím nejsou žádní partneři</p>
          <Link href="/admin/partners/new" className="text-aurora-cyan hover:underline">Přidat prvního partnera</Link>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-6">
            {tierConfig.map(({ key: tier, label, color, border }) => (
              <TierSection
                key={tier}
                tier={tier}
                label={label}
                color={color}
                border={border}
                partners={getForTier(tier)}
                onDelete={handleDelete}
                onTogglePublished={handleTogglePublished}
              />
            ))}
          </div>

          <DragOverlay>
            {activePartner ? <DragOverlayRow partner={activePartner} /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
