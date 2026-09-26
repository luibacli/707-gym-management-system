# Client Demo Script

A 5–7 minute walkthrough for the gym owner. The goal is for them to see their
**daily routine get easier** in the first two minutes. Then use the rest of the
meeting to **confirm the provisional business rules** (`docs/business-rules.md`).

The demo data is always the same set of 60 members, and every date is relative
to the day you reset it. The names below match what the demo shows.

---

## Before the meeting

**The day before**

- [ ] Make sure your current IP is allowed in MongoDB Atlas (Network Access).
- [ ] Run `pnpm demo:reset` once to confirm it works.
- [ ] Rehearse the story below once, end to end.

**30 minutes before** (dates are relative to the day of the reset, so reset on the day)

- [ ] `pnpm demo:reset`
- [ ] `pnpm demo:start`, then open http://localhost:3000 in a **fresh browser
      window** (no other tabs, bookmarks bar hidden, full screen).
- [ ] For a projector or TV, zoom the browser to 110–125%.
- [ ] Sign-in details: `DEMO_STAFF_EMAIL` / `DEMO_STAFF_PASSWORD` in `.env`.
      Don't type a wrong password 5 times; sign-in locks for 15 minutes.
- [ ] Stay on the sign-in page, ready to start.

**If something goes wrong mid-demo:** run `pnpm demo:reset` and reload the page.
The data comes back exactly as it was.

---

## The story

### 1. Open with their problem (30 seconds, no screen)

> "Right now, when you want to know whose membership is expiring, you go through
> the logbook page by page. Let me show you what that looks like instead."

*Adjust this to how they actually track members today (logbook, Excel, and so on).*

### 2. Sign in (10 seconds)

Sign in as the front desk account. Keep it quick; don't explain it.

### 3. The dashboard: "this is your morning check" (1 minute)

- Point at the tiles: **57 members, 30 active, 8 near expiry, 13 expired.**
  > "The moment you open it, you see where the gym stands today."
- Point at **Expiring this week**:
  > "These are the people to message today. Rafael Navarro's membership ends
  > **today**, Paolo Flores's ends tomorrow. You don't have to search for anyone."
- Point at **Recently expired**:
  > "And these are the people who didn't come back. Maria Del Rosario expired
  > yesterday, so she's worth a follow-up call."

### 4. Renew in two clicks (1 minute)

- On **Rafael Navarro**, click **Renew**.
  > "Same plan as before, starting the day after his current one ends. The
  > system already calculated the expiry date."
- Point at the "Expires …" preview, then click **Renew**.
- Show the member page: the new membership is **Scheduled**, and the current
  one is still **Near expiry**. His full history is below.
- Go back to the **Dashboard**. Rafael is no longer on the "Expiring this week" list.

### 5. Finding anyone (1 minute)

- Go to **Members**, type `santos` in search. **Joshua Santos** appears straight away.
- Clear it, then choose **Expired** in the status filter.
  > "Everyone who's lapsed, with the date their membership ended. That's your
  > win-back list."
- Point at the **Expires** column.

### 6. A walk-in signs up (1–2 minutes)

- Click **Add member**, and fill in a first name, last name and phone. Point
  out that everything else is optional.
- Click **Add member**, then **Add membership**, choose **Monthly** (today is
  the default), and click **Add membership**.
- The status shows **Active**.
  > "That's the whole sign-up at the front desk."

### 7. Close (30 seconds)

> "This is built around how you work, and the details can be adjusted. I'd like
> to go through a few questions so it matches your gym exactly."

Then go through the questions below.

---

## Questions to confirm (turn the demo into the requirements session)

Ask each question at the moment it naturally comes up, or at the end.
Write the answers in `docs/business-rules.md` and mark each rule **Confirmed**.

| When | Ask | Rule |
| --- | --- | --- |
| Step 4 (renewal preview) | "A monthly membership starting Jan 15 expires Feb 15. Is that how you count it?" | BR-P2 |
| Step 4 | "If someone starts Jan 31, it ends Feb 28 (29 in a leap year). OK?" | BR-P3 |
| Step 4 | "On the expiry day itself, can they still train?" | BR-P4 |
| Step 4 | "When someone renews early, does the new month start after the current one ends, as shown, or on the day they pay?" | BR-H3 |
| Step 4 | "Can a member ever have two memberships running at the same time?" | BR-H2 |
| Step 3 | "Is 7 days the right warning time for 'expiring soon'?" | BR-S2 (already confirmed; re-check) |
| Step 6 (form) | "Is this the information you collect from members? Anything missing or unnecessary?" | BR-M1 |
| Step 6 | "Which plans do you offer: only monthly and annual? Student rates, 3-month plans, daily walk-ins?" | BR-P1 |
| Anywhere | "Do you ever freeze or pause memberships (injury, travel)?" | BR-S1 |
| Anywhere | "Do you want to record how much each member paid?" | BR-P6 (payments are out of scope today) |
| Members list | "When a member leaves, do you want to keep their record (archive), and ever bring it back?" | BR-M2 |
| Close | "Who will use this: just the front desk, or also you as owner? Should anyone see less?" | BR-A1 |
| Close | "If a membership is entered by mistake, should staff be able to delete it?" | Open question |
| Close | "Should staff be able to add memberships for archived members?" | Open question |
| Close | "How many members do you have in the logbook now? Should we import them for you?" | Onboarding (possible bulk import) |

---

## What to be upfront about

- **It isn't online yet.** The demo runs on this laptop. Going live is the next
  step after the rules are confirmed.
- **No payments or SMS reminders in this first version** (by design: they're
  out of scope for the MVP, `project-overview.md` §8). They can come later.
- **Existing members need to be entered or imported.** Offer to import their
  current list.

## Things to avoid during the demo

- Don't archive a demo member unless you restore them afterwards.
- Don't open the browser's developer tools on screen.
- Don't demo on the dev server (`pnpm dev`); always use `pnpm demo:start`.
