# Retained carrier evidence walkthrough — 18 November 2026

## Source and limits

Six original browser screenshots show English and Arabic views of synthetic
zero-value order `TEST-CARRIER-EVIDENCE-20261118`, parcel 7, in the local admin,
tenant and vendor dashboards. The isolated preview SQLite database received a
properly signed local test-adapter dispatch callback (202) and an identical
retry (200). The replay did not add a second observation. No live carrier,
delivery, collection, invoice or financial settlement was executed. This does
not verify whole-order automatic fulfillment, which remains implementation work.

The three-step `carrier-evidence` interactive tour is adjacent to its explanation
in both packing guides. The two 24-second silent MP4s are assembled from the
actual screenshots, with English/Arabic captions and matching transcripts.
They are teaching walkthroughs, not live screen recordings.

## Observed behavior

- All three dashboards show retained handoff and test-observation notices.
- The tenant cannot void the handed-off parcel.
- The vendor cannot adopt this existing handoff into a new packing plan; separate
  parcel-creation authority remains visible independently of quantity editing.
- Admin oversight has no save, seal, void or parcel-creation commands.
- Both videos reached their natural end at 24 seconds without media errors.
  English captions defaulted on the English page; Arabic on the Arabic page.
- Arabic screenshot enlargement opened with the matching explanation and closed
  normally. Selecting the platform step changed both screenshot and text.
- `carrier-evidence-guide` is a separate wrapper; the existing `screen-guide`
  anchor and packing-manifest tour remain intact.
- Production build passed. Structural checks passed for 236 pages, 32 diagram
  blocks and 87 tours. Rendered-route check returned 236 pages and zero failures.

Browser proof: `evidence/carrier-evidence-guide-ar.jpg`.

## Language-switch regression

The browser originally exposed a cached Arabic server explanation after switching
to English. Packing reads now provide stable readiness/blocking codes alongside
their existing localized text. All three staff dashboards translate recognized
codes locally and retain the server text for unknown/older contracts. No automatic
refresh, draft replacement or command is triggered by switching languages.

In the tenant browser, an unsaved quantity of 1 and its explanation survived
Arabic-to-English switching. Removing that local row revealed the readiness
explanation in English from the same originally Arabic snapshot. The test draft
was cleared without saving or changing any server packing record.

Backend packing regression: 39 tests, 155 assertions passed. Focused dashboard
packing suites: admin 6, tenant 22, vendor 22 tests passed. Development and
production builds passed for all three staff dashboards.

Published code checkpoint: backend `c07fdab1`, admin `9db9083`, tenant `2f925c3`,
vendor `dc6135b`. The generated dashboard contracts were refreshed against the
backend checkpoint. These scoped checks do not imply full-roadmap acceptance.
