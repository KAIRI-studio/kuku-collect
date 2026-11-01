# Experience finish — 2026-11-01 JST

Implemented the six requested improvements while retaining the flat home artwork, anonymous unmet characters, high title logo, and simple home without record/title-return panels.

1. First-companion guidance lives in the existing recommendation card: learning → gacha → room. A decorative capsule and short caption occupy the empty rug until a companion is placed. At 100 points the recommendation opens gacha; an owned but unplaced companion prompts room placement. The room picker clears rarity filters so an owned companion cannot be hidden by an earlier selection.
2. The high title logo uses a bounded vertical position, and the existing room art scales modestly on tall screens. No new generated artwork or title characters.
3. Results prioritize score, earned points, and next actions. The point breakdown and learning record are in a collapsed details section. Short learning hints prevent small-text overflow.
4. Buttons visibly depress, correct answers show circle marks, incorrect choices show triangles, and points show a brief increment badge. Reduced-motion styles disable new animations; the point pulse also respects that preference.
5. All/LR/SR/R/N rarity filters combine with owned/all. Empty filtered results explain the selected rarity; filters do not change ownership, placement or rarity. Reveal-to-collection navigation clears an unrelated rarity selection.
6. Optional recall mode hides the reading list and answer, lets the learner say the phrase then reveal it, and hides it again for the next item/group. It has no points, clear flags, or self-reported scoring. Normal quiz rewards remain unchanged.

## Validation

- 9 Node tests passed, including the extended bootstrap flow for recall, guide states, first draw and placement, and a new combined rarity/ownership filter test. Existing rewards, duplicate fragments, exchange, JST day transitions and distinct-day learning tests remain passing.
- Inline script syntax, `polish.js`, and balanced CSS braces checked.
- Character rendering and walking code compared with the baseline: unchanged. No character assets, names, IDs, rarity or save-key changes.
- Chromium same-origin iframe QA at 320×568, 375×667, 390×844, 460×1000. Both reading and recall modes fit without vertical scrolling: 441/441, 530/530, 694/694, 850/850 scrollHeight/clientHeight respectively. Challenge buttons were above the section bottom in all eight checks.
- Title caption/logo/start bounds checked at small, medium and tall dimensions; all remain inside the screen.
- Full-roster preview: SR 10, N 20, LR 10 cards with the corresponding group only.
- Fresh preview: hidden answer → reveal → next hidden answer → next group, points remain 0. First three normal answers earn 100 points. Result details disclose +30 correct, +30 clear, +40 first-adventure bonuses. Correct circle and +10 badge confirmed in the DOM.
- Fresh flow: home gacha recommendation → R みずぷに → close without placement → home placement recommendation → collection → place → home. Capsule placeholder hides and normal recommendation returns. Removed home record/title-return panels remain absent.
- QA used preview flags that disable save writes. No real saved placements were changed.
- Physical iOS/Safari and long-term child playtesting were not performed. Audio was not modified.

Screenshots: `experience-title.jpg`, `experience-first-home.jpg`, `experience-rarity.jpg`, `experience-recall-final.jpg`, `experience-result.jpg`.
