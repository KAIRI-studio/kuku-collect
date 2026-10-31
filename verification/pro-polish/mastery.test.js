const test=require('node:test'),assert=require('node:assert/strict'),R=require('../../progression.js');
const start=Date.parse('2026-11-01T10:00:00+09:00');
test('mastery reports distinct-day progress without treating old clears as mastery or changing saved data',()=>{
 const s={points:46,owned:[0,1,2],favorites:[2,0],clears:{'2-0':true}},q={d:2,n:1};
 const before=JSON.stringify(s);assert.equal(R.mastery(s,2,start).steady,0);assert.equal(R.mastery(s,2,start).clearedSets,1);assert.equal(JSON.stringify(s),before);
 R.answer(s,q,true,false,start);R.answer(s,q,true,false,start+1000);assert.equal(R.mastery(s,2,start).started,1);assert.equal(R.mastery(s,2,start).steady,0);assert.equal(s.practice['2-1'].streak,1);
 R.answer(s,q,true,true,start+R.DAY);assert.equal(R.mastery(s,2,start+R.DAY).steady,0);
 R.answer(s,q,true,true,start+4*R.DAY);let m=R.mastery(s,2,start+4*R.DAY);assert.equal(m.steady,1);assert.equal(m.total,9);assert.equal(m.items[0].stage,'steady');assert.equal(R.mastery(s,null,start+4*R.DAY).total,81);
 const saved=JSON.stringify(s);R.mastery(s,null,start+5*R.DAY);assert.equal(JSON.stringify(s),saved);
 R.answer(s,q,false,true,start+5*R.DAY);m=R.mastery(s,2,start+5*R.DAY);assert.equal(m.steady,0);assert.equal(m.items[0].stage,'review');assert.equal(m.review,1);assert.deepEqual(s.favorites,[2,0]);assert.deepEqual(s.owned,[0,1,2]);
});
