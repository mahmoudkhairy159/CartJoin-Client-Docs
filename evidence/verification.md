# Verification — 17 November 2026

## 18 November 2026 — Marketplace service operations

Published application checkpoints: backend7b527247, adminc90cb93, tenant3c983a6,
vendor86a1063. Backend MarketplaceOps51 tests230 assertions plus final2 actor/paging
tests9 assertions pass; related Order62 tests177 assertions pass. All seven
metadata queues and the bounded evidence reconciliation query execute against
development MySQL read-only. Admin13 operation tests plus42 catalogue/scope/nav
checks, scoped lint, generated145-file drift and production/development builds pass.

EN/AR browser evidence includes policy acceptance, case reply/appeal, manual
warning/resolution, platform assignment/dismissal, named immutable history,
evidence queues, store filter and390px light/dark/RTL checks. All mutations used
an explicitly synthetic local case/policy; no real allegation, order, payment,
compliance upload or vendor approval changed.25 reviewed screenshots are added.

Three contextual tours add six localized30–40s MP4s and bilingual VTT transcripts.
All six played to completion with the correct default caption language; active
caption tracks loaded successfully. Interactive step/image switching, Arabic zoom
and both flow diagrams render. No browser console or media errors were recorded.
Docs check:232 pages,28 diagrams,78 tours,194 mapped frontend routes; production
build passes after the final coverage-text/source-inventory refresh. Provenance explicitly gives
18 November and calls the clips screenshot walkthroughs, not live recordings.

Remaining work is visible: publication eligibility/rejection, carrier-to-order
integration, dispatch cohorts/metrics, growth consent and opt-in discovery.
Test adapters stay guarded; live provider/pilot/deployment gates remain separate.

## Completed checks

- `bun run build`: passed; compiled/prerendered all 206 documentation pages and their Markdown representations, including the new visual-learning pages.
- `bun run types:check`: passed.
- `bun run docs:check`: passed; language counterparts, feature structure, page links, screenshots, six interactive tours, focus bounds, bilingual caption cues, ERP branding residue and 187 classified frontend route entries.
- Browser: homepage rendered; English-to-Arabic counterpart navigation preserved the page; Arabic HTML used `lang=ar` and `dir=rtl`.
- Browser: selecting Vendor filtered the handbook navigation to Vendor while retaining shared business guidance.
- Browser: search for `wallet` returned indexed business guidance and source references.
- Browser: original gallery images loaded; new contextual captures were inspected, and selected tour images/changes were verified in the browser. There are now 12 system screenshots.
- Browser: every Mermaid diagram rendered: business relationship flow + ER map (2 per language), checkout sequence + order state machine (2 per language), money flow (1 per language), onboarding flow (1 per language). Total: 12 rendered diagrams.
- Live demo read-only observations: signed into all four surfaces with README demo accounts; captured 12 screenshots, including tenant Arabic RTL and full product/account/invoice examples. No purchase, payment, refund, payout or business-record edit was performed.
- Interactive screenshot checks: changing a numbered callout updates its selected state; next-step navigation can change the screenshot; full-size dialogs work in English and Arabic; Escape dismisses the dialog and restores focus to the trigger.
- Video playback: a 40-second clip reached ready state 4 and advanced normally; the Arabic caption track reached loaded state 2 and displayed captions on screen. All four files were measured by ffprobe as H.264, 1280×720, duration 40.0 seconds. See `tour-media.json`.
- Arabic search for `المحفظة` returned the relevant Arabic feature and handbook content.
- Language counterpart controls preserved the current handbook, changing HTML `lang`/`dir` between English/LTR and Arabic/RTL. RTL dialog bounds and sidebar placement were checked, with no horizontal page overflow.
- Both light and dark palettes were reviewed. Local Arabic/Latin fonts, localized controls and technical-detail disclosure were checked.
- Original backend status remained its pre-existing untracked `bun.lock`. No frontend application source changes were made.
- Reference ERP repository was cloned locally; the new copy's origin was removed. No commit, push or deployment was performed.

## Limits

- Backend/frontend application test suites were not run, in accordance with the user's instructions. Documentation checks and builds are not transactional application tests.
- The inherited Fumadocs CSS emits non-blocking `::highlight(fd-search)` parser warnings during build.
- Source extraction enumerates explicit backend controller-array declarations; resource/helper/group-generated routes can require direct source inspection. URI fragments may inherit prefixes and permissions.
- Screenshots prove selected visible states on the capture date, not end-to-end correctness or parity between local and deployed commits.
- Three older customer captures use a mobile-width view. The guided customer tour uses the newer desktop account and invoice captures.
- Videos are silent, captioned teaching clips assembled from screenshots, not recordings of a live transaction. A text transcript is also available below each video.
- The development app was left running at http://localhost:3100/docs for the user's review. English and Arabic visual-learning pages were opened.

## Useful files

- `source-inventory.json`: reviewed commit IDs, route paths, per-feature backend references, request field names and enum values.
- `preview-home.jpg`: reviewed documentation homepage.
- `preview-arabic.jpg`: reviewed Arabic business guide.
- `../public/screenshots/`: live demo screenshots used in the bilingual guide.
- `../public/videos/`: eight short MP4 tours, posters and English/Arabic WebVTT captions.
- `ui-polish.md`: approved design direction, audit, nine-pass report and walkthrough details.
- `unslop-home.jpg` and `unslop-tours-ar.jpg`: verified UI refinement previews.


## Browser repair and contextual media expansion — 17 November 2026

- Reproduced the Workflows index bug in the browser: the content link resolved to `/docs/en/commerce`, while the actual route was `/docs/en/workflows/commerce`.
- Canonicalized 1,076 Markdown guide links across both languages. Added English/Arabic redirects for the three shortened workflow URLs. The document checker now rejects relative guide links; `scripts/canonicalize-links.py` repairs generated content.
- `node scripts/check-rendered-routes.mjs` fetched all 206 pages: all returned HTTP 200, with no unknown rendered internal guide destinations. Results are recorded in `rendered-route-check.json`.
- Added seven read-only live captures: stock balances, stock filters, locations, empty movement history, return list, return overview and return handling. No inventory/return changes were submitted. The empty movement ledger is explained explicitly.
- Added inventory and returns interactive tours in both languages, and placed relevant existing tours inside commerce, money and onboarding workflows. The learning hub links directly to task guides.
- Enabled 30-second product and order teaching clips, and generated two additional 40-second inventory/returns clips. Total: eight H.264 1280×720 videos and 19 screenshot files. Each video has English and Arabic caption files and a transcript.
- Browser interaction verified inventory step changes, screenshot enlargement and close/focus return. Inventory playback advanced beyond 28 seconds with English captions visible. Arabic return playback selected Arabic captions by default.
- Arabic returns were checked at 390×844: HTML language `ar`, direction `rtl`, no horizontal page overflow. The viewport override was reset afterward. Fresh English/Arabic browser console checks had no warnings/errors. The earlier hydration warning could not be reproduced in the clean browser session; the user's Chrome contains active DOM-injecting extensions, but its full mismatch diff could not be inspected because native capture/input failed. No blanket hydration suppression was added.
- `bun run docs:check`, `bun run types:check` and production build passed. The existing Fumadocs CSS highlight parser warning remains non-blocking. Backend/frontend application suites were not run.


## Repository refresh and inspired template — 17 November 2026

- Pulled all five CartJoin source repositories with `git pull --ff-only`; four advanced and vendor was already current. Local environment edits and lockfiles were preserved. Docs has no remote. `repository-update.json` records the exact commits and changed files.
- Updated English and Arabic guides for pricing quantities/flash discounts, tenant pricing scope, address normalization, shipping quotes, invoice item snapshots, gift-card validation, wishlist details, cache invalidation and localization changes.
- Reviewed Attio, Stripe Risk docs, Saaspo documentation examples and Notion documentation templates. Adapted their spacing, hierarchy and topic organization to CartJoin's existing green/cream identity. Used CartJoin screenshots rather than external product artwork. Unslop attribution remains in README.
- Added an interactive four-dashboard homepage preview, seven-topic searchable capability library, grouped navigation, segmented language control and feature-page shortcuts. Fixed empty opposite-language sidebar folders by removing orphan separators.
- Refreshed 127 unique screenshots: 124 role–capability combinations and three additional focused views. Capture metadata records URLs, date and validated authenticated states. The vendor team image is cropped to exclude non-demo contact details; customer/staff lists were filtered to demo identities. Login screens and incomplete captures were rejected and replaced.
- All 44 capabilities now include dashboard-specific interactive screenshots, English/Arabic explanations and captioned short videos. Total: 52 screenshot-based silent MP4 tours, bilingual WebVTT captions and readable transcripts. These illustrate observed screens; they do not execute transactions. `video-verification.json` verifies H.264 encoding and expected durations for all 52.
- Admin, tenant and customer screenshots use production-configuration local frontend previews after the pull, connected through development proxies to the demo API. Vendor screenshots use the unchanged deployed vendor frontend. Deployed backend commit parity is not claimed. Temporary frontend previews were stopped after capture.
- Browser verified homepage presentation, capability search (invoice returned three matching guides), dashboard selection changing its explanation/image, Arabic RTL at 390×844 with no horizontal overflow, and video playback with Arabic captions selected. Viewport was reset.
- `bun run docs:check` and `bun run types:check` passed for 208 pages, 12 diagram blocks, 52 tours and 187 frontend route entries. Production build passed. All 208 rendered routes returned success with no unknown internal destinations. The first route pass caught unsupported HTML comments in MDX; fixed them to JSX comments and repeated successfully.
- The inherited Fumadocs `::highlight(fd-search)` CSS parser warnings remain non-blocking. Backend/frontend application suites were not run. Documentation and media validation are separate from transactional application tests.
- Review screenshots: `template-homepage.jpg`, `template-ar-mobile.jpg`. Capture ledger: `feature-captures.json`; capability matrix: `visual-coverage.json` and bilingual coverage pages.


## Customer website refresh — 17 November 2026

- Pulled the clean storefront repository from `5fc5565` to `598d8cd` with a fast-forward. No storefront source files were modified by this task.
- Rewrote both customer handbooks around everyday shopping tasks, website labels and clear checkout/account decisions. Updated bilingual Brands, Vendors, Support, Cart and Wishlist feature guidance against the changed source.
- Refreshed 24 customer feature screenshots and added four focused views: filtered brands, seller detail, Help centre and an expanded FAQ answer. Reviewed the images and replaced seller-loading and incorrectly framed brand captures before the final video rebuild. Demo account only; no purchase, refund, claim, wishlist mutation or account edit was submitted.
- Added four 48-second customer-only screenshot tours (discovery, basket/checkout, aftercare, money/rewards), with English/Arabic WebVTT and transcripts. Rebuilt 29 customer-related clips and corrected three affected clips after visual QA. Total is now 56 tours/videos. All video codecs and durations verified.
- Built customer handbooks render in English and Arabic. Browser verified seller-step selection changes the English explanation and image, checkout-step selection changes the Arabic explanation, and Arabic playback advances with Arabic captions visible. The dev preview initially did not apply step changes; the built production preview was verified and left running. No cause was established for the dev-only observation.
- `docs:check`, type checking and production build passed. The existing inherited CSS highlight parser warnings remain. All 208 rendered routes passed with no broken destinations. Application test suites were not run.
- `customer-refresh.json` records commits, reviewed source files and capture limits. `customer-handbook-ar-video.jpg` shows the updated guide and its captioned player. Screenshots use the latest local production-configuration frontend with the deployed demo API; backend deployment parity is not asserted.


## Admin, tenant and vendor refresh — 17 November 2026

- Pulled all three dashboard repos with `git pull --ff-only`. Admin `a747603` and vendor `360fd56` were already current; tenant advanced `11f3034` → `cb0f52e` with a .gitignore-only change. No UI/business behavior changed in the pull. Existing environment edits and admin bun.lock were preserved. No application source edits, commits or pushes were made.
- Rewrote English and Arabic handbooks for platform oversight/investigation, tenant store/order operations and vendor workspace/offer/fulfillment/earnings tasks. Preserved technical route maps and linked detailed rules. Reviewed frontend navigation and order-service restrictions; platform order oversight remains read-only, tenant workflow actions remain distinct, and vendor scope/cancellation restrictions are explained.
- Refreshed 103 screenshots from authorized deployed demo dashboards: 38 admin, 43 tenant and 22 vendor. Login/loading checks passed; demo customer/staff list filters and the vendor staff crop remain. No business mutations, approvals, payouts, account edits or live purchases were submitted. Local source review and deployed observations are separate evidence; deployed commit parity is not asserted.
- Added 12 role-specific 48-second tours (four per role), each using only its own dashboard images, bilingual explanations, English/Arabic WebVTT and transcripts. Rebuilt 60 operator-related videos from refreshed images. The guide now contains 68 tours/videos overall. `operator-tour-plan.json` maps the new tours; `operator-refresh.json` records pull results and scope.
- Visual contact-sheet review confirmed representative overview, catalog, finance, roles, workspace and payment-method screens. Browser checks verified all three English handbooks and all three Arabic handbooks with four tours each, step changes updating both image and explanation, screenshot enlargement/close, and caption selection. English and Arabic vendor playback advanced beyond 11 seconds; admin and tenant playback also advanced. Fresh docs console checks showed no errors or warnings.
- Caught a vendor media 404 because production started before the last new media files existed. Restarted after generation completed, checked all 68 videos/posters/caption pairs over HTTP, and retested vendor playback successfully. `video-verification.json` records successful serving plus H.264 codecs and expected durations.
- `bun run types:check`, `bun run docs:check` and production build passed. All 208 rendered routes passed with no unknown internal destinations. Existing Fumadocs CSS highlight parser warnings remain non-blocking. Application test suites were not run.
- Built review app left running at http://127.0.0.1:3100/docs. Role previews: `admin-handbook-en.jpg`, `admin-handbook-ar.jpg`, `tenant-handbook-en.jpg`, `tenant-handbook-ar.jpg`, `vendor-handbook-en.jpg`, `vendor-handbook-ar.jpg`.

## 18 November development billing and onboarding checkpoint

- Backend master checkpoints: a565c369 (subscription/module), 5562b3bc (mode/return protection), a9236b95 (public availability privacy and audit scope).
- Admin master791776c; tenant master8df49d6; private platform master0ac04ba. Vendor/storefront retain the published central-identity checkpoint while later operational work continues.
- Subscription/BaseModule regression65 passed/897 assertions. Notification/Review/Payment/Loyalty195 passed/614 assertions. Mode/commerce run337 passed; two obsolete role-backfill fixtures were corrected to current development-schema invariants and both passed/9 assertions. Product policy30 passed/73 assertions; return-window policy7 passed/18 assertions; pending-exit/public catalog1 passed/6 assertions. Customer-facing restricted checkout privacy test passed/3 assertions.
- Admin eight and tenant five focused API tests passed, including populated application/invoice rows after ApiClient pagination normalization. Both production builds passed. Admin targeted ESLint passed. Tenant does not declare an ESLint dependency/command. Platform three route/retry/receipt tests, production build and typecheck passed.
- MySQL read-only central identity audit completed: four identities, zero collision groups, zero missing login identifiers or normalization gaps. Its authorization_cutover_ready flag is deliberately not a runtime authorization assessment; endpoint tests supply that separate evidence.
- Browser verified EN/AR package listing, application receipt and protected review rows, quote confirmation and simulated paid activation. No actual money, transfer or live deployment occurred. Admin/tenant console error checks were empty.
- Docs build and typecheck passed; all230 rendered pages returned200 without broken internal guide links. Feature jump headings are now checked for both languages. Browser verified English and Arabic screenshot selection, step navigation, actual24-second MP4 playback and default Arabic captions. Four new MP4s have valid H.2641280×720 streams and24/32-second durations. They are labeled screenshot walkthroughs rather than live transaction recordings.
- Later roadmap phases are not marked complete. New captures are synthetic local preview data; original deployed capture provenance is preserved.

## 18 November 2026 — Carrier labels and session review

Tenant73, vendor47, admin16 and customer8 focused tests passed; all four production builds passed. Backend Shipping/ShippingProvider72 passed195 assertions before the final projection/envelope changes, followed by signed-carrier16 passed67 and tenant-auth10 passed29. Published tenantbaf5b40, vendorec9d244, admin0d7362c, storefrontc7823db; backend shipping806d750f/e55ed88f and authb61ac88b.

Browser generated and reused private TEST labels for tenant shipment3 and vendor shipment4 in a synthetic local SQLite preview. Verified the private PDF download, named eligible carrier list, explicit vendor-label policy confirmation, persistent TEST marker, unchanged Pending status after label generation, and matched English/Arabic screens. Local tenant selector corrected from6 to1 without publishing environment overrides. A nested label response that hid existing rows and parallel JWT renewal races were found and fixed. No live carrier booking, external message or charge.

Added11 screenshots, one contextual four-step tour and two32-second captioned walkthroughs. Both MP4s played to completion with the correct default captions and no media errors. English/Arabic carrier guide console checks had zero errors. Docs check230 pages26 diagrams74 tours and production build passed. Later marketplace operations, consent and global discovery remain active work; live provider/pilot/deployment gates remain separate.

## 18 November 2026 — Document expiry and review

Backend8db1df30: Vendor48 tests127 assertions, including UTC day boundaries, reversible additive migration, stale approval, immutable vendor, forced Pending uploads and generic status permission enforcement. Expiry migration applied to development MySQL and local SQLite without reset/reseed. Admin26 document/API/i18n tests passed; final explicit unchanged-choice refinement13 dialog tests passed; vendor17 document/i18n tests passed. Admin7ef78b1 and vendoree9b240 production/development builds passed and are pushed. Storefront56aa211 fixes renewable expired basket routing,9 focused tests/prod build passed.

Eight local bilingual screenshots use synthetic expiry metadata and upload forms without submitting compliance files. Browser observed expired/due/undated rows, disabled expired approval and explicit unchanged-review choice; zero admin/vendor console errors. New4-step tour and two32-second clips played to completion with EN/AR default captions and no errors. Docs230 pages26 diagrams75 tours and production build passed. Fixed an existing duplicate vendor participation tour anchor. Marketplace policy, targets, case/appeal/operational queues, consent and discovery remain active work.
