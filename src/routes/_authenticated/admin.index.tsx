import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminOverview } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: OverviewPage,
});

function OverviewPage() {
  const fn = useServerFn(getAdminOverview);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => fn(),
  });

  const cards = [
    { label: "Teams registered", value: data?.teams ?? 0, tone: "bg-orange text-cream" },
    { label: "Mentor / Judge applications", value: data?.applications ?? 0, tone: "bg-cobalt text-cream" },
    { label: "Sponsor inquiries", value: data?.sponsors ?? 0, tone: "bg-yellow text-ink" },
    { label: "Volunteer signups", value: data?.volunteers ?? 0, tone: "bg-rose text-ink" },
  ];

  return (
    <div>
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Overview</div>
        <h1 className="font-chunk text-4xl uppercase tracking-tight">Dashboard</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`ink-border-sm rounded-2xl p-5 ${c.tone}`}>
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-80">{c.label}</div>
            <div className="mt-2 font-chunk text-5xl">{isLoading ? "…" : c.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 ink-border-sm rounded-2xl bg-cream p-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Tips</div>
        <ul className="mt-2 space-y-1 text-sm">
          <li>· Use the tabs above to review submissions.</li>
          <li>· Approve or reject mentor / judge applications from the Mentors & Judges tab.</li>
          <li>· Team submissions (PPT links, notes) appear in the Teams tab once uploaded.</li>
        </ul>
      </div>
    </div>
  );
}
