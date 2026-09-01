"use client";

import type { Lead } from "@/lib/types";
import {
  cn,
  getLeadStatus,
  getLeadUrgency,
  type LeadStatus,
} from "@/lib/utils";
import { CallWhatsAppButtons } from "./CallWhatsAppButtons";

interface Props {
  lead: Lead;
  onClick: () => void;
}

const statusStyles: Record<
  LeadStatus,
  { label: string; className: string }
> = {
  new: { label: "new", className: "bg-upcoming text-foreground/70" },
  interested: { label: "interested", className: "bg-ok-tint text-ok" },
  negotiation: { label: "negotiation", className: "bg-today-tint text-today" },
};

export function LeadCard({ lead, onClick }: Props) {
  const urgency = getLeadUrgency(lead);
  const status = getLeadStatus(lead);
  const tag = statusStyles[status];
  const whatsappMsg = `Hi ${lead.name}, following up on your property requirement.`;
  const meta = [lead.requirement, lead.location, lead.budget]
    .filter(Boolean)
    .join(" • ");

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[14px] bg-surface py-3.5 pl-4 pr-3.5 shadow-sm",
        "border-l-4",
        urgency === "overdue" && "border-l-overdue",
        urgency === "due" && "border-l-today",
        (urgency === "upcoming" || urgency === "none") && "border-l-upcoming",
      )}
    >
      <button type="button" onClick={onClick} className="min-w-0 flex-1 text-left">
        <div className="text-[14.5px] font-semibold text-primary">
          {lead.name}{" "}
          <span
            className={cn(
              "ml-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize",
              tag.className,
            )}
          >
            {tag.label}
          </span>
        </div>
        {meta && (
          <p className="mt-0.5 truncate text-[12.5px] text-muted">{meta}</p>
        )}
      </button>

      <CallWhatsAppButtons
        phone={lead.phone}
        whatsappMessage={whatsappMsg}
        iconOnly
        size="sm"
      />
    </div>
  );
}
