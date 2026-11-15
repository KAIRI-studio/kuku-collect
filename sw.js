const CACHE='kuku-collect-save1';
const ASSETS=['./progression.js?v=gacha-rates1','./','./index.html','./manifest.webmanifest','./manifest.webmanifest?v=homeicon1','./assets/app-icon/apple-touch-icon-v1.png','./assets/app-icon/icon-192-v1.png','./assets/app-icon/icon-512-v1.png','./assets/app-icon/favicon-v1.png','./polish.css?v=viewport-fit1','./polish.js?v=save1','./sound.js?v=audio-recovery1','./audio.css?v=uploaded1','./assets/audio/tap.mp3','./assets/audio/correct.mp3','./assets/audio/wrong.mp3','./assets/audio/arrival.mp3','./assets/audio/capsule.mp3','./backup.js?v=tutorial1','./finishing.js?v=save1','./finishing.css?v=tutorial1'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
async function refreshOlderPages() {
 const pages = await self.clients.matchAll({type:'window'});
 await Promise.all(pages.filter(page => page.url.startsWith(self.registration.scope)).map(async page => {
  const current = await new Promise(resolve => {
   const channel = new MessageChannel();
   const timer = setTimeout(() => done(false), 800);
   function done(matches) {
    clearTimeout(timer);
    channel.port1.close();
    resolve(matches);
   }
   channel.port1.onmessage = event => done(event.data === 'save1');
   try { page.postMessage({type:'kuku-page-version'}, [channel.port2]); }
   catch { done(true); }
  });
  if (!current) await page.navigate(page.url).catch(() => {});
 }));
}
self.addEventListener('activate', e => {
 e.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(key => key.startsWith('kuku-collect-') && key !== CACHE).map(key => caches.delete(key)));
  await self.clients.claim();
  await refreshOlderPages();
 })());
});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(fetch(e.request,{cache:e.request.mode==='navigate'?'no-store':'default'}).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r}).catch(()=>caches.match(e.request)))});

