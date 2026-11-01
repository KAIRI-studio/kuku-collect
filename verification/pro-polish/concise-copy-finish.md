# Concise screen copy — 2026-11-01 JST

- Title: removed the tagline; logo, start, help and studio credit remain.
- Home: shortened recommendation labels, reduced the first-time guide to one path line, removed the capsule caption and normal save-status sentence. Error messages remain intact.
- Learning: removed repeated step captions and reward explanation; kept mode names, reading, equations, answer reveal, question action and the short gacha-distance count. Learning records and their explanation are collapsed under `きろく`.
- Quiz/result: shortened the question hint, reward unit, answer feedback and next actions. Exact earned points and the breakdown remain available. Removed result/selection navigation that duplicated the bottom menu.
- Collection: short ownership filter and counts, concise place/remove labels, abbreviated rarity tags/groups, no repeated locked-card explanation or gacha hint. Character names and artwork are unchanged; place/remove controls retain descriptive accessible labels.
- Gacha: removed the duplicate balance paragraph and decorative subtitle. Kept draw cost, shortfall and optional rules under `くわしく`.
- Exchange: one short explanation of random unowned selection, concise rarity rows and cost buttons, exact shortfall notices. First-fragment guidance remains contextual.

## Checks

- Bootstrap and combined rarity/ownership tests passed after copy assertion updates. No progression/reward/cost or saved-data behavior changed.
- Inline JavaScript syntax and CSS structure checked; character rendering/walking matched the previous source.
- Browser QA: title, fresh home, selection, reading, recall, quiz, result, gacha, collection and rarity exchange reviewed. Preview placement added then removed カイリ, restoring the original favorite order. Three correct questions still earned 100 points; result details showed +30/+30/+40.
- Exchange explanation still stated random unowned selection; LR160/SR80/R30 costs remained visible. At 320px the exchange panel had equal client/scroll widths of 269px.
- Screenshots: `concise-collection.jpg`, `concise-gacha.jpg`. QA used in-memory preview modes, with no writes to real progress.
