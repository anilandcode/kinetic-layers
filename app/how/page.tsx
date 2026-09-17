import { notFound } from "next/navigation";

/** Archived. Middleware also returns a real HTTP 404 before this can stream. */
export default function How() { notFound(); }
