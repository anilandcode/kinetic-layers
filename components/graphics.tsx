/**
 * Every visual on the site, drawn from palette tokens.
 *
 * No raster file, no icon set, no third-party asset — so there is nothing to
 * licence and no request leaves the origin. The shared <defs> live in the hero
 * and are referenced by id from the bento visuals below it.
 */

export function HeroFigure() {
  return (
    <svg
      viewBox="0 0 640 480"
      role="img"
      aria-label="Three layered panels rising along an arc, representing stacked design directions."
    >
      <defs>
        <linearGradient id="planeA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#35e0a1" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#35e0a1" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="planeB" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#38d3ee" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="arcG" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="55%" stopColor="#38d3ee" />
          <stop offset="100%" stopColor="#35e0a1" />
        </linearGradient>
        <radialGradient id="bloom" cx="0.72" cy="0.22" r="0.55">
          <stop offset="0%" stopColor="#35e0a1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#35e0a1" stopOpacity="0" />
        </radialGradient>
        <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="1.4" cy="1.4" r="1.4" fill="#2f353f" opacity="0.55" />
        </pattern>
      </defs>

      <rect width="640" height="480" fill="#0b0d10" />
      <rect width="640" height="480" fill="url(#dots)" />
      <rect width="640" height="480" fill="url(#bloom)" />

      <g>
        <rect x="66" y="268" width="336" height="132" rx="16" fill="url(#planeA)" stroke="#2f353f" />
        <rect x="124" y="188" width="336" height="132" rx="16" fill="url(#planeA)" stroke="#2f353f" />
        <rect
          x="182"
          y="108"
          width="336"
          height="132"
          rx="16"
          fill="url(#planeB)"
          stroke="#a78bfa"
          strokeOpacity="0.4"
        />
      </g>

      <g fill="#f2f4f6" opacity="0.5">
        <rect x="208" y="136" width="120" height="9" rx="4.5" />
        <rect x="208" y="158" width="196" height="7" rx="3.5" />
        <rect x="208" y="175" width="156" height="7" rx="3.5" />
      </g>
      <rect x="208" y="197" width="88" height="24" rx="12" fill="#35e0a1" />

      <path
        d="M56 414C186 414 302 314 358 216 402 138 470 100 578 106"
        fill="none"
        stroke="url(#arcG)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="7 9"
      />
      <circle cx="56" cy="414" r="7.5" fill="#a78bfa" />
      <circle cx="578" cy="106" r="7.5" fill="#35e0a1" />
    </svg>
  );
}

export function SamenessViz() {
  return (
    <svg viewBox="0 0 320 180" role="img" aria-label="A row of near-identical generic layouts.">
      <rect width="320" height="180" fill="#08090b" />
      <g stroke="#2f353f" fill="#101318">
        <rect x="14" y="34" width="66" height="112" rx="7" />
        <rect x="94" y="34" width="66" height="112" rx="7" />
        <rect x="174" y="34" width="66" height="112" rx="7" />
        <rect x="254" y="34" width="66" height="112" rx="7" />
      </g>
      <g fill="#3c434f">
        {[14, 94, 174, 254].map((x) => (
          <g key={x}>
            <rect x={x + 10} y="48" width="40" height="7" rx="3.5" />
            <rect x={x + 10} y="62" width="30" height="5" rx="2.5" />
            <rect x={x + 10} y="120" width="26" height="12" rx="6" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function DirectionViz() {
  return (
    <svg
      viewBox="0 0 640 180"
      role="img"
      aria-label="Layered panels converging on a single marked conversion point."
    >
      <rect width="640" height="180" fill="#08090b" />
      <rect width="640" height="180" fill="url(#dots)" />
      <g>
        <rect x="40" y="96" width="200" height="66" rx="10" fill="#35e0a1" fillOpacity="0.07" stroke="#2f353f" />
        <rect x="76" y="60" width="200" height="66" rx="10" fill="#35e0a1" fillOpacity="0.09" stroke="#2f353f" />
        <rect
          x="112"
          y="24"
          width="200"
          height="66"
          rx="10"
          fill="#a78bfa"
          fillOpacity="0.13"
          stroke="#a78bfa"
          strokeOpacity="0.4"
        />
      </g>
      <g fill="#f2f4f6" opacity="0.45">
        <rect x="130" y="42" width="74" height="7" rx="3.5" />
        <rect x="130" y="56" width="110" height="5" rx="2.5" />
      </g>
      <rect x="130" y="70" width="46" height="12" rx="6" fill="#35e0a1" />
      <path
        d="M356 150c60 0 104-34 128-70 20-30 52-46 116-44"
        fill="none"
        stroke="#35e0a1"
        strokeWidth="2"
        strokeDasharray="6 8"
        strokeLinecap="round"
      />
      <circle cx="356" cy="150" r="6" fill="#a78bfa" />
      <circle cx="600" cy="36" r="9" fill="none" stroke="#35e0a1" strokeWidth="2" />
      <circle cx="600" cy="36" r="3.5" fill="#35e0a1" />
    </svg>
  );
}

export function BriefNetworkViz() {
  const satellites: Array<[number, number, number]> = [
    [170, 46, 24],
    [150, 118, 20],
    [214, 150, 16],
    [470, 44, 20],
    [496, 112, 24],
    [420, 152, 16],
  ];
  return (
    <svg
      viewBox="0 0 640 180"
      role="img"
      aria-label="A brief at the centre of a network of connected tools and outputs."
    >
      <rect width="640" height="180" fill="#08090b" />
      <g stroke="#21252d" strokeWidth="1.5" fill="none">
        {satellites.map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M320 90 L${x} ${y}`} />
        ))}
      </g>
      <g fill="#101318" stroke="#2f353f">
        {satellites.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
        ))}
      </g>
      <g fill="#3c434f">
        <rect x="160" y="42" width="20" height="3" rx="1.5" />
        <rect x="163" y="49" width="14" height="3" rx="1.5" />
        <rect x="141" y="114" width="18" height="3" rx="1.5" />
        <rect x="144" y="121" width="12" height="3" rx="1.5" />
        <rect x="462" y="40" width="16" height="3" rx="1.5" />
        <rect x="464" y="47" width="12" height="3" rx="1.5" />
        <rect x="486" y="108" width="20" height="3" rx="1.5" />
        <rect x="489" y="115" width="14" height="3" rx="1.5" />
      </g>
      <circle cx="320" cy="90" r="40" fill="#35e0a1" />
      <g stroke="#08090b" strokeWidth="2.2" strokeLinecap="round">
        <path d="M320 58 V72" />
        <path d="M320 108 V122" />
        <path d="M288 90 H302" />
        <path d="M338 90 H352" />
        <path d="M297 67 L307 77" />
        <path d="M333 103 L343 113" />
        <path d="M343 67 L333 77" />
        <path d="M307 103 L297 113" />
      </g>
      <circle cx="320" cy="90" r="7" fill="#08090b" />
    </svg>
  );
}

export function LicenceViz() {
  return (
    <svg viewBox="0 0 320 180" role="img" aria-label="A licence mark connected to the assets it covers.">
      <rect width="320" height="180" fill="#08090b" />
      <g stroke="#21252d" strokeWidth="1.5" fill="none">
        <path d="M160 90 H86" />
        <path d="M160 90 H234" />
        <path d="M160 90 V46 H228" />
        <path d="M160 90 V134 H92" />
      </g>
      <g fill="#101318" stroke="#2f353f">
        <rect x="16" y="78" width="70" height="24" rx="12" />
        <rect x="234" y="78" width="70" height="24" rx="12" />
        <rect x="228" y="34" width="76" height="24" rx="12" />
        <rect x="22" y="122" width="70" height="24" rx="12" />
      </g>
      <g fill="#7e8590" fontFamily="ui-monospace, monospace" fontSize="9">
        <text x="30" y="94">fonts</text>
        <text x="248" y="94">images</text>
        <text x="242" y="50">source</text>
        <text x="34" y="138">motion</text>
      </g>
      <path
        d="M160 58 l26 10 v20c0 16-11 27-26 32-15-5-26-16-26-32V68z"
        fill="#35e0a1"
        fillOpacity="0.16"
        stroke="#35e0a1"
        strokeWidth="2"
      />
      <path
        d="M149 92 l8 8 15-16"
        fill="none"
        stroke="#35e0a1"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* --- Concept card schematics ------------------------------------------
   Drawn in the light palette because the sections they represent are
   light. Recolouring them to match the dark site would misrepresent the
   thing being previewed. */

export function SignalArcSchematic() {
  return (
    <svg
      viewBox="0 0 320 200"
      role="img"
      aria-label="Schematic of the Signal Arc hero: a copy column beside a proof panel."
    >
      <rect width="320" height="200" fill="#ffffff" />
      <g fill="#12494a" opacity="0.5">
        <rect x="24" y="46" width="56" height="6" rx="3" />
        <rect x="24" y="64" width="126" height="12" rx="6" />
        <rect x="24" y="84" width="102" height="12" rx="6" />
        <rect x="24" y="110" width="118" height="5" rx="2.5" />
        <rect x="24" y="122" width="96" height="5" rx="2.5" />
      </g>
      <rect x="24" y="142" width="66" height="18" rx="9" fill="#bb5220" />
      <rect x="180" y="40" width="116" height="124" rx="10" fill="#e7efee" stroke="#12494a" strokeOpacity="0.3" />
      <path
        d="M194 140c18-6 30-26 40-44s22-26 48-30"
        fill="none"
        stroke="#bb5220"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="282" cy="66" r="4" fill="#bb5220" />
    </svg>
  );
}

export function ProofLedgerSchematic() {
  return (
    <svg
      viewBox="0 0 320 200"
      role="img"
      aria-label="Schematic of the Proof Ledger section: large figures above a bar comparison."
    >
      <rect width="320" height="200" fill="#ffffff" />
      <g fill="#12494a" opacity="0.5">
        <rect x="24" y="34" width="72" height="6" rx="3" />
        <rect x="24" y="52" width="150" height="11" rx="5.5" />
      </g>
      <g fill="#12494a">
        <rect x="24" y="86" width="46" height="20" rx="4" />
        <rect x="108" y="86" width="46" height="20" rx="4" />
        <rect x="192" y="86" width="46" height="20" rx="4" />
      </g>
      <g fill="#8b8e96" opacity="0.55">
        <rect x="24" y="114" width="60" height="5" rx="2.5" />
        <rect x="108" y="114" width="60" height="5" rx="2.5" />
        <rect x="192" y="114" width="60" height="5" rx="2.5" />
      </g>
      <g>
        <rect x="24" y="152" width="30" height="22" rx="3" fill="#cec6b6" />
        <rect x="66" y="140" width="30" height="34" rx="3" fill="#cec6b6" />
        <rect x="108" y="128" width="30" height="46" rx="3" fill="#bb5220" />
        <rect x="150" y="146" width="30" height="28" rx="3" fill="#cec6b6" />
      </g>
    </svg>
  );
}

export function StudioCurrentSchematic() {
  return (
    <svg
      viewBox="0 0 320 200"
      role="img"
      aria-label="Schematic of the Studio Current layer: a sequence of project steps beside a testimonial."
    >
      <rect width="320" height="200" fill="#ffffff" />
      <g fill="#12494a" opacity="0.5">
        <rect x="24" y="30" width="64" height="6" rx="3" />
        <rect x="24" y="48" width="132" height="11" rx="5.5" />
      </g>
      <line x1="32" y1="92" x2="32" y2="170" stroke="#cec6b6" strokeWidth="2" />
      <g>
        <circle cx="32" cy="98" r="6" fill="#bb5220" />
        <circle cx="32" cy="132" r="6" fill="#12494a" opacity="0.45" />
        <circle cx="32" cy="166" r="6" fill="#12494a" opacity="0.45" />
      </g>
      <g fill="#12494a" opacity="0.4">
        <rect x="50" y="94" width="88" height="6" rx="3" />
        <rect x="50" y="128" width="72" height="6" rx="3" />
        <rect x="50" y="162" width="80" height="6" rx="3" />
      </g>
      <rect x="176" y="82" width="120" height="94" rx="10" fill="#e7efee" stroke="#12494a" strokeOpacity="0.3" />
      <g fill="#12494a" opacity="0.45">
        <rect x="192" y="104" width="88" height="5" rx="2.5" />
        <rect x="192" y="118" width="72" height="5" rx="2.5" />
        <rect x="192" y="132" width="80" height="5" rx="2.5" />
      </g>
      <circle cx="200" cy="156" r="8" fill="#bb5220" opacity="0.7" />
    </svg>
  );
}
