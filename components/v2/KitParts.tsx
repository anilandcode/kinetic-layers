import Link from "next/link";
import type { ReactNode } from "react";
import type { Asset, Verification, Viewer } from "@/lib/kl/types";
import { EARLY_ACCESS } from "@/lib/kl/access";
import { canDownload } from "@/lib/kl/gate";
import { formatBytes, formatDate, stillFor, tierLabel, typeLabel, type KitGraph, type NodeId } from "@/lib/v2/kit";
import { ButtonLink, Signal, Tag } from "./Button";
import { DotNumber } from "./DotMatrix";
import DownloadButton from "./DownloadButton";
import SaveButton from "./SaveButton";
import PromptReveal from "./PromptReveal";
import Icon from "./Icon";
import s from "./Kit.module.css";

/* ---------------------------------------------------------------------------
   Access: one decision, the same one the old item page made, in v2 words.
   ------------------------------------------------------------------------- */

export type Access = {
  label: string;
  note: string;
  open: boolean;
  action: ReactNode;
};

export function kitAccess(kit: Asset, viewer: Viewer | null): Access {
  const files = kit.files ?? [];
  if (kit.sample) {
    return {
      label: kit.illustrative ? "Illustrative" : "Sample",
      note: "Shown on preview deployments only, so you can judge a full library. Nothing here can be downloaded.",
      open: false,
      action: (
        <ButtonLink href="/library" variant="secondary" size="lg" icon="arrow" className={s.wide}>
          Browse the library
        </ButtonLink>
      ),
    };
  }
  const downloadable = canDownload(viewer, kit) && files.length > 0;
  if (downloadable) {
    return {
      label: "Available to you",
      note: `${files.length} ${files.length === 1 ? "file" : "files"} on your account.`,
      open: true,
      action: <DownloadButton slug={kit.slug} label={files.length === 1 ? "Download kit" : "Download first file"} />,
    };
  }
  if (!viewer && (kit.free || EARLY_ACCESS)) {
    return {
      label: kit.free ? "Free with an account" : "Free during early access",
      note: files.length
        ? "Create a free account to download the files listed below."
        : "The preview is published. Files are listed here when they are ready.",
      open: false,
      action: (
        <ButtonLink href={`/join?next=/item/${kit.slug}`} size="lg" icon="arrow" className={s.wide}>
          Join free
        </ButtonLink>
      ),
    };
  }
  if (!viewer) {
    return {
      label: "Premium",
      note: "Included with Premium. Premium is not on sale yet — see pricing for the plan.",
      open: false,
      action: (
        <ButtonLink href="/pricing" size="lg" icon="arrow" className={s.wide}>
          See pricing
        </ButtonLink>
      ),
    };
  }
  if (!files.length) {
    return {
      label: "Preview only",
      note: "The preview is published. Files are listed here when they are ready — nothing is promised before then.",
      open: false,
      action: (
        <ButtonLink href="/library" variant="secondary" size="lg" icon="arrow" className={s.wide}>
          Browse the library
        </ButtonLink>
      ),
    };
  }
  return {
    label: "Premium",
    note: "Included with Premium. Your account is on the free plan.",
    open: false,
    action: (
      <ButtonLink href="/pricing" size="lg" icon="arrow" className={s.wide}>
        See pricing
      </ButtonLink>
    ),
  };
}

/* ---------------------------------------------------------------------------
   Figures: only the ones the kit really has. None at all is a valid answer.
   ------------------------------------------------------------------------- */

export function KitFigures({ kit, dot = 6 }: { kit: Asset; dot?: number }) {
  const records = kit.verifications ?? [];
  const passes = records.filter((r) => r.result === "Pass").length;
  const figures: Array<{ value: string; label: string; spoken: string }> = [];
  if (kit.version) figures.push({ value: `v${kit.version}`, label: "Version", spoken: `version ${kit.version}` });
  if (kit.files?.length)
    figures.push({ value: String(kit.files.length), label: kit.files.length === 1 ? "File" : "Files", spoken: `${kit.files.length} files` });
  if (records.length)
    figures.push({
      value: `${passes}/${records.length}`,
      label: "Rebuilds passed",
      spoken: `${passes} of ${records.length} rebuilds passed`,
    });
  if (!figures.length) return null;
  return (
    <dl className={s.figures}>
      {figures.map((f) => (
        <div key={f.label} className={s.figure}>
          <dt>{f.label}</dt>
          <dd>
            <DotNumber value={f.value} label={f.spoken} dot={dot} tone={f.label === "Rebuilds passed" ? "accent" : "text"} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------------------------------------------------------------------------
   The panels each graph node opens.
   ------------------------------------------------------------------------- */

/* `?? []`, not a default parameter: GROQ returns null for a kit with no
   records, and a default only covers undefined. */
function sortRecords(records?: Verification[] | null) {
  return [...(records ?? [])].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

function PromptPreview({ preview, length, what }: { preview?: string; length?: number; what: string }) {
  const shown = preview?.length ?? 0;
  const rest = Math.max(0, (length ?? 0) - shown);
  return (
    <div className={s.prompt}>
      <pre className={s.promptText}>{preview}</pre>
      {rest > 0 ? (
        <p className={s.promptRest}>
          <Icon name="lock" size={15} />
          <span>
            {rest.toLocaleString("en")} more characters — the full {what} comes with the kit.
          </span>
        </p>
      ) : null}
    </div>
  );
}

export function kitPanels(kit: Asset): Partial<Record<NodeId, ReactNode>> {
  const still = stillFor(kit, 900);
  const records = sortRecords(kit.verifications);
  return {
    reference: (
      <div className={s.panelSplit}>
        <div className={s.panelThumb} style={{ aspectRatio: String(kit.aspect || 4 / 3) }}>
          {still ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={still} alt="" loading="lazy" decoding="async" />
          ) : null}
        </div>
        <div className={s.panelWords}>
          <h3>Reference</h3>
          <p>The finished design this kit rebuilds. Every other part of the kit is measured against it.</p>
          <dl className={s.facts}>
            <div><dt>Format</dt><dd>{kit.clip && !kit.poster ? "Video" : "Image"}</dd></div>
            {kit.width && kit.height ? <div><dt>Size</dt><dd>{kit.width} × {kit.height}</dd></div> : null}
            {kit.sample ? <div><dt>Source</dt><dd>Hotlinked reference</dd></div> : null}
          </dl>
        </div>
      </div>
    ),
    spec: kit.notes ? (
      <div className={s.panelWords}>
        <h3>Design spec</h3>
        <div className={s.spec}>
          {kit.notes
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}
        </div>
      </div>
    ) : null,
    reconstruction: kit.promptLength ? (
      <div className={s.panelWords}>
        <h3>Reconstruction prompt</h3>
        <p>Rebuilds the reference from the spec. The first two lines are public; the rest opens with an account.</p>
        <PromptPreview preview={kit.promptPreview} length={kit.promptLength} what="prompt" />
        {kit.sample ? null : <PromptReveal slug={kit.slug} />}
      </div>
    ) : null,
    output: records.length ? (
      <div className={s.panelWords}>
        <h3>Output — test records</h3>
        <p>Each row is a rebuild someone ran with the reconstruction prompt, and whether it matched the reference.</p>
        <table className={s.records}>
          <thead>
            <tr><th scope="col">Tool</th><th scope="col">Model</th><th scope="col">Date</th><th scope="col">Result</th></tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i}>
                <td>{r.tool}</td>
                <td>{r.model ?? "—"}</td>
                <td>{formatDate(r.date) ?? "—"}</td>
                <td>
                  <Tag tone={r.result === "Pass" ? "solid" : "neutral"} signal={r.result === "Pass"}>
                    {r.result}
                  </Tag>
                  {r.note ? <span className={s.recordNote}>{r.note}</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : null,
    adaptation: kit.adaptationLength ? (
      <div className={s.panelWords}>
        <h3>Adaptation prompt</h3>
        <p>Branches from the spec: keeps the structure and motion, and swaps the identity for yours.</p>
        <PromptPreview preview={kit.adaptationPreview} length={kit.adaptationLength} what="adaptation prompt" />
      </div>
    ) : null,
    brand: kit.adaptationLength ? (
      <div className={s.panelWords}>
        <h3>Your brand</h3>
        <p>
          Run the adaptation prompt with your name, palette, typeface and copy. The layout and motion stay as tested;
          the identity becomes yours. Nothing on this node is ours to verify — it is what you make.
        </p>
      </div>
    ) : null,
  };
}

/** The proof line under the graph, and the honest version of it when there is none. */
export function VerificationNote({ kit, graph }: { kit: Asset; graph: KitGraph }) {
  const records = sortRecords(kit.verifications);
  const latest = records.find((r) => r.result === "Pass");
  const missing = graph.missing;
  return (
    <div className={s.proof}>
      {latest ? (
        <p className={s.proofLine}>
          <Signal />
          <span>
            Last verified with <strong>{latest.tool}</strong>
            {latest.model ? <> · {latest.model}</> : null}
            {latest.date ? <> · {formatDate(latest.date)}</> : null}
          </span>
          {kit.version ? <span className={s.proofVersion}>version {kit.version}</span> : null}
        </p>
      ) : (
        <p className={s.proofLine}>
          <Tag>Not yet verified</Tag>
          <span>No rebuild of this kit has been tested yet. When one is, the tool, model, date and result appear here.</span>
        </p>
      )}
      {missing.length ? (
        <p className={s.missing}>
          Not published for this kit yet: {missing.join(", ").replace(/, ([^,]*)$/, " and $1")}.
        </p>
      ) : null}
    </div>
  );
}

export function FileManifest({ kit }: { kit: Asset }) {
  const files = kit.files ?? [];
  if (!files.length) {
    return <p className={s.noFiles}>Files are not listed yet. This page does not promise a download that is not ready.</p>;
  }
  return (
    <ul className={s.manifest}>
      {files.map((file, i) => (
        <li key={`${file.name}-${i}`}>
          <Icon name="file" size={16} />
          <span className={s.fileName}>{file.name}</span>
          <span className={s.fileMeta}>{[file.tag, formatBytes(file.bytes)].filter(Boolean).join(" · ")}</span>
        </li>
      ))}
    </ul>
  );
}

export function SampleNotice({ kit }: { kit: Asset }) {
  if (!kit.sample) return null;
  return (
    <p className={s.notice} role="note">
      <Tag tone="sample">{kit.illustrative ? "Illustrative — not a real kit" : "Sample"}</Tag>
      <span>
        {kit.illustrative
          ? "Every figure, prompt and test record on this page is made up, to show what a complete kit looks like. Preview deployments only."
          : "A hotlinked reference, shown on preview deployments only so a full library can be judged. Not a Kinetic Layers kit."}
      </span>
    </p>
  );
}

/** The access panel beside the open graph node: the gate's answer, the files, the facts. */
export function KitAccessPanel({ kit, viewer, saved = false }: { kit: Asset; viewer: Viewer | null; saved?: boolean }) {
  const access = kitAccess(kit, viewer);
  const released = formatDate(kit.publishedAt);
  return (
    <aside className={s.access} aria-label="Access and files">
      <p className={s.accessLabel}>
        {access.open ? <Signal /> : null}
        {access.label}
      </p>
      <p className={s.accessNote}>{access.note}</p>
      {access.action}
      {kit.sample ? null : <SaveButton slug={kit.slug} saved={saved} signedIn={Boolean(viewer)} className={s.wide} />}
      <div className={s.divider} />
      <h2 className={s.sideTitle}>Files</h2>
      <FileManifest kit={kit} />
      <div className={s.divider} />
      <dl className={s.facts}>
        <div><dt>Type</dt><dd>{typeLabel(kit.type)}</dd></div>
        <div><dt>Access</dt><dd>{tierLabel(kit)}</dd></div>
        {kit.version ? <div><dt>Version</dt><dd>{kit.version}</dd></div> : null}
        {released ? <div><dt>Published</dt><dd>{released}</dd></div> : null}
        <div><dt>Licence</dt><dd><Link href="/license" className={s.inlineLink}>Kinetic Layers licence</Link></dd></div>
      </dl>
    </aside>
  );
}
