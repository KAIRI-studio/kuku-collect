(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KukuRules=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const DAY=86400000,RATES={N:69.5,R:25,SR:5,LR:0.5},DUPLICATES={N:1,R:3,SR:8,LR:20},COSTS={N:10,R:30,SR:80,LR:160};
 const dayKey=now=>new Date(now+9*3600000).toISOString().slice(0,10);
 const valid=q=>q&&Number.isInteger(q.d)&&q.d>=1&&q.d<=9&&Number.isInteger(q.n)&&q.n>=1&&q.n<=9;
 const key=q=>q.d+'-'+q.n;
 function init(s,now=Date.now()){
  if(!s.practice||typeof s.practice!=='object'||Array.isArray(s.practice))s.practice={};
  if(!s.dailyPractice||s.dailyPractice.date!==dayKey(now))s.dailyPractice={date:dayKey(now),correct:{}};
  if(!s.dailyPractice.correct||typeof s.dailyPractice.correct!=='object')s.dailyPractice.correct={};
  if(!Number.isFinite(s.fragments)||s.fragments<0)s.fragments=0;
  if(typeof s.fragmentExchangeUnlocked!=='boolean')s.fragmentExchangeUnlocked=!!(s.fragments>0||(s.lastDraw&&s.lastDraw.source==='exchange')||(s.lastDraw&&s.lastDraw.fragments>0));
  if(s.fragments>0)s.fragmentExchangeUnlocked=true;
  if(!Number.isInteger(s.drawCount)||s.drawCount<0)s.drawCount=0;
  if(typeof s.starterBonusClaimed!=='boolean')s.starterBonusClaimed=!!((s.owned||[]).length||Object.keys(s.clears||{}).length);
  if(!s.settings||typeof s.settings!=='object')s.settings={};
  if(typeof s.settings.effects!=='boolean')s.settings.effects=true;
  return s;
 }
 function rewardFor(s,q,review=false,now=Date.now()){
  init(s,now);if(!valid(q))return 0;
  return s.dailyPractice.correct[key(q)]?2:(review?15:10);
 }
 function answer(s,q,ok,review=false,now=Date.now()){
  init(s,now);if(!valid(q))throw new Error('Invalid practice item');
  const id=key(q),p=s.practice[id]||{streak:0,misses:0,due:0,last:0,needsReview:false};let points=0;
  if(ok){
   points=rewardFor(s,q,review,now);s.points+=points;
   s.dailyPractice.correct[id]=(s.dailyPractice.correct[id]||0)+1;
   if(p.correctDay!==dayKey(now)||p.needsReview){p.streak=Math.min(3,(p.streak||0)+1);p.due=now+[DAY,3*DAY,7*DAY][p.streak-1]}
   p.correctDay=dayKey(now);p.needsReview=false;
  }else{p.streak=0;p.misses=(p.misses||0)+1;p.needsReview=true;p.due=now}
  p.last=now;s.practice[id]=p;return {points,review,repeat:ok&&s.dailyPractice.correct[id]>1};
 }
 function complete(s,d,g,perfect,now=Date.now()){
  init(s,now);let clearBonus=0,starterBonus=0;
  if(perfect){
   const id=d+'-'+g;if(!s.clears[id]){s.clears[id]=true;clearBonus=30}
   if(!s.starterBonusClaimed){s.starterBonusClaimed=true;starterBonus=40}
  }
  s.points+=clearBonus+starterBonus;return {clearBonus,starterBonus,total:clearBonus+starterBonus};
 }
 function due(s,now=Date.now()){
  init(s,now);return Object.entries(s.practice).map(([id,p])=>{const [d,n]=id.split('-').map(Number);return {d,n,...p}}).filter(q=>valid(q)&&(q.needsReview||q.due<=now)).sort((a,b)=>Number(!!b.needsReview)-Number(!!a.needsReview)||(a.due||0)-(b.due||0));
 }
 function next(s,now=Date.now()){
  const items=due(s,now);if(items.length)return {kind:'review',items:items.slice(0,3),label:items.some(q=>q.needsReview)?'まちがえたもんだいを ふくしゅう':'おぼえているか ふくしゅう'};
  for(const d of [2,3,4,5,6,7,8,9,1])for(let g=0;g<3;g++)if(!s.clears[d+'-'+g])return {kind:'learn',d,g,label:d+'のだんを おぼえよう'};
  const part=Math.floor(now/DAY)%27;return {kind:'learn',d:Math.floor(part/3)+1,g:part%3,label:'きょうの おさらい'};
 }
 function mastery(s,d=null,now=Date.now()){
  let started=0,steady=0,review=0;const items=[];
  for(let a=d||1;a<=(d||9);a++)for(let n=1;n<=9;n++){
   const p=(s.practice||{})[a+'-'+n];let stage='new';
   if(p){if(p.needsReview)stage='review';else if(p.streak>=3)stage='steady';else if(p.streak>0)stage='practice';
    if(p.streak>0&&!p.needsReview)started++;if(p.streak>=3&&!p.needsReview)steady++;if(p.needsReview||p.due<=now)review++}
   items.push({d:a,n,stage});
  }
  const clearedSets=Object.entries(s.clears||{}).filter(([id,on])=>on&&(!d||id.startsWith(d+'-'))).length;
  return {total:d?9:81,started,steady,review,clearedSets,items};
 }
 function rarity(roll){const r=Math.min(.999999999,Math.max(0,roll))*100;let sum=0;for(const [code,weight]of Object.entries(RATES)){sum+=weight;if(r<sum)return code}return 'LR'}
 function draw(s,codes,random=Math.random,now=Date.now()){
  init(s,now);if(s.points<100)return null;
  const code=rarity(random()),all=codes.map((r,i)=>r===code?i:-1).filter(i=>i>=0),unowned=all.filter(i=>!s.owned.includes(i)),pool=unowned.length?unowned:all;
  if(!pool.length)throw new Error('Missing rarity pool');
  const i=pool[Math.min(pool.length-1,Math.floor(Math.max(0,random())*pool.length))],fresh=!s.owned.includes(i),fragments=fresh?0:DUPLICATES[code];
  const firstFragments=!fresh&&!s.fragmentExchangeUnlocked;
  s.points-=100;s.drawCount++;if(fresh)s.owned.push(i);else{s.fragments+=fragments;s.fragmentExchangeUnlocked=true}
  const result={i,rarity:code,fresh,fragments,firstFragments,source:'gacha',at:now};s.lastDraw=result;return result;
 }
 function exchange(s,i,codes,now=Date.now()){
  init(s,now);if(!Number.isInteger(i)||i<0||i>=codes.length||s.owned.includes(i))return null;
  const cost=COSTS[codes[i]];if(!cost||s.fragments<cost)return null;
  s.fragments-=cost;s.owned.push(i);const result={i,rarity:codes[i],fresh:true,fragments:0,source:'exchange',cost,at:now};s.lastDraw=result;return result;
 }
 function exchangeRarity(s,code,codes,random=Math.random,now=Date.now()){
  init(s,now);if(!Object.prototype.hasOwnProperty.call(COSTS,code))return null;const cost=COSTS[code];if(s.fragments<cost)return null;
  const pool=codes.map((r,i)=>r===code&&!s.owned.includes(i)?i:-1).filter(i=>i>=0);if(!pool.length)return null;
  const roll=Number(random());if(!Number.isFinite(roll))return null;
  const i=pool[Math.floor(Math.min(.999999999,Math.max(0,roll))*pool.length)];return exchange(s,i,codes,now);
 }

 return {DAY,RATES,DUPLICATES,COSTS,dayKey,init,rewardFor,answer,complete,due,next,mastery,rarity,draw,exchange,exchangeRarity};
});


