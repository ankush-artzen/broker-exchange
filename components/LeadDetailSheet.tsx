"use client";

import { useState } from "react";
import type { Lead, LeadFormData } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { CallWhatsAppButtons } from "./CallWhatsAppButtons";
import { RescheduleButtons } from "./RescheduleButtons";
import { LeadForm } from "./LeadForm";
import { Modal } from "./Modal";

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
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!lead) return null;

  const whatsappMsg = `Hi ${lead.name}, this is regarding your property requirement${lead.requirement ? ` for ${lead.requirement}` : ""}.`;

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

  return (
    <Modal
      open={open}
      onClose={() => {
        setEditing(false);
        onClose();
      }}
      title={editing ? "Edit Lead" : lead.name}
    >
      {editing ? (
        <LeadForm
          initial={lead}
          onSubmit={async (data) => {
            await onUpdate(lead.id, data);
            setEditing(false);
            onClose();
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="space-y-4">
          <InfoRow label="Phone" value={lead.phone} />
          <InfoRow label="Requirement" value={lead.requirement} />
          <InfoRow label="Location" value={lead.location} />
          <InfoRow label="Budget" value={lead.budget} />
          <InfoRow label="Source" value={lead.source} />
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
                className="w-full rounded-xl bg-emerald-600 py-3 font-medium text-white disabled:opacity-50"
              >
                Mark Follow-up Done
              </button>
            )}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="w-full rounded-xl border border-zinc-200 py-3 font-medium text-zinc-700"
            >
              Edit
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleDelete}
              className="w-full rounded-xl py-3 font-medium text-red-600 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      )}
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
