/** Simple line icons (24x24, stroke based). */
const paths = {
  headset: "M4 13v-2a8 8 0 0 1 16 0v2M4 13h3v5H4zM17 13h3v5h-3zM20 18a4 4 0 0 1-4 4h-3",
  bank: "M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18",
  trend: "M3 17l6-6 4 4 8-8M15 7h6v6",
  monitor: "M3 5h18v11H3zM8 21h8M12 16v5",
  chat: "M4 5h16v11H9l-5 4z",
  people:
    "M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19v-1a3 3 0 0 0-2-2.8M16 5.2a3 3 0 0 1 0 5.6",
  file: "M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6",
  spark:
    "M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  shield: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6zM9 12l2 2 4-4",
  signal: "M5 20v-3M10 20v-7M15 20v-11M20 20V4",
  cart: "M3 4h2l2.4 11h11l2-8H6.2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2M18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10zM8 11h2l1-2 2 4 1-2h2",
  plane:
    "M10 14l-6-2 1-2 7 1 4-5a1.5 1.5 0 0 1 2 2l-5 4 1 7-2 1-2-6-3 3v2l-1.5.5L5 17l-2.5-1.5L3 14h2z",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21a2 2 0 0 1 2-2h13M8 7h7",
  home: "M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  phone:
    "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7v5l3 2",
  pin: "M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5",
  check: "M5 12l4.5 4.5L19 7",
  arrow: "M5 12h14M13 6l6 6-6 6",
  briefcase: "M3 8h18v12H3zM8 8V5h8v3M3 13h18",
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  className = "size-6",
  strokeWidth = 1.6,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}
