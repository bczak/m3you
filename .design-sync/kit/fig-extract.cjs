const z=require('zlib'), fs=require('fs'), {execSync}=require('child_process');
const d=execSync('unzip -p "+require('node:path').resolve(__dirname,'../../../m3ui.fig')+" canvas.fig',{maxBuffer:1e9});
let off=12, chunks=[];
while(off<d.length){const n=d.readUInt32LE(off);off+=4;chunks.push(d.subarray(off,off+n));off+=n;}
const schemaBuf=z.inflateRawSync(chunks[0]);
const dataBuf=z.zstdDecompressSync(chunks[1],{maxOutputLength:200e6});
function Reader(b){this.b=b;this.i=0;} const R=Reader.prototype;
R.byte=function(){return this.b[this.i++];};
R.bool=function(){return !!this.b[this.i++];};
R.varUint=function(){let v=0,s=0,c;do{c=this.b[this.i++];v+=(c&127)*Math.pow(2,s);s+=7;}while(c&128);return v;};
R.varInt=function(){const v=this.varUint();return (v%2)?-(v+1)/2:v/2;};
R.varUint64=function(){let v=0n,s=0n,c;do{c=this.b[this.i++];v|=BigInt(c&127)<<s;s+=7n;}while(c&128);return v;};
R.varInt64=function(){const v=this.varUint64();return (v&1n)?-((v>>1n)+1n):(v>>1n);};
const _ab=new ArrayBuffer(4),_u=new Uint32Array(_ab),_f=new Float32Array(_ab);
R.float=function(){if(this.b[this.i]===0){this.i++;return 0;}
 let bits=(this.b[this.i]|(this.b[this.i+1]<<8)|(this.b[this.i+2]<<16)|(this.b[this.i+3]<<24))>>>0;this.i+=4;
 _u[0]=((bits<<23)|(bits>>>9))>>>0;return _f[0];};
R.str=function(){const s=this.i;while(this.b[this.i]!==0)this.i++;const r=this.b.toString('utf8',s,this.i);this.i++;return r;};
const sr=new Reader(schemaBuf),dc=sr.varUint(),defs=[];
for(let i=0;i<dc;i++){const name=sr.str(),kind=sr.byte(),fc=sr.varUint(),fields=[];
 for(let j=0;j<fc;j++)fields.push({name:sr.str(),type:sr.varInt(),isArray:sr.bool(),value:sr.varUint()});
 const byId={};if(kind===2)fields.forEach(f=>byId[f.value]=f);defs.push({name,kind,fields,byId});}
const byName={};defs.forEach((x,i)=>byName[x.name]=i);
const enumMap=n=>{const m={};defs[byName[n]].fields.forEach(f=>m[f.value]=f.name);return m;};

// Only keep what the audit needs — everything else is decoded then dropped.
const K=new Set(['guid','parentIndex','type','name','isStateGroup','stateGroupPropertyValueOrder','symbolData',
 'size','cornerRadius','rectangleTopLeftCornerRadius','rectangleTopRightCornerRadius','rectangleBottomLeftCornerRadius',
 'rectangleBottomRightCornerRadius','rectangleCornerRadiiIndependent','strokeWeight','strokeAlign','borderTopWeight',
 'borderBottomWeight','borderLeftWeight','borderRightWeight','fillPaints','strokePaints','effects','opacity','visible',
 'stackMode','stackSpacing','stackCounterSpacing','stackPadding','stackHorizontalPadding','stackVerticalPadding',
 'stackPaddingRight','stackPaddingBottom','stackJustify','stackAlign','stackPrimarySizing','stackCounterAlign',
 'stackWidth','stackHeight','minSize','maxSize','fontSize','fontName','lineHeight','letterSpacing','textCase',
 'textAlignHorizontal','textData','textTracking','inheritTextStyleID','styleIdForText','styleType','styleID',
 'variableConsumptionMap','variableModeBySetMap','variableSetModes','variableSetID','variableResolvedType',
 'variableDataValues','variableTokenName','componentPropDefs','variantPropSpecs','sectionStatus','internalOnly']);
const KEEP={NodeChange:K};
function readVal(r,t){if(t<0){switch(t){case -1:return r.bool();case -2:return r.byte();case -3:return r.varInt();
 case -4:return r.varUint();case -5:return r.float();case -6:return r.str();case -7:return r.varInt64();case -8:return r.varUint64();}}
 return readDef(r,t);}
function readDef(r,ti){const D=defs[ti];
 if(D.kind===0)return r.varUint();
 if(D.kind===1){const o={};for(const f of D.fields)o[f.name]=f.isArray?readArr(r,f.type):readVal(r,f.type);return o;}
 const keep=KEEP[D.name],o={};
 for(;;){const id=r.varUint();if(id===0)break;const f=D.byId[id];if(!f)throw new Error('unknown '+id+' in '+D.name);
  const v=f.isArray?readArr(r,f.type):readVal(r,f.type);if(!keep||keep.has(f.name))o[f.name]=v;}
 return o;}
function readArr(r,t){const n=r.varUint(),a=new Array(n);for(let i=0;i<n;i++)a[i]=readVal(r,t);return a;}
const rr=new Reader(dataBuf);
const root=readDef(rr,byName.Message);
module.exports={root,defs,byName,enumMap,
 NodeType:enumMap('NodeType'),VariableField:enumMap('VariableField'),PaintType:enumMap('PaintType'),
 StackMode:enumMap('StackMode'),EffectType:enumMap('EffectType'),VarType:enumMap('VariableResolvedDataType'),
 StackJustify:enumMap('StackJustify'),StackAlign:enumMap('StackAlign'),StackSize:enumMap('StackSize'),
 TextCase:enumMap('TextCase'),StrokeAlign:enumMap('StrokeAlign'),StyleType:enumMap('StyleType')};
