import { useTheme } from "../theme/useTheme";

/**
 * Summarizes the calculated trip plan into the dispatch metrics users scan first.
 *
 * Expected data shape:
 * - data.trip_plan.total_distance_miles
 * - data.trip_plan.estimated_drive_hours
 * - data.trip_plan.estimated_total_trip_hours
 * - data.trip_plan.cycle_used_after_trip
 */
export default function TripSummary({ data }) {
  const { theme } = useTheme();
  const plan = data.trip_plan;

  // Keep card metadata close to rendering so the layout can stay data-driven.
  const cards = [
    {
      label: "Total distance",
      value: `${plan.total_distance_miles} mi`,
      detail: "Planned route mileage",
      icon: <RoadIcon />,
    },
    {
      label: "Drive time",
      value: `${plan.estimated_drive_hours} hrs`,
      detail: "Wheel time estimate",
      icon: <ClockIcon />,
    },
    {
      label: "Trip duration",
      value: `${plan.estimated_total_trip_hours} hrs`,
      detail: "Includes required stops",
      icon: <TimerIcon />,
    },
    {
      label: "Cycle used",
      value: `${plan.cycle_used_after_trip} / 70 hrs`,
      detail: "After completion",
      icon: <GaugeIcon />,
    },
  ];

  return (
    <section className={theme.card}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          title="Trip summary"
          subtitle="A dispatch-ready overview of mileage, timing, and cycle impact."
        />
        <span className="inline-flex w-fit items-center rounded-md border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-xs font-semibold text-[#166534]">
          Plan generated
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className={theme.mutedCard}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className={theme.iconTile}>
                {card.icon}
              </div>
              <span className={theme.liveBadge}>
                Live
              </span>
            </div>
            <p className={`text-sm font-semibold ${theme.textMuted}`}>{card.label}</p>
            <p className={`mt-1 text-2xl font-semibold tracking-tight ${theme.textStrong}`}>
              {card.value}
            </p>
            <p className={`mt-2 text-xs font-medium ${theme.textSoft}`}>{card.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Reusable section heading that stays aligned with theme typography. */
function SectionHeader({ title, subtitle }) {
  const { theme } = useTheme();

  return (
    <div>
      <h2 className={theme.sectionTitle}>{title}</h2>
      <p className={theme.sectionSubtitle}>{subtitle}</p>
    </div>
  );
}

/** Base icon shell for metric icons in the summary cards. */
function SvgIcon({ children }) {
  return (
    <svg
      className="h-5 w-5"
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

/**
 * The road icon visually represents the concept of a trip or route, making it an intuitive choice for the "Total distance" metric. The two parallel paths symbolize a roadway, while the lines connecting them suggest movement and direction, effectively conveying the idea of travel and mileage in the context of the trip summary.
 */
function RoadIcon() {
  return (
    <SvgIcon>
      <path d="M8 3 5 21" />
      <path d="m16 3 3 18" />
      <path d="M12 8v2" />
      <path d="M12 14v2" />
      <path d="M12 20v1" />
    </SvgIcon>
  );
}

/**
 * The clock icon is used to represent the "Drive time" metric, which is a critical component of the trip summary as it directly relates to the driver's wheel time and compliance with hours of service regulations. The circular shape of the clock symbolizes the passage of time, while the hands indicate specific time intervals, visually conveying the concept of driving duration and helping drivers quickly grasp their estimated drive hours at a glance.
 */
function ClockIcon() {
  return (
    <SvgIcon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </SvgIcon>
  );
}

/**
 * The timer icon represents total trip duration, which includes both drive time and required stops. The circle forms the timer face, while the paths create the timer hands and top button, visually conveying the concept of measuring elapsed time for the entire trip.
 */
function TimerIcon() {
  return (
    <SvgIcon>
      <path d="M10 2h4" />
      <path d="M12 14 15 11" />
      <circle cx="12" cy="14" r="8" />
    </SvgIcon>
  );
}

/**
 * The gauge icon is used to represent the cycle used after the trip, which is a critical metric for drivers to understand how much of their available hours they have consumed. The semi-circular path forms the gauge face, while the paths create the needle and base, visually conveying the concept of measuring remaining capacity in the driver's cycle.
 */
function GaugeIcon() {
  return (
    <SvgIcon>
      <path d="M4 14a8 8 0 0 1 16 0" />
      <path d="M12 14 16 9" />
      <path d="M7 19h10" />
    </SvgIcon>
  );
}
