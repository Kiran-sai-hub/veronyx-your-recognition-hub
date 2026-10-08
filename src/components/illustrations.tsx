/**
 * Empty-state illustration set (checklist §10.7): one flat style, people from a diverse Indian
 * workforce across factory, retail, office and field settings, no religious or caste markers and
 * no gendered roles. Colours come from theme tokens so they work in light, dark and high contrast.
 */
export type IllustrationKind =
  "start" | "factory" | "retail" | "office" | "field" | "done" | "data" | "inbox";

const skin = ["#8d5524", "#c68642", "#e0ac69", "#a0663a", "#6b4226"];
const hair = ["#1f1a17", "#2d2420", "#3b2f2a", "#4a3b33"];

function Person({
  x,
  y,
  tone = 0,
  outfit = "var(--primary)",
  hairStyle = "short",
  helmet = false,
  scale = 1,
  arm = "down",
}: {
  x: number;
  y: number;
  tone?: number;
  outfit?: string;
  hairStyle?: "short" | "long" | "bun" | "covered";
  helmet?: boolean;
  scale?: number;
  arm?: "down" | "up" | "wave";
}) {
  const s = skin[tone % skin.length];
  const h = hair[tone % hair.length];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* body */}
      <rect x={-14} y={22} width={28} height={40} rx={12} fill={outfit} />
      {/* arms */}
      {arm === "down" && (
        <>
          <rect x={-20} y={26} width={8} height={28} rx={4} fill={outfit} />
          <rect x={12} y={26} width={8} height={28} rx={4} fill={outfit} />
        </>
      )}
      {arm === "up" && (
        <>
          <rect
            x={-22}
            y={2}
            width={8}
            height={30}
            rx={4}
            fill={outfit}
            transform="rotate(-20 -18 26)"
          />
          <rect
            x={14}
            y={2}
            width={8}
            height={30}
            rx={4}
            fill={outfit}
            transform="rotate(20 18 26)"
          />
          <circle cx={-26} cy={4} r={5} fill={s} />
          <circle cx={26} cy={4} r={5} fill={s} />
        </>
      )}
      {arm === "wave" && (
        <>
          <rect x={-20} y={26} width={8} height={28} rx={4} fill={outfit} />
          <rect
            x={14}
            y={4}
            width={8}
            height={28}
            rx={4}
            fill={outfit}
            transform="rotate(25 18 26)"
          />
          <circle cx={27} cy={6} r={5} fill={s} />
        </>
      )}
      {/* legs */}
      <rect x={-11} y={58} width={9} height={26} rx={4} fill="var(--foreground)" opacity={0.75} />
      <rect x={2} y={58} width={9} height={26} rx={4} fill="var(--foreground)" opacity={0.75} />
      {/* head */}
      {hairStyle === "long" && <rect x={-13} y={-2} width={26} height={30} rx={12} fill={h} />}
      <circle cx={0} cy={8} r={12} fill={s} />
      {hairStyle === "short" && <path d="M-12 6 a12 12 0 0 1 24 0 q-12 -6 -24 0z" fill={h} />}
      {hairStyle === "long" && <path d="M-12 7 a12 12 0 0 1 24 0 q-12 -7 -24 0z" fill={h} />}
      {hairStyle === "bun" && (
        <>
          <circle cx={0} cy={-6} r={6} fill={h} />
          <path d="M-12 6 a12 12 0 0 1 24 0 q-12 -6 -24 0z" fill={h} />
        </>
      )}
      {hairStyle === "covered" && (
        <path d="M-13 9 a13 13 0 0 1 26 0 l0 -2 q-13 -14 -26 0z" fill="var(--reward)" />
      )}
      {helmet && (
        <>
          <path d="M-14 4 a14 13 0 0 1 28 0z" fill="#f2b705" />
          <rect x={-16} y={3} width={32} height={3} rx={1.5} fill="#d99e00" />
        </>
      )}
    </g>
  );
}

const ground = <rect x={10} y={150} width={220} height={6} rx={3} fill="var(--muted)" />;

function Scene({ kind }: { kind: IllustrationKind }) {
  switch (kind) {
    case "factory":
      return (
        <>
          {ground}
          <rect x={120} y={84} width={90} height={66} rx={6} fill="var(--muted)" />
          <rect x={132} y={96} width={30} height={20} rx={3} fill="var(--primary)" opacity={0.25} />
          <circle cx={186} cy={106} r={10} fill="none" stroke="var(--primary)" strokeWidth={4} />
          <rect
            x={126}
            y={126}
            width={78}
            height={6}
            rx={3}
            fill="var(--foreground)"
            opacity={0.3}
          />
          <Person x={62} y={66} tone={0} outfit="#2f6db5" helmet />
          <Person x={102} y={74} tone={2} outfit="#2f6db5" hairStyle="bun" helmet scale={0.9} />
        </>
      );
    case "retail":
      return (
        <>
          {ground}
          <rect x={30} y={104} width={120} height={46} rx={6} fill="var(--muted)" />
          <rect x={44} y={70} width={22} height={34} rx={3} fill="var(--reward)" opacity={0.6} />
          <rect x={72} y={80} width={22} height={24} rx={3} fill="var(--success)" opacity={0.5} />
          <Person x={180} y={66} tone={1} outfit="var(--reward)" hairStyle="long" arm="wave" />
          <Person x={112} y={58} tone={3} outfit="#7c5cbf" scale={0.75} />
        </>
      );
    case "office":
      return (
        <>
          {ground}
          <rect
            x={92}
            y={110}
            width={110}
            height={8}
            rx={4}
            fill="var(--foreground)"
            opacity={0.5}
          />
          <rect x={150} y={80} width={40} height={28} rx={3} fill="var(--primary)" opacity={0.3} />
          <Person x={70} y={66} tone={4} outfit="#3f8f6b" hairStyle="short" />
          <Person
            x={124}
            y={70}
            tone={2}
            outfit="var(--primary)"
            hairStyle="covered"
            scale={0.92}
          />
        </>
      );
    case "field":
      return (
        <>
          {ground}
          <circle
            cx={170}
            cy={136}
            r={14}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth={4}
            opacity={0.6}
          />
          <circle
            cx={214}
            cy={136}
            r={14}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth={4}
            opacity={0.6}
          />
          <path d="M170 136 L190 116 L214 136" fill="none" stroke="var(--reward)" strokeWidth={5} />
          <Person x={100} y={66} tone={1} outfit="#c2513a" arm="wave" />
          <rect x={124} y={68} width={10} height={16} rx={2} fill="var(--foreground)" />
        </>
      );
    case "done":
      return (
        <>
          {ground}
          <circle cx={120} cy={56} r={26} fill="var(--success)" opacity={0.18} />
          <path
            d="M108 56 l9 9 l17 -19"
            fill="none"
            stroke="var(--success)"
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Person x={60} y={66} tone={3} outfit="var(--primary)" arm="up" hairStyle="long" />
          <Person x={180} y={66} tone={0} outfit="var(--reward)" arm="up" helmet />
        </>
      );
    case "data":
      return (
        <>
          {ground}
          <rect x={110} y={40} width={110} height={90} rx={8} fill="var(--muted)" />
          <rect x={126} y={96} width={14} height={24} rx={2} fill="var(--primary)" opacity={0.5} />
          <rect x={148} y={80} width={14} height={40} rx={2} fill="var(--primary)" opacity={0.7} />
          <rect x={170} y={64} width={14} height={56} rx={2} fill="var(--primary)" />
          <rect x={192} y={88} width={14} height={32} rx={2} fill="var(--reward)" />
          <Person x={70} y={66} tone={2} outfit="#3f8f6b" hairStyle="bun" arm="wave" />
        </>
      );
    case "inbox":
      return (
        <>
          {ground}
          <rect x={80} y={70} width={80} height={60} rx={8} fill="var(--muted)" />
          <path
            d="M80 92 h22 l8 12 h20 l8 -12 h22"
            fill="none"
            stroke="var(--foreground)"
            strokeWidth={4}
            opacity={0.4}
          />
          <Person x={44} y={66} tone={4} outfit="#7c5cbf" scale={0.85} />
          <Person
            x={196}
            y={66}
            tone={1}
            outfit="var(--primary)"
            hairStyle="long"
            scale={0.85}
            arm="wave"
          />
        </>
      );
    default:
      return (
        <>
          {ground}
          <circle cx={120} cy={40} r={8} fill="var(--reward)" />
          <circle cx={96} cy={28} r={5} fill="var(--primary)" />
          <circle cx={146} cy={26} r={5} fill="var(--success)" />
          <Person x={60} y={66} tone={0} outfit="#2f6db5" helmet arm="wave" />
          <Person x={120} y={66} tone={2} outfit="var(--reward)" hairStyle="long" arm="up" />
          <Person x={180} y={66} tone={4} outfit="#3f8f6b" hairStyle="short" arm="wave" />
        </>
      );
  }
}

export const illustrationKinds: { kind: IllustrationKind; label: string }[] = [
  { kind: "start", label: "Getting started — factory, retail and office teams" },
  { kind: "factory", label: "Factory line" },
  { kind: "retail", label: "Retail counter" },
  { kind: "office", label: "Office" },
  { kind: "field", label: "Field sales" },
  { kind: "done", label: "All caught up" },
  { kind: "data", label: "Waiting for data" },
  { kind: "inbox", label: "Empty inbox" },
];

export function EmptyIllustration({
  kind,
  className,
}: {
  kind: IllustrationKind;
  className?: string | undefined;
}) {
  return (
    <svg viewBox="0 0 240 160" className={className} aria-hidden="true" focusable="false">
      <Scene kind={kind} />
    </svg>
  );
}
