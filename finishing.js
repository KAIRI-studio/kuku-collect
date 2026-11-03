(function(){
'use strict';
const $=id=>document.getElementById(id),Rules=window.KukuRules;let pendingRestore=null,reactionTimer;
const mark=(code)=>{
 const shapes={
 N:'<path d="M21 43C13 34 16 20 28 17c9-3 17 2 17 10 0 11-10 20-24 16Z" fill="#b4c992"/><path d="M22 42q5-13 15-18" fill="none"/><path d="m28 31 7 1" fill="none" stroke-width="2"/>',
 R:'<path d="M32 12C15 8 9 21 12 32c3 12 17 18 28 10-13 2-22-9-19-19 2-6 6-9 11-11Z" fill="#b5cfd9"/><path d="M44 16q1 7 8 9-7 1-9 8-1-7-8-9 7-1 9-8Z" fill="#fff0c4" stroke-width="2.5"/>',
 SR:'<path d="M32 10q6-9 10 1 10-4 10 6 11 2 4 10 7 8-4 11 0 11-10 6-5 10-10 1-7 9-11-1-10 4-10-6-10-3-4-11-6-8 4-11 0-10 10-6 5-10 11 0Z" fill="#e6c474"/><circle cx="32" cy="27" r="12" fill="#fff0c6"/><path d="M27 22q3-3 7-2" fill="none" stroke="#fff9e8" stroke-width="3"/>',
 LR:'<path d="M13 22q-1-4 3-2l9 8 6-13q1-3 3 0l6 13 9-8q4-2 3 2l-5 21q-15 5-30 0Z" fill="#dfa58f"/><path d="M18 40q14 4 28 0v6q-14 5-28 0Z" fill="#ebcb86"/><path d="m32 26 6 6-6 7-6-7Z" fill="#abcbd7" stroke-width="2.3"/><circle cx="14" cy="20" r="3" fill="#edcf8e"/><circle cx="32" cy="13" r="3" fill="#edcf8e"/><circle cx="50" cy="20" r="3" fill="#edcf8e"/>'
 };return '<svg class="exchange-emblem" viewBox="0 0 64 68" aria-hidden="true"><ellipse cx="32" cy="58" rx="21" ry="4" fill="#836342" opacity=".12"/><path d="M13 52q19-7 38 0v5q-19 7-38 0Z" fill="#d9b784" stroke="#795435" stroke-width="2.7" stroke-linejoin="round"/><ellipse cx="32" cy="52" rx="19" ry="4.5" fill="#f4dfb1" stroke="#795435" stroke-width="2.7"/><g stroke="#654327" stroke-width="3.1" stroke-linejoin="round" stroke-linecap="round">'+shapes[code]+'</g></svg>'

};
function decorateExchange(){for(const row of document.querySelectorAll('.rarity-exchange-row')){const code=['N','R','SR','LR'].find(c=>row.classList.contains('exchange-'+c.toLowerCase()));if(code)row.querySelector('.exchange-crystal').innerHTML=mark(code)}}
const oldGacha=window.renderGacha;window.renderGacha=function(){oldGacha();decorateExchange()};
const oldToggle=window.toggleFragmentCollection;window.toggleFragmentCollection=function(){oldToggle();decorateExchange()};
const oldOpen=window.openFragmentCollection;window.openFragmentCollection=function(){oldOpen();decorateExchange()};
const heart='<svg viewBox="0 0 36 30" aria-hidden="true"><path d="M18 26C-5 12 6-5 18 6 30-5 41 12 18 26Z" fill="#e4a397" stroke="#654327" stroke-width="2.5"/></svg>';
function react(friend){
 if(window.KukuSound)KukuSound.play('tap');
 if(friend.dataset.reacting)return;friend.dataset.reacting='1';const art=friend.querySelector('.character-art');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(art&&art.animate&&!reduced)art.animate([{transform:'translateY(0) rotate(0)'},{transform:'translateY(-9px) rotate(-5deg)'},{transform:'translateY(0) rotate(4deg)'},{transform:'translateY(-3px)'},{transform:'translateY(0)'}],{duration:650,easing:'ease-out'});
 const bubble=document.createElement('span');bubble.className='friend-reaction';bubble.innerHTML=heart;friend.append(bubble);
 const status=$('friendReactionStatus');status.textContent=species[Number(friend.dataset.character)]+'が よろこんでいるよ';
 setTimeout(()=>{bubble.remove();delete friend.dataset.reacting;status.textContent=''},1200);
}
function bindFriends(){for(const f of $('roomFriends').querySelectorAll('.room-friend')){f.setAttribute('role','button');f.tabIndex=0;f.setAttribute('aria-label',species[Number(f.dataset.character)]+'と あそぶ');f.onpointerdown=()=>{f.dataset.pointerFocus='true'};f.onclick=()=>react(f);f.onkeydown=e=>{delete f.dataset.pointerFocus;if(e.key==='Enter'||e.key===' '){e.preventDefault();react(f)}}}}
const live=document.createElement('span');live.id='friendReactionStatus';live.className='sr-only';live.setAttribute('role','status');$('home').append(live);
const oldHome=window.home;window.home=function(){oldHome();bindFriends()};bindFriends();
const oldFinish=window.finish;window.finish=function(){
 const review=$('quizProgress').textContent.startsWith('ふくしゅう'),oldClears=Object.keys(state.clears).filter(k=>state.clears[k]).length;
 oldFinish();let node=$('learningAchievement');if(!node){node=document.createElement('div');node.id='learningAchievement';$('rewardTitle').before(node)}
 const newClear=Object.keys(state.clears).filter(k=>state.clears[k]).length>oldClears;
 node.textContent=newClear?'はじめてクリア！':review&&correct===questions.length?'ふくしゅう できた！':correct===questions.length?'ぜんぶ せいかい！':'つぎに つながる一歩！';
 let dots=$('achievementDots');if(!dots){dots=document.createElement('div');dots.id='achievementDots';$('rewardDesc').before(dots)}
 dots.innerHTML=questions.map((_,i)=>'<span class="'+(i<correct?'achieved':'')+'" aria-hidden="true">'+(i<correct?'✓':'・')+'</span>').join('');dots.setAttribute('aria-label',questions.length+'もん中'+correct+'もんせいかい');
};
let helpReturn=null;const oldHelpOpen=window.openHowTo,oldHelpClose=window.closeHowTo;
window.openHowTo=function(){helpReturn=document.activeElement;oldHelpOpen()};
window.closeHowTo=function(){oldHelpClose();if(helpReturn&&helpReturn.isConnected)helpReturn.focus()};
const settings=document.createElement('button');settings.className='save-tools-trigger';settings.setAttribute('aria-label','セーブ・あそびかた');settings.innerHTML='<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M5 4h16l3 4v16H4V4Z" fill="#f4e8ca" stroke="#896b45" stroke-width="2"/><path d="M9 4v8h10V4M9 24v-8h10v8" fill="#b6d2d9" stroke="#896b45" stroke-width="2"/></svg>';settings.onclick=()=>openHowTo();document.querySelector('.app>header').append(settings);
const tools=document.createElement('details');tools.className='save-tools';tools.innerHTML='<summary>セーブのバックアップ</summary><p>このブラウザに保存されています。端末を変える前に書き出してね。</p><button type="button" id="exportSave">書き出す</button><label class="save-file-label">バックアップをえらぶ<input id="importSave" type="file" accept=".json,application/json"></label><p id="backupStatus" role="status"></p><div id="restorePreview" hidden><p id="restoreSummary"></p><button type="button" id="confirmRestore">このデータに復元する</button><button type="button" id="cancelRestore">やめる</button></div><button type="button" id="exportPrevious" hidden>復元前のデータを書き出す</button>';
document.querySelector('.howto-card').append(tools);
const status=$('backupStatus'),preview=()=>new URLSearchParams(location.search).has('preview-progress')||TEST_ALL_CHARACTERS;
function download(s){const blob=new Blob([JSON.stringify(KukuBackup.pack(s),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='kuku-collect-'+Rules.dayKey(Date.now())+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
$('exportSave').onclick=()=>{if(preview()){status.textContent='確認モードでは書き出せません。';return}download(state);status.textContent='バックアップを書き出しました。'};
$('importSave').onchange=async event=>{
 pendingRestore=null;$('restorePreview').hidden=true;
 if(preview()){status.textContent='確認モードでは復元できません。';return}
 const file=event.target.files[0];if(!file)return;
 try{if(file.size>512000)throw Error('ファイルが大きすぎます。');const candidate=KukuBackup.validate(JSON.parse(await file.text()),species.length);Rules.init(candidate);pendingRestore=candidate;$('restoreSummary').textContent='なかま '+candidate.owned.length+'体 ／ '+candidate.points+'pt ／ かけら '+candidate.fragments+'こ。今の進みぐあいを置きかえます。';$('restorePreview').hidden=false;status.textContent='内容を確認してから復元してください。'}catch(e){status.textContent=e instanceof SyntaxError?'ファイルを読み取れません。JSONファイルを選んでください。':e.message}
 event.target.value='';
};
$('cancelRestore').onclick=()=>{pendingRestore=null;$('restorePreview').hidden=true;status.textContent='復元をやめました。'};
$('confirmRestore').onclick=()=>{
 if(!pendingRestore||preview())return;
 try{const next=JSON.stringify(pendingRestore);localStorage.setItem('kuku-save-before-restore-v1',JSON.stringify(state));localStorage.setItem('kuku-save-v1',next);state=pendingRestore;pendingRestore=null;$('restorePreview').hidden=true;$('exportPrevious').hidden=false;closeHowTo();if(!$('titleScreen').hidden)enterGame();else show('home');status.textContent='復元しました。'}catch{status.textContent='保存できませんでした。今の進みぐあいは変えていません。'}
};
$('exportPrevious').onclick=()=>{try{const old=JSON.parse(localStorage.getItem('kuku-save-before-restore-v1'));if(old)download(KukuBackup.validate(KukuBackup.pack(old),species.length))}catch{status.textContent='復元前のデータを読み取れません。'}};
try{$('exportPrevious').hidden=!localStorage.getItem('kuku-save-before-restore-v1')}catch{}

 const closeReveal=window.closeGachaReveal;window.closeGachaReveal=function(){KukuSound.stop('reveal');return closeReveal()};
 const changeScreen=window.show;window.show=function(id){if(id==='learn'||id==='quiz'){KukuSound.stop('reveal')}return changeScreen(id)};
 // Start music after a user gesture and pause it while the app is hidden.
 const musicToggle=document.createElement('label');
 musicToggle.innerHTML='<input type="checkbox"> BGM';
 const musicEnabled=musicToggle.querySelector('input');
 musicEnabled.checked=state.settings.bgm!==false;
 document.querySelector('.howto-card').append(musicToggle);
 let musicContext,musicBuffer,musicSource;
 async function startMusic(){
  if(!musicEnabled.checked||document.hidden||musicSource)return;
  try{
   if(!musicContext)musicContext=new (window.AudioContext||window.webkitAudioContext)();
   await musicContext.resume();
   if(!musicBuffer)musicBuffer=fetch('./assets/audio/sunny-number-path.base64').then(async response=>{
    if(!response.ok)throw new Error('BGM download failed');
    const bytes=Uint8Array.from(atob(await response.text()),char=>char.charCodeAt(0));
    return musicContext.decodeAudioData(bytes.buffer);
   }).catch(()=>{musicBuffer=null;return null});
   const buffer=await musicBuffer;
   if(!buffer||musicSource||document.hidden||!musicEnabled.checked)return;
   const gain=musicContext.createGain();
   gain.gain.value=.08;
   gain.connect(musicContext.destination);
   musicSource=musicContext.createBufferSource();
   musicSource.buffer=buffer;
   musicSource.loop=true;
   musicSource.connect(gain);
   musicSource.onended=()=>gain.disconnect();
   musicSource.start();
  }catch{}
 }
 function stopMusic(){
  if(!musicSource)return;
  musicSource.stop();
  musicSource.disconnect();
  musicSource=null;
 }
 document.addEventListener('click',startMusic);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMusic();else if(musicContext)startMusic()});
 musicEnabled.onchange=()=>{
  state.settings.bgm=musicEnabled.checked;
  save();
  if(musicEnabled.checked)startMusic();else stopMusic();
 };
 document.addEventListener('pointerdown',()=>KukuSound.prime(),{passive:true,once:true});
 document.addEventListener('keydown',()=>KukuSound.prime(),{once:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)KukuSound.suspend()});
 document.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b||b.disabled)return;
  if(b.matches('[data-effects-toggle],#titleStart,#drawButton,#revealSkip,[data-exchange-rarity],#choices button,#lines button,.all-sounds,#recallReveal'))return;
  KukuSound.play('tap');
 },true);
 const options=document.createElement('details');options.className='audio-options';
 options.innerHTML='<summary>こうか音の音量</summary><label for="effectsVolume">音量 <output id="effectsVolumeValue"></output></label><input type="range" id="effectsVolume" min="0" max="100" step="5"><p>九九の読み上げの音量は変わりません。</p>';
 document.querySelector('.howto-card').append(options);
 const slider=$('effectsVolume'),value=$('effectsVolumeValue');
 function refreshVolume(){slider.value=Math.round(KukuSound.volume()*100);value.textContent=slider.value+'%'}
 refreshVolume();slider.oninput=()=>{state.settings.effectsVolume=Number(slider.value)/100;value.textContent=slider.value+'%';KukuSound.stopAll()};
 slider.onchange=()=>{save();KukuSound.play('tap')};
 const restoreConfirm=$('confirmRestore').onclick;$('confirmRestore').onclick=()=>{KukuSound.stopAll();restoreConfirm();refreshVolume();document.querySelectorAll('[data-effects-toggle]').forEach(b=>{b.classList.toggle('sound-off',!state.settings.effects);b.setAttribute('aria-pressed',String(state.settings.effects));b.setAttribute('aria-label','効果音を'+(state.settings.effects?'オフ':'オン')+'にする')})};


 // Membership changes never replace character SVGs or their image/filter nodes.
 function updateRoomMembership(){
  $('clearRoomButton').disabled=state.favorites.length===0;
  $('collectionCount').textContent=(TEST_ALL_CHARACTERS?'確認用：':'なかま ')+state.owned.length+' / '+species.length+' ・ おへや '+state.favorites.length+' / '+HOME_LIMIT;
  for(const card of $('monsters').querySelectorAll('.friend-card')){
   const i=Number(card.dataset.character);if(!state.owned.includes(i))continue;
   const selected=state.favorites.includes(i),button=card.querySelector('button');
   card.classList.toggle('in-room',selected);
   let badge=card.querySelector('.room-badge');
   if(selected&&!badge){badge=document.createElement('span');badge.className='room-badge';badge.textContent='✓ おへや';card.prepend(badge)}else if(!selected&&badge)badge.remove();
   if(button){button.disabled=!selected&&state.favorites.length>=HOME_LIMIT;button.textContent=selected?'はずす':button.disabled?'いっぱい':'へやにおく';button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-label',species[i]+'を'+(selected?'おへやからはずす':'おへやにおく'))}
  }
 }
 window.toggleFavorite=function(i){
  if(!Number.isInteger(i)||!state.owned.includes(i))return;
  const at=state.favorites.indexOf(i);
  if(at>=0)state.favorites.splice(at,1);
  else if(state.favorites.length<HOME_LIMIT)state.favorites.push(i);
  else{$('roomActionStatus').textContent='おへやは5にんまで。';return}
  save();updateRoomMembership();$('roomActionStatus').textContent='';
 };
 window.clearRoom=function(){
  if(!state.favorites.length)return;
  state.favorites=[];save();updateRoomMembership();$('roomActionStatus').textContent='みんな おへやから はずしたよ。';
 };

})();