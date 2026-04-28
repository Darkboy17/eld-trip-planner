import { useState } from "react";
import { useTheme } from "../theme/useTheme";

/**
 * Captures the dispatch inputs required to generate an ELD trip plan.
 *
 * onSubmit receives the backend payload shape:
 * - current_location, pickup_location, dropoff_location: address/search strings
 * - current_cycle_used: numeric hours already consumed from the 70-hour cycle
 */
export default function TripForm({ onSubmit, loading, error }) {
  const { theme } = useTheme();

  // Keep the field names aligned with the API contract so submit can forward the form directly.
  const [form, setForm] = useState({
    current_location: "",
    pickup_location: "",
    dropoff_location: "",
    current_cycle_used: 0,
  });

  function updateField(event) {
    // A single handler works because each input name matches a key in form state.
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  }

  function submit(event) {
    event.preventDefault();

    // Browser number inputs still produce strings, so normalize cycle hours before submission.
    onSubmit({
      ...form,
      current_cycle_used: Number(form.current_cycle_used),
    });
  }

  return (
    <form onSubmit={submit} className={theme.softCard}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={theme.sectionTitle}>Trip details</h2>
          <p className={theme.sectionSubtitle}>
            Enter the three route anchors and the driver cycle already used.
          </p>
        </div>
        <span className={theme.formRequiredBadge}>
          Required
        </span>
      </div>

      <div className="mt-6 space-y-4">
        <Input
          label="Current location"
          name="current_location"
          placeholder="Chicago, IL"
          value={form.current_location}
          onChange={updateField}
          icon={<PinIcon />}
        />

        <Input
          label="Pickup location"
          name="pickup_location"
          placeholder="Indianapolis, IN"
          value={form.pickup_location}
          onChange={updateField}
          icon={<BoxIcon />}
        />

        <Input
          label="Dropoff location"
          name="dropoff_location"
          placeholder="Newark, NJ"
          value={form.dropoff_location}
          onChange={updateField}
          icon={<FlagIcon />}
        />

        <Input
          label="Current cycle used"
          name="current_cycle_used"
          type="number"
          min="0"
          max="70"
          step="0.25"
          value={form.current_cycle_used}
          onChange={updateField}
          suffix="hrs"
          icon={<ClockIcon />}
        />
      </div>

      {error && (
        <div className="mt-5 rounded-md border border-[#fecaca] bg-[#fff1f2] px-3 py-2.5 text-sm font-medium text-[#b42318]">
          {error}
        </div>
      )}

      <button disabled={loading} className={`mt-6 w-full ${theme.primaryButton}`}>
        {loading && <span className="button-spinner" aria-hidden="true" />}
        {loading ? "Planning trip" : "Generate trip plan"}
      </button>
    </form>
  );
}

/**
 * Shared labeled input shell used by all trip fields.
 * It keeps icons, suffixes, required validation, and theme styling consistent.
 */
function Input({ label, suffix, icon, ...props }) {
  const { theme } = useTheme();

  return (
    <label className="block">
      <span className={theme.inputLabel}>
        {label}
      </span>

      <div className={theme.input}>
        <span className={theme.inputIcon} aria-hidden="true">
          {icon}
        </span>
        <input
          {...props}
          required
          className={theme.inputText}
        />

        {suffix && (
          <span className={theme.inputSuffix}>
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

/** Shared SVG shell for simple field icons that inherit theme color from their parent. */
function SvgIcon({ children }) {
  return (
    <svg
      className="h-4.5 w-4.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function PinIcon() {
  return (
    <SvgIcon>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </SvgIcon>
  );
}

function BoxIcon() {
  return (
    <SvgIcon>
      <path d="m21 8-9-5-9 5 9 5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </SvgIcon>
  );
}

function FlagIcon() {
  return (
    <SvgIcon>
      <path d="M5 22V4" />
      <path d="M5 4h12l-2 4 2 4H5" />
    </SvgIcon>
  );
}

function ClockIcon() {
  return (
    <SvgIcon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </SvgIcon>
  );
}
