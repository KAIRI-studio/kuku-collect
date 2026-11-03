const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('room selection preserves all SVG/image identities and only updates membership UI',()=>{
 const source=fs.readFileSync('finishing.js','utf8'),start=source.indexOf(' // Membership changes never replace'),end=source.lastIndexOf('})();');
 assert.ok(start>=0);
 const state={owned:[0,1,2,3,4,5,6],favorites:[0,1,2,3,4],points:250,clears:{'2-1':true}},nodes=new Map(),cards=[];
 for(let i=0;i<7;i++){
  const body={svg:{image:{},filter:{}}},button={disabled:false,textContent:'',attrs:{},setAttribute(k,v){this.attrs[k]=v}},classes=new Set();let badge=null;
  const card={dataset:{character:String(i)},body,button,classList:{toggle(k,v){v?classes.add(k):classes.delete(k)},contains:k=>classes.has(k)},querySelector(sel){if(sel==='button')return button;if(sel==='.room-badge')return badge;return body},prepend(n){badge=n;n.remove=()=>{badge=null}},set innerHTML(v){throw Error('body was rebuilt')}};
  cards.push(card);
 }
 nodes.set('monsters',{querySelectorAll:()=>cards});for(const id of ['clearRoomButton','collectionCount','roomActionStatus'])nodes.set(id,{});
 let saves=0;const sandbox={state,window:null,document:{createElement:()=>({})},$:id=>nodes.get(id),species:Array.from({length:7},(_,i)=>'friend'+i),HOME_LIMIT:5,TEST_ALL_CHARACTERS:false,save(){saves++}};sandbox.window=sandbox;
 vm.runInNewContext(source.slice(start,end),sandbox);
 const original=cards.map(c=>c.body.svg),snapshot=JSON.stringify({points:state.points,clears:state.clears});
 sandbox.toggleFavorite(5);assert.equal(saves,0);assert.deepEqual(state.favorites,[0,1,2,3,4]);
 sandbox.toggleFavorite(1);assert.equal(saves,1);assert.deepEqual(state.favorites,[0,2,3,4]);assert.equal(cards[1].button.textContent,'へやにおく');assert.equal(cards[5].button.disabled,false);
 sandbox.toggleFavorite(5);assert.equal(cards[5].classList.contains('in-room'),true);assert.equal(cards[6].button.disabled,true);assert.equal(cards[0].button.disabled,false);assert.equal(cards[5].button.attrs['aria-pressed'],'true');assert.deepEqual(state.favorites,[0,2,3,4,5]);
 sandbox.clearRoom();assert.equal(state.favorites.length,0);assert.equal(nodes.get('clearRoomButton').disabled,true);assert.ok(cards.every(c=>!c.button.disabled&&!c.classList.contains('in-room')));
 cards.forEach((c,i)=>assert.equal(c.body.svg,original[i]));assert.equal(JSON.stringify({points:state.points,clears:state.clears}),snapshot);
 sandbox.toggleFavorite(999);assert.equal(saves,3);
});
