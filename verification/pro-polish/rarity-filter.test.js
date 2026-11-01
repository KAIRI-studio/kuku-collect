const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('rarity and ownership filters combine, show the correct empty state, and preserve the save',()=>{
 const html=fs.readFileSync('index.html','utf8'),source=html.slice(html.indexOf("let collectionView='owned'"),html.indexOf('home();if(TEST_ALL_CHARACTERS)'));
 class Node{constructor(){this.children=[];this.dataset={};this.attrs={};this.classList={toggle(){}}}append(n){this.children.push(n)}set innerHTML(v){this.html=v;this.children=[]}get innerHTML(){return this.html||''}setAttribute(k,v){this.attrs[k]=v}}
 const ids=new Map(),get=id=>{if(!ids.has(id))ids.set(id,new Node());return ids.get(id)},chips=['all','LR','SR','R','N'].map(r=>{const b=new Node();b.dataset.rarityFilter=r;return b});
 const state={points:46,owned:[0,20,40],favorites:[40],clears:{'2-0':true}},before=JSON.stringify(state),codes=[...Array(20).fill('N'),...Array(10).fill('R'),...Array(10).fill('SR'),...Array(10).fill('LR')];
 const ctx={state,$:get,species:codes.map((_,i)=>'name'+i),rarityCodes:codes,HOME_LIMIT:5,TEST_ALL_CHARACTERS:false,document:{createElement:()=>new Node(),querySelectorAll:()=>chips},rarityTag:()=>'<span>rarity</span>',character:()=>'<svg></svg>',toggleFavorite(){}};
 vm.createContext(ctx);vm.runInContext(source,ctx);const cards=()=>get('monsters').children.filter(n=>n.dataset.character!==undefined);
 ctx.collection();assert.equal(cards().length,3);
 ctx.setCollectionView('all');assert.equal(cards().length,50);
 for(const [r,n]of [['N',20],['R',10],['SR',10],['LR',10]]){ctx.setCollectionRarity(r);assert.equal(cards().length,n);assert(cards().every(c=>codes[Number(c.dataset.character)]===r));assert.equal(chips.find(b=>b.dataset.rarityFilter===r).attrs['aria-pressed'],'true')}
 ctx.setCollectionView('owned');assert.equal(cards().length,1);assert.equal(cards()[0].dataset.character,'40');ctx.setCollectionRarity('SR');assert.equal(cards().length,0);assert.match(get('monsters').children[0].innerHTML,/このレア/);
 ctx.setCollectionRarity('invalid');assert.equal(cards().length,3);assert.equal(JSON.stringify(state),before);
});
