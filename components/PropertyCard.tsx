"use client";

import type { Property } from "@/lib/types";
import { cn, getPropertyStatus } from "@/lib/utils";
import { House } from "lucide-react";
import Image from "next/image";

interface Props {
  property: Property;
  onClick: () => void;
}

const statusStyles = {
  available: { label: "available", className: "bg-ok-tint text-ok" },
  reserved: { label: "reserved", className: "bg-today-tint text-today" },
} as const;

export function PropertyCard({ property, onClick }: Props) {
  const thumb = property.photoUrls[0];
  const status = getPropertyStatus(property);
  const tag = statusStyles[status];
  const meta = [property.configuration, property.location]
    .filter(Boolean)
    .join(" • ");

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full gap-3 rounded-[14px] bg-surface p-3.5 text-left shadow-sm active:opacity-90"
    >
      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[10px] bg-upcoming">
        {thumb ? (
          <Image
            src={thumb}
            alt={property.title}
            fill
            className="object-cover"
            sizes="72px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <House size={28} strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[15px] font-semibold text-primary">{property.price}</p>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize",
              tag.className,
            )}
          >
            {tag.label}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[14px] font-semibold text-primary">
          {property.title}
        </p>
        {meta ? (
          <p className="mt-0.5 truncate text-[12.5px] text-muted">{meta}</p>
        ) : null}
      </div>
    </button>
  );
}
