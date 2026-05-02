export type RsvpState =
  | { status: "idle" }
  | { status: "ok"; mode: "created" | "updated" }
  | {
      status: "error";
      code:
        | "VALIDATION"
        | "INVALID_CODE"
        | "STORAGE_FAILED"
        | "HONEYPOT"
        | "DEADLINE_PASSED";
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export const initialRsvpState: RsvpState = { status: "idle" };
