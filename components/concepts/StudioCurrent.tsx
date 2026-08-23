/**
 * Studio Current — agency service and portfolio layer.
 *
 * Entirely static: no state, no effects, no JavaScript beyond what React ships.
 *
 * The plates are original SVG compositions standing in for client photography.
 * They are cropped with the same rules a photo would be (`slice`, matching
 * object-fit: cover), so swapping in a real <img> changes nothing else.
 */

function DirectionPlate() {
  return (
    <svg
      viewBox="0 0 500 400"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Overlapping translucent planes converging on a single marked point."
    >
      <defs>
        <linearGradient id="scp1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <rect width="500" height="400" fill="var(--base-sunk)" />
      <g stroke="var(--accent)" strokeOpacity="0.25" fill="url(#scp1)">
        <polygon points="40,340 250,60 300,340" />
        <polygon points="120,340 300,90 420,340" />
        <polygon points="200,340 360,140 470,340" />
      </g>
      <line x1="0" y1="340" x2="500" y2="340" stroke="var(--line-strong)" strokeWidth="1.5" />
      <circle cx="300" cy="90" r="9" fill="var(--signal)" />
      <line
        x1="300"
        y1="90"
        x2="300"
        y2="340"
        stroke="var(--signal)"
        strokeWidth="1.5"
        strokeDasharray="5 6"
        opacity="0.7"
      />
    </svg>
  );
}

function ProofPlate() {
  return (
    <svg
      viewBox="0 0 500 400"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="A grid of modules with one module resolved in full detail."
    >
      <rect width="500" height="400" fill="var(--base-sunk)" />
      <g fill="none" stroke="var(--line-strong)" strokeDasharray="4 6">
        <rect x="40" y="50" width="130" height="130" rx="8" />
        <rect x="190" y="50" width="130" height="130" rx="8" />
        <rect x="340" y="50" width="120" height="130" rx="8" />
        <rect x="40" y="200" width="130" height="130" rx="8" />
        <rect x="340" y="200" width="120" height="130" rx="8" />
      </g>
      <rect
        x="190"
        y="200"
        width="130"
        height="130"
        rx="8"
        fill="var(--surface)"
        stroke="var(--signal)"
      />
      <g fill="var(--accent)" opacity="0.55">
        <rect x="206" y="218" width="70" height="8" rx="4" />
        <rect x="206" y="234" width="94" height="5" rx="2.5" />
        <rect x="206" y="246" width="80" height="5" rx="2.5" />
        <rect x="206" y="258" width="88" height="5" rx="2.5" />
      </g>
      <rect x="206" y="288" width="54" height="18" rx="9" fill="var(--signal)" />
    </svg>
  );
}

function ScalePlate() {
  return (
    <svg
      viewBox="0 0 500 400"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="A single module repeating outward across a widening field."
    >
      <rect width="500" height="400" fill="var(--base-sunk)" />
      <g>
        <rect x="36" y="150" width="86" height="100" rx="8" fill="var(--surface)" stroke="var(--signal)" />
        <rect x="142" y="150" width="86" height="100" rx="8" fill="var(--surface)" stroke="var(--line-strong)" />
        <rect
          x="248"
          y="150"
          width="86"
          height="100"
          rx="8"
          fill="var(--surface)"
          stroke="var(--line-strong)"
          opacity="0.72"
        />
        <rect
          x="354"
          y="150"
          width="86"
          height="100"
          rx="8"
          fill="var(--surface)"
          stroke="var(--line-strong)"
          opacity="0.44"
        />
      </g>
      <g fill="var(--accent)" opacity="0.45">
        <rect x="52" y="170" width="48" height="7" rx="3.5" />
        <rect x="52" y="184" width="60" height="4" rx="2" />
        <rect x="158" y="170" width="48" height="7" rx="3.5" />
        <rect x="158" y="184" width="60" height="4" rx="2" />
        <rect x="264" y="170" width="48" height="7" rx="3.5" opacity="0.7" />
        <rect x="370" y="170" width="48" height="7" rx="3.5" opacity="0.4" />
      </g>
      <path d="M60 300h380" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="5 7" opacity="0.5" />
      <circle cx="60" cy="300" r="6" fill="var(--signal)" />
    </svg>
  );
}

const STEPS = [
  {
    label: "Direction",
    title: "Two weeks to a direction you can show your board.",
    body: "We come back with one considered route rather than three safe ones, and the reasoning behind it in writing. If it is wrong, that is a cheap two weeks.",
    chips: ["2 weeks", "Fixed fee", "Stop here freely"],
    Plate: DirectionPlate,
  },
  {
    label: "Proof",
    title: "One real page, built properly, before the rest exists.",
    body: "The hardest page ships first — in production code, on your stack, with the content you actually have. Everything after it is repetition.",
    chips: ["3–4 weeks", "Your repo", "Handover included"],
    Plate: ProofPlate,
  },
  {
    label: "Scale",
    title: "The rest of the site, or your team takes it from here.",
    body: "Whichever is cheaper for you. We document the system either way, because a handover you cannot use is not a handover.",
    chips: ["Monthly", "Cancel any month", "Docs included"],
    Plate: ScalePlate,
  },
];

const SERVICES = [
  {
    name: "Direction sprint",
    from: "From $6,000",
    body: "One route, argued in writing, with the visual system to build it.",
  },
  {
    name: "Flagship page",
    from: "From $14,000",
    body: "Your hardest page, in production code, on your stack.",
  },
  {
    name: "Ongoing build",
    from: "From $9,000 / month",
    body: "The rest of the site, or support while your team ships it.",
  },
];

export default function StudioCurrent() {
  return (
    <section className="sc" aria-labelledby="sc-title">
      <div className="sc__shell">
        <div className="sc__head">
          <p className="sc__eyebrow">How we work</p>
          <h1 className="sc__title" id="sc-title">
            Three moves, and you can stop us after any of them.
          </h1>
          <p className="sc__intro">
            Most studios ask for the whole project up front. We would rather earn the next
            stage than sell you all of them at once.
          </p>
        </div>

        <ol className="sc__seq">
          {STEPS.map(({ label, title, body, chips, Plate }) => (
            <li className="sc__step" key={label}>
              <div className="sc__step-body">
                <p className="sc__step-n">{label}</p>
                <h3 className="sc__step-title">{title}</h3>
                <p>{body}</p>
                <p className="sc__step-meta">
                  {chips.map((chip) => (
                    <span className="sc__chip" key={chip}>
                      {chip}
                    </span>
                  ))}
                </p>
              </div>
              <figure className="sc__plate">
                <Plate />
              </figure>
            </li>
          ))}
        </ol>

        <figure className="sc__quote">
          <blockquote>
            &ldquo;They gave us a way to stop after two weeks. That is the only reason we
            said yes.&rdquo;
          </blockquote>
          <figcaption>
            <strong>Placeholder attribution</strong>
            Managing director, fictional client &mdash; replace with a real, approved quote.
          </figcaption>
        </figure>

        <div className="sc__services">
          {SERVICES.map((service) => (
            <div className="sc__service" key={service.name}>
              <h3>{service.name}</h3>
              <p className="sc__service-from">{service.from}</p>
              <p>{service.body}</p>
              <a href="#stage">See what you get</a>
            </div>
          ))}
        </div>

        <div className="sc__close">
          <p>
            Not sure which one? Most people start with the direction sprint and decide
            afterwards.
          </p>
          <a className="sc__cta" href="#stage">
            Start a conversation
          </a>
        </div>

        <p className="sc__foot">
          Placeholder copy and pricing for a studio that does not exist. The plates are
          original SVG compositions standing in for client photography &mdash; swap in a
          real image and the cropping behaviour is unchanged.
        </p>
      </div>
    </section>
  );
}
