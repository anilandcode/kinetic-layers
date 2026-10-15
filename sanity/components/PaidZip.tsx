import { useEffect, useRef, useState } from "react";
import { useClient, useFormValue, type InputProps } from "sanity";
import { Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { PAID_TYPE, UPLOAD_PREFIX, UPLOAD_TYPE, baseId, paidId, type PaidZip } from "../../lib/kl/paid";

/* The site that signs uploads. Set SANITY_STUDIO_SITE_URL to test against a local app. */
const SITE = (process.env.SANITY_STUDIO_SITE_URL || "https://kineticlayers.com").replace(/\/+$/, "");

const size = (bytes: number) =>
  bytes < 1_048_576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1_048_576).toFixed(1)} MB`;

function put(url: string, file: File, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", "application/zip");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Storage said ${xhr.status}`)));
    xhr.onerror = () => reject(new Error("Network error while uploading"));
    xhr.send(file);
  });
}

/**
 * The website's project ZIP, uploaded straight into the private R2 bucket.
 *
 * A Sanity file upload would sit on Sanity's CDN where the public API lists
 * every file, so this never uses one. It writes a ticket (`paid.upload.<nonce>`)
 * with your Studio session, trades it at /api/studio/zip-upload for a one-time
 * signed URL, PUTs the file there, then records the key in the website's
 * private `paid.<id>` document. Like the paid text fields, it saves on its own.
 */
export function PaidZipInput(props: InputProps) {
  const client = useClient({ apiVersion: "2026-08-25" });
  const docId = useFormValue(["_id"]) as string | undefined;
  const id = docId ? paidId(docId) : null;
  const picker = useRef<HTMLInputElement | null>(null);
  const [zip, setZip] = useState<PaidZip | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("Loading…");

  useEffect(() => {
    if (!id) return;
    let live = true;
    client
      .fetch<PaidZip | null>(`*[_id == $id][0].zip`, { id })
      .then((z) => {
        if (!live) return;
        setZip(z?.storagePath ? z : null);
        setNote("Stored in the private bucket — only the paywall can hand out a link.");
      })
      .catch((e) => live && setNote(`Could not load: ${e instanceof Error ? e.message : e}`));
    return () => {
      live = false;
    };
  }, [client, id]);

  async function upload(file: File) {
    if (!id || !docId) return;
    if (!file.name.toLowerCase().endsWith(".zip")) {
      setNote("Choose a .zip file.");
      return;
    }
    setBusy(true);
    const nonce = crypto.randomUUID();
    const ticket = `${UPLOAD_PREFIX}${nonce}`;
    try {
      setNote("Preparing…");
      await client.create({ _id: ticket, _type: UPLOAD_TYPE, website: baseId(docId), filename: file.name, size: file.size });
      const res = await fetch(`${SITE}/api/studio/zip-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nonce }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.message ?? `The site said ${res.status}`);
      await put(json.url, file, (pct) => setNote(`Uploading… ${pct}%`));
      const next: PaidZip = { storagePath: json.key, name: file.name, bytes: file.size, uploadedAt: new Date().toISOString() };
      await client
        .transaction()
        .createIfNotExists({ _id: id, _type: PAID_TYPE, parent: baseId(docId) })
        .patch(id, (p) => p.set({ zip: next }))
        .commit({ visibility: "async" });
      setZip(next);
      setNote("Uploaded to the private bucket. It is live for entitled visitors now.");
    } catch (e) {
      setNote(`Upload failed: ${e instanceof Error ? e.message : e}`);
    } finally {
      await client.delete(ticket).catch(() => {});
      setBusy(false);
      if (picker.current) picker.current.value = "";
    }
  }

  async function remove() {
    if (!id) return;
    setBusy(true);
    try {
      await client.patch(id).unset(["zip"]).commit({ visibility: "async" });
      setZip(null);
      setNote("Removed. The website no longer offers a ZIP.");
    } catch (e) {
      setNote(`Could not remove: ${e instanceof Error ? e.message : e}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack space={3}>
      <Card padding={3} radius={2} border tone={zip ? "positive" : "transparent"}>
        <Text size={1}>{zip ? `${zip.name} · ${size(zip.bytes)} · uploaded ${new Date(zip.uploadedAt).toLocaleDateString()}` : "No ZIP uploaded yet."}</Text>
      </Card>
      <Flex gap={2}>
        <Button
          id={props.id}
          text={busy ? "Working…" : zip ? "Replace ZIP" : "Upload ZIP"}
          tone="primary"
          disabled={busy || !id}
          onClick={() => picker.current?.click()}
        />
        {zip ? <Button text="Remove" mode="ghost" tone="critical" disabled={busy} onClick={remove} /> : null}
      </Flex>
      <input
        ref={picker}
        type="file"
        accept=".zip,application/zip"
        hidden
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file) void upload(file);
        }}
      />
      <Text size={1} muted>
        {note}
      </Text>
    </Stack>
  );
}
