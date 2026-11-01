const test=require('node:test'),assert=require('node:assert/strict'),R=require('../../progression.js');
const now=Date.parse('2026-11-01T10:00:00+09:00'),codes=['N','N','R','R','SR','LR'];
function state(){return R.init({points:246,owned:[0,2],favorites:[2,0],clears:{'2-0':true},fragments:160},now)}
test('rarity exchange selects only missing companions of that rarity and charges once',()=>{
 const s=state(),r=R.exchangeRarity(s,'R',codes,()=>.99,now);assert.equal(r.i,3);assert.equal(r.rarity,'R');assert.equal(r.source,'exchange');assert.equal(r.cost,30);assert.equal(s.fragments,130);assert.equal(s.points,246);assert.deepEqual(s.favorites,[2,0]);assert.deepEqual(s.clears,{'2-0':true});assert.deepEqual(s.owned,[0,2,3]);
 const before=JSON.stringify(s);assert.equal(R.exchangeRarity(s,'R',codes,()=>0,now),null);assert.equal(JSON.stringify(s),before);
});
test('insufficient balance, invalid rarity, and a completed rarity never charge or grant a character',()=>{
 const s=state();s.fragments=29;const before=JSON.stringify(s);assert.equal(R.exchangeRarity(s,'R',codes,()=>0,now),null);assert.equal(R.exchangeRarity(s,'invalid',codes,()=>0,now),null);assert.equal(R.exchangeRarity(s,'constructor',codes,()=>0,now),null);assert.equal(JSON.stringify(s),before);
 s.owned.push(1);s.fragments=160;const completed=JSON.stringify(s);assert.equal(R.exchangeRarity(s,'N',codes,()=>0,now),null);assert.equal(JSON.stringify(s),completed);
});
test('first fragments unlock exchange once and the feature remains unlocked after spending to zero',()=>{
 const s=R.init({points:200,owned:[0,1],favorites:[0],clears:{},fragments:0},now);assert.equal(s.fragmentExchangeUnlocked,false);
 const first=R.draw(s,codes,()=>0,now);assert.equal(first.firstFragments,true);assert.equal(s.fragmentExchangeUnlocked,true);assert.equal(s.fragments,1);
 s.fragments=30;assert(R.exchangeRarity(s,'R',codes,()=>0,now));assert.equal(s.fragments,0);R.init(s,now);assert.equal(s.fragmentExchangeUnlocked,true);
 const next=R.draw(s,codes,()=>0,now);assert.equal(next.firstFragments,false);assert.equal(s.fragmentExchangeUnlocked,true);
 const old={points:0,owned:[0],favorites:[],clears:{},fragments:8};R.init(old,now);assert.equal(old.fragmentExchangeUnlocked,true);assert.equal(old.fragments,8);
});
