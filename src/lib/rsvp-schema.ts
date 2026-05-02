import { z } from "zod";

export const INVITE_CODE_REGEX = /^[0-9A-Z]{6}$/;
export const INVITE_CODE_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const optionalString = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

const attendeeName = z.string().trim().min(1, "Please enter a name").max(120);

// Each entry is one guest's dietary requirements. Position matches `attendees`,
// so empty strings are kept (don't filter — it would shift indexes).
const attendeeDietary = z.string().trim().max(500);

export const RsvpInputSchema = z
  .object({
    code: z.string().regex(INVITE_CODE_REGEX, "Invalid invite code"),
    attending: z.enum(["yes", "no"]),
    attendees: z.array(attendeeName).max(20),
    dietaries: z.array(attendeeDietary).max(20),
    songRequests: optionalString(500),
    website: z.string().max(500).optional().or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    if (value.attending === "yes" && value.attendees.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["attendees"],
        message: "Please enter at least one name",
      });
    }
  });

export type RsvpInput = z.infer<typeof RsvpInputSchema>;

export type Invitee = {
  id: string;
  code: string;
  household: string;
  maxPartySize: number;
};

export function parseFormData(formData: FormData): unknown {
  // Read raw attendee/dietary arrays in the same order the form submits them,
  // so dietaries[i] always corresponds to attendees[i]. We then drop any slot
  // where the name is blank, preserving alignment between the two arrays.
  const rawAttendees = formData.getAll("attendees").map((v) => v.toString().trim());
  const rawDietaries = formData.getAll("dietaries").map((v) => v.toString().trim());

  const attendees: string[] = [];
  const dietaries: string[] = [];
  for (let i = 0; i < rawAttendees.length; i++) {
    if (rawAttendees[i].length === 0) continue;
    attendees.push(rawAttendees[i]);
    dietaries.push(rawDietaries[i] ?? "");
  }

  return {
    code: (formData.get("code") ?? "").toString(),
    attending: (formData.get("attending") ?? "").toString(),
    attendees,
    dietaries,
    songRequests: (formData.get("songRequests") ?? "").toString(),
    website: (formData.get("website") ?? "").toString(),
  };
}
