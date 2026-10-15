import { useCallback, useEffect, useRef, useState } from "react";
import { useClient, useFormValue, type InputProps } from "sanity";
import { Stack, Text, TextArea } from "@sanity/ui";
import { PAID_TYPE, baseId, paidId, type PaidField } from "../../lib/kl/paid";

type State = "loading" | "idle" | "dirty" | "saving" | "saved" | "error";

const STATUS: Record<Exclude<State, "error">, string> = {
  loading: "Loading…",
  idle: "Private — only the paywall can read this. Saves as you type; it does not wait for Publish.",
  dirty: "Unsaved changes…",
  saving: "Saving privately…",
  saved: "Saved privately — only the paywall can read this.",
};

/**
 * A text field whose value never touches the kit or website document.
 *
 * The dataset is public, so anything on the document itself can be read by
 * anyone through the API. This input reads and writes `paid.<id>` instead
 * (lib/kl/paid.ts), which only the Studio and the app's server can see. It
 * saves on its own — debounced while typing, at once on blur — rather than
 * through Publish, because the paid document is not part of this form.
 */
export function paidText(field: PaidField) {
  return function PaidTextInput(props: InputProps) {
    const client = useClient({ apiVersion: "2026-08-25" });
    const docId = useFormValue(["_id"]) as string | undefined;
    const id = docId ? paidId(docId) : null;
    const [value, setValue] = useState("");
    const [state, setState] = useState<State>("loading");
    const [error, setError] = useState("");
    const latest = useRef("");
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
      if (!id) return;
      let live = true;
      client
        .fetch<Record<string, string | undefined> | null>(`*[_id == $id][0]{ prompt, adaptationPrompt, code, design }`, { id })
        .then((doc) => {
          if (!live) return;
          latest.current = doc?.[field] ?? "";
          setValue(latest.current);
          setState("idle");
        })
        .catch((e) => {
          if (!live) return;
          setError(e instanceof Error ? e.message : String(e));
          setState("error");
        });
      return () => {
        live = false;
      };
    }, [client, id]);

    const save = useCallback(async () => {
      clearTimeout(timer.current);
      if (!id || !docId) return;
      const text = latest.current;
      setState("saving");
      try {
        await client
          .transaction()
          .createIfNotExists({ _id: id, _type: PAID_TYPE, parent: baseId(docId) })
          .patch(id, (p) => (text.trim() ? p.set({ [field]: text }) : p.unset([field])))
          .commit({ visibility: "async" });
        setState(latest.current === text ? "saved" : "dirty");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setState("error");
      }
    }, [client, id, docId]);

    useEffect(() => () => clearTimeout(timer.current), []);

    return (
      <Stack space={2}>
        <TextArea
          id={props.id}
          rows={12}
          value={value}
          disabled={state === "loading" || !id}
          onChange={(e) => {
            latest.current = e.currentTarget.value;
            setValue(latest.current);
            setState("dirty");
            clearTimeout(timer.current);
            timer.current = setTimeout(save, 1200);
          }}
          onBlur={() => {
            if (state === "dirty") void save();
          }}
          style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13 }}
        />
        <Text size={1} muted>
          {state === "error" ? `Could not save: ${error}` : STATUS[state]}
        </Text>
      </Stack>
    );
  };
}
