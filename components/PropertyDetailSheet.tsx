"use client";

import { useState } from "react";
import Image from "next/image";
import type { Property, PropertyFormData } from "@/lib/types";
import { PropertyForm } from "./PropertyForm";
import { Modal } from "./Modal";
import { ImageLightbox } from "./ImageLightbox";

interface Props {
  property: Property | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<PropertyFormData>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function PropertyDetailSheet({
  property,
  open,
  onClose,
  onUpdate,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [zoomedUrl, setZoomedUrl] = useState<string | null>(null);

  if (!property) return null;

  const handleDelete = async () => {
    if (!confirm("Delete this property?")) return;
    setLoading(true);
    try {
      await onDelete(property.id);
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
        setZoomedUrl(null);
        onClose();
      }}
      title={editing ? "Edit Property" : property.title}
    >
      {editing ? (
        <PropertyForm
          initial={property}
          onSubmit={async (data) => {
            await onUpdate(property.id, data);
            setEditing(false);
            onClose();
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="relative space-y-4">
          {property.photoUrls.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {property.photoUrls.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setZoomedUrl(url)}
                  aria-label="View photo"
                  className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl"
                >
                  <Image src={url} alt="" fill className="object-cover" sizes="128px" />
                </button>
              ))}
            </div>
          )}

          <ImageLightbox
            variant="modal"
            open={!!zoomedUrl}
            src={zoomedUrl ?? ""}
            alt={property.title}
            onClose={() => setZoomedUrl(null)}
          />

          <InfoRow label="Location" value={property.location} />
          <InfoRow label="Price" value={property.price} />
          <InfoRow label="Configuration" value={property.configuration} />
          <InfoRow label="Area" value={property.area} />
          <InfoRow label="Availability" value={property.availability} />
          {property.notes && <InfoRow label="Notes" value={property.notes} />}

          <div className="flex flex-col gap-2 pt-2">
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
