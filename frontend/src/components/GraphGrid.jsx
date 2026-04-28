/**
 * Driver duty status rows for the ELD graph grid
 * Each row represents a distinct driver activity state
 */
const ROWS = [
  { key: "OFF_DUTY", label: ["Off", "Duty"] },
  { key: "SLEEPER_BERTH", label: ["Sleeper", "Berth"] },
  { key: "DRIVING", label: ["Driving"] },
  { key: "ON_DUTY", label: ["On Duty", "(Not", "Driving)"] },
];

/**
 * Hour labels for the 24-hour timeline
 * Uses 12-hour naming convention (Midnight, Noon) for readability
 */
const HOURS = [
  "Midnight",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "Noon",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
];

/**
 * SVG layout dimensions and positioning constants
 * All values are in pixels for precise SVG rendering
 */
const SVG = {
  width: 1480,      // Total SVG canvas width
  height: 560,      // Total SVG canvas height
  titleX: 32,       // Horizontal position for title
  titleY: 40,       // Vertical position for title
  labelX: 115,      // X position for row labels
  gridX: 150,       // Left edge of the grid
  gridY: 80,        // Top edge of the grid
  gridW: 1260,      // Width of the grid area
  rowH: 78,         // Height of each status row
  remarksH: 160,    // Height of remarks section
};

/** Width of each hour column (calculates grid width divided by 24 hours) */
const hourW = SVG.gridW / 24;

/**
 * GraphGrid Component
 * 
 * Renders a visual representation of driver duty status over a 24-hour period.
 * Creates an ELD (Electronic Logging Device) compliant graph showing:
 * - Off duty, sleeper berth, driving, and on-duty (not driving) time blocks
 * - Hour-by-hour timeline with 15-minute tick marks
 * - Remarks section for additional driver notes
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array<Object>} [props.segments=[]] - Duty status segments
 *        @param {string} segments[].status - One of: OFF_DUTY, SLEEPER_BERTH, DRIVING, ON_DUTY
 *        @param {number} segments[].start - Start time (0-24 hour decimal)
 *        @param {number} segments[].end - End time (0-24 hour decimal)
 * @param {Array<string>} [props.remarks=[]] - Driver remarks (max 6 displayed)
 * @returns {JSX.Element} SVG-based graph grid component
 * 
 * @example
 * const segments = [
 *   { status: "OFF_DUTY", start: 0, end: 8 },
 *   { status: "DRIVING", start: 8, end: 15 },
 * ];
 * <GraphGrid segments={segments} remarks={["Started at 8am"]} />
 */
export default function GraphGrid({ segments = [], remarks = [] }) {
  return (
    <section className="w-full overflow-x-auto rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <svg
        viewBox={`0 0 ${SVG.width} ${SVG.height}`}
        className="min-w-275 w-full"
        role="img"
        aria-label="Driver daily log graph grid"
      >
        {/* <text
          x={SVG.titleX}
          y={SVG.titleY}
          fontSize="34"
          fontWeight="800"
          fill="#0874b9"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          The Graph Grid
        </text> */}

        <HourLabels />

        <RowLabels />

        <GridLines />

        <DutySegments segments={segments} />

        <Remarks remarks={remarks} />
      </svg>
    </section>
  );
}

/**
 * Hour labels
 * 
 * Renders the 24-hour timeline labels at the top of the graph grid.
 * Special positioning for "Midnight" label to center it properly.
 * 
 * @returns {JSX.Element} SVG text elements for hour labels
 */
function HourLabels() {
  return (
    <>
      {HOURS.map((hour, index) => {
        const actualHour = index === 0 ? 0 : index + 1;
        const x = SVG.gridX + actualHour * hourW;

        return (
          <text
            key={hour}
            // Special offset for "Midnight" label for better visual alignment
            x={hour === "Midnight" ? x + 30 : x}
            y={SVG.gridY - 10}
            textAnchor="middle"
            fontSize="15"
            fontWeight="400"
            fill="#222"
            fontFamily="Arial, Helvetica, sans-serif"
          >
            {hour}
          </text>
        );
      })}
    </>
  );
}

/**
 * Duty-status row labels
 * 
 * Renders the left-side labels for each driver status row and the remarks section.
 * Handles multi-line labels by positioning each line vertically.
 * 
 * @returns {JSX.Element} SVG text elements for status row labels
 */
function RowLabels() {
  return (
    <>
      {ROWS.map((row, index) => {
        // Center text vertically within the row height
        const centerY = SVG.gridY + index * SVG.rowH + SVG.rowH / 2;

        return (
          <text
            key={row.key}
            x={SVG.labelX}
            // Adjust starting Y position to account for multi-line labels
            y={centerY - (row.label.length - 1) * 11}
            textAnchor="end"
            fontSize="22"
            fontWeight="400"
            fill="#222"
            fontFamily="Arial, Helvetica, sans-serif"
          >
            {/* Render each label line independently for proper positioning */}
            {row.label.map((line, lineIndex) => (
              <tspan
                key={line}
                x={SVG.labelX}
                dy={lineIndex === 0 ? 0 : 23}
              >
                {line}
              </tspan>
            ))}
          </text>
        );
      })}

      {/* Remarks section label */}
      <text
        x={SVG.labelX}
        y={SVG.gridY + SVG.rowH * 4 + 28}
        textAnchor="end"
        fontSize="24"
        fontWeight="400"
        fill="#222"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        REMARKS
      </text>
    </>
  );
}

/**
 * Grid lines
 * 
 * Renders the complete grid structure including:
 * - Border rectangle defining the graph boundaries
 * - Horizontal lines separating each status row
 * - Vertical lines for each hour
 * - Quarter-hour tick marks (with 30-minute ticks emphasized)
 * - Bottom line for remarks section
 * 
 * @returns {JSX.Element} SVG line and rectangle elements for grid
 */
function GridLines() {
  const gridBottom = SVG.gridY + SVG.rowH * 4;
  const remarksBottom = gridBottom + SVG.remarksH;

  return (
    <>
      {/* Main border rectangle */}
      <rect
        x={SVG.gridX}
        y={SVG.gridY}
        width={SVG.gridW}
        height={SVG.rowH * 4 + SVG.remarksH}
        fill="white"
        stroke="#111"
        strokeWidth="2.5"
      />

      {/* Horizontal row dividers - separates each duty status row */}
      {[1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1={SVG.gridX}
          x2={SVG.gridX + SVG.gridW}
          y1={SVG.gridY + i * SVG.rowH}
          y2={SVG.gridY + i * SVG.rowH}
          stroke="#111"
          strokeWidth="2.5"
        />
      ))}

      {/* Vertical hour lines - creates 24-column grid */}
      {Array.from({ length: 25 }).map((_, hour) => {
        const x = SVG.gridX + hour * hourW;

        return (
          <line
            key={hour}
            x1={x}
            x2={x}
            y1={SVG.gridY}
            y2={gridBottom}
            stroke="#111"
            strokeWidth="2.5"
          />
        );
      })}

      {/* Quarter-hour tick marks within each hour column */}
      {Array.from({ length: 24 }).map((_, hour) => {
        return [1, 2, 3].map((quarter) => {
          const x = SVG.gridX + hour * hourW + (quarter * hourW) / 4;
          // 30-minute mark (middle quarter) is longer for emphasis
          const tickLength = quarter === 2 ? 38 : 20;

          return ROWS.map((_, rowIndex) => {
            const y1 = SVG.gridY + rowIndex * SVG.rowH;
            const y2 = y1 + tickLength;

            return (
              <line
                key={`${hour}-${quarter}-${rowIndex}`}
                x1={x}
                x2={x}
                y1={y1}
                y2={y2}
                stroke="#111"
                strokeWidth="2"
              />
            );
          });
        });
      })}

      {/* Bottom border for remarks section */}
      <line
        x1={SVG.gridX}
        x2={SVG.gridX + SVG.gridW}
        y1={remarksBottom}
        y2={remarksBottom}
        stroke="#111"
        strokeWidth="2.5"
      />
    </>
  );
}

/**
 * Duty segments
 * 
 * Renders the driver's duty status segments as colored line segments on the graph.
 * Each segment spans from start to end time and is positioned along its corresponding row.
 * Vertical connector lines are drawn when transitioning between different duty statuses.
 * 
 * @param {Object} props - Component props
 * @param {Array<Object>} props.segments - Array of duty status segments
 * @returns {JSX.Element} SVG line elements representing duty segments
 */
function DutySegments({ segments }) {
  // Map each duty status to its row's vertical center position
  const rowCenter = {
    OFF_DUTY: SVG.gridY + SVG.rowH * 0 + SVG.rowH / 2,
    SLEEPER_BERTH: SVG.gridY + SVG.rowH * 1 + SVG.rowH / 2,
    DRIVING: SVG.gridY + SVG.rowH * 2 + SVG.rowH / 2,
    ON_DUTY: SVG.gridY + SVG.rowH * 3 + SVG.rowH / 2,
  };

  return (
    <>
      {segments.map((segment, index) => {
        // Calculate x-coordinates based on time (0-24 hour scale)
        const x1 = SVG.gridX + (segment.start / 24) * SVG.gridW;
        const x2 = SVG.gridX + (segment.end / 24) * SVG.gridW;
        const y = rowCenter[segment.status];

        // Get previous segment to draw vertical connector line
        const previous = segments[index - 1];
        const previousY = previous ? rowCenter[previous.status] : y;

        return (
          <g key={index}>
            {/* Vertical connector line when duty status changes */}
            {previous && (
              <line
                x1={x1}
                x2={x1}
                y1={previousY}
                y2={y}
                stroke="#0874b9"
                strokeWidth="4"
              />
            )}

            {/* Horizontal segment line for the duty period */}
            <line
              x1={x1}
              x2={x2}
              y1={y}
              y2={y}
              stroke="#0874b9"
              strokeWidth="5"
              strokeLinecap="square"
            />
          </g>
        );
      })}
    </>
  );
}

/**
 * Driver remarks
 * 
 * Renders driver remarks text in the bottom section of the graph.
 * Only displays the first 6 remarks to fit within the remarks section height.
 * 
 * @param {Object} props - Component props
 * @param {Array<string>} props.remarks - Array of remark strings to display
 * @returns {JSX.Element} SVG text elements for remarks
 */
function Remarks({ remarks }) {
  const startY = SVG.gridY + SVG.rowH * 4 + 35;

  return (
    <>
      {/* Limit display to 6 remarks to prevent overflow */}
      {remarks.slice(0, 6).map((remark, index) => (
        <text
          key={index}
          x={SVG.gridX + 20}
          y={startY + index * 22}
          fontSize="17"
          fontWeight="400"
          fill="#222"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          {remark}
        </text>
      ))}
    </>
  );
}
