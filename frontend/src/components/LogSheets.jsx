/**
 * Driver log sheet viewer
 * 
 * Provides a zoomable, interactive viewer for FMCSA-compliant driver daily logs.
 * Features include:
 * - Multi-sheet navigation with smooth transitions
 * - Zoom controls (mouse wheel, buttons, pinch gesture, double-click)
 * - Pan with inertia scrolling
 * - Responsive grid rendering
 * - ELD-compliant graph visualization
 */

import { useEffect, useRef, useState } from "react";
import { useTheme } from "../theme/useTheme";

/**
 * Inner sheet area dimensions and positioning
 * Defines the white printable area within the SVG canvas
 */
const INNER_SHEET = {
  x: 95,
  y: 70,
  width: 760,
  height: 545,
};

/**
 * Driver duty status row definitions
 * Each row represents a distinct activity state in the ELD graph
 */
const ROWS = [
  { key: "OFF_DUTY", label: ["Off", "Duty"] },
  { key: "SLEEPER_BERTH", label: ["Sleeper", "Berth"] },
  { key: "DRIVING", label: ["Driving"] },
  { key: "ON_DUTY", label: ["On Duty", "(Not", "Driving)"] },
];

/**
 * Y-coordinate mapping for each duty status row
 * Used to position segments on the graph
 */
const ROW_Y = {
  OFF_DUTY: 298,
  SLEEPER_BERTH: 338,
  DRIVING: 378,
  ON_DUTY: 418,
};

/**
 * Grid layout constants for the hour timeline
 * Defines the printable grid area for the duty graph
 */
const GRID = {
  x: 186,
  y: 296,
  width: 590,
  rowHeight: 36,
};

const SHEET_VIEWBOX = {
  x: INNER_SHEET.x - 20,
  y: INNER_SHEET.y - 20,
  width: INNER_SHEET.width + 40,
  height: INNER_SHEET.height + 40,
};

/** Minimum allowed zoom level (showing 70% of normal size) */
const MIN_ZOOM = 0.7;

/** Maximum allowed zoom level (showing 1000% of normal size) */
const MAX_ZOOM = 10;

/** Sensitivity factor for mouse wheel zoom (lower = less sensitive) */
const ZOOM_INTENSITY = 0.0015;

/** Zoom multiplier for zoom in/out button clicks */
const BUTTON_ZOOM_FACTOR = 1.2;

/** Width of each hour column in the grid (divides 590px by 24 hours) */
const hourWidth = GRID.width / 24;

/**
 * Calculate SVG x-coordinate for a given hour on the timeline
 * @param {number} hour - Hour value (0-24)
 * @returns {number} SVG x-coordinate
 */
function getX(hour) {
  return GRID.x + hour * hourWidth;
}

/**
 * Constrain zoom value to valid range
 * @param {number} value - Zoom value to clamp
 * @returns {number} Clamped zoom value between MIN_ZOOM and MAX_ZOOM
 */
function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(3))));
}

/** Center the scrollable sheet viewport after layout has reflected a zoom change. */
function centerSheet(container) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.scrollLeft = Math.max(
        0,
        (container.scrollWidth - container.clientWidth) / 2
      );
      container.scrollTop = Math.max(
        0,
        (container.scrollHeight - container.clientHeight) / 2
      );
    });
  });
}

/**
 * LogSheets Component
 * 
 * Main container for displaying multiple ELD driver daily logs.
 * Manages sheet navigation and zoom controls, delegating rendering to DailyLogSheet.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array<Object>} props.logs - Array of driver log objects
 * @returns {JSX.Element|null} Log sheets viewer or null if no logs
 */
export default function LogSheets({ logs }) {
  const { theme } = useTheme();

  // Current active sheet index
  const [activeIndex, setActiveIndex] = useState(0);

  // Reference for zoom animation frame
  const animationRef = useRef(null);

  // Default zoom level for new sheets
  const DEFAULT_ZOOM = 1.2;
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  // Ref to track latest zoom without re-rendering
  const latestZoomRef = useRef(zoom);

  // Key to trigger re-centering when zoom resets
  const [resetKey, setResetKey] = useState(0);

  // Sync zoom ref with state for smooth animations
  useEffect(() => {
    latestZoomRef.current = zoom;
  }, [zoom]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Early exit if no logs available
  if (!logs || logs.length === 0) return null;

  const activeLog = logs[activeIndex];

  /**
   * Smoothly animate zoom to target level using easing
   * Uses quadratic ease-in-out easing function for natural motion
   * @param {number} targetZoom - Target zoom level
   * @param {Function} onComplete - Callback fired after the final zoom frame
   */
  function smoothZoom(targetZoom, onComplete) {
    // Cancel previous animation if in progress
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const startZoom = latestZoomRef.current;
    const endZoom = clampZoom(targetZoom);
    const duration = 140; // ms

    let startTime = null;

    /**
     * Animation frame callback for smooth zoom transition
     */
    function animate(timestamp) {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Quadratic ease-in-out easing for smooth acceleration/deceleration
      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      // Interpolate between start and end zoom levels
      const interpolated = startZoom + (endZoom - startZoom) * eased;

      setZoom(interpolated);
      latestZoomRef.current = interpolated;

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
        onComplete?.();
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }

  /** Zoom in by BUTTON_ZOOM_FACTOR */
  function zoomIn() {
    smoothZoom(latestZoomRef.current * BUTTON_ZOOM_FACTOR);
  }

  /** Zoom out by BUTTON_ZOOM_FACTOR */
  function zoomOut() {
    smoothZoom(latestZoomRef.current / BUTTON_ZOOM_FACTOR);
  }

  /** Reset zoom to default and recenter content */
  function resetZoom() {
    smoothZoom(DEFAULT_ZOOM, () => setResetKey((k) => k + 1));
  }

  return (
    <section className={theme.card}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className={theme.sectionTitle}>Driver daily logs</h2>
          <p className={theme.sectionSubtitle}>
            Showing one FMCSA-style log sheet at a time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="group relative">
            <button
              type="button"
              aria-label="Daily log zoom information"
              className={`${theme.pill} h-10 w-10 px-0`}
            >
              i
            </button>
            <div className={`pointer-events-none absolute right-0 top-12 z-20 w-64 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 ${theme.tooltip}`}>
              Use Ctrl + scroll to zoom around the cursor. Drag the log sheet to pan when zoomed in.
            </div>
          </div>

          <button
            onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            disabled={activeIndex === 0}
            className={`${theme.pill} h-10 px-3`}
          >
            Prev
          </button>

          <span className={theme.pill}>
            Sheet {activeIndex + 1} of {logs.length}
          </span>

          <button
            onClick={() =>
              setActiveIndex((i) => Math.min(logs.length - 1, i + 1))
            }
            disabled={activeIndex === logs.length - 1}
            className={`${theme.pill} h-10 px-3`}
          >
            Next
          </button>

          <div className="flex items-center gap-2 rounded-md border border-[#d9e0e8] bg-[#f8fafc] p-1.5">
            <button
              onClick={zoomOut}
              disabled={zoom <= MIN_ZOOM}
              className={theme.pill}
            >
              -
            </button>

            <span className="min-w-12 text-center text-xs font-semibold text-[#3e4c59]">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={zoomIn}
              disabled={zoom >= MAX_ZOOM}
              className={theme.pill}
            >
              +
            </button>

            <button onClick={resetZoom} className={theme.button}>
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex min-w-0 justify-center">
        <DailyLogSheet
          log={activeLog}
          zoom={zoom}
          setZoom={setZoom}
          resetKey={resetKey}
        />
      </div>
    </section>
  );
}

/**
 * Daily log sheet renderer
 * 
 * Renders a single FMCSA-compliant driver daily log as an interactive SVG.
 * Implements:
 * - Ctrl + mouse wheel zoom with accumulation and smooth animation
 * - Click-and-drag panning with inertia scrolling
 * - Pinch-to-zoom on touch devices
 * - Double-click zoom in/out (Shift+click for zoom out)
 * - Center-on-zoom to maintain cursor position
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.log - Single log object with segments, remarks, day, totals
 * @param {number} props.zoom - Current zoom level
 * @param {Function} props.setZoom - Callback to update parent zoom state
 * @param {number} props.resetKey - Key to trigger re-centering
 * @returns {JSX.Element} Interactive scrollable SVG log viewer
 */
function DailyLogSheet({ log, zoom, setZoom, resetKey }) {
  // Container for scrollable content
  const containerRef = useRef(null);

  // Track latest zoom without re-rendering
  const latestZoomRef = useRef(zoom);

  // Accumulate wheel delta for smooth zoom
  const wheelDeltaRef = useRef(0);

  // Animation frame ID for wheel zoom
  const wheelRafRef = useRef(null);

  // Cursor position for Ctrl + wheel zoom anchoring.
  const wheelAnchorRef = useRef(null);

  const { theme } = useTheme();

  // Keep zoom ref in sync with state
  useEffect(() => {
    latestZoomRef.current = zoom;
  }, [zoom]);

  // Center on sheet changes and explicit reset; wheel zoom preserves the cursor anchor.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    centerSheet(container);
  }, [log.day, resetKey]);

  // Setup all interaction handlers (pan, zoom, pinch)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Pointer drag state
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let startScrollTop = 0;

    // Velocity tracking for inertia
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let velocityX = 0;
    let velocityY = 0;

    // Animation frame IDs
    let dragRafId = null;
    let inertiaRafId = null;

    // Pinch-to-zoom state
    let pinchStartDistance = null;
    let pinchStartZoom = null;

    /**
     * Cancel ongoing inertia animation
     */
    function stopInertia() {
      if (inertiaRafId) {
        cancelAnimationFrame(inertiaRafId);
        inertiaRafId = null;
      }
    }

    /**
     * Start inertia scrolling animation based on velocity
     */
    function startInertia() {
      const friction = 0.92;      // Deceleration per frame
      const minVelocity = 0.15;   // Stop below this threshold

      /**
       * Animation step for inertia scrolling
       */
      function step() {
        // Apply friction deceleration
        velocityX *= friction;
        velocityY *= friction;

        // Update scroll position
        container.scrollLeft -= velocityX;
        container.scrollTop -= velocityY;

        // Continue if velocity is significant
        if (
          Math.abs(velocityX) > minVelocity ||
          Math.abs(velocityY) > minVelocity
        ) {
          inertiaRafId = requestAnimationFrame(step);
        }
      }

      inertiaRafId = requestAnimationFrame(step);
    }

    /**
     * Calculate distance between two touch points
     * @param {TouchList} touches - Touch points
     * @returns {number} Distance in pixels
     */
    function getTouchDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    }

    /**
     * Zoom from the viewport center so the log remains visually centered.
     * @param {number} targetZoom - Target zoom level
     */
    function zoomFromCenter(targetZoom) {
      const nextZoom = clampZoom(targetZoom);

      setZoom(nextZoom);
      latestZoomRef.current = nextZoom;
      centerSheet(container);
    }

    /**
     * Zoom while preserving the content point currently under the mouse cursor.
     * @param {number} nextZoom - Zoom level after the wheel step
     */
    function zoomAtCursor(nextZoom) {
      const anchor = wheelAnchorRef.current;
      const currentZoom = latestZoomRef.current;

      if (!anchor) {
        setZoom(nextZoom);
        latestZoomRef.current = nextZoom;
        centerSheet(container);
        return;
      }

      const contentX = (container.scrollLeft + anchor.x) / currentZoom;
      const contentY = (container.scrollTop + anchor.y) / currentZoom;

      setZoom(nextZoom);
      latestZoomRef.current = nextZoom;

      requestAnimationFrame(() => {
        container.scrollLeft = contentX * nextZoom - anchor.x;
        container.scrollTop = contentY * nextZoom - anchor.y;
      });
    }

    /**
     * Mouse down - start dragging
     */
    function onPointerDown(event) {
      if (event.button !== 0) return;          // Only left mouse button
      if (event.pointerType === "touch") return; // Use touch handlers instead

      event.preventDefault();
      stopInertia();

      isDragging = true;
      startX = event.clientX;
      startY = event.clientY;
      startScrollLeft = container.scrollLeft;
      startScrollTop = container.scrollTop;

      lastX = event.clientX;
      lastY = event.clientY;
      lastTime = performance.now();
      velocityX = 0;
      velocityY = 0;

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
      container.style.cursor = "grabbing";
    }

    /**
     * Mouse move - update pan and velocity
     */
    function onPointerMove(event) {
      if (!isDragging) return;
      event.preventDefault();

      const now = performance.now();
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      // Calculate velocity (pixels per 16ms frame)
      const dt = now - lastTime || 16;
      velocityX = ((event.clientX - lastX) / dt) * 16;
      velocityY = ((event.clientY - lastY) / dt) * 16;

      lastX = event.clientX;
      lastY = event.clientY;
      lastTime = now;

      if (dragRafId) cancelAnimationFrame(dragRafId);

      dragRafId = requestAnimationFrame(() => {
        container.scrollLeft = startScrollLeft - deltaX;
        container.scrollTop = startScrollTop - deltaY;
      });
    }

    /**
     * Mouse up - end dragging and potentially start inertia
     */
    function onPointerUp() {
      if (!isDragging) return;

      isDragging = false;

      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      container.style.cursor = "grab";

      // Start inertia if velocity is significant
      if (Math.abs(velocityX) > 0.5 || Math.abs(velocityY) > 0.5) {
        startInertia();
      }
    }

    /**
     * Mouse wheel - accumulate delta and smoothly zoom
     */
    function onWheel(event) {
      if (!event.ctrlKey) return;

      event.preventDefault();

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      wheelAnchorRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      // Accumulate wheel delta for smooth zooming across multiple frames
      wheelDeltaRef.current += event.deltaY;

      if (wheelRafRef.current) return; // Already animating - add to accumulator

      /**
       * Animate zoom based on accumulated wheel delta
       */
      function animate() {
        const currentZoom = latestZoomRef.current;

        // Consume a portion of accumulated delta to smooth out zoom
        const delta = wheelDeltaRef.current * 0.15;
        wheelDeltaRef.current -= delta;

        // Exponential zoom for natural feel
        const zoomFactor = Math.exp(-delta * ZOOM_INTENSITY);
        const nextZoom = clampZoom(currentZoom * zoomFactor);

        zoomAtCursor(nextZoom);

        // Continue animation if delta remains significant
        if (Math.abs(wheelDeltaRef.current) > 0.1) {
          wheelRafRef.current = requestAnimationFrame(animate);
        } else {
          wheelDeltaRef.current = 0;
          wheelRafRef.current = null;
          wheelAnchorRef.current = null;
        }
      }

      wheelRafRef.current = requestAnimationFrame(animate);
    }

    /**
     * Double-click to zoom in at cursor
     * Shift+double-click to zoom out
     */
    function onDoubleClick(event) {
      event.preventDefault();
      stopInertia();

      const targetZoom = event.shiftKey
        ? latestZoomRef.current / 1.6
        : latestZoomRef.current * 1.6;
      zoomFromCenter(targetZoom);
    }

    /**
     * Multi-touch start - prepare for pinch-to-zoom
     */
    function onTouchStart(event) {
      if (event.touches.length !== 2) return; // Only pinch gesture

      stopInertia();

      pinchStartDistance = getTouchDistance(event.touches);
      pinchStartZoom = latestZoomRef.current;
    }

    /**
     * Multi-touch move - zoom based on distance change
     */
    function onTouchMove(event) {
      if (event.touches.length !== 2) return;
      if (!pinchStartDistance || !pinchStartZoom) return;

      event.preventDefault();

      const currentDistance = getTouchDistance(event.touches);
      const scale = currentDistance / pinchStartDistance; // Ratio of current to start distance
      const nextZoom = clampZoom(pinchStartZoom * scale);

      setZoom(nextZoom);
      latestZoomRef.current = nextZoom;
      centerSheet(container);
    }

    /**
     * Touch end - cleanup pinch state
     */
    function onTouchEnd() {
      pinchStartDistance = null;
      pinchStartZoom = null;
    }

    // Register all event listeners
    container.addEventListener("pointerdown", onPointerDown);

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("dblclick", onDoubleClick);

    container.addEventListener("touchstart", onTouchStart, { passive: false });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd);
    container.addEventListener("touchcancel", onTouchEnd);

    // Cleanup on unmount
    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("dblclick", onDoubleClick);

      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", onTouchEnd);

      if (dragRafId) cancelAnimationFrame(dragRafId);
      if (inertiaRafId) cancelAnimationFrame(inertiaRafId);
    };
  }, [setZoom]); // Only re-attach listeners if setZoom changes

  return (
    <div className="relative w-full min-w-0 overflow-hidden">
      <div
        ref={containerRef}
        className={`no-scrollbar h-[75vh] min-h-110 w-full min-w-0 cursor-grab overflow-auto overscroll-contain ${theme.mutedCard}`}
        style={{
          userSelect: "none",
          touchAction: "pan-x pan-y",
        }}
      >
        <div
          style={{
            width: `${SHEET_VIEWBOX.width * zoom}px`,
            height: `${SHEET_VIEWBOX.height * zoom}px`,
            minWidth: "100%",
            minHeight: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            viewBox={`${SHEET_VIEWBOX.x} ${SHEET_VIEWBOX.y} ${SHEET_VIEWBOX.width} ${SHEET_VIEWBOX.height}`}
            style={{
              width: `${SHEET_VIEWBOX.width * zoom}px`,
              height: `${SHEET_VIEWBOX.height * zoom}px`,
              maxWidth: "none",
              background: "var(--surface, white)"
            }}
            className="rounded-xl shadow-sm"
          >
          <rect
          x={INNER_SHEET.x}
          y={INNER_SHEET.y}
          width={INNER_SHEET.width}
          height={INNER_SHEET.height}
          fill="white"
          stroke="currentColor"
          strokeWidth="1.4"
        />

        <text x="122" y="112" fontSize="9" fontFamily="serif">
          U.S. DEPARTMENT OF TRANSPORTATION
        </text>

        <text
          x="450"
          y="103"
          textAnchor="middle"
          fontSize="18"
          fontWeight="800"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          DRIVER'S DAILY LOG
        </text>

        <text
          x="450"
          y="119"
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          (ONE CALENDAR DAY - 24 HOURS)
        </text>

        <text
          x="590"
          y="108"
          fontSize="8"
          fontWeight="700"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          ORIGINAL - Submit to carrier within 13 days
        </text>

        <text
          x="590"
          y="121"
          fontSize="8"
          fontWeight="700"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          DUPLICATE - Driver retains possession for eight days
        </text>

        <line x1="122" y1="148" x2="270" y2="148" stroke="currentColor" />
        <line x1="300" y1="148" x2="450" y2="148" stroke="currentColor" />
        <line x1="652" y1="148" x2="790" y2="148" stroke="currentColor" />

        <text x="137" y="158" fontSize="7" fontWeight="700">
          (MONTH)
        </text>
        <text x="190" y="158" fontSize="7" fontWeight="700">
          (DAY)
        </text>
        <text x="232" y="158" fontSize="7" fontWeight="700">
          YEAR
        </text>
        <text x="313" y="158" fontSize="7" fontWeight="700">
          (TOTAL MILES DRIVING TODAY)
        </text>
        <text x="653" y="158" fontSize="7" fontWeight="700">
          VEHICLE NUMBERS - (SHOW EACH UNIT)
        </text>

        <line x1="122" y1="200" x2="452" y2="200" stroke="currentColor" />
        <line x1="485" y1="200" x2="790" y2="200" stroke="currentColor" />

        <text x="250" y="209" fontSize="7" fontWeight="700">
          (NAME OF CARRIER OR CARRIERS)
        </text>

        <text x="590" y="176" fontSize="8">
          I certify that these entries are true and correct
        </text>

        <text x="595" y="209" fontSize="7" fontWeight="700">
          (DRIVER'S SIGNATURE IN FULL)
        </text>

        <line x1="122" y1="236" x2="452" y2="236" stroke="currentColor" />
        <line x1="485" y1="236" x2="790" y2="236" stroke="currentColor" />

        <text x="235" y="245" fontSize="7" fontWeight="700">
          (MAIN OFFICE ADDRESS)
        </text>

        <text x="638" y="245" fontSize="7" fontWeight="700">
          (NAME OF CO-DRIVER)
        </text>

        <text x="645" y="227" fontSize="12">
          —
        </text>

        <text x="780" y="248" fontSize="7" fontWeight="700">
          TOTAL
        </text>
        <text x="780" y="257" fontSize="7" fontWeight="700">
          HOURS
        </text>

        <text x="135" y="142" fontSize="12" fontWeight="600">
          Day {log.day}
        </text>

        <text x="350" y="142" fontSize="12" fontWeight="600">
          Auto
        </text>

        <text x="672" y="142" fontSize="12" fontWeight="600">
          Truck / Trailer
        </text>

        <text x="220" y="193" fontSize="12" fontWeight="600">
          Demo Carrier
        </text>

        <text x="575" y="193" fontSize="12" fontWeight="600">
          Driver Signature
        </text>

        <text x="250" y="229" fontSize="12" fontWeight="600">
          Main Office Address
        </text>

        <GraphGrid log={log} />

        <line x1="776" y1="296" x2="820" y2="296" stroke="currentColor" />
        <line x1="776" y1="332" x2="820" y2="332" stroke="currentColor" />
        <line x1="776" y1="368" x2="820" y2="368" stroke="currentColor" />
        <line x1="776" y1="404" x2="820" y2="404" stroke="currentColor" />
        <line x1="776" y1="440" x2="820" y2="440" stroke="currentColor" />
        <line x1="776" y1="470" x2="820" y2="470" stroke="currentColor" />

        <TotalText y="320" value={log.totals.OFF_DUTY} />
        <TotalText y="356" value={log.totals.SLEEPER_BERTH} />
        <TotalText y="392" value={log.totals.DRIVING} />
        <TotalText y="428" value={log.totals.ON_DUTY} />
        <TotalText y="462" value="= 24" />

        <rect
          x="186"
          y="495"
          width="590"
          height="108"
          fill="white"
          stroke="currentColor"
          strokeWidth="1.1"
        />

        <text
          x="115"
          y="485"
          fontSize="12"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          REMARKS
        </text>

        <text
          x="194"
          y="540"
          fontSize="7"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          Pro or Shipping No.
        </text>

        <line x1="260" y1="540" x2="330" y2="540" stroke="currentColor" />

        {log.remarks.slice(0, 5).map((remark, index) => (
          <text
            key={index}
            x="350"
            y={525 + index * 16}
            fontSize="10"
            fontFamily="Arial, Helvetica, sans-serif"
          >
            {remark}
          </text>
        ))}
        </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * Duty-status graph grid
 * 
 * Renders the duty status grid within an ELD log sheet.
 * Includes:
 * - 24-hour timeline labels (top and bottom)
 * - Row labels for each duty status
 * - Grid structure with hour and quarter-hour tick marks
 * - Duty segments as colored line plots
 * - Time scale below the grid
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.log - Log object containing segments array
 * @returns {JSX.Element} SVG elements for the grid
 */
function GraphGrid({ log }) {
  const dutyPath = log.segments
    .map((segment, index) => {
      const x1 = getX(segment.start);
      const x2 = getX(segment.end);
      const y = ROW_Y[segment.status];

      if (index === 0) {
        return `M ${x1} ${y} L ${x2} ${y}`;
      }

      return `L ${x1} ${y} L ${x2} ${y}`;
    })
    .join(" ");

  return (
    <>
      {/* Top hour labels (midnight to 23:00) */}
      <text x={getX(0)} y="288" fontSize="7" textAnchor="middle">
        Midnight
      </text>

      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour) => (
        <text key={hour} x={getX(hour)} y="288" fontSize="7" textAnchor="middle">
          {hour}
        </text>
      ))}

      <text x={getX(12)} y="288" fontSize="7" textAnchor="middle">
        Noon
      </text>

      {[13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((hour) => (
        <text key={hour} x={getX(hour)} y="288" fontSize="7" textAnchor="middle">
          {hour}
        </text>
      ))}

      {/* Row labels (duty status identifiers) */}
      {ROWS.map((row, rowIndex) => (
        <text
          key={row.key}
          x="176"
          y={315 + rowIndex * 36}
          textAnchor="end"
          fontSize="9"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          {row.label.map((line, index) => (
            <tspan key={line} x="176" dy={index === 0 ? 0 : 10}>
              {line}
            </tspan>
          ))}
        </text>
      ))}

      {/* Main grid border and structure */}
      <rect
        x={GRID.x}
        y={GRID.y}
        width={GRID.width}
        height={GRID.rowHeight * 4}
        fill="white"
        stroke="#111"
        strokeWidth="1.2"
      />

      {/* Horizontal row dividers */}
      {[1, 2, 3].map((i) => (
        <line
          key={i}
          x1={GRID.x}
          x2={GRID.x + GRID.width}
          y1={GRID.y + i * GRID.rowHeight}
          y2={GRID.y + i * GRID.rowHeight}
          stroke="#111"
          strokeWidth="1"
        />
      ))}

      {/* Vertical hour lines */}
      {Array.from({ length: 25 }).map((_, hour) => {
        const x = getX(hour);

        return (
          <line
            key={hour}
            x1={x}
            x2={x}
            y1={GRID.y}
            y2={GRID.y + GRID.rowHeight * 4}
            stroke="#111"
            strokeWidth="1"
          />
        );
      })}

      {/* Quarter-hour tick marks within each hour */}
      {Array.from({ length: 24 }).map((_, hour) =>
        [1, 2, 3].map((quarter) => {
          const x = getX(hour + quarter / 4);
          const tickLength = quarter === 2 ? 22 : 14;

          return ROWS.map((_, rowIndex) => {
            const y1 = GRID.y + rowIndex * GRID.rowHeight;

            return (
              <line
                key={`${hour}-${quarter}-${rowIndex}`}
                x1={x}
                x2={x}
                y1={y1}
                y2={y1 + tickLength}
                stroke="#111"
                strokeWidth="1"
              />
            );
          });
        })
      )}

      {/* Duty status segments plotted as one path for smooth joined corners. */}
      {dutyPath && (
        <path
          d={dutyPath}
          fill="none"
          stroke="#FF5E1A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Bottom hour labels (midnight to 23:00) - duplicated for continuous scrolling visual */}
      <text x={getX(0)} y="460" fontSize="7" textAnchor="middle">
        Midnight
      </text>

      {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour) => (
        <text key={hour} x={getX(hour)} y="460" fontSize="7" textAnchor="middle">
          {hour}
        </text>
      ))}

      <text x={getX(12)} y="460" fontSize="7" textAnchor="middle">
        Noon
      </text>

      {[13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((hour) => (
        <text key={hour} x={getX(hour)} y="460" fontSize="7" textAnchor="middle">
          {hour}
        </text>
      ))}

      {/* Bottom border and detailed time scale */}
      <line x1={GRID.x} y1="465" x2={GRID.x + GRID.width} y2="465" stroke="#111" />

      {/* Fine-grained time scale (quarter-hour increments) */}
      {Array.from({ length: 97 }).map((_, i) => {
        const hour = i / 4;
        const x = getX(hour);
        const isHour = i % 4 === 0;
        const isHalf = i % 2 === 0;

        return (
          <line
            key={i}
            x1={x}
            x2={x}
            y1="465"
            y2={isHour ? 490 : isHalf ? 484 : 478}
            stroke="#111"
            strokeWidth="1"
          />
        );
      })}
    </>
  );
}

/**
 * Duty total value
 * 
 * Renders a total hours value aligned with corresponding duty row
 * 
 * @component
 * @param {Object} props - Component props
 * @param {number} props.y - Y-coordinate for text position
 * @param {number|string} props.value - Hours value to display (number or string like "= 24")
 * @returns {JSX.Element} SVG text element
 */
function TotalText({ y, value }) {
  return (
    <text
      x="798"
      y={y}
      textAnchor="middle"
      fontSize="11"
      fontWeight="700"
      fontFamily="Arial, Helvetica, sans-serif"
    >
      {/* Display value or 0 if undefined */}
      {value ?? 0}
    </text>
  );
}
