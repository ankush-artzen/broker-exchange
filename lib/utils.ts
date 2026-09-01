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

export function isOverdue(followUpDate: string | null | undefined): boolean {
  if (!followUpDate) return false;
  const d = new Date(followUpDate);
  d.setHours(23, 59, 59, 999);
  return d < startOfToday();
}

export function isToday(date: string | null | undefined): boolean {
  if (!date) return false;
  const d = new Date(date);
  const today = startOfToday();
  const end = endOfToday();
  return d >= today && d <= end;
}

export type LeadStatus = "new" | "interested" | "negotiation";

export function getLeadStatus(lead: {
  createdAt: string;
  notes?: string | null;
  requirement?: string | null;
}): LeadStatus {
  const text = `${lead.notes ?? ""} ${lead.requirement ?? ""}`;
  if (/negotiat/i.test(text)) return "negotiation";

  const created = new Date(lead.createdAt).getTime();
  const weekAgo = Date.now() - 7 * 86400000;
  if (created > weekAgo) return "new";

  return "interested";
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
