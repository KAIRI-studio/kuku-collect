const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
const species=JSON.parse(html.match(/const species=(\[[^;]+\])/)[1]);
const rigs=JSON.parse(html.match(/const rigAssets=(\[[^\r\n]+);/)[1]);
const imageRigs=new Map(rigs.map(r=>[r.src,r]));
const paints=[];
function context(){return {scale(){},translate(){},save(){},restore(){},drawImage(){this.draws=(this.draws||0)+1},beginPath(){},ellipse(){},arc(){},fill(){paints.push(this.fillStyle)},lineTo(){},moveTo(){},stroke(){paints.push(this.strokeStyle)},setTransform(){},clearRect(){},fillRect(){paints.push(this.fillStyle)},getImageData(){const a=new Uint8ClampedArray(248*240*4);for(let y=20;y<224;y++)for(let x=40;x<200;x++)a[(y*248+x)*4+3]=255;return {data:a}},createLinearGradient(){return {stops:[],addColorStop(at,color){this.stops.push([at,color])}}}}}
function canvas(){const c=context();return {getContext:()=>c,_context:c}}
class TestImage{set src(src){const a=imageRigs.get(src);assert(a,src);this.naturalWidth=a.w;this.naturalHeight=a.h;this.onload()}}
const sandbox={rigAssets:rigs,species,matchMedia:()=>({matches:false}),Image:TestImage,document:{createElement:tag=>{assert.equal(tag,'canvas');return canvas()}},Map,Math};
vm.createContext(sandbox);vm.runInContext(html.slice(html.indexOf('const legendAuraPalette'),html.indexOf('function friendEffects')),sandbox);
for(const id of [3,4,5,13,14,16,46,47,48,49]){
 const a=sandbox.legendAuraAssets(id);assert(a.ready);assert.equal(a.views.length,3);
 for(const view of ['front','side','back'])for(const face of [1,-1]){const screen=canvas(),w={view,face,el:{dataset:{character:String(id)},querySelector:()=>screen}};sandbox.paintLegendAura(w,1000);assert(screen._context.draws>0);assert.equal(screen._auraFrame,1000)}
}
assert(!paints.includes(undefined));console.log('PASS: all 10 LR build 3 aura masks and paint front/side/back in both facing directions; no undefined aura colours.');
const rarity=JSON.parse(html.match(/const rarityCodes=(\[[^;]+\])/)[1]);assert.equal(species.length,50);assert.deepStrictEqual(rarity.reduce((a,r)=>(a[r]=(a[r]||0)+1,a),{}),{N:20,SR:10,LR:10,R:10});for(const r of rigs.slice(46)){assert(fs.existsSync(r.src));for(const [x,y,w,h]of r.parts)assert(x>=0&&y>=0&&x+w<=r.w&&y+h<=r.h)}
vm.runInContext(html.slice(html.indexOf('const CHARACTER_OUTLINE_WIDTH'),html.indexOf('let walkFrame')),sandbox);for(let i=0;i<50;i++)assert(!sandbox.character(i,true).includes('undefined'));console.log('PASS: 50-character roster counts, new atlas bounds and all character renderers.');
