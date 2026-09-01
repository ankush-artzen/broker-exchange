"use client";

import Link from "next/link";
import { ChevronRight, LandPlot, User } from "lucide-react";
import { getStoredUserName } from "@/lib/storage";
import { LogoutButton } from "@/components/LogoutButton";
import { AppPage } from "@/components/AppPage";

const quickLinks = [
  {
    href: "/leads",
    label: "Leads",
    icon: User,
    description: "View and manage leads",
  },
  {
    href: "/properties",
    label: "Properties",
    icon: LandPlot,
    description: "Browse your listings",
  },
];

export default function AccountPage() {
  const userName = getStoredUserName();

  return (
    <AppPage title="Account" subtitle="Your profile and settings">
      <div className="mb-6 rounded-[14px] border border-border bg-surface p-4 shadow-sm">
        <p className="text-[12.5px] text-muted">Signed in as</p>
        <p className="mt-1 text-lg font-semibold text-primary">
          {userName ?? "Broker"}
        </p>
      </div>

      <section className="mb-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Quick links
        </h2>
        <div className="overflow-hidden rounded-[14px] border border-border bg-surface shadow-sm">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-background ${
                  index < quickLinks.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ok-tint text-ok">
                  <Icon size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-primary">{link.label}</p>
                  <p className="text-sm text-muted">{link.description}</p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-muted" />
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Session
        </h2>
        <div className="rounded-[14px] border border-border bg-surface p-2 shadow-sm">
          <LogoutButton className="w-full justify-center rounded-lg py-3 text-overdue hover:bg-overdue-tint hover:text-overdue" />
        </div>
      </section>
    </AppPage>
  );
}
