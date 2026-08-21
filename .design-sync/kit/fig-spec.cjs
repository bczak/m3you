const fs=require('fs'),path=require('path');
const M=require('./fig-extract.cjs');
const {root,NodeType,VariableField,PaintType,StackMode,EffectType,VarType,StackJustify,StackAlign,StackSize,TextCase,StrokeAlign}=M;
const nc=root.nodeChanges;
const gid=g=>g?g.sessionID+':'+g.localID:null;
const nodes=new Map(); nc.forEach(n=>nodes.set(gid(n.guid),n));
const kids=new Map();
for(const n of nc){const p=gid(n.parentIndex&&n.parentIndex.guid); if(!p)continue;
  if(!kids.has(p))kids.set(p,[]); kids.get(p).push(n);}
for(const a of kids.values()) a.sort((x,y)=>(x.parentIndex.position<y.parentIndex.position?-1:1));
const T=n=>NodeType[n.type];
const pageCache=new Map();
function pageOf(n){let c=n,d=0,seen=[];
  while(c&&d++<300){const k=gid(c.guid); if(pageCache.has(k))
      {const r=pageCache.get(k);seen.forEach(s=>pageCache.set(s,r));return r;}
    if(T(c)==='CANVAS'){seen.forEach(s=>pageCache.set(s,c.name));return c.name;}
    seen.push(k); c=nodes.get(gid(c.parentIndex&&c.parentIndex.guid));}
  return '?';}
const r2=v=>v==null?undefined:Math.round(v*1000)/1000;
const hex=c=>c?'#'+[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('')+(c.a<0.999?Math.round(c.a*255).toString(16).padStart(2,'0'):''):undefined;

/* ---------- variables ---------- */
const sets=new Map(); // setGuid -> {name, modes:[{id,name}]}
for(const n of nc) if(T(n)==='VARIABLE_SET')
  sets.set(gid(n.guid),{name:n.name,modes:(n.variableSetModes||[]).map(m=>({id:gid(m.id),name:m.name}))});
const vars=new Map(); // varGuid -> {name,set,type,byMode:{modeId:VariableData}}
for(const n of nc) if(T(n)==='VARIABLE'){
  const byMode={}; ((n.variableDataValues||{}).entries||[]).forEach(e=>byMode[gid(e.modeID)]=e.variableData);
  vars.set(gid(n.guid),{name:n.name,token:n.variableTokenName,
    set:gid(n.variableSetID&&n.variableSetID.guid),type:VarType[n.variableResolvedType],byMode});}
function modeIdFor(setId,modeName){const s=sets.get(setId);if(!s)return null;
  const m=s.modes.find(m=>m.name===modeName)||s.modes[0];return m&&m.id;}
function resolve(varId,modeName,depth){
  if(depth>10)return {err:'deep'};
  const v=vars.get(varId); if(!v)return {err:'missing'};
  const mid=modeIdFor(v.set,modeName);
  const vd=v.byMode[mid]||Object.values(v.byMode)[0];
  if(!vd||!vd.value)return {err:'noval'};
  const val=vd.value;
  if(val.alias) return resolve(gid(val.alias.guid),modeName,depth+1);
  if(val.colorValue!==undefined)return {color:hex(val.colorValue)};
  if(val.floatValue!==undefined)return {num:r2(val.floatValue)};
  if(val.textValue!==undefined)return {text:val.textValue};
  if(val.boolValue!==undefined)return {bool:val.boolValue};
  if(val.fontStyleValue)return {font:val.fontStyleValue};
  return {raw:Object.keys(val)[0]};}
const varName=id=>{const v=vars.get(id);return v?v.name:('?'+id);};

/* ---------- node spec ---------- */
function paints(ps){if(!ps||!ps.length)return undefined;
  return ps.filter(p=>p.visible!==false).map(p=>{const o={type:PaintType[p.type]};
    if(p.color)o.hex=hex(p.color);
    if(p.opacity!==undefined&&p.opacity<0.999)o.opacity=r2(p.opacity);
    const cv=p.colorVar&&p.colorVar.value&&p.colorVar.value.alias;
    if(cv)o.var=varName(gid(cv.guid));
    return o;});}
function nodeSpec(n,depth){
  const s={name:n.name,type:T(n)};
  if(n.visible===false)s.hidden=true;
  if(n.size)s.size=[r2(n.size.x),r2(n.size.y)];
  if(n.rectangleCornerRadiiIndependent)s.radii=[r2(n.rectangleTopLeftCornerRadius),r2(n.rectangleTopRightCornerRadius),r2(n.rectangleBottomRightCornerRadius),r2(n.rectangleBottomLeftCornerRadius)];
  else if(n.cornerRadius)s.radius=r2(n.cornerRadius);
  if(n.stackMode&&StackMode[n.stackMode]!=='NONE'){
    s.layout={dir:StackMode[n.stackMode],gap:r2(n.stackSpacing)||0,
      pad:[r2(n.stackVerticalPadding)||0,r2(n.stackPaddingRight)||0,r2(n.stackPaddingBottom)||0,r2(n.stackHorizontalPadding)||0],
      justify:StackJustify[n.stackJustify],align:StackAlign[n.stackCounterAlign],
      w:StackSize[n.stackWidth],h:StackSize[n.stackHeight]};
    if(n.stackCounterSpacing)s.layout.crossGap=r2(n.stackCounterSpacing);}
  const f=paints(n.fillPaints); if(f)s.fill=f;
  const st=paints(n.strokePaints); if(st){s.stroke=st;
    s.strokeWeight=r2(n.strokeWeight); s.strokeAlign=StrokeAlign[n.strokeAlign];
    if([n.borderTopWeight,n.borderRightWeight,n.borderBottomWeight,n.borderLeftWeight].some(v=>v!==undefined))
      s.borderWeights=[r2(n.borderTopWeight),r2(n.borderRightWeight),r2(n.borderBottomWeight),r2(n.borderLeftWeight)];}
  if(n.effects&&n.effects.length)s.effects=n.effects.filter(e=>e.visible!==false).map(e=>({t:EffectType[e.type],
    r:r2(e.radius),sp:r2(e.spread),off:e.offset?[r2(e.offset.x),r2(e.offset.y)]:undefined,c:hex(e.color)}));
  if(n.opacity!==undefined&&n.opacity<0.999)s.opacity=r2(n.opacity);
  if(T(n)==='TEXT'){s.text={chars:(n.textData&&n.textData.characters||'').slice(0,60),
    size:r2(n.fontSize),font:n.fontName?n.fontName.family+' '+n.fontName.style:undefined,
    lh:n.lineHeight?r2(n.lineHeight.value)+(n.lineHeight.units===2?'%':n.lineHeight.units===1?'px':'raw'):undefined,
    ls:n.letterSpacing?r2(n.letterSpacing.value):undefined,case:TextCase[n.textCase]};}
  if(n.minSize)s.minSize=[r2(n.minSize.x),r2(n.minSize.y)];
  if(n.maxSize)s.maxSize=[r2(n.maxSize.x),r2(n.maxSize.y)];
  const vc=n.variableConsumptionMap&&n.variableConsumptionMap.entries;
  if(vc&&vc.length){s.vars={};for(const e of vc){const a=e.variableData&&e.variableData.value&&e.variableData.value.alias;
    if(a)s.vars[VariableField[e.variableField]||('F'+e.variableField)]=varName(gid(a.guid));}}
  const mb=n.variableModeBySetMap&&n.variableModeBySetMap.entries;
  if(mb&&mb.length){s.modes={};for(const e of mb){const sid=gid(e.variableSetID&&e.variableSetID.guid),S=sets.get(sid);
    if(S){const m=S.modes.find(m=>m.id===gid(e.variableModeID));s.modes[S.name]=m?m.name:'?';}}}
  const ch=kids.get(gid(n.guid));
  if(ch&&ch.length&&depth<9)s.children=ch.map(c=>nodeSpec(c,depth+1));
  return s;}
module.exports={M,nc,nodes,kids,gid,T,pageOf,sets,vars,resolve,varName,nodeSpec,hex,r2,modeIdFor};
