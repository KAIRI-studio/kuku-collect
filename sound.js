(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KukuSound=api.create({settings:()=>state.settings||{},hidden:()=>document.hidden,context:()=>{
 try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch{}
 return new (window.AudioContext||window.webkitAudioContext)();
},fetch:url=>fetch(url),now:()=>Date.now()})})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clips={tap:{file:'tap',gain:.35,group:'tap'},correct:{file:'correct',gain:.55,group:'answer'},wrong:{file:'wrong',gain:.40,group:'answer'},capsule:{file:'capsule',gain:.26,group:'reveal'},arrival:{file:'arrival',gain:.32,group:'reveal'}};
function create(env){
 let ctx=null;const buffers=new Map(),voices=new Map(),versions=new Map();
 const volume=()=>{const v=env.settings().effectsVolume;return typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(1,v)):.75};
 function setup(){try{if(!ctx)ctx=env.context();if(ctx.state==='suspended'||ctx.state==='interrupted')Promise.resolve(ctx.resume()).catch(()=>{});return ctx}catch{return null}}
 function load(key){if(buffers.has(key))return buffers.get(key);const c=setup();if(!c)return Promise.resolve(null);const p=env.fetch('./assets/audio/'+clips[key].file+'.mp3').then(r=>{if(!r.ok)throw Error('audio');return r.arrayBuffer()}).then(b=>c.decodeAudioData(b)).catch(()=>{buffers.delete(key);return null});buffers.set(key,p);return p}
 function stop(group,fade=.05){versions.set(group,(versions.get(group)||0)+1);const v=voices.get(group);if(!v||!ctx)return;voices.delete(group);try{v.gain.gain.cancelScheduledValues(ctx.currentTime);v.gain.gain.setValueAtTime(v.gain.gain.value,ctx.currentTime);v.gain.gain.linearRampToValueAtTime(0,ctx.currentTime+fade);v.source.stop(ctx.currentTime+fade+.01)}catch{}}
 function stopAll(){for(const g of ['tap','answer','reveal'])stop(g)}
 async function play(key){
  const spec=clips[key];if(!spec||!env.settings().effects||!volume()||env.hidden())return;
  const c=setup();if(!c)return;stop(spec.group);const version=versions.get(spec.group),at=env.now();
  try{const b=await load(key);if(!b||versions.get(spec.group)!==version||!env.settings().effects||!volume()||env.hidden()||env.now()-at>600)return;
   const source=c.createBufferSource(),gain=c.createGain();source.buffer=b;gain.gain.value=spec.gain*volume();source.connect(gain);gain.connect(c.destination);
   const voice={source,gain};voices.set(spec.group,voice);source.onended=()=>{if(voices.get(spec.group)===voice)voices.delete(spec.group);try{source.disconnect();gain.disconnect()}catch{}};source.start();
  }catch{}
 }
 function prime(){if(!setup())return;for(const k of Object.keys(clips))load(k)}
 function quietForSpeech(){stop('tap',.04);stop('reveal',.06)}
 function suspend(){stopAll();if(ctx)Promise.resolve(ctx.suspend()).catch(()=>{})}
 return {play,prime,stop,stopAll,quietForSpeech,suspend,volume};
}
return {create,clips};
});