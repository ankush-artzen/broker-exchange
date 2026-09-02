"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Property } from "@/lib/types";
import { Modal } from "./Modal";
import { ImageLightbox } from "./ImageLightbox";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  property: Property | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}

export function PropertyDetailSheet({
  property,
  open,
  onClose,
  onDelete,
}: Props) {
  const router = useRouter();
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

  const handleEdit = () => {
    onClose();
    router.push(`/properties/${property.id}/edit`);
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setZoomedUrl(null);
        onClose();
      }}
      title={property.title}
    >
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

        <div className="flex gap-2 pt-2">
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
