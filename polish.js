(function(){
 'use strict';
 const query=new URLSearchParams(location.search);if(query.has('walk-review'))return;
 const Rules=window.KukuRules;Rules.init(state);
 const base={home:window.home,show:window.show,learn:window.renderLearn,collection:window.collection,gacha:window.renderGacha};
 let launchOpen=true,launchBusy=false,gachaBusy=false,revealDone=false,revealResult=null,revealFrame=0,revealTimers=[],speechTimer=0;
 let quizMode='normal',sessionPoints=0,sessionWrong=[],followTarget=null,audio=null;
 const app=document.querySelector('.app');
 const audioIcon='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 12h6l7-6v20l-7-6H5z" fill="currentColor"/><path d="M22 11q5 5 0 10M26 7q8 9 0 18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>';
 const shardIcon='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m16 3 10 10-4 12-6 5-6-5-4-12Z" fill="#a6cbd6" stroke="#648590" stroke-width="2"/><path d="m16 3 4 10-4 17-4-17Zm-10 10h20" fill="none" stroke="#eff9f4" stroke-width="1.5"/></svg>';
 function effectSound(kind){
  if(!state.settings.effects)return;
  try{
   const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
   if(!audio)audio=new Audio();if(audio.state==='suspended')audio.resume().catch(()=>{});
   const notes=kind==='wrong'?[330,294]:kind==='capsule'?[262,330,392]:kind==='legend'?[392,494,587,784,988]:kind==='correct'?[523,659,784]:kind==='start'?[392,523,659]:[659,880];
   notes.forEach((f,j)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+j*.075;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.045,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.2)});
  }catch{}
 }
 window.toggleEffects=function(){state.settings.effects=!state.settings.effects;save();updateSoundButtons();if(state.settings.effects)effectSound('tap')};
 function updateSoundButtons(){document.querySelectorAll('[data-effects-toggle]').forEach(b=>{b.innerHTML=audioIcon;b.classList.toggle('sound-off',!state.settings.effects);b.setAttribute('aria-label','効果音を'+(state.settings.effects?'オフ':'オン')+'にする');b.setAttribute('aria-pressed',String(state.settings.effects));b.title='こうか音 '+(state.settings.effects?'ON':'OFF')})}
 function lockApp(locked){app.inert=locked;app.setAttribute('aria-hidden',String(locked))}
 function medal(perfect){return '<svg viewBox="0 0 120 120" role="img" aria-label="'+(perfect?'よくできたメダル':'がんばったメダル')+'"><path d="m30 65-8 45 22-10 14 13 4-45M65 65l-1 45 17-12 20 5-15-40" fill="'+(perfect?'#a7bf8f':'#b2cad1')+'" stroke="#7c714f" stroke-width="3" stroke-linejoin="round"/><circle cx="60" cy="47" r="36" fill="'+(perfect?'#efd17f':'#e9e1cb')+'" stroke="#9d7c3f" stroke-width="4"/><circle cx="60" cy="47" r="28" fill="#fff3c9" stroke="#d4b362" stroke-width="2"/><path d="m60 25 7 14 16 2-12 12 3 17-14-8-14 8 3-17-12-12 16-2Z" fill="'+(perfect?'#d4a84f':'#a0b69b')+'" stroke="#997b44" stroke-width="2" stroke-linejoin="round"/></svg>'}
 function clearChoiceSpeech(){clearTimeout(speechTimer);speechTimer=0}
 function runTarget(target){target=target||Rules.next(state);if(target.kind==='review')startReview(target.items);else{dan=target.d;group=target.g;show('learn')}}
 window.startRecommended=function(){runTarget(Rules.next(state))};
 window.returnToTitle=function(){if(gachaBusy)return;stopRoomWalk();stopSpeech();clearChoiceSpeech();launchOpen=true;lockApp(true);document.body.classList.add('booting');$('titleScreen').hidden=false;$('titleStart').focus()};
 function recommendation(){
  const target=Rules.next(state),count=Rules.due(state).length;
  let h=$('homeRecommendation');if(!h){h=document.createElement('div');h.id='homeRecommendation';$('home').append(h)}
  h.innerHTML='<div class="recommend-top"><span>きょうのおすすめ'+(count?' ・ ふくしゅう '+count+'もん':'')+'</span><button class="text-button" onclick="returnToTitle()">タイトル</button></div><button class="recommend-go" onclick="startRecommended()">'+target.label+' <span aria-hidden="true">▶</span></button>';
  let card=$('selectRecommendation');if(!card){card=document.createElement('div');card.id='selectRecommendation';$('select').prepend(card)}
  card.innerHTML='<button class="primary" onclick="startRecommended()">'+target.label+' ▶</button><p>はじめてクリアで ＋30ポイント！</p>';
 }
 window.home=function(){base.home();$('totalProgress').textContent='クリアしたところ：'+Object.keys(state.clears).filter(k=>state.clears[k]).length+' / 27 セット';recommendation();if(launchOpen)stopRoomWalk()};
 window.show=function(id){clearChoiceSpeech();base.show(id);if(id==='home')recommendation();if(launchOpen)stopRoomWalk()};
 window.renderLearn=function(){base.learn();const p=$('learn').querySelector('.point-explanation strong');if(p)p.innerHTML='きょう初めての正解は <b>10</b>ポイント！';$('nextGachaHint').textContent=(state.points>=100?'ガチャがひけるよ！':'あと'+(100-state.points)+'ポイントで ガチャ1かい')+' ・ 初クリア ＋30pt';};
 function prepareQuiz(items,mode){
  clearChoiceSpeech();stopSpeech();quizMode=mode;questions=items;index=0;correct=0;sessionPoints=0;sessionWrong=[];show('quiz');renderQuestion();
 }
 window.startQuiz=function(){const items=[1,2,3].map(x=>({d:dan,n:group*3+x}));for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]]}prepareQuiz(items,'normal')};
 window.startReview=function(items){
  const source=items&&items.length?items:Rules.due(state),seen=new Set(),list=[];
  for(const item of source){const id=item.d+'-'+item.n;if(!seen.has(id)){seen.add(id);list.push({d:item.d,n:item.n})}if(list.length===3)break}
  if(!list.length){runTarget(Rules.next(state));return}prepareQuiz(list,'review');
 };
 window.renderQuestion=function(){
  clearChoiceSpeech();stopSpeech();answered=false;const q=questions[index],parts=splitPhrase(q.d,q.n);$('next').classList.add('hidden');$('feedback').textContent='';
  $('question').textContent=parts[0]+' ○○';$('quizEquation').textContent=q.d+' × '+q.n+' ＝ □';$('quizProgress').textContent=(quizMode==='review'?'ふくしゅう':q.d+'のだん')+'　'+(index+1)+' / '+questions.length;$('bar').style.width=(index/questions.length*100)+'%';
  $('quiz').querySelector('.quiz-reward strong').textContent='せいかいで '+Rules.rewardFor(state,q,quizMode==='review')+'ポイント！';
  const answers=[parts[1]],candidates=[...new Set(Array.from({length:9},(_,j)=>splitPhrase(q.d,j+1)[1]))].filter(x=>x!==parts[1]);
  for(let i=candidates.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]]}answers.push(...candidates.slice(0,3));
  for(let i=answers.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[answers[i],answers[j]]=[answers[j],answers[i]]}
  $('choices').innerHTML='';for(const a of answers){const b=document.createElement('button');b.textContent=a;b.onclick=()=>choose(a,parts[1],q.n);$('choices').append(b)}
 };
 window.choose=function(a,expected){
  if(answered)return;answered=true;const q=questions[index],ok=a===expected,reward=Rules.answer(state,q,ok,quizMode==='review');if(ok){correct++;sessionPoints+=reward.points}else sessionWrong.push(q);
  save();updatePoints();effectSound(ok?'correct':'wrong');
  $('feedback').textContent=ok?'せいかい！ ＋'+reward.points+'ポイント'+(reward.repeat?'（きょうのくりかえし）':quizMode==='review'?'（ふくしゅうボーナス）':''):'おしい！ '+phrase(q.d,q.n)+' だよ。あとで もういちど！';
  $('question').textContent=phrase(q.d,q.n);$('quizEquation').textContent=q.d+' × '+q.n+' ＝ '+q.d*q.n;
  for(const b of $('choices').children){b.disabled=true;if(b.textContent===expected)b.style.background='#b5d89f';else if(b.textContent===a&&!ok)b.style.background='#e9b4a7'}
  if(ok&&$('points').animate)$('points').animate([{transform:'scale(1)'},{transform:'scale(1.15)'},{transform:'scale(1)'}],{duration:400});
  speechTimer=setTimeout(()=>{if(!$('quiz').classList.contains('hidden')&&questions[index]===q)speak(phrase(q.d,q.n))},150);
  $('next').textContent=index===questions.length-1?'けっかをみる ▶':'つぎへ ▶';$('next').classList.remove('hidden');
 };
 window.nextQuestion=function(){if(!answered)return;index++;if(index<questions.length)renderQuestion();else finish()};
 function following(){
  if(quizMode==='normal'){if(group<2)return {kind:'learn',d:dan,g:group+1,label:'つぎの3つへ'};if(dan<9)return {kind:'learn',d:dan+1,g:0,label:(dan+1)+'のだんへ'}}
  return Rules.next(state);
 }
 window.finish=function(){
  clearChoiceSpeech();stopSpeech();const perfect=correct===questions.length,bonus=quizMode==='normal'?Rules.complete(state,dan,group,perfect):{clearBonus:0,starterBonus:0,total:0};save();updatePoints();followTarget=following();
  $('rewardEmoji').innerHTML=medal(perfect);$('rewardTitle').textContent=correct+' / '+questions.length+' もん せいかい！';$('rewardDesc').textContent='今回は ＋'+(sessionPoints+bonus.total)+'ポイント！';
  $('resultBreakdown').innerHTML='<div><span>せいかいのポイント</span><b>＋'+sessionPoints+'</b></div>'+(bonus.clearBonus?'<div><span>はじめてクリア！</span><b>＋'+bonus.clearBonus+'</b></div>':'')+(bonus.starterBonus?'<div><span>はじめのぼうけんボーナス！</span><b>＋'+bonus.starterBonus+'</b></div>':'')+'<p>もっているポイント：<strong>'+state.points+' pt</strong></p>';
  const actions=$('resultActions');actions.innerHTML='';let primary,secondary;
  if(sessionWrong.length){primary={label:'まちがえた '+sessionWrong.length+'もんを ふくしゅう',go:()=>startReview(sessionWrong)};secondary=state.points>=100?{label:'ガチャをみにいく',go:()=>show('gacha')}:{label:followTarget.label,go:()=>runTarget(followTarget)}}
  else if(state.points>=100){primary={label:'ガチャをひきにいく！',go:()=>show('gacha')};secondary={label:followTarget.label,go:()=>runTarget(followTarget)}}
  else{primary={label:followTarget.label,go:()=>runTarget(followTarget)};secondary={label:'もういちど 練習する',go:()=>quizMode==='review'?startReview(questions):show('learn')}}
  for(const [item,cls]of [[primary,'primary'],[secondary,'secondary']]){const b=document.createElement('button');b.className=cls;b.textContent=item.label+' ▶';b.onclick=item.go;actions.append(b)}
  const c=document.createElement('button');c.className='text-button';c.textContent='なかまをみる';c.onclick=()=>show('collection');actions.append(c);
  show('result');$('result').classList.toggle('perfect-result',perfect);effectSound(perfect?'start':'tap');
 };
 function fragmentBar(){return shardIcon+'<span>なかまのかけら <b>'+state.fragments+'</b>こ</span>'}
 window.renderGacha=function(){base.gacha();$('drawButton').disabled=gachaBusy||state.points<100;$('drawButton').setAttribute('aria-busy',String(gachaBusy));$('gachaHint').textContent=state.points<100?'あと '+(100-state.points)+'ポイントで ひけるよ':'同じレアなら、まだいない子を優先するよ。';$('gachaFragments').innerHTML=fragmentBar()};
 window.collection=function(){
  base.collection();let wallet=$('collectionWallet');if(!wallet){wallet=document.createElement('div');wallet.id='collectionWallet';$('collectionCount').after(wallet)}
  wallet.innerHTML='<div class="fragment-balance">'+fragmentBar()+'</div><button class="text-button" onclick="setCollectionView(\'all\')">かけらで むかえる ▶</button>';
  for(const card of $('monsters').querySelectorAll('.friend-card')){
   const i=Number(card.dataset.character);if(!Number.isInteger(i)||state.owned.includes(i))continue;
   const cost=Rules.COSTS[rarityCodes[i]],enough=state.fragments>=cost;
   card.classList.add('locked-card');card.innerHTML=rarityTag(i)+'<span class="locked-label">まだ であっていない</span><div class="locked-art" aria-hidden="true">'+character(i)+'</div><p>'+species[i]+'</p>';
   const b=document.createElement('button');b.className='exchange-button';b.disabled=!enough;b.innerHTML='かけら '+cost+'こで むかえる'+(!enough?'<br><small>あと '+(cost-state.fragments)+'こ</small>':'');b.onclick=()=>exchangeCharacter(i);card.append(b);
  }
 };
 function clearRevealTimers(){for(const t of revealTimers)clearTimeout(t);revealTimers=[];cancelAnimationFrame(revealFrame);revealFrame=0}
 function later(fn,ms){const id=setTimeout(fn,ms);revealTimers.push(id)}
 function animateRevealAura(){cancelAnimationFrame(revealFrame);const hero=$('revealCharacter');function frame(t){if($('gachaReveal').hidden)return;paintLegendAura({el:hero,view:'front',face:1},t);revealFrame=requestAnimationFrame(frame)}revealFrame=requestAnimationFrame(frame)}
 function finishReveal(){
  if(revealDone||!revealResult)return;revealDone=true;const r=revealResult;$('gachaReveal').classList.add('is-opening','is-revealed');$('revealSkip').hidden=true;$('revealContent').hidden=false;
  $('revealHeadline').textContent=r.source==='exchange'?'かけらで なかまになった！':r.fresh?'あたらしい なかま！':'なかまのかけら ゲット！';
  $('revealCharacter').dataset.character=String(r.i);$('revealCharacter').innerHTML='<div class="walk-facing">'+character(r.i)+'</div>'+friendEffects(r.i);
  $('revealName').textContent=species[r.i];$('revealRarity').innerHTML=rarityTag(r.i);$('revealDescription').textContent=r.fresh?'おへやで いっしょに すごそう！':'もうなかまの子は、かけらになるよ。＋'+r.fragments+'こ！';
  const main=$('revealMain');main.textContent=r.fresh&&state.favorites.length<HOME_LIMIT?'おへやにおく':r.fresh?'なかまをみる':'かけらで なかまをむかえる';main.onclick=()=>{
   if(r.fresh&&state.favorites.length<HOME_LIMIT){if(!state.favorites.includes(r.i)){state.favorites.push(r.i);save()}closeGachaReveal();show('home')}
   else{closeGachaReveal();if(!r.fresh)collectionView='all';show('collection');const card=$('monsters').querySelector('[data-character="'+r.i+'"]');if(card)card.scrollIntoView({block:'center'})}
  };
  $('gachaResult').classList.remove('hidden');$('gachaResult').innerHTML='<p>'+species[r.i]+' '+(r.fresh?'が なかまになった！':'・ かけら ＋'+r.fragments+'こ')+'</p>'+rarityTag(r.i);
  animateRevealAura();effectSound(r.rarity==='LR'?'legend':'correct');main.focus();
 }
 function reveal(r){
  clearRevealTimers();gachaBusy=true;revealDone=false;revealResult=r;lockApp(true);const view=$('gachaReveal');view.hidden=false;view.className='gacha-reveal reveal-'+r.rarity.toLowerCase();
  $('revealContent').hidden=true;$('revealSkip').hidden=false;$('revealSkip').focus();$('revealLoading').textContent=r.source==='exchange'?'なかまを よびにいくよ…':'だれが あそびにくるかな？';
  effectSound('capsule');later(()=>view.classList.add('is-opening'),800);later(finishReveal,1350);renderGacha();
 }
 window.drawGacha=function(){if(gachaBusy)return;const result=Rules.draw(state,rarityCodes);if(!result)return;save();updatePoints();reveal(result)};
 window.exchangeCharacter=function(i){if(gachaBusy)return;const result=Rules.exchange(state,i,rarityCodes);if(!result)return;save();reveal(result)};
 window.skipGachaReveal=function(){finishReveal()};
 window.closeGachaReveal=function(){if(!revealDone){finishReveal();return}clearRevealTimers();$('gachaReveal').hidden=true;gachaBusy=false;lockApp(launchOpen);renderGacha();$('drawButton').focus()};
 window.openHowTo=function(){$('howToOverlay').hidden=false;$('titleScreen').inert=true;$('howToClose').focus()};
 window.closeHowTo=function(){$('howToOverlay').hidden=true;$('titleScreen').inert=false;$('titleStart').focus()};
 window.showTitleScreen=function(){clearTimeout(brandTimer);$('brandScreen').hidden=true;$('titleScreen').hidden=false;$('titleStart').focus()};
 window.enterGame=function(){
  if(launchBusy)return;launchBusy=true;effectSound('start');const shutter=$('sceneShutter');shutter.hidden=false;requestAnimationFrame(()=>shutter.classList.add('closed'));
  setTimeout(()=>{launchOpen=false;$('titleScreen').hidden=true;$('brandScreen').hidden=true;document.body.classList.remove('booting');lockApp(false);show('home')},260);
  setTimeout(()=>shutter.classList.remove('closed'),340);setTimeout(()=>{shutter.hidden=true;launchBusy=false;$('homeRecommendation').querySelector('.recommend-go').focus()},620);
 };
 const sound=document.createElement('button');sound.className='sound-toggle';sound.dataset.effectsToggle='';sound.onclick=toggleEffects;document.querySelector('.app>header').append(sound);updateSoundButtons();
 $('quiz').querySelector(':scope >button').onclick=()=>{const q=questions[index];if(q){dan=q.d;group=Math.floor((q.n-1)/3)}show('learn')};
 $('titleFriends').innerHTML=[39,0,2,6,43].map((i,j)=>'<div class="title-friend room-friend" style="--title-delay:'+(-j*1.2)+'s"><div class="walk-facing">'+character(i)+'</div>'+friendEffects(i)+'</div>').join('');
 document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;if(!$('howToOverlay').hidden)closeHowTo();else if(!$('gachaReveal').hidden)closeGachaReveal()});
 document.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const modal=!$('howToOverlay').hidden?$('howToOverlay'):!$('gachaReveal').hidden?$('gachaReveal'):null;if(!modal)return;const buttons=[...modal.querySelectorAll('button:not([disabled])')].filter(b=>b.getClientRects().length);if(!buttons.length)return;const first=buttons[0],last=buttons[buttons.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&audio)audio.suspend().catch(()=>{});else if(audio&&state.settings.effects)audio.resume().catch(()=>{})});
 home();stopRoomWalk();lockApp(true);let brandTimer=0;
 if(query.get('screen-review')==='title')showTitleScreen();else if(query.get('screen-review')!=='brand')brandTimer=setTimeout(showTitleScreen,1700);
})();
