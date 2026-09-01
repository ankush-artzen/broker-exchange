"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Lead, LeadFormData } from "@/lib/types";
import { api } from "@/lib/api";
import { LeadCard } from "@/components/LeadCard";
import { LeadDetailSheet } from "@/components/LeadDetailSheet";
import { VoiceLeadCapture } from "@/components/VoiceLeadCapture";
import { AddButton, AppPage } from "@/components/AppPage";
import { ListPagination } from "@/components/ListPagination";
import { usePagination } from "@/hooks/usePagination";
import {
  cn,
  matchesLeadFilter,
  type LeadFilter,
} from "@/lib/utils";
import { User } from "lucide-react";

const filters: { id: LeadFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "due-today", label: "Due today" },
  { id: "new", label: "New" },
  { id: "negotiation", label: "Negotiation" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [filter, setFilter] = useState<LeadFilter>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getLeads();
      setLeads(data);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (sessionStorage.getItem("quick-add") === "lead") {
      sessionStorage.removeItem("quick-add");
      setVoiceOpen(true);
    }
  }, []);

  const filtered = useMemo(() => {
    return leads.filter((lead) => matchesLeadFilter(lead, filter));
  }, [leads, filter]);

  const { page, setPage, totalPages, paginatedItems, pageSize, total } =
    usePagination(filtered, filter);

  const handleCreate = async (data: LeadFormData) => {
    await api.createLead(data);
    setVoiceOpen(false);
    load();
  };

  return (
    <AppPage
      title="Leads"
      subtitle={`${leads.length} ${leads.length === 1 ? "lead" : "leads"}`}
      action={<AddButton onClick={() => setVoiceOpen(true)} />}
    >

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filters.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setFilter(chip.id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
              filter === chip.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-muted",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-[14px] bg-surface"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-surface px-4 py-9 text-center text-[13.5px] leading-relaxed text-muted">
          <User
            size={36}
            strokeWidth={1.5}
            className="mx-auto mb-3 text-upcoming"
          />
          {leads.length === 0
            ? "No leads yet — tap + Add to create your first one."
            : "No leads match this filter."}
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {paginatedItems.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onClick={() => setSelected(lead)}
              />
            ))}
          </div>
          <ListPagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      )}

      <VoiceLeadCapture
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onSave={handleCreate}
      />

      <LeadDetailSheet
        lead={selected}
        open={!!selected}
        onClose={() => {
          setSelected(null);
          load();
        }}
        onUpdate={async (id, data) => {
          await api.updateLead(id, data);
          load();
        }}
        onDelete={async (id) => {
          await api.deleteLead(id);
          load();
        }}
      />
    </AppPage>
  );
}
