import { useState } from "react";
import TripForm from "./components/TripForm";
import RouteMap from "./components/RouteMap";
import TripSummary from "./components/TripSummary";
import LogSheets from "./components/LogSheets";
import StopsTimeline from "./components/StopsTimeline";
import ThemeSwitcher from "./components/ThemeSwitcher";
import { planTrip } from "./api/tripApi";
import "leaflet/dist/leaflet.css";
import "./style.css";
import { useTheme } from "./theme/useTheme";

/**
 * Top-level application shell for the ELD trip planning workflow.
 * Owns request state and switches the main panel between the empty and results views.
 */
export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { theme } = useTheme();

  async function handleSubmit(formData) {
    // Reset the previous plan so each submission reflects only the latest request.
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const data = await planTrip(formData);
      setResult(data);
    } catch (requestError) {
      // Prefer backend validation/processing details, with a stable fallback for network failures.
      setError(requestError.response?.data?.detail || "Failed to plan trip");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={theme.app}>
      <Header />

      <div className={theme.page}>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[390px_minmax(0,1fr)] xl:grid-cols-[430px_minmax(0,1fr)]">
          <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
            <SidebarHeader />
            <TripForm onSubmit={handleSubmit} loading={loading} error={error} />
            <ComplianceCard />
          </aside>

          <section className="min-w-0 space-y-5">
            {!result ? <EmptyState loading={loading} /> : <Results data={result} />}
          </section>
        </div>
      </div>
    </main>
  );
}

/** Persistent header with product identity and high-level compliance context. */
function Header() {
  const { theme } = useTheme();

  return (
    <header className={theme.header}>
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className={theme.headerLogo}>
            <RouteIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className={theme.headerTitle}>
              ELD Trip Planner
            </h1>
            <p className={theme.headerSubtitle}>
              Route planning, HOS validation, and printable driver logs
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeSwitcher />
          <span className={theme.headerBadge}>
            FMCSA 70-hour cycle
          </span>
          <span className={theme.button}>Live plan</span>
        </div>
      </div>
    </header>
  );
}

/** Left rail introduction that frames the form as a dispatch workflow. */
function SidebarHeader() {
  const { theme } = useTheme();

  return (
    <div className={theme.sidebarHeader}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9fb3c8]">
            Dispatch workspace
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Build a compliant route plan
          </h2>
        </div>
        <div className="rounded-md bg-white/10 p-2 text-[#9fd2ff]">
          <ClipboardIcon className="h-5 w-5" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        {["Route", "Stops", "Logs"].map((item) => (
          <div key={item} className="rounded-md border border-white/10 bg-white/10 px-3 py-2">
            <span className="block font-semibold text-white">{item}</span>
            <span className="text-[#9fb3c8]">Auto-built</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Static note for the planner assumptions used by the generated trip plan. */
function ComplianceCard() {
  const { theme } = useTheme();

  return (
    <section className={theme.softCard}>
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-[#eef6ff] p-2 text-[#0b6bcb]">
          <ShieldIcon className="h-5 w-5" />
        </div>
        <div>
          <h2 className={theme.sectionTitle}>Planning assumptions</h2>
          <p className={theme.sectionSubtitle}>
            Fuel stops, rest periods, and duty-status transitions are calculated
            from the trip inputs before logs are rendered.
          </p>
        </div>
      </div>
    </section>
  );
}

/** Placeholder view shown before the first successful trip plan is generated. */
function EmptyState({ loading }) {
  const { theme } = useTheme();

  return (
    <section className={theme.emptyState}>
      <div className="w-full max-w-3xl">
        <div className={theme.emptyIcon}>
          <MapIcon className="h-7 w-7" />
        </div>

        <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${theme.textMuted}`}>
          Ready for dispatch
        </p>
        <h3 className={`mt-3 text-2xl font-semibold tracking-tight sm:text-3xl ${theme.textStrong}`}>
          Generate a route, stop plan, and daily logs in one pass.
        </h3>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          <EmptyStep icon={<PinIcon className="h-5 w-5" />} title="Locations" copy="Current, pickup, and dropoff points." />
          <EmptyStep icon={<ClockIcon className="h-5 w-5" />} title="HOS math" copy="Drive cycle and rest timing." />
          <EmptyStep icon={<LogIcon className="h-5 w-5" />} title="Log sheets" copy="Printable duty-status records." />
        </div>

        {loading && (
          <div className="mx-auto mt-8 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-[#e6edf5]">
            <div className="planning-bar h-full w-1/2 rounded-full bg-[#0b6bcb]" />
          </div>
        )}
      </div>
    </section>
  );
}

/** Small summary tile used inside the empty state checklist. */
function EmptyStep({ icon, title, copy }) {
  const { theme } = useTheme();

  return (
    <div className={theme.emptyStepCard}>
      <div className={theme.emptyStepIcon}>
        {icon}
      </div>
      <p className={`font-semibold ${theme.textStrong}`}>{title}</p>
      <p className={`mt-1 text-sm leading-6 ${theme.textMuted}`}>{copy}</p>
    </div>
  );
}

/** Coordinates the generated response into summary, route, stops, and log sections. */
function Results({ data }) {
  const { theme } = useTheme();

  return (
    <div className={theme.resultsWrapper}>
      <TripSummary data={data} />

      <div className={theme.routeTimelineLayout}>
        <RouteMap data={data} />
        <StopsTimeline stops={data.trip_plan.stops} />
      </div>

      <LogSheets logs={data.daily_logs} />
    </div>
  );
}

/** Shared SVG wrapper keeps custom inline icons visually consistent. */
function SvgIcon({ children, className = "h-5 w-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function RouteIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M4 19c4-7 12 1 16-6" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="12" r="2" />
      <path d="M8 7h8" />
      <path d="M12 3v8" />
    </SvgIcon>
  );
}

function ClipboardIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M9 4h6" />
      <path d="M9 2h6v4H9z" />
      <path d="M7 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <path d="M8 12h8" />
      <path d="M8 16h6" />
    </SvgIcon>
  );
}

function ShieldIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-5" />
    </SvgIcon>
  );
}

function MapIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" />
      <path d="M9 3v15" />
      <path d="M15 6v15" />
    </SvgIcon>
  );
}

function PinIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </SvgIcon>
  );
}

function ClockIcon(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </SvgIcon>
  );
}

function LogIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </SvgIcon>
  );
}
