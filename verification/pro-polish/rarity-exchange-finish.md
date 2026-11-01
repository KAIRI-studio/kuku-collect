# Rarity exchange refinement — 2026-11-01 JST

- Hide collection wallet, exchange panel, and gacha fragment balance before fragments are first obtained. First duplicate reveal introduces the fragment system. Existing positive balances unlock the UI; an unlock flag keeps it visible after spending to zero.
- Replace individual anonymous-card exchange buttons with one exchange action per rarity. Explain that the result is a random, unowned member of the selected rarity. Completed rarities cannot be exchanged. Cost and ordinary gacha rates/rewards are unchanged.
- Keep the existing insufficient-fragment message and button feedback. Refresh the wallet, missing counts and collection immediately when the exchange reveal closes.
- Preserve character IDs, names, rarity, walking/rendering code, ownership, ordered favorites and save key. Added metadata is additive.

## Verification

- 12 automated checks passed before browser QA; the four affected bootstrap/exchange tests passed after the close-refresh fix. The bootstrap now asserts that the displayed wallet updates to zero after closing the reveal.
- Source syntax, balanced CSS and unchanged character rendering/walking verified.
- Fresh preview: 50 locked cards, no revealing images or individual exchange buttons; wallet and exchange panel hidden.
- Isolated exchange preview starts with 160 fragments and all N companions, without writing real saved data. Exchange screen showed LR160/SR80/R30 and a disabled completed-N row.
- Exchange of LR160 yielded an unowned LR よるまる, changed owned count 20→21, remaining LR count 10→9, and wallet 160→0 immediately on closing the reveal. The wallet remained available at zero.
- SR exchange at zero showed an 80-fragment shortfall without charging. The rarity filter reduced the exchange list to the selected rarity. At 320px width the exchange panel had no horizontal overflow.
- Normal gameplay was opened separately for link verification. Physical iOS/Safari and multi-day child testing remain unperformed.

QA modes (`preview-progress`, `preview-roster`, `preview-exchange`) are explicitly in-memory and suppress save writes. Screenshots: `exchange-by-rarity.jpg`, `exchange-by-rarity-final.jpg`.
