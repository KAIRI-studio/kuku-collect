(function(){
 'use strict';
 const query=new URLSearchParams(location.search);if(query.has('walk-review'))return;
 const Rules=window.KukuRules;Rules.init(state);
 const base={home:window.home,show:window.show,learn:window.renderLearn,collection:window.collection,gacha:window.renderGacha};
 let launchOpen=true,launchBusy=false,gachaBusy=false,revealDone=false,revealResult=null,revealFrame=0,revealTimers=[],speechTimer=0,revealPreviousFocus=null;
 let quizMode='normal',sessionPoints=0,sessionWrong=[],followTarget=null,audio=null,pointTimer=0,fragmentTimer=0;
 let recallMode=false,recallIndex=0,recallKey='',exchangeOpen=false;
 const app=document.querySelector('.app');
 const audioIcon='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 12h6l7-6v20l-7-6H5z" fill="currentColor"/><path d="M22 11q5 5 0 10M26 7q8 9 0 18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>';
 const shardIcon='<img class="shard-art" src="./assets/fragment-original.webp" alt="">';
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
 window.openRoomPicker=function(){collectionView='owned';collectionRarity='all';show('collection')};
 function renderLearningProgress(){
  const all=Rules.mastery(state);
  $('totalProgress').textContent='クリア '+all.clearedSets+'/27 ・ 3日せいかい '+all.steady+'/81';
  const buttons=$('danButtons').children;
  for(let i=0;i<buttons.length;i++){
   const d=i+1,m=Rules.mastery(state,d),b=buttons[i];
   b.classList.add('dan-card');b.classList.toggle('dan-steady',m.steady===9);
   b.setAttribute('aria-label',d+'のだん、3日せいかい '+m.steady+' / 9、クリア '+m.clearedSets+' / 3');
   b.innerHTML='<strong>'+d+'<small>のだん</small></strong><span class="dan-dots" aria-hidden="true">'+m.items.map(q=>'<i class="dot-'+q.stage+'"></i>').join('')+'</span><small class="dan-status">'+(m.steady===9?'3日せいかい！':m.review?'ふくしゅう '+m.review+'もん':m.started?m.started+' / 9':m.clearedSets?'✓ '+m.clearedSets+' / 3':'')+'</small>';
  }
 }
 function shortTarget(target){return target.kind==='review'?target.label:target.label.startsWith('つぎの3つ')?'つぎの3つ':target.d?target.d+'のだん':target.label}
 function recommendation(){
  renderLearningProgress();
  const target=Rules.next(state),count=Rules.due(state).length;
  let h=$('homeRecommendation');if(!h){h=document.createElement('div');h.id='homeRecommendation';$('home').append(h)}
  const first=!state.owned.length,waiting=state.owned.length>0&&!state.favorites.length;
  const canDraw=first&&state.points>=100;
  h.classList.toggle('first-companion',first);h.classList.toggle('waiting-room',waiting);
  const title=first?'はじめのなかま':waiting?'おへや':'おすすめ'+(count?' ・ ふくしゅう '+count+'もん':'');
  const label=canDraw?'ガチャへ':waiting?'なかまをおく':shortTarget(target);
  const action=canDraw?"show('gacha')":waiting?'openRoomPicker()':'startRecommended()';
  h.innerHTML='<div class="recommend-top"><span>'+title+'</span></div><button class="recommend-go" onclick="'+action+'">'+label+' <span aria-hidden="true">▶</span></button>'+(first?'<p class="first-path">九九 → ガチャ → おへや</p>':'');
  let welcome=$('roomWelcome');if(!welcome){welcome=document.createElement('div');welcome.id='roomWelcome';welcome.setAttribute('aria-hidden','true');$('home').append(welcome)}
  welcome.hidden=!!state.favorites.length||!first;
  welcome.innerHTML='<svg viewBox="0 0 72 84" aria-hidden="true"><path d="M12 40a24 24 0 0 1 48 0v3H12Z" fill="#cee1e5" stroke="#715333" stroke-width="3"/><path d="M12 43h48v3a24 24 0 0 1-48 0Z" fill="#e9c878" stroke="#715333" stroke-width="3"/><path d="M23 27q3-7 11-9" fill="none" stroke="#fff9ec" stroke-width="4" stroke-linecap="round"/><circle cx="36" cy="43" r="6" fill="#fff9ec" stroke="#715333" stroke-width="2"/></svg>';

  let card=$('selectRecommendation');if(!card){card=document.createElement('div');card.id='selectRecommendation';$('select').prepend(card)}
  card.innerHTML='<button class="primary" onclick="startRecommended()">'+shortTarget(target)+' ▶</button>';
 }
 window.home=function(){base.home();$('totalProgress').textContent='クリアしたところ：'+Object.keys(state.clears).filter(k=>state.clears[k]).length+' / 27 セット';recommendation();if(launchOpen)stopRoomWalk()};
 window.show=function(id){clearFragmentNotice();clearChoiceSpeech();clearTimeout(pointTimer);$('pointGain').hidden=true;if(id!=='quiz'){$('feedback').classList.remove('is-correct','is-incorrect');document.querySelectorAll('#choices button').forEach(b=>b.classList.remove('choice-correct','choice-incorrect'))}base.show(id);if(id==='home')recommendation();if(launchOpen)stopRoomWalk()};
 function renderRecall(){
  const n=group*3+recallIndex+1,parts=splitPhrase(dan,n);
  $('recallCounter').textContent=(recallIndex+1)+' / 3 もん';$('recallPrompt').textContent=parts[0]+' ○○';$('recallEquation').textContent=dan+' × '+n+' ＝ □';
  $('recallReveal').hidden=false;$('recallNext').hidden=true;$('recallNext').textContent=recallIndex<2?'つぎの九九へ ▶':'もういちど この3つ';
 }
 window.setLearnMode=function(hiddenAnswer){stopSpeech();clearChoiceSpeech();recallMode=!!hiddenAnswer;recallIndex=0;renderLearn()};
 window.revealRecall=function(){if(!recallMode||$('recallReveal').hidden)return;const n=group*3+recallIndex+1;$('recallPrompt').textContent=phrase(dan,n);$('recallEquation').textContent=dan+' × '+n+' ＝ '+dan*n;$('recallReveal').hidden=true;$('recallNext').hidden=false};
 window.nextRecall=function(){if(!recallMode||!$('recallReveal').hidden)return;recallIndex=(recallIndex+1)%3;renderRecall()};
 window.renderLearn=function(){
  base.learn();const key=dan+'-'+group;if(key!==recallKey){recallKey=key;recallIndex=0}
  $('learn').classList.toggle('is-recall',recallMode);$('readModeButton').setAttribute('aria-pressed',String(!recallMode));$('recallModeButton').setAttribute('aria-pressed',String(recallMode));
  $('recallCard').hidden=!recallMode;$('lines').hidden=recallMode;
  $('learn').querySelector('.learn-instruction').textContent=recallMode?'声にだしてみよう':'';
  if(recallMode){$('lines').innerHTML='';renderRecall()}
  const p=$('learn').querySelector('.point-explanation strong');if(p)p.innerHTML='きょう はじめてなら <b>10</b>ポイント！';$('nextGachaHint').textContent=state.points>=100?'ガチャがひけるよ！':'ガチャまで あと'+(100-state.points)+'pt';
 };

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
  clearChoiceSpeech();stopSpeech();answered=false;const q=questions[index],parts=splitPhrase(q.d,q.n);$('next').classList.add('hidden');$('feedback').textContent='';$('feedback').classList.remove('is-correct','is-incorrect');
  $('question').textContent=parts[0]+' ○○';$('quizEquation').textContent=q.d+' × '+q.n+' ＝ □';$('quizProgress').textContent=(quizMode==='review'?'ふくしゅう':q.d+'のだん')+'　'+(index+1)+' / '+questions.length;$('bar').style.width=(index/questions.length*100)+'%';
  $('quiz').querySelector('.quiz-reward strong').textContent='せいかい ＋'+Rules.rewardFor(state,q,quizMode==='review')+'pt';
  const answers=[parts[1]],candidates=[...new Set(Array.from({length:9},(_,j)=>splitPhrase(q.d,j+1)[1]))].filter(x=>x!==parts[1]);
  for(let i=candidates.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]]}answers.push(...candidates.slice(0,3));
  for(let i=answers.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[answers[i],answers[j]]=[answers[j],answers[i]]}
  $('choices').innerHTML='';for(const a of answers){const b=document.createElement('button');b.textContent=a;b.onclick=()=>choose(a,parts[1],q.n);$('choices').append(b)}
 };
 window.choose=function(a,expected){
  if(answered)return;answered=true;const q=questions[index],ok=a===expected,reward=Rules.answer(state,q,ok,quizMode==='review');if(ok){correct++;sessionPoints+=reward.points}else sessionWrong.push(q);
  save();updatePoints();effectSound(ok?'correct':'wrong');
  $('feedback').textContent=ok?'せいかい！':'おしい！';
  $('question').textContent=phrase(q.d,q.n);$('quizEquation').textContent=q.d+' × '+q.n+' ＝ '+q.d*q.n;
  for(const b of $('choices').children){b.disabled=true;if(b.textContent===expected){b.style.background='#b5d89f';b.classList.add('choice-correct')}else if(b.textContent===a&&!ok){b.style.background='#e9b4a7';b.classList.add('choice-incorrect')}}
  $('feedback').classList.add(ok?'is-correct':'is-incorrect');
  if(ok){$('pointGain').textContent='＋'+reward.points+' pt';$('pointGain').hidden=false;clearTimeout(pointTimer);pointTimer=setTimeout(()=>{$('pointGain').hidden=true},1100)}
  if(ok&&(!window.matchMedia||!window.matchMedia('(prefers-reduced-motion: reduce)').matches)&&$('points').animate)$('points').animate([{transform:'scale(1)'},{transform:'scale(1.15)'},{transform:'scale(1)'}],{duration:400});
  speechTimer=setTimeout(()=>{if(!$('quiz').classList.contains('hidden')&&questions[index]===q)speak(phrase(q.d,q.n))},150);
  $('next').textContent=index===questions.length-1?'けっかをみる ▶':'つぎへ ▶';$('next').classList.remove('hidden');
 };
 window.nextQuestion=function(){if(!answered)return;index++;if(index<questions.length)renderQuestion();else finish()};
 function following(){
  if(quizMode==='normal'){if(group<2)return {kind:'learn',d:dan,g:group+1,label:'つぎの3つへ'};if(dan<9)return {kind:'learn',d:dan+1,g:0,label:(dan+1)+'のだんへ'}}
  if(quizMode==='review'&&questions.length){const first=questions[0],g=Math.floor((first.n-1)/3);if(questions.every(q=>q.d===first.d&&Math.floor((q.n-1)/3)===g)&&!state.clears[first.d+'-'+g])return {kind:'learn',d:first.d,g,label:first.d+'のだんを まとめてチャレンジ'}}
  return Rules.next(state);
 }
 window.finish=function(){
  clearChoiceSpeech();stopSpeech();const perfect=correct===questions.length,bonus=quizMode==='normal'?Rules.complete(state,dan,group,perfect):{clearBonus:0,starterBonus:0,total:0};save();updatePoints();followTarget=following();
  $('rewardEmoji').innerHTML=medal(perfect);$('rewardTitle').textContent=correct+' / '+questions.length+' せいかい！';$('rewardDesc').textContent='＋'+(sessionPoints+bonus.total)+'pt';$('resultDetails').open=false;
  $('resultBreakdown').innerHTML='<div><span>せいかいのポイント</span><b>＋'+sessionPoints+'</b></div>'+(bonus.clearBonus?'<div><span>はじめてクリア！</span><b>＋'+bonus.clearBonus+'</b></div>':'')+(bonus.starterBonus?'<div><span>はじめのぼうけんボーナス！</span><b>＋'+bonus.starterBonus+'</b></div>':'')+'<p>もっているポイント：<strong>'+state.points+' pt</strong></p>';
  const progress=Rules.mastery(state,questions[0].d);$('resultMilestone').textContent=questions[0].d+'のだん：れんしゅう '+progress.started+' / 9 ・ 3日せいかい '+progress.steady+' / 9';
  const actions=$('resultActions');actions.innerHTML='';let primary,secondary;
  if(sessionWrong.length){primary={label:'まちがえた '+sessionWrong.length+'もんを ふくしゅう',go:()=>startReview(sessionWrong)};secondary=state.points>=100?{label:'ガチャへ',go:()=>show('gacha')}:{label:shortTarget(followTarget),go:()=>runTarget(followTarget)}}
  else if(state.points>=100){primary={label:'ガチャへ',go:()=>show('gacha')};secondary={label:shortTarget(followTarget),go:()=>runTarget(followTarget)}}
  else{primary={label:shortTarget(followTarget),go:()=>runTarget(followTarget)};secondary={label:'もういちど',go:()=>quizMode==='review'?startReview(questions):show('learn')}}
  for(const [item,cls]of [[primary,'primary'],[secondary,'secondary']]){const b=document.createElement('button');b.className=cls;b.textContent=item.label+' ▶';b.onclick=item.go;actions.append(b)}
  show('result');$('result').classList.toggle('perfect-result',perfect);effectSound(perfect?'start':'tap');
 };
 function fragmentBar(){return shardIcon+'<span>かけら <b>'+state.fragments+'</b>こ</span>'}
 window.renderGacha=function(){base.gacha();$('drawButton').disabled=gachaBusy||state.points<100;$('drawButton').setAttribute('aria-busy',String(gachaBusy));$('gachaHint').textContent=state.points<100?'あと '+(100-state.points)+'pt':'';$('gachaFragments').hidden=!state.fragmentExchangeUnlocked;$('gachaFragments').innerHTML=fragmentBar()+'<button class="fragment-entry" aria-expanded="'+exchangeOpen+'" onclick="toggleFragmentCollection()">'+(exchangeOpen?'とじる':'<img src="./assets/fragment-original.webp" alt=""><span>かけらで むかえる</span><span aria-hidden="true">▶</span>')+'</button>';renderRarityExchange()};
 window.collection=function(){
  base.collection();
  for(const card of $('monsters').querySelectorAll('.friend-card')){
   const i=Number(card.dataset.character);if(!Number.isInteger(i)||state.owned.includes(i))continue;
   card.classList.add('locked-card');card.innerHTML=rarityTag(i)+'<div class="locked-art" aria-hidden="true"><span class="unknown-companion">？</span></div><p>？？？</p>';
  }
 };
 function renderRarityExchange(){
  const panel=$('fragmentExchangePanel');panel.hidden=!state.fragmentExchangeUnlocked||!exchangeOpen;
  const list=$('rarityExchangeList');list.innerHTML='';if(panel.hidden)return;
  const names={LR:'LR',SR:'SR',R:'R',N:'N'};
  for(const code of ['LR','SR','R','N']){
   
   const missing=rarityCodes.filter((r,i)=>r===code&&!state.owned.includes(i)).length,cost=Rules.COSTS[code];
   const row=document.createElement('div');row.className='rarity-exchange-row exchange-'+code.toLowerCase();
   row.innerHTML='<div class="exchange-crystal" aria-hidden="true">'+shardIcon+'</div><div class="exchange-row-title"><strong>'+names[code]+'</strong><small>'+(missing?'あと'+missing+'体':'✓')+'</small></div>';
   const button=document.createElement('button');button.className='rarity-exchange-button';button.dataset.exchangeRarity=code;
   button.disabled=!missing;button.classList.toggle('is-unaffordable',state.fragments<cost);
   button.setAttribute('aria-label',missing?code+'の未獲得なかまを1体むかえる。かけら'+cost+'こ':'コンプリート');
   button.innerHTML=missing?'かけら '+cost+'こで むかえる'+(state.fragments<cost?'<br><small>あと'+(cost-state.fragments)+'こ</small>':''):'コンプリート';
   button.onclick=()=>exchangeByRarity(code,button);row.append(button);list.append(row);
  }
 }
 function clearRevealTimers(){for(const t of revealTimers)clearTimeout(t);revealTimers=[];cancelAnimationFrame(revealFrame);revealFrame=0}
 function later(fn,ms){const id=setTimeout(fn,ms);revealTimers.push(id)}
 function animateRevealAura(){cancelAnimationFrame(revealFrame);const hero=$('revealCharacter');function frame(t){if($('gachaReveal').hidden)return;paintLegendAura({el:hero,view:'front',face:1},t);revealFrame=requestAnimationFrame(frame)}revealFrame=requestAnimationFrame(frame)}
 function finishReveal(){
  if(revealDone||!revealResult)return;revealDone=true;const r=revealResult;$('gachaReveal').classList.add('is-opening','is-revealed');$('revealSkip').hidden=true;$('revealContent').hidden=false;
  $('revealHeadline').textContent=r.source==='exchange'?'かけらで なかまになった！':r.fresh?'あたらしい なかま！':'なかまのかけら ゲット！';
  $('revealCharacter').dataset.character=String(r.i);$('revealCharacter').innerHTML='<div class="walk-facing">'+character(r.i)+'</div>'+friendEffects(r.i);
  $('revealName').textContent=species[r.i];$('revealRarity').innerHTML=rarityTag(r.i);$('revealDescription').textContent=r.fresh?'':r.firstFragments?'はじめてのかけら ＋'+r.fragments+'こ！\nレアをえらんで むかえよう。':'＋'+r.fragments+'こ';
  const main=$('revealMain');main.textContent=r.fresh&&state.favorites.length<HOME_LIMIT?'おへやにおく':r.fresh?'なかまをみる':'かけらをつかう';main.onclick=()=>{
   if(r.fresh&&state.favorites.length<HOME_LIMIT){if(!state.favorites.includes(r.i)){state.favorites.push(r.i);save()}closeGachaReveal();show('home')}
   else{closeGachaReveal();collectionRarity='all';show('collection');if(!r.fresh)openFragmentCollection();else{const card=$('monsters').querySelector('[data-character="'+r.i+'"]');if(card)card.scrollIntoView({block:'center'})}}
  };
  $('gachaResult').classList.remove('hidden');$('gachaResult').innerHTML='<p>'+species[r.i]+' '+(r.fresh?'が なかまになった！':'・ かけら ＋'+r.fragments+'こ')+'</p>'+rarityTag(r.i);
  animateRevealAura();effectSound(r.rarity==='LR'?'legend':'correct');main.focus();
 }
 function reveal(r){
  clearRevealTimers();gachaBusy=true;revealDone=false;revealResult=r;revealPreviousFocus=document.activeElement;lockApp(true);const view=$('gachaReveal');view.hidden=false;view.className='gacha-reveal reveal-'+r.rarity.toLowerCase();$('revealHeadline').textContent='なかまガチャ';
  $('revealContent').hidden=true;$('revealSkip').hidden=false;$('revealSkip').focus();$('revealLoading').textContent=r.source==='exchange'?'むかえているよ…':'だれがくるかな？';
  effectSound('capsule');later(()=>view.classList.add('is-opening'),800);later(finishReveal,1350);renderGacha();
 }
 window.drawGacha=function(){if(gachaBusy)return;const result=Rules.draw(state,rarityCodes);if(!result)return;save();updatePoints();reveal(result)};
 function clearFragmentNotice(){clearTimeout(fragmentTimer);$('fragmentNotice').hidden=true}
 function fragmentNotice(message){clearTimeout(fragmentTimer);$('fragmentNotice').textContent=message;$('fragmentNotice').hidden=false;fragmentTimer=setTimeout(()=>{$('fragmentNotice').hidden=true},3800)}
 window.openFragmentCollection=function(){if(!state.fragmentExchangeUnlocked)return;exchangeOpen=true;show('gacha');$('fragmentExchangePanel').scrollIntoView({block:'nearest'})};
 window.toggleFragmentCollection=function(){if(!state.fragmentExchangeUnlocked)return;exchangeOpen=!exchangeOpen;renderGacha();if(exchangeOpen)$('fragmentExchangePanel').scrollIntoView({block:'nearest'})};
 window.exchangeByRarity=function(code,button){
  if(gachaBusy||!Object.prototype.hasOwnProperty.call(Rules.COSTS,code))return;
  const cost=Rules.COSTS[code],missing=rarityCodes.some((r,i)=>r===code&&!state.owned.includes(i));if(!missing)return;
  if(state.fragments<cost){fragmentNotice('あと'+(cost-state.fragments)+'こ 必要だよ');if(button&&button.animate&&(!window.matchMedia||!window.matchMedia('(prefers-reduced-motion: reduce)').matches))button.animate([{transform:'translateX(0)'},{transform:'translateX(-3px)'},{transform:'translateX(3px)'},{transform:'translateX(0)'}],{duration:220});return}
  const result=Rules.exchangeRarity(state,code,rarityCodes);if(!result)return;clearFragmentNotice();save();reveal(result);
 };
 window.skipGachaReveal=function(){finishReveal()};
 window.closeGachaReveal=function(){if(!revealDone){finishReveal();return}clearRevealTimers();$('gachaReveal').hidden=true;gachaBusy=false;lockApp(launchOpen);renderGacha();if(!$('collection').classList.contains('hidden')){collection();$('clearRoomButton').focus()}else if(revealPreviousFocus&&revealPreviousFocus.isConnected)revealPreviousFocus.focus();else $('drawButton').focus()};
 window.openHowTo=function(){$('howToOverlay').hidden=false;$('titleScreen').inert=true;$('howToClose').focus()};
 window.closeHowTo=function(){$('howToOverlay').hidden=true;$('titleScreen').inert=false;$('titleStart').focus()};
 window.showTitleScreen=function(){clearTimeout(brandTimer);$('brandScreen').hidden=true;$('titleScreen').hidden=false;$('titleScreen').focus()};
 window.enterGame=function(){
  if(launchBusy)return;launchBusy=true;effectSound('start');const shutter=$('sceneShutter');shutter.hidden=false;requestAnimationFrame(()=>shutter.classList.add('closed'));
  setTimeout(()=>{launchOpen=false;$('titleScreen').hidden=true;$('brandScreen').hidden=true;document.body.classList.remove('booting');lockApp(false);show('home')},260);
  setTimeout(()=>shutter.classList.remove('closed'),340);setTimeout(()=>{shutter.hidden=true;launchBusy=false;$('home').focus()},620);
 };
 const sound=document.createElement('button');sound.className='sound-toggle';sound.dataset.effectsToggle='';sound.onclick=toggleEffects;document.querySelector('.app>header').append(sound);updateSoundButtons();
 $('quiz').querySelector(':scope >button').onclick=()=>{const q=questions[index];if(q){dan=q.d;group=Math.floor((q.n-1)/3)}show('learn')};
 document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;if(!$('howToOverlay').hidden)closeHowTo();else if(!$('gachaReveal').hidden)closeGachaReveal()});
 document.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const modal=!$('howToOverlay').hidden?$('howToOverlay'):!$('gachaReveal').hidden?$('gachaReveal'):null;if(!modal)return;const buttons=[...modal.querySelectorAll('button:not([disabled])')].filter(b=>b.getClientRects().length);if(!buttons.length)return;const first=buttons[0],last=buttons[buttons.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&audio)audio.suspend().catch(()=>{});else if(audio&&state.settings.effects)audio.resume().catch(()=>{})});
 home();stopRoomWalk();lockApp(true);let brandTimer=0;
 if(query.get('screen-review')==='title')showTitleScreen();else if(query.get('screen-review')!=='brand')brandTimer=setTimeout(showTitleScreen,1700);
})();




