type StatusColor = "green" | "yellow" | "red" | "blue" | "gray" | "amber" | "orange";

const DOT_COLORS: Record<StatusColor, string> = {
 green: "bg-positive",
 yellow: "bg-attention",
 red: "bg-critical",
 blue: "bg-info",
 gray: "bg-ink-3",
 amber: "bg-ink",
 orange: "bg-ink",
};

const RING_COLORS: Record<StatusColor, string> = {
 green: "ring-positive/30",
 yellow: "ring-attention/30",
 red: "ring-critical/30",
 blue: "ring-info/30",
 gray: "ring-line",
 amber: "ring-brand/40",
 orange: "ring-brand/40",
};

interface Props {
 color: StatusColor;
 pulse?: boolean;
 size?: "sm" | "md";
}

export default function StatusDot({ color, pulse = false, size = "sm" }: Props) {
 const sizeClass = size === "md" ? "h-2.5 w-2.5" : "h-2 w-2";

 return (
 <span className={`relative inline-flex shrink-0 ${sizeClass}`}>
 {pulse && (
 <span className={`absolute inline-flex h-full w-full rounded-full ${DOT_COLORS[color]} opacity-50 animate-ping`} />
 )}
 <span className={`relative inline-flex ${sizeClass} rounded-full ${DOT_COLORS[color]} ring-2 ${RING_COLORS[color]}`} />
 </span>
 );
}
