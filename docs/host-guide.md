# Your wedding RSVP guide

Hi Ismene & Hannah! Everything for the wedding RSVPs lives in one Airtable base, and this is your one-page guide to it. You don't need to touch any code — just open Airtable in your browser and follow the steps below.

If something looks different to what's described here (a missing column, a missing view), give Jake a nudge.

---

## Getting in

1. **Open the Airtable base** — bookmark this link: *[Jake to paste your base URL here]*
2. Sign in with the Google account or email Jake invited you with.
3. You'll see two tables along the top: **Invitees** and **RSVPs**.

---

## What's in each table

**Invitees** — your guest list. One row per **household** (e.g. "The Smith family", "Aunty Maria", "Tom & Jess"). You add people here.

**RSVPs** — what guests submitted through the website. You don't add rows here — they appear automatically when guests RSVP. You can read them; you don't need to edit them.

**Settings** — site-wide settings (currently just the RSVP deadline date). One row, edit it directly.

**Notes** — public notes wall. Guests post sweet messages here through the website (one row per note). You can hide any note by ticking its `Hidden` checkbox.

The Invitees and RSVPs tables are linked: each RSVP knows which Invitee it belongs to.

---

## The 6 things you'll actually do

### 1. See who has and hasn't responded

Open **Invitees**. Look at the **Status** column:

- 🟢 **Confirmed** — they've said yes
- 🔴 **Declined** — they've said no
- ⏳ **Pending** — haven't responded yet

Use the saved views (top-left of the table) to filter quickly:
- **Pending** — your chase list
- **Confirmed** — your seating plan list
- **Declined** — for your records

### 2. Get the head count

Open **Invitees**. Scroll to the bottom of the **Confirmed seats** column — Airtable shows the SUM at the bottom. That's your live confirmed headcount.

Need to filter to "only confirmed"? Switch to the **Confirmed** view first; the SUM updates.

### 3. Add a new household

Open **Invitees** → click the `+` at the bottom of the table → fill in:

- **Code** — 6 characters from `0–9` and `A–Z` (uppercase). Example: `AB12CD`. Make sure it's not already used. **Don't ever change this once shared.**
- **Household** — display name, e.g. "The Patel family"
- **Max party size** — how many people they're allowed to bring (1, 2, 3…)
- **Notes** *(optional)* — anything for your eyes only ("dad's side", "lives in NZ")

That's it. They're now invited.

### 4. Send someone their invite link

The link format is:

```
[your wedding site URL]/i/CODE
```

Replace `CODE` with their `Code` field. Example: `https://ismeneandhannah.com/i/AB12CD`

Or even better — ask Jake to add a **Share link** formula column to Invitees that builds this for you, so you can copy-paste straight from the table.

When they open the link, they'll see a personalised welcome page with their household name, then click through to RSVP.

### 5. Look up dietary needs (closer to the day)

Open **RSVPs** → switch to the **Dietary needs** view. You'll see only rows where someone wrote something. Hand this list to your caterer.

The `Dietary` column is one block of text per RSVP, with **one line per guest** that has a requirement, formatted as `Name: requirement`. Guests with no requirements simply don't appear in that block. Example:

```
Hannah Smith: vegetarian, no nuts
Bob Smith: gluten free
```

### 5b. Look up song requests

Open **RSVPs** → look at the **Song requests** column. It's free text — guests are encouraged to drop their must-plays here. Hand the list to whoever is running the music.

### 6. Change the RSVP deadline

Open the **Settings** table → edit the `RSVP deadline` field on the single row.

- **Before** the date: the form on the website shows "please let us know by [date]" and accepts submissions.
- **After** the date: the form is replaced with "RSVPs have closed on [date] — please contact Ismene & Hannah". Late guests will need to reach out to you directly.

You can extend or shorten the deadline at any time by changing this one field.

### 7. Moderate a note on the wall

Open the **Notes** table. Each row is a guest's message. To hide a note from the public wall:

- Tick its `Hidden` checkbox. The note disappears from the website immediately on next page load (no need to delete).
- Untick to bring it back.

To delete entirely: select the row and press Delete. This is permanent.

The author can also delete their own notes from the website. Each invitee can have up to 3 notes at once; once they hit the limit they'll need to delete one of theirs to leave another.

### 8. Manually add an RSVP (e.g. someone called you)

Easiest path: ask them their answers, then submit the form for them on your phone using their invite link. The website fills it into Airtable just like a normal RSVP.

If you'd rather type it directly: open **RSVPs**, add a row, link the **Invitee** field to the right household, fill in **Attending**, **Attendee names**, **Party size**, and so on.

---

## Things to *not* do

- ❌ **Don't change the `Code` field on an existing Invitee.** Their invite link will break.
- ❌ **Don't delete the `Raw payload` column** on RSVPs — it's a safety net for Jake if anything ever needs debugging.
- ❌ **Don't rename column headers** (e.g. `Party size` → `PartySize`). The website talks to Airtable by exact column name.
- ❌ **Don't delete a household** unless you're sure — their submitted RSVP becomes orphaned. If they need to be removed, also delete their linked RSVP row.
- ✅ **Do** add columns freely (e.g. "Address", "Table number", "Plus-one notes"). New columns are safe — the website just ignores them.

---

## Reading an RSVP row

Each RSVP row tells you:

- **Attending** — checkbox: are they coming?
- **Party size** — how many of them are coming
- **Attendee names** — the actual names (one per line)
- **Dietary** — one line per guest who entered something (`Name: requirement`)
- **Song requests** — free-text song wishlist
- **Submitted at** — when they replied
- **Invitee** — the linked household (click to jump back)

If a guest changes their mind, they can reopen their invite link and resubmit. The same row updates — you won't see duplicates.

---

## When something goes wrong

- A guest says **"my code doesn't work"** — check the Invitees table for typos in their `Code`. Codes are case-insensitive on the link (we uppercase before lookup).
- An RSVP **looks half-empty** — check the `Raw payload` column for what was submitted; sometimes guests skip optional fields.
- You see **two RSVPs for one household** — keep the most recent (`Submitted at`), delete the older one. Future submissions will overwrite the kept row.
- **Anything else** — message Jake. Screenshots help.

---

## Quick reference

| Want to know… | Look here |
|---|---|
| Who's coming? | Invitees → Confirmed view |
| How many are coming? | Invitees → SUM of `Confirmed seats` |
| Who hasn't replied? | Invitees → Pending view |
| Who needs vegan food? | RSVPs → Dietary needs view |
| What songs do guests want? | RSVPs → `Song requests` column |
| When did they reply? | RSVPs → `Submitted at` |

---

That's it. Have fun! 💒
