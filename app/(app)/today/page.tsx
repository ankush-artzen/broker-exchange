"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Lead } from "@/lib/types";
import { api } from "@/lib/api";
import { getStoredUserName } from "@/lib/storage";
import {
  cn,
  formatLongDate,
  getGreeting,
  getInitials,
  isOverdue,
} from "@/lib/utils";
import { LeadDetailSheet } from "@/components/LeadDetailSheet";
import { CallWhatsAppButtons } from "@/components/CallWhatsAppButtons";
import { AppPage } from "@/components/AppPage";
import { AlertCircle, CircleCheck } from "lucide-react";

export default function TodayPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);
  const userName = getStoredUserName();
  const firstName = userName?.split(" ")[0] ?? "Broker";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [leadsData, propertiesData] = await Promise.all([
        api.getTodayLeads(),
        api.getProperties(),
      ]);
      setLeads(leadsData);
      setPropertiesCount(propertiesData.length);
    } catch {
      setError("Failed to load data. Please try again.");
      setLeads([]);
      setPropertiesCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { overdue, today, sortedLeads } = useMemo(() => {
    const overdueLeads = leads.filter((l) => isOverdue(l.followUpDate));
    const todayLeads = leads.filter((l) => !isOverdue(l.followUpDate));
    return {
      overdue: overdueLeads,
      today: todayLeads,
      sortedLeads: [...overdueLeads, ...todayLeads],
    };
  }, [leads]);

  return (
    <AppPage
      header={
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-[1.75rem] leading-tight text-primary">
              {getGreeting()}, {firstName}
            </h1>
            <p className="mt-1 text-[12.5px] text-muted">{formatLongDate()}</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {getInitials(userName)}
          </div>
        </header>
      }
    >

      <div className="mb-8 rounded-3xl bg-primary px-4 py-5 shadow-lg shadow-primary/20">
        <div className="grid grid-cols-3 divide-x divide-white/15">
          <Stat value={today.length} label="Due today" />
          <Stat value={overdue.length} label="Overdue" highlight />
          <Stat value={propertiesCount} label="Properties saved" />
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="flex-1 text-sm">{error}</p>
          <button
            type="button"
            onClick={load}
            className="text-sm font-medium text-red-700"
          >
            Retry
          </button>
        </div>
      )}

      <section>
        <h2 className="mb-4 font-serif text-xl text-primary">
          Today&apos;s follow-ups
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[88px] animate-pulse rounded-2xl bg-surface"
              />
            ))}
          </div>
        ) : sortedLeads.length === 0 ? (
          <div className="rounded-2xl bg-surface p-8 text-center shadow-sm">
            <CircleCheck
              size={40}
              strokeWidth={1.5}
              className="mx-auto text-secondary"
            />
            <p className="mt-3 font-medium text-primary">All caught up!</p>
            <p className="text-sm text-muted">No follow-ups due today.</p>
            <Link
              href="/leads"
              className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Add a lead
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedLeads.map((lead) => (
              <TodayLeadItem
                key={lead.id}
                lead={lead}
                onOpen={() => setSelected(lead)}
              />
            ))}
          </div>
        )}
      </section>

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

function Stat({
  value,
  label,
  highlight,
}: {
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="px-2 text-center">
      <p
        className={cn(
          "font-serif text-3xl leading-none",
          highlight ? "text-overdue-muted" : "text-primary-foreground",
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-[11px] leading-tight text-white/55">{label}</p>
    </div>
  );
}

function TodayLeadItem({
  lead,
  onOpen,
}: {
  lead: Lead;
  onOpen: () => void;
}) {
  const overdue = isOverdue(lead.followUpDate);
  const whatsappMsg = `Hi ${lead.name}, following up on your property requirement.`;
  const subtitle = [lead.requirement, lead.location]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="flex overflow-hidden rounded-2xl bg-surface shadow-sm">
      <div
        className={cn(
          "w-1 shrink-0",
          overdue ? "bg-overdue" : "bg-today",
        )}
      />
      <div className="flex min-w-0 flex-1 items-center gap-2 p-3 sm:gap-3 sm:p-4">
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 text-left"
        >
          <h3 className="truncate font-semibold text-primary">{lead.name}</h3>
          {subtitle ? (
            <p className="mt-0.5 truncate text-sm text-muted">{subtitle}</p>
          ) : (
            <p className="mt-0.5 text-sm text-muted">{lead.phone}</p>
          )}
        </button>
        <span
          className={cn(
            "shrink-0 text-xs font-medium sm:text-sm",
            overdue ? "text-overdue" : "text-today",
          )}
        >
          {overdue ? "Overdue" : "Today"}
        </span>
        <CallWhatsAppButtons
          phone={lead.phone}
          whatsappMessage={whatsappMsg}
          iconOnly
        />
      </div>
    </div>
  );
}
