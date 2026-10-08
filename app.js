'use strict';
const defaults=['Work and career','Family life','Friendships and support','Health and wellbeing','Enjoyment and interests','Financial security','Learning and personal growth'];
let nextId=defaults.length+1;
let areas=defaults.map((name,i)=>({id:i+1,name,score:null}));
const $=id=>document.getElementById(id);
const svgNS='http://www.w3.org/2000/svg';
const escaped=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderAreas(){
  $('area-list').innerHTML=areas.map((a,i)=>`<div class="area"><span class="area-number" aria-hidden="true">${i+1}</span><input maxlength="60" aria-label="Name of area ${i+1}" data-name="${a.id}" value="${escaped(a.name)}"><select aria-label="Satisfaction score for area ${i+1}" data-score="${a.id}"><option value="">Score</option>${Array.from({length:11},(_,v)=>`<option value="${v}" ${a.score===v?'selected':''}>${v} / 10</option>`).join('')}</select><button class="remove" data-remove="${a.id}" aria-label="Remove area ${i+1}" ${areas.length<=3?'disabled':''}>×</button></div>`).join('');
  $('add').disabled=areas.length>=10; renderFocus();draw();
}
function renderFocus(){
  const selected=$('focus').value;
  $('focus').innerHTML='<option value="">Choose an area, or leave this open</option>'+areas.map(a=>`<option value="${a.id}">${escaped(a.name||'Unnamed area')}</option>`).join('');
  if(areas.some(a=>String(a.id)===selected))$('focus').value=selected;
  syncPrint();
}
function point(r,angle){return [230+r*Math.cos(angle),230+r*Math.sin(angle)];}
function addSvg(tag,attrs,text){const el=document.createElementNS(svgNS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(text!==undefined)el.textContent=text;$('wheel').appendChild(el);return el;}
function draw(){
  const svg=$('wheel');svg.replaceChildren();
  addSvg('title',{id:'chart-title'},'Current satisfaction by life area');
  addSvg('desc',{id:'chart-desc'},areas.map((a,i)=>`${i+1}. ${a.name||'Unnamed area'}: ${a.score===null?'unrated':a.score+' out of 10'}`).join('; '));
  const R=172,n=areas.length;
  for(let i=0;i<n;i++){
    const start=-Math.PI/2+i*2*Math.PI/n,end=start+2*Math.PI/n;
    const score=areas[i].score;
    if(score!==null&&score>0){const r=R*score/10,p1=point(r,start),p2=point(r,end);addSvg('path',{d:`M230 230 L${p1.join(' ')} A${r} ${r} 0 0 1 ${p2.join(' ')} Z`,fill:'#4450b3','fill-opacity':i%2===0?'.28':'.4'});}
  }
  for(let v=2;v<=10;v+=2)addSvg('circle',{cx:230,cy:230,r:R*v/10,fill:'none',stroke:'#cbd1e2','stroke-width':v===10?1.5:1});
  for(let i=0;i<n;i++){
    const start=-Math.PI/2+i*2*Math.PI/n,p=point(R,start),mid=start+Math.PI/n,label=point(R+29,mid);
    addSvg('line',{x1:230,y1:230,x2:p[0],y2:p[1],stroke:'#cbd1e2'});
    addSvg('circle',{cx:label[0],cy:label[1],r:16,fill:'#f4f6fc',stroke:'#cbd1e2'});
    addSvg('text',{x:label[0],y:label[1]+5,'text-anchor':'middle','font-size':16,fill:'#4450b3'},i+1);
  }
  for(let v=2;v<=10;v+=2)addSvg('text',{x:236,y:230-R*v/10+4,'font-size':11,fill:'#48516a','paint-order':'stroke',stroke:'white','stroke-width':3},v);
  const answered=areas.filter(a=>a.score!==null).length;
  $('progress').textContent=answered?`${answered} of ${n} areas rated`:'Choose a score for each area when you are ready.';
}
$('area-list').addEventListener('input',e=>{
  const id=Number(e.target.dataset.name||e.target.dataset.score),a=areas.find(a=>a.id===id);if(!a)return;
  if(e.target.dataset.name){a.name=e.target.value;renderFocus();}else{a.score=e.target.value===''?null:Number(e.target.value);}draw();
});
$('area-list').addEventListener('click',e=>{const id=Number(e.target.dataset.remove);if(id&&areas.length>3){areas=areas.filter(a=>a.id!==id);renderAreas();}});
$('add').addEventListener('click',()=>{if(areas.length<10){const id=nextId++;areas.push({id,name:'My area',score:null});renderAreas();const field=document.querySelector(`[data-name="${id}"]`);field.focus();field.select();}});
function syncPrint(){for(const id of ['notice','protect','change'])$('print-'+id).textContent=$(id).value||'Left open for discussion';$('print-focus').textContent=areas.find(a=>String(a.id)===$('focus').value)?.name||'Left open for discussion';}
for(const id of ['notice','protect','focus','change'])$(id).addEventListener('input',syncPrint);
function reflectionText(){return 'WHEEL OF LIFE\n'+new Date().toLocaleDateString('en-GB')+'\n\nCurrent satisfaction: 0 = very dissatisfied, 10 = very satisfied\n\n'+areas.map((a,i)=>`${i+1}. ${a.name||'Unnamed area'}: ${a.score===null?'Unrated':a.score+' / 10'}`).join('\n')+'\n\nWhat stands out or surprises you?\n'+($('notice').value||'Left open for discussion')+'\n\nWhat is working well that you want to preserve?\n'+($('protect').value||'Left open for discussion')+'\n\nWhich area would you most like to discuss?\n'+(areas.find(a=>String(a.id)===$('focus').value)?.name||'Left open for discussion')+'\n\nWhat would feel a little better in that area?\n'+($('change').value||'Left open for discussion')+'\n';}
$('download').addEventListener('click',()=>{const blob=new Blob([reflectionText()],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='My Wheel of Life reflection.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('status').textContent='Your download has been requested. Check your downloads folder.';});
$('print').addEventListener('click',()=>{syncPrint();window.print();});
window.addEventListener('beforeprint',syncPrint);
function startAgain(){if(window.confirm('Clear all your scores and reflections and start again?')){areas=defaults.map((name,i)=>({id:i+1,name,score:null}));nextId=defaults.length+1;for(const id of ['notice','protect','change','focus'])$(id).value='';$('status').textContent='Your scores and reflections have been cleared.';renderAreas();}}
$('reset').addEventListener('click',startAgain);
$('reset-bottom').addEventListener('click',startAgain);
renderAreas();
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'read_wheel_reflection',title:'Read current reflection',description:'Read the current life areas, satisfaction scores and reflection notes on this page.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute(){return {areas:areas.map(a=>({...a})),notice:$('notice').value,protect:$('protect').value,focus:areas.find(a=>String(a.id)===$('focus').value)?.name||null,change:$('change').value};}})).catch(()=>{});}catch{}}
