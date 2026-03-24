import { Link } from "react-router-dom";
import GympayLogo from "@/components/branding/GympayLogo";
import { useAuth } from "@/context/AuthContext";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { btnPrimary } from "@/lib/buttonStyles";

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, loading } = useDashboardStats();

  if (loading || !stats) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="loading-spinner" />
      </div>
    );
  }

  const {
    totalMembers, paymentReceived, failedCount,
    paidCount, overdueCount, pendingCount,
    upcoming, revenueByMonth,
  } = stats;

  return (
    <>
      {/* Header — only on mobile */}
      <div className="sticky top-0 z-10 bg-bg px-5 pt-safe pb-3 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="relative">
            <GympayLogo size="sm" />
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-bg bg-lime" />
          </div>
          <h2 className="text-base font-bold tracking-tight text-ink">
            {user?.business_name ?? "My Gym"}
          </h2>
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden border-b border-border bg-surface px-8 py-5 lg:block">
        <h1 className="text-xl font-extrabold tracking-tight text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Overview of {user?.business_name ?? "your gym"}'s performance
        </p>
      </div>

      <div className="px-5 pt-4 lg:p-6">
        {/* Stat cards — single flat card with 3 stats separated by dividers */}
        <div className="flex items-stretch rounded-3xl bg-elevated shadow-level1">
          <StatCell
            icon="group"
            label="Members"
            value={String(totalMembers)}
            iconColor="bg-primary"
          />
          <div className="my-4 w-px bg-border" />
          <StatCell
            icon="account_balance_wallet"
            label="Received"
            value={`₹${paymentReceived.toLocaleString("en-IN")}`}
            glow
          />
          <div className="my-4 w-px bg-border" />
          <StatCell
            icon="error_outline"
            label="Failed"
            value={String(failedCount)}
            danger
          />
        </div>

        {/* Charts */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col justify-center rounded-3xl bg-elevated p-4 shadow-level1">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-ink-muted">
              Member Status
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Legend color="bg-lime" label="Paid" count={paidCount} />
              <Legend color="bg-status-overdue" label="Overdue" count={overdueCount} />
              <Legend color="bg-status-pending" label="Pending" count={pendingCount} />
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-grad-start to-blue-grad-end p-4 shadow-level1">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
              Monthly Revenue
            </p>
            <RevenueBarChart data={revenueByMonth} />
          </div>
        </div>

        {/* Upcoming payments */}
        <div className="pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
            Upcoming Payments
          </p>
        </div>

        <div className="mt-3 flex flex-col gap-2 pb-4">
          {upcoming.length === 0 && (
            <div className="flex items-center justify-center rounded-2xl bg-surface py-10 text-sm text-ink-muted shadow-level1">
              No upcoming payments
            </div>
          )}
          {upcoming.map((m) => (
            <Link
              key={m.id}
              to={`/members/${m.id}`}
              className="flex items-center justify-between rounded-2xl bg-surface p-3 shadow-level1 transition-all duration-200 ease-out hover:bg-elevated active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-elevated">
                  <span className="material-symbols-outlined text-lg text-ink-secondary">
                    calendar_month
                  </span>
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{m.name}</p>
                  <p className="text-xs text-ink-muted">{m.status_label ?? "Pending"}</p>
                </div>
              </div>
              <p className="text-sm font-bold tabular-nums text-ink">
                ₹{Number(m.monthly_fee).toLocaleString("en-IN")}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Primary action — mobile only; sits above bottom nav + home indicator */}
      <div className="pointer-events-none fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px)+0.75rem)] left-0 right-0 z-10 flex justify-end px-4 lg:hidden">
        <Link to="/members/new" className={`${btnPrimary} pointer-events-auto`}>
          <span className="material-symbols-outlined text-xl">add</span>
          Add member
        </Link>
      </div>
    </>
  );
}

function StatCell({
  icon,
  label,
  value,
  iconColor = "bg-surface",
  glow = false,
  danger = false,
}: {
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
  glow?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-4 px-2">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full ${iconColor}`}
      >
        <span className="material-symbols-outlined text-base text-white">{icon}</span>
      </span>
      <p
        title={value}
        className={`min-w-0 truncate text-base font-extrabold leading-tight tabular-nums sm:text-lg ${
          danger ? "text-status-overdue" : "text-ink"
        }`}
        style={glow ? { textShadow: "0 0 12px rgba(46,107,255,0.35)" } : undefined}
      >
        {value}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">{label}</p>
    </div>
  );
}

function Legend({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-surface px-3 py-1">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
      <span className="text-xs font-medium text-ink-secondary">{label}</span>
      <span className="ml-auto text-xs font-bold tabular-nums text-ink">{count}</span>
    </div>
  );
}

function formatCompact(n: number) {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n}`;
}

function RevenueBarChart({ data }: { data: { label: string; value: number }[] }) {
  const maxV = Math.max(...data.map((d) => d.value), 1);
  const barMaxH = 64;

  if (data.length === 0) {
    return <p className="mt-2 text-center text-xs text-white/50">No revenue data yet</p>;
  }

  const visibleData = data.length > 4 ? data.slice(-4) : data;
  const lastIdx = visibleData.length - 1;

  return (
    <div className="mt-2 flex items-end justify-around gap-1">
      {visibleData.map((d, idx) => {
        const h = Math.max(Math.round((d.value / maxV) * barMaxH), 6);
        const parts = d.label.split(" ");
        const month = parts[0] ?? d.label;
        const year = parts[1] ?? "";
        const isCurrent = idx === lastIdx;
        return (
          <div key={d.label} className="flex flex-col items-center gap-0.5">
            <span className="whitespace-nowrap text-[7px] font-bold tabular-nums text-white/80">
              {formatCompact(d.value)}
            </span>
            <div
              className={`w-4 rounded-t-lg rounded-b bg-white/85 ${
                isCurrent ? "ring-1 ring-lime" : ""
              }`}
              style={{ height: h }}
            />
            <span className="text-[8px] font-bold uppercase leading-tight text-white/50">{month}</span>
            <span className="-mt-0.5 text-[6px] font-medium text-white/30">{year}</span>
          </div>
        );
      })}
    </div>
  );
}
