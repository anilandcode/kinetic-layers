import Gradient from "../Gradient";
import { DotNumber } from "../DotMatrix";
import s from "./Account.module.css";

/**
 * One of the dashboard's figures, as a card from Home's deck: the number in
 * the dot matrix over a luminous well. The number is always real — a count of
 * this account's own rows — and the words say what it counts.
 */
export default function StatCard({
  label,
  value,
  spoken,
  note,
  hue,
  second,
}: {
  label: string;
  value: string;
  /** What a screen reader hears for the figure. */
  spoken: string;
  note: string;
  hue: number;
  second?: number;
}) {
  return (
    <Gradient hue={hue} second={second} className={s.stat}>
      <p className={s.statLabel}>{label}</p>
      <DotNumber value={value} label={spoken} dot={8} className={s.statFig} />
      <p className={s.statNote}>{note}</p>
    </Gradient>
  );
}
