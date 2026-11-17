(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
if(!$('#fx-refresh'))return;
const API='https://api.frankfurter.dev/v1/';
const codes=['EUR','USD','GBP','CHF'];
let latest=null,series=[],days=30,stale=false,loading=false;
const safeStore={get(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
function setStatus(msg,error=false){$('#fx-update').textContent=msg;$('#status-led')?.classList.toggle('is-error',error)}
function number(v, digits=4){return Number(v).toLocaleString('en-US',{minimumFractionDigits:digits,maximumFractionDigits:digits})}
function isRate(v){return typeof v==='number'&&Number.isFinite(v)&&v>0}
async function request(url){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);try{const r=await fetch(url,{signal:controller.signal,cache:'no-store',headers:{Accept:'application/json'}});if(!r.ok)throw Error(`HTTP ${r.status}`);return await r.json()}finally{clearTimeout(timer)}}
function parseLatest(raw){if(!raw||!/^\d{4}-\d{2}-\d{2}$/.test(raw.date)||!raw.rates||!['USD','GBP','CHF'].every(c=>isRate(raw.rates[c])))throw Error('Unexpected latest-rate response');return {date:raw.date,rates:{EUR:1,USD:raw.rates.USD,GBP:raw.rates.GBP,CHF:raw.rates.CHF}}}
function parseHistory(raw){if(!raw?.rates||typeof raw.rates!=='object')throw Error('Unexpected historical response');const arr=Object.entries(raw.rates).filter(([d,r])=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&isRate(r?.USD)).map(([d,r])=>[d,r.USD]).sort((a,b)=>a[0].localeCompare(b[0]));if(arr.length<2)throw Error('Too few observations');return arr}
function rates(from,to){if(!latest)return null;return latest.rates[to]/latest.rates[from]}
function renderRates(){for(const [id,v] of [['#fx-eurusd',latest.rates.USD],['#fx-eurgbp',latest.rates.GBP],['#fx-eurchf',latest.rates.CHF],['#fx-usdeur',1/latest.rates.USD]])$(id).textContent=number(v);$('#fx-conversion-note').textContent=`${stale?'Cached · ':''}Reference date: ${latest.date} · Not an intraday quote`;calculate();}
function calculate(){if(!latest)return;const amount=parseFloat($('#fx-amount').value),from=$('#fx-from').value,to=$('#fx-to').value;if(!Number.isFinite(amount)||amount<0){$('#fx-converted').textContent='Enter an amount';return}const converted=amount*rates(from,to);$('#fx-converted').textContent=`${converted.toLocaleString('en-US',{maximumFractionDigits:4,minimumFractionDigits:2})} ${to}`}
function chart(){const a=series.slice(-days);if(a.length<2){$('#chart-subtitle').textContent='Historical series is unavailable';return}
const values=a.map(x=>x[1]),lo=Math.min(...values),hi=Math.max(...values),padding=Math.max((hi-lo)*.16,.002),min=lo-padding,max=hi+padding,W=820,Y0=290,H=250;
const pts=a.map(([d,v],i)=>({date:d,value:v,x:30+i*W/(a.length-1),y:Y0-(v-min)/(max-min)*H}));
const path='M'+pts.map(p=>`${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' L');$('#chart-line').setAttribute('d',path);$('#chart-area').setAttribute('d',path+` L850,${Y0} L30,${Y0} Z`);
const grid=$('#chart-grid');grid.replaceChildren();for(let i=0;i<5;i++){const y=40+(H/4)*i,elem=document.createElementNS('http://www.w3.org/2000/svg','path');elem.setAttribute('d',`M30,${y}H850`);grid.append(elem)}
$('#chart-axis').replaceChildren(...[a[0][0],a[Math.floor(a.length/2)][0],a.at(-1)[0]].map(t=>{const sp=document.createElement('span');sp.textContent=t;return sp}));
const first=a[0][1],last=a.at(-1)[1],delta=(last/first-1)*100;$('#chart-first').textContent=number(first);$('#chart-last').textContent=number(last);$('#chart-change').textContent=(delta>=0?'+':'')+delta.toFixed(2)+'%';$('#chart-change').classList.toggle('negative',delta<0);$('#chart-count').textContent=String(a.length);
$('#chart-subtitle').textContent=`${a[0][0]} to ${a.at(-1)[0]} · ${a.length} published observations${stale?' · cached':''}`;
$('#fx-export').disabled=false;
const svg=$('#fx-chart'), rect=$('#chart-interaction');
function tooltip(e){const r=svg.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*880;let n=Math.max(0,Math.min(pts.length-1,Math.round((x-30)/W*(pts.length-1))));const p=pts[n];$('#chart-crosshair').setAttribute('x1',p.x);$('#chart-crosshair').setAttribute('x2',p.x);$('#chart-crosshair').setAttribute('opacity','1');$('#chart-focus').setAttribute('cx',p.x);$('#chart-focus').setAttribute('cy',p.y);$('#chart-focus').setAttribute('opacity','1');$('#chart-tooltip').textContent=`${p.date}  ·  1 EUR = ${number(p.value)} USD`}
rect.onpointermove=tooltip;rect.onpointerleave=()=>{$('#chart-crosshair').setAttribute('opacity','0');$('#chart-focus').setAttribute('opacity','0');$('#chart-tooltip').textContent='Move over the chart to inspect a date'};
svg.onkeydown=e=>{if(!['ArrowRight','ArrowLeft'].includes(e.key))return;e.preventDefault();let at=Number(svg.dataset.cursor||0);at=Math.max(0,Math.min(pts.length-1,at+(e.key==='ArrowRight'?1:-1)));svg.dataset.cursor=at;const p=pts[at];$('#chart-crosshair').setAttribute('x1',p.x);$('#chart-crosshair').setAttribute('x2',p.x);$('#chart-crosshair').setAttribute('opacity','1');$('#chart-focus').setAttribute('cx',p.x);$('#chart-focus').setAttribute('cy',p.y);$('#chart-focus').setAttribute('opacity','1');$('#chart-tooltip').textContent=`${p.date}  ·  ${number(p.value)} USD`};
}
async function load(){if(loading)return;loading=true;$('#fx-refresh').disabled=true;$('#fx-error').hidden=true;setStatus('Fetching the latest published reference rates…');
const start=new Date(Date.now()-200*86400000).toISOString().slice(0,10);
const results=await Promise.allSettled([request(`${API}latest?base=EUR&symbols=USD,GBP,CHF`),request(`${API}${start}..?base=EUR&symbols=USD`)]);
let issues=[];stale=false;
if(results[0].status==='fulfilled'){try{latest=parseLatest(results[0].value);safeStore.set('bz-fx-latest-v23',latest)}catch(e){issues.push('Latest rates: '+e.message)}}else issues.push('Latest rates unavailable');
if(results[1].status==='fulfilled'){try{series=parseHistory(results[1].value);safeStore.set('bz-fx-series-v23',series)}catch(e){issues.push('History: '+e.message)}}else issues.push('Historical rates unavailable');
if(!latest){latest=safeStore.get('bz-fx-latest-v23');if(latest)stale=true}
if(!series.length){series=safeStore.get('bz-fx-series-v23')||[];if(series.length)stale=true}
if(latest){renderRates();setStatus(`${stale?'Showing saved data':'Reference data'} · ${latest.date}${stale?' · may be outdated':''}`,stale)}else{setStatus('Unable to load rates — retry or visit source',true)}
if(series.length)chart();else $('#chart-subtitle').textContent='Historical data unavailable';
if(issues.length){$('#fx-error').hidden=false;$('#fx-error').textContent=issues.join(' · ')+(stale?' · Displaying previously saved data.':' · No rates are invented. Check the source or retry.')}
$('#fx-refresh').disabled=false;loading=false;}
$('#fx-refresh').addEventListener('click',load);
$$('[data-days]').forEach(b=>b.addEventListener('click',()=>{days=+b.dataset.days;$$('[data-days]').forEach(el=>el.classList.toggle('active',el===b));chart()}));
$('#fx-converter').addEventListener('input',calculate);$('#fx-converter').addEventListener('change',calculate);
$('#fx-swap').addEventListener('click',()=>{const a=$('#fx-from').value;$('#fx-from').value=$('#fx-to').value;$('#fx-to').value=a;calculate()});
$('#fx-export').addEventListener('click',()=>{if(!series.length)return;const entries=series.slice(-days);const csv='Date,EUR_USD\n'+entries.map(([date,val])=>`${date},${val}`).join('\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`EUR_USD_reference_${entries[0][0]}_${entries.at(-1)[0]}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
load();
})();