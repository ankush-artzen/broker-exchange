"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead, LeadFormData } from "@/lib/types";
import { formatDate, getLeadStatus, normalizeIndianPhone } from "@/lib/utils";
import { CallWhatsAppButtons } from "./CallWhatsAppButtons";
import { RescheduleButtons } from "./RescheduleButtons";
import { Modal } from "./Modal";
import { Check, Pencil, Trash2 } from "lucide-react";

interface Props {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<LeadFormData> & { followUpDone?: boolean }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function LeadDetailSheet({
  lead,
  open,
  onClose,
  onUpdate,
  onDelete,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!lead) return null;

  const whatsappMsg = `Hi ${lead.name}, this is regarding your property requirement${lead.requirement ? ` for ${lead.requirement}` : ""}.`;
  const statusLabel =
    getLeadStatus(lead).charAt(0).toUpperCase() + getLeadStatus(lead).slice(1);

  const handleMarkDone = async () => {
    setLoading(true);
    try {
      await onUpdate(lead.id, { followUpDone: true });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (date: Date) => {
    setLoading(true);
    try {
      await onUpdate(lead.id, {
        followUpDate: date.toISOString(),
        followUpDone: false,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this lead?")) return;
    setLoading(true);
    try {
      await onDelete(lead.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    onClose();
    router.push(`/leads/${lead.id}/edit`);
  };

  return (
    <Modal open={open} onClose={onClose} title={lead.name}>
      <div className="space-y-4">
        <InfoRow label="Phone" value={normalizeIndianPhone(lead.phone)} />
        <InfoRow label="Requirement" value={lead.requirement} />
        <InfoRow label="Location" value={lead.location} />
        <InfoRow label="Budget" value={lead.budget} />
        <InfoRow label="Source" value={lead.source} />
        <InfoRow label="Status" value={statusLabel} />
        <InfoRow label="Follow-up" value={formatDate(lead.followUpDate)} />
        {lead.notes && <InfoRow label="Notes" value={lead.notes} />}

        <CallWhatsAppButtons phone={lead.phone} whatsappMessage={whatsappMsg} />

        {!lead.followUpDone && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-700">Reschedule</p>
            <RescheduleButtons onReschedule={handleReschedule} loading={loading} />
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          {!lead.followUpDone && (
            <button
              type="button"
              disabled={loading}
              onClick={handleMarkDone}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-white disabled:opacity-50"
            >
              <Check size={18} />
              Mark Follow-up Done
            </button>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleEdit}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border py-3 font-medium text-primary"
            >
              <Pencil size={18} />
              Edit
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleDelete}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 font-medium text-red-600 disabled:opacity-50"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="text-zinc-900">{value}</p>
    </div>
  );
}
