import { z } from "zod";

export const INVITE_CODE_REGEX = /^[0-9A-HJKMNP-TV-Z]{6}$/;
export const INVITE_CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

const optionalString = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

const attendeeName = z.string().trim().min(1, "Please enter a name").max(120);

export const RsvpInputSchema = z
  .object({
    code: z.string().regex(INVITE_CODE_REGEX, "Invalid invite code"),
    attending: z.enum(["yes", "no"]),
    attendees: z.array(attendeeName).max(20),
    email: z.email().max(320).optional().or(z.literal("")),
    dietary: optionalString(1000),
    website: z.string().max(500).optional().or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    if (value.attending === "yes") {
      if (value.attendees.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["attendees"],
          message: "Please enter at least one name",
        });
      }
      if (!value.email || value.email.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: "Email is required when attending",
        });
      }
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
  const attendees = formData
    .getAll("attendees")
    .map((value) => value.toString())
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  return {
    code: (formData.get("code") ?? "").toString(),
    attending: (formData.get("attending") ?? "").toString(),
    attendees,
    email: (formData.get("email") ?? "").toString(),
    dietary: (formData.get("dietary") ?? "").toString(),
    website: (formData.get("website") ?? "").toString(),
  };
}
