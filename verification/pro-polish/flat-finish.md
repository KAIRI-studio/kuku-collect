# Flat-art finish — 2026-11-01 JST

The existing home room (`assets/companion-3.webp`) is the visual reference. The title now reuses it instead of the generated painted room, with no characters; the large centered logo retains its gentle 4-second motion. The caption sits above the logo to avoid the window. Studio splash size remains unchanged.

Home: recommendation and learning record occupy the upper wall; on short displays the record moves to the right of the window. Existing room geometry, feet, effects, names, rarity, and ordered favorites are unchanged.

UI: consistent warm colors, button sizes, type hierarchy, readable supporting text, quieter rarity foil, compact collection tools. Gacha artwork flexes into the remaining height; duplicated post-reveal results are hidden because the reveal dialog already presents them.

Learning: distinct-day success is shown separately from clear flags. Three successful days gives a green marker; same-day repetition does not increase the streak, and wrong answers reset it. Legacy clear flags are preserved and are not converted into mastery. The summary reads existing practice records without writing to the saved state.

## Validation

- 8 Node tests passed: existing progression rules, end-to-end bootstrap, new distinct-day progress/read-only summary test.
- Character and walking source compared with the pre-change GitHub file: identical.
- CSS braces balanced; JavaScript syntax checked.
- Public browser QA inside same-origin iframes at 390×844, 375×667, 320×568. Collapsed gacha had matching scrollHeight/clientHeight: 694/694, 530/530, 441/441 respectively before a draw.
- Checked title, home, collection, learning, quiz, result, gacha and reveal flow. Fresh in-memory preview: first three answers → 100 points → R ぷくりん → room placement. Owned-only collection showed that one character; all view showed locked exchange cards.
- Full-roster and fresh preview flags disable save writes. No real saved placement was changed during QA.
- Browser QA is Chromium in smartphone-sized frames; physical iOS/Safari was not tested. Audio was outside this task.

Screenshots: `title-flat-final.jpg`, `cards-flat.jpg`, `result-flat.jpg`.
