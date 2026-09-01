import { AuthGuard } from "@/components/AuthGuard";
import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthGuard>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-background">
        <main className="flex-1 pb-24">{children}</main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
