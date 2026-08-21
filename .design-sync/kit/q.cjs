#!/usr/bin/env node
/* Query the extracted Material 3 Design Kit specs.
   Usage: node .design-sync/kit/q.cjs <set-substring> [variantRegex] [--all] [--depth N]
          node .design-sync/kit/q.cjs --list [substring]
          node .design-sync/kit/q.cjs --var <substring>        # look up design variables
*/
const fs=require('fs'),path=require('path'),DIR=require('node:path').dirname(require('node:fs').realpathSync(__filename));
const idx=JSON.parse(fs.readFileSync(DIR+'/_index.json','utf8'));
const argv=process.argv.slice(2);
const flag=n=>{const i=argv.indexOf(n);if(i<0)return null;const v=argv[i+1];argv.splice(i,v&&!v.startsWith('--')?2:1);return v||true;};
const all=!!flag('--all'), maxDepth=+(flag('--depth')||9);
if(argv[0]==='--list'){const s=(argv[1]||'').toLowerCase();
  idx.filter(x=>(x.page+'/'+x.set).toLowerCase().includes(s))
     .forEach(x=>console.log((x.page+' / '+x.set).padEnd(70),String(x.variants).padStart(4),'axes:',x.axes.join(',')));
  process.exit(0);}
if(argv[0]==='--var'){const v=JSON.parse(fs.readFileSync(DIR+'/_variables.json','utf8'));
  const s=(argv[1]||'').toLowerCase();
  for(const [set,items] of Object.entries(v))for(const [name,d] of Object.entries(items))
    if((set+'/'+name).toLowerCase().includes(s)){
      const f=x=>x==null?'':(x.color!==undefined?x.color:x.num!==undefined?String(x.num):x.text!==undefined?JSON.stringify(x.text):x.bool!==undefined?String(x.bool):x.err||'');
      console.log((set+'/'+name).padEnd(46),String(f(d.light)||f(d.baseline)||'').padEnd(12),f(d.dark)||'');}
  process.exit(0);}
const q=(argv[0]||'').toLowerCase(), vre=argv[1]?new RegExp(argv[1],'i'):null;
let sre;try{sre=new RegExp(argv[0]||'','i');}catch(e){sre=null;}
const hits=idx.filter(x=>{const k=x.page+'/'+x.set;return sre?sre.test(k):k.toLowerCase().includes(q);});
if(!hits.length){console.error('no set matches '+q+'  (try --list)');process.exit(1);}
const num=v=>Number.isInteger(v)?v:(v==null?v:Math.round(v*100)/100);
function line(n,d,out){
  if(d>maxDepth)return;
  const p=[];
  if(n.size)p.push('['+num(n.size[0])+'x'+num(n.size[1])+']');
  if(n.radius!==undefined)p.push('r='+num(n.radius));
  if(n.radii)p.push('r='+n.radii.map(num).join('/'));
  if(n.layout){const L=n.layout;p.push(L.dir==='VERTICAL'?'col':'row');
    if(L.pad.some(v=>v))p.push('pad='+L.pad.map(num).join(','));
    if(L.gap)p.push('gap='+num(L.gap));
    if(L.justify&&L.justify!=='MIN')p.push('justify='+L.justify);
    if(L.align&&L.align!=='MIN')p.push('align='+L.align);
    if(L.w)p.push('w='+L.w); if(L.h)p.push('h='+L.h);}
  if(n.minSize)p.push('min='+n.minSize.map(num).join('x'));
  if(n.maxSize)p.push('max='+n.maxSize.map(num).join('x'));
  if(n.fill)p.push('fill='+n.fill.map(f=>f.var||f.hex||f.type).join('+')+(n.fill[0]&&n.fill[0].opacity!==undefined?'@'+n.fill[0].opacity:''));
  if(n.stroke)p.push('stroke='+n.stroke.map(f=>f.var||f.hex).join('+')+' w='+num(n.strokeWeight)+(n.borderWeights&&n.borderWeights.some(x=>x!==n.strokeWeight)?' bw='+n.borderWeights.map(num).join(','):''));
  if(n.effects&&n.effects.length)p.push('shadow='+n.effects.map(e=>e.t+' r'+num(e.r)+' y'+(e.off?num(e.off[1]):0)+' '+(e.c||'')).join(';'));
  if(n.opacity!==undefined)p.push('opacity='+n.opacity);
  if(n.text){const t=n.text;p.push('"'+t.chars+'"');
    p.push([t.size&&t.size+'px',t.lh&&'lh'+t.lh,t.ls!==undefined&&'ls'+t.ls,t.font,t.case&&t.case!=='ORIGINAL'&&t.case].filter(Boolean).join(' '));}
  if(n.vars&&Object.keys(n.vars).length)p.push('vars{'+Object.entries(n.vars).map(([k,v])=>k+'='+v).join(' ')+'}');
  if(n.modes)p.push('modes{'+Object.entries(n.modes).map(([k,v])=>k+'='+v).join(' ')+'}');
  if(n.hidden)p.push('HIDDEN');
  out.push('  '.repeat(d)+(d?'· ':'▸ ')+n.name+(n.type!=='FRAME'&&n.type!=='SYMBOL'?' <'+n.type+'>':'')+'  '+p.join('  '));
  (n.children||[]).forEach(c=>line(c,d+1,out));}
for(const h of hits){
  const spec=JSON.parse(fs.readFileSync(path.join(DIR,'sets',h.file),'utf8'));
  console.log('\n════ '+spec.page+' / '+spec.set+'  ('+spec.variantCount+' variants)');
  console.log('axes: '+Object.entries(spec.axes).map(([k,v])=>k+'=['+v.join('|')+']').join('  '));
  let vs=spec.variants; if(vre)vs=vs.filter(v=>vre.test(v.name));
  const cap=all?vs.length:Math.min(vs.length,24);
  if(vs.length>cap)console.log('(showing '+cap+' of '+vs.length+' matching variants — pass --all or a variant regex)');
  vs.slice(0,cap).forEach(v=>{const out=[];line(v,0,out);console.log(out.join('\n'));});}
