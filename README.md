This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Guest Arrival and Dietary Information

Signed-in guests land on their **My Highlands profile** dashboard at `/summary`.
It combines check-in status, dietary information, and their existing cabin and
guest-management controls. Guests without a cabin can still use the dashboard,
with a cabin-selection link while reservations are open. **My Profile** in the
navigation returns to this dashboard. Arrival and dietary information are
available directly on the summary page, without a separate navigation link.
The standalone `/guest-information` page has been removed. The countdown does
not link to the profile because guests must select a cabin before accessing it.
The guest-profile API and shared profile controls remain in use.

The page reads the ticket's existing `Checked In` status. A personalized
`/check-in?id=<ticket record ID>` link is shown only when the published Contentful
`ENABLE_CHECK_IN` boolean is enabled. This is separate from `ENABLE_RESERVATIONS`
in reservation constants. Configure the same `NEXT_PUBLIC_CONTENTFUL_SPACE_ID`,
`NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT`, and `NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN`
used by the festival website. The reservation app reads the published flag
through Contentful's REST Delivery API, not GraphQL.
A missing configuration or flag-read failure is
shown explicitly without preventing dietary updates.
When check-in is closed, the dashboard says "Check-in will open 24 hours before
the festival." When it is open, guests who have not checked in are prompted to
complete their personalized form. The Contentful flag controls availability;
the dashboard does not automatically enable check-in based on the date.

On Airtable's **Ticket Purchases** table, create `Dietary Requirements` as
**Multiple select**, with the options from
[GuestProfilePanel/utils.js](./src/components/GuestProfilePanel/utils.js),
and `Dietary Notes` as **Long text**. Mirror these fields and options in the
duplicate test base before running live integration tests.

Guests select all applicable requirements and can add up to 5,000 characters of
notes. Saving updates both fields and the existing `Dietary Restrictions`
checkbox in one Airtable update. Guests without saved selections or notes are
prompted to fill out the form or choose **I don't have dietary restrictions**.
That button clears the selections, sets `Dietary Notes` to exactly `None`, and
checks `Dietary Restrictions`, marking the dietary response as provided.
Saving completely empty selections and notes clears the checkbox and restores
the prompt. The admin dashboard dietary responses list displays both
restrictions and explicit `None` responses.
This replaces the Google Form for guests using this page; existing Google Form
responses are not imported, and guest-intake dietary syncing is not added.

`POST /api/platform/guest-profile` only reads the aggregated profile data;
it does not update tickets. `POST /api/platform/dietary-intake` reads dietary details,
and `PATCH /api/platform/dietary-intake` saves the dietary response. POST reads carry
the Firebase ID token in the request body, matching the existing authentication
pattern. Check-in creation and waiver operations remain in their existing APIs.
Both profile and dietary endpoints share the authenticated ticket lookup in
[guest-ticket-server.js](./src/lib/guest-ticket-server.js), which verifies the
Firebase ID token and requires one active ticket with the verified account's
UID and email. Neither accepts a ticket ID from the browser.
Guests must sign in again if
their Firebase account session has expired, even if the reservation cookie
remains. API failures preserve unsaved selections and do not show a success
message.

Logging out clears the Firebase session as well as the reservation cookies.
When Firebase authentication expires, the guest page's sign-in link clears the
old reservation cookies so the login page does not redirect back to reservations.

## Inactive Tickets

Successful email/password login calls `/api/airtable/add-firebase-uid` with the
Firebase ID token. The server verifies it through Firebase Authentication,
queries Ticket Purchases once using the verified email, and attaches the verified
UID only if the active ticket has no UID. A different existing UID is rejected.
The operation uses the existing Firebase web API key and Airtable server credentials.
Failed Firebase sign-in retains the ticket lookup/create-account guidance.
The `/api/airtable/add-firebase-uid` route owns ticket lookup and UID assignment
directly and requires an ID token; arbitrary record-ID/UID writes through that
route are no longer supported.

The admin dashboard archives purchases using `Status = Archived` on Airtable's
`Ticket Purchases` table. Both `Archived` and `Refunded` are inactive statuses.
Reservation attendee lookups and purchased-ticket allocation exclude both.
Generic Airtable read APIs return all records regardless of status; ticket access
rules are applied by the reservation helpers. Inactive tickets cannot update
their reservation record, attach an account UID, or create a check-in.
Cabin reservation, bed reservation, and guest-assignment operations validate the
attendee records they already load before writing changes. They share
`throwIfReservationTicketIsInvalid` rather than routing through an extra ticket-update
API. The generic `/api/airtable/update-record` route does not apply ticket-status rules.
Check-in creation uses `/api/platform/create-check-in` to validate attendee ticket
eligibility before calling the generic Airtable create handler. The generic
`/api/airtable/create-record` route does not apply check-in or ticket-status rules.
The dashboard also clears group/cabin/bed links when
archiving. Deploy these API changes before enabling dashboard archiving. Restoring
a record in Airtable does not restore its former reservation assignments.

## Automated Reservations Tests

The automated reservation tests use the [duplicated Airtable test base](https://airtable.com/appFe9v1pu6BLVxeD).

The test suite and supporting scripts are in [scripts/tests/](./scripts/tests). Run them with `npm run test:automated-reservations`.

### Optional Tests Before Pushing

Run `npm run hooks:install` once per clone to enable the [pre-push hook](./.githooks/pre-push). Command-line pushes will ask whether to run the automated reservation tests first.

- Answer `y` to run the suite. A failed run cancels the push.
- Answer `n` or press Enter to push without running the suite.
- Pushes without an interactive terminal skip the prompt and print a notice.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
