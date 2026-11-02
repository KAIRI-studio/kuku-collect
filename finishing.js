(function(){
'use strict';
const $=id=>document.getElementById(id),Rules=window.KukuRules;let pendingRestore=null,reactionTimer;
const mark=(code)=>{
 const shapes={
 N:'<path d="M22 41Q9 21 27 14q16 4 15 14-3 14-20 13Z" fill="#b5ce94"/><path d="m22 41 11-18" fill="none"/>',
 R:'<path d="M22 13q-18 8-12 22t24 8q-15-1-16-12t4-18Z" fill="#c1dae3"/><path d="m40 15 3 7 8 2-7 4-1 8-5-6-8 1 4-7-2-7Z" fill="#eff6f3"/>',
 SR:'<path d="m31 6 6 8 10-1-1 10 9 6-9 6 1 10-10-1-6 8-6-8-10 1 1-10-9-6 9-6-1-10 10 1Z" fill="#edc46d"/><circle cx="31" cy="29" r="11" fill="#fff3ca"/>',
 LR:'<path d="m12 19 12 9 8-16 8 16 12-9-5 27H17Z" fill="#e3a490"/><path d="m32 22 7 10-7 9-7-9Z" fill="#fff0c7"/><path d="M18 47h28" fill="none"/>'
 };return '<svg class="exchange-emblem" viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="56" rx="24" ry="5" fill="#d9bd8a" stroke="#765136" stroke-width="2"/><g stroke="#654327" stroke-width="2.7" stroke-linejoin="round" stroke-linecap="round">'+shapes[code]+'</g></svg>'
};
function decorateExchange(){for(const row of document.querySelectorAll('.rarity-exchange-row')){const code=['N','R','SR','LR'].find(c=>row.classList.contains('exchange-'+c.toLowerCase()));if(code)row.querySelector('.exchange-crystal').innerHTML=mark(code)}}
const oldGacha=window.renderGacha;window.renderGacha=function(){oldGacha();decorateExchange()};
const oldToggle=window.toggleFragmentCollection;window.toggleFragmentCollection=function(){oldToggle();decorateExchange()};
const oldOpen=window.openFragmentCollection;window.openFragmentCollection=function(){oldOpen();decorateExchange()};
const heart='<svg viewBox="0 0 36 30" aria-hidden="true"><path d="M18 26C-5 12 6-5 18 6 30-5 41 12 18 26Z" fill="#e4a397" stroke="#654327" stroke-width="2.5"/></svg>';
function react(friend){
 if(friend.dataset.reacting)return;friend.dataset.reacting='1';const art=friend.querySelector('.character-art');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(art&&art.animate&&!reduced)art.animate([{transform:'translateY(0) rotate(0)'},{transform:'translateY(-9px) rotate(-5deg)'},{transform:'translateY(0) rotate(4deg)'},{transform:'translateY(-3px)'},{transform:'translateY(0)'}],{duration:650,easing:'ease-out'});
 const bubble=document.createElement('span');bubble.className='friend-reaction';bubble.innerHTML=heart;friend.append(bubble);
 const status=$('friendReactionStatus');status.textContent=species[Number(friend.dataset.character)]+'が よろこんでいるよ';
 setTimeout(()=>{bubble.remove();delete friend.dataset.reacting;status.textContent=''},1200);
}
function bindFriends(){for(const f of $('roomFriends').querySelectorAll('.room-friend')){f.setAttribute('role','button');f.tabIndex=0;f.setAttribute('aria-label',species[Number(f.dataset.character)]+'と あそぶ');f.onclick=()=>react(f);f.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();react(f)}}}}
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
})();
