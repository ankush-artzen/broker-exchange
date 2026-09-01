export function formatPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function phoneDialLink(phone: string): string {
  const digits = formatPhone(phone);
  return digits ? `tel:+${digits.startsWith("91") ? digits : `91${digits}`}` : "#";
}

export function whatsappLink(phone: string, message?: string): string {
  const digits = formatPhone(phone);
  const num = digits.startsWith("91") ? digits : `91${digits}`;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${num}${text}`;
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatLongDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "B";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatCurrency(value: string | null | undefined): string {
  if (!value) return "—";
  return value;
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseFollowUpDate(
  value: string | Date | null | undefined,
): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDate) {
    return new Date(+isoDate[1], +isoDate[2] - 1, +isoDate[3]);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toLocalDateKey(
  date: string | Date | null | undefined,
): string {
  const d =
    typeof date === "string" ? parseFollowUpDate(date) : date ?? null;
  if (!d || Number.isNaN(d.getTime())) return "";
  return formatDateKey(d);
}

export function normalizeFollowUpInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();
  const today = startOfToday();
  if (/\btoday\b/.test(lower)) return formatDateKey(today);
  if (/\btomorrow\b/.test(lower)) return formatDateKey(addDays(today, 1));

  const parsed = parseFollowUpDate(trimmed);
  return parsed ? formatDateKey(parsed) : null;
}

export function isOverdue(followUpDate: string | null | undefined): boolean {
  if (!followUpDate) return false;
  const key = toLocalDateKey(followUpDate);
  if (!key) return false;
  return key < toLocalDateKey(new Date());
}

export function isToday(date: string | null | undefined): boolean {
  if (!date) return false;
  const key = toLocalDateKey(date);
  if (!key) return false;
  return key === toLocalDateKey(new Date());
}

export function isDueForFollowUp(lead: {
  followUpDate?: string | null;
  followUpDone: boolean;
}): boolean {
  if (!lead.followUpDate || lead.followUpDone) return false;
  return isOverdue(lead.followUpDate) || isToday(lead.followUpDate);
}

export type LeadStatus = "new" | "interested" | "negotiation";

export type LeadFilter = "all" | "due-today" | "new" | "negotiation";

const leadStatuses: LeadStatus[] = ["new", "interested", "negotiation"];

export function normalizeLeadStatus(value?: string | null): LeadStatus | null {
  const normalized = value?.toLowerCase().trim();
  if (normalized && leadStatuses.includes(normalized as LeadStatus)) {
    return normalized as LeadStatus;
  }
  return null;
}

export function getLeadStatus(lead: {
  status?: string | null;
  createdAt: string;
  notes?: string | null;
  requirement?: string | null;
}): LeadStatus {
  const stored = normalizeLeadStatus(lead.status);
  if (stored) return stored;

  const text = `${lead.notes ?? ""} ${lead.requirement ?? ""}`;
  if (/negotiat/i.test(text)) return "negotiation";

  const created = new Date(lead.createdAt).getTime();
  const weekAgo = Date.now() - 7 * 86400000;
  if (created > weekAgo) return "new";

  return "interested";
}

export function matchesLeadFilter(
  lead: {
    status?: string | null;
    createdAt: string;
    notes?: string | null;
    requirement?: string | null;
    followUpDate?: string | null;
    followUpDone: boolean;
  },
  filter: LeadFilter,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "due-today":
      return isDueForFollowUp(lead);
    case "new":
      return getLeadStatus(lead) === "new";
    case "negotiation":
      return getLeadStatus(lead) === "negotiation";
    default:
      return true;
  }
}

export function getLeadUrgency(lead: {
  followUpDate?: string | null;
  followUpDone: boolean;
}): "overdue" | "due" | "upcoming" | "none" {
  if (!lead.followUpDate || lead.followUpDone) return "none";
  if (isOverdue(lead.followUpDate)) return "overdue";
  if (isToday(lead.followUpDate)) return "due";
  return "upcoming";
}

export type PropertyStatus = "available" | "reserved";

export function getPropertyStatus(property: {
  availability?: string | null;
}): PropertyStatus {
  const value = property.availability?.toLowerCase().trim() ?? "";
  if (value.includes("reserved")) return "reserved";
  return "available";
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
