(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KukuBackup=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function validate(input,total=50){
 const bad=()=>{throw new Error('九九コレクトのバックアップを選んでください。')};
 if(!input||input.app!=='kuku-collect'||input.version!==1||!input.state||typeof input.state!=='object')bad();
 const s=JSON.parse(JSON.stringify(input.state)),integer=(v,max)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
 if(!integer(s.points,1e9)||!integer(s.fragments===undefined?0:s.fragments,1e9)||s.rosterVersion!==1)bad();
 for(const key of ['owned','favorites']){if(!Array.isArray(s[key])||s[key].some(i=>!integer(i,total-1))||new Set(s[key]).size!==s[key].length)bad()}
 if(s.favorites.length>5||s.favorites.some(i=>!s.owned.includes(i)))bad();
 if(!s.clears||Array.isArray(s.clears)||typeof s.clears!=='object'||Object.entries(s.clears).some(([k,v])=>!/^([1-9])-([0-2])$/.test(k)||typeof v!=='boolean'))bad();
 if(s.practice!==undefined){if(!s.practice||Array.isArray(s.practice)||typeof s.practice!=='object')bad();for(const [k,p]of Object.entries(s.practice)){if(!/^[1-9]-[1-9]$/.test(k)||!p||typeof p!=='object'||!integer(p.streak,3))bad();for(const f of ['misses','due','last'])if(p[f]!==undefined&&!integer(p[f],Number.MAX_SAFE_INTEGER))bad();if(p.needsReview!==undefined&&typeof p.needsReview!=='boolean')bad();if(p.correctDay!==undefined&&!/^\d{4}-\d{2}-\d{2}$/.test(p.correctDay))bad()}}
 // Only known state fields are retained; imported text never becomes HTML.
 const keys=['points','owned','favorites','clears','rosterVersion','practice','fragments','fragmentExchangeUnlocked','drawCount','starterBonusClaimed','settings','dailyPractice'];
 const out={};for(const k of keys)if(Object.prototype.hasOwnProperty.call(s,k))out[k]=s[k];
 if(out.dailyPractice){const d=out.dailyPractice;if(typeof d.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||!d.correct||typeof d.correct!=='object'||Array.isArray(d.correct)||Object.entries(d.correct).some(([k,v])=>!/^([1-9])-([1-9])$/.test(k)||!integer(v,1e9)))bad()}
 if(out.settings&&(!out.settings||typeof out.settings!=='object'||Array.isArray(out.settings)||typeof out.settings.effects!=='boolean'))bad();
 if(out.settings&&out.settings.effectsVolume!==undefined&&(typeof out.settings.effectsVolume!=='number'||!Number.isFinite(out.settings.effectsVolume)||out.settings.effectsVolume<0||out.settings.effectsVolume>1))bad();
 for(const k of ['fragmentExchangeUnlocked','starterBonusClaimed'])if(out[k]!==undefined&&typeof out[k]!=='boolean')bad();
 if(out.drawCount!==undefined&&!integer(out.drawCount,1e9))bad();
 return out;
}
function pack(state,now=new Date()){return {app:'kuku-collect',version:1,createdAt:now.toISOString(),state:JSON.parse(JSON.stringify(state))}}
return {validate,pack};
});