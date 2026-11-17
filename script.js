(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const menu=$('.menu-toggle'),nav=$('#nav'),header=$('.site-header'),progress=$('.scroll-progress');
menu?.addEventListener('click',()=>{const isOpen=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(isOpen))});
$$('a',nav).forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false')}));
$('#year').textContent=String(new Date().getFullYear());
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const typed=$('#typewriter'),words=['Economic Analysis','Business Consulting','International Trade','Automotive Business'];
if(!reduced&&typed){let wi=0,i=words[0].length,back=false,handle;function type(){const word=words[wi];typed.textContent=word.slice(0,i);let delay=back?45:85;if(!back&&i===word.length){back=true;delay=1850}else if(back&&i===0){back=false;wi=(wi+1)%words.length;delay=320}else i+=back?-1:1;handle=setTimeout(type,delay)}handle=setTimeout(type,1800);window.addEventListener('pagehide',()=>clearTimeout(handle),{once:true})}
// Small shared scroll loop: progress, active section and the career timeline.
let scrollScheduled=false;function onScroll(){if(scrollScheduled)return;scrollScheduled=true;requestAnimationFrame(()=>{scrollScheduled=false;const y=window.scrollY,doc=document.documentElement,max=Math.max(1,doc.scrollHeight-innerHeight);if(progress)progress.style.transform=`scaleX(${Math.min(1,y/max)})`;header?.classList.toggle('is-scrolled',y>22);const career=$('.experience-list');if(career){const rect=career.getBoundingClientRect();const p=Math.max(0,Math.min(1,(innerHeight*.75-rect.top)/(rect.height+innerHeight*.3)));career.style.setProperty('--timeline-progress',p.toFixed(3))}})}
window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll,{passive:true});onScroll();
if(reduced)return;
// Reveal content in natural document order; controls remain keyboard accessible.
const targets=$$('.section-head,.about-layout>*,.section-title-row>*,.experience-row,.expertise-item,.education-layout>*,.education-item,.thesis,.impact-band,.advisory-rows article,.advisory-link,.skills-columns>*,.insights-feature,.insight-topics>*,.insights-bottom,.contact-inner>*,.interests-strip');
if('IntersectionObserver' in window){document.documentElement.classList.add('motion-ready');targets.forEach((el,i)=>{el.classList.add('reveal');const siblings=el.parentElement?.children;const local=siblings?[...siblings].indexOf(el):0;el.style.setProperty('--stagger',Math.min(local,4)*85+'ms')});const io=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('in-view');io.unobserve(entry.target)}}},{threshold:.09,rootMargin:'0px 0px -28px 0px'});targets.forEach(el=>io.observe(el));window.addEventListener('pagehide',()=>io.disconnect(),{once:true})}
// Activate nav link while browsing content.
if('IntersectionObserver' in window){const links=$$('.nav a');const sectionIds=links.map(a=>a.getAttribute('href')).filter(h=>h?.startsWith('#'));const ni=new IntersectionObserver(entries=>{entries.filter(e=>e.isIntersecting).forEach(e=>links.forEach(a=>a.getAttribute('href')==='#'+e.target.id?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current')))},{rootMargin:'-30% 0px -60% 0px'});sectionIds.forEach(id=>{const el=$(id);if(el)ni.observe(el)})}
// Count up verified career metric once in viewport.
const metric=$('[data-count]');if(metric&&'IntersectionObserver' in window){const countIO=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)return;countIO.disconnect();const value=+metric.dataset.count,start=performance.now(),duration=1400;function count(now){const t=Math.min(1,(now-start)/duration),e=1-Math.pow(1-t,3);metric.innerHTML=Math.round(value*e).toLocaleString('en-US')+'<span>+</span>';if(t<1)requestAnimationFrame(count)}requestAnimationFrame(count)},{threshold:.4});countIO.observe(metric)}
// Pointer-responsive orbital depth: desktop only; never required for functionality.
const fine=matchMedia('(hover: hover) and (pointer: fine)').matches,art=$('.hero-art');if(fine&&art){let mx=0,my=0,ax=0,ay=0,raf=0;art.addEventListener('pointermove',e=>{const r=art.getBoundingClientRect();mx=(e.clientX-r.left-r.width/2)/r.width;my=(e.clientY-r.top-r.height/2)/r.height;if(!raf)raf=requestAnimationFrame(move)},{passive:true});function move(){raf=0;ax+=(mx-ax)*.18;ay+=(my-ay)*.18;art.style.setProperty('--mouse-x',(ax*30).toFixed(1)+'px');art.style.setProperty('--mouse-y',(ay*30).toFixed(1)+'px')}art.addEventListener('pointerleave',()=>{mx=my=0;if(!raf)raf=requestAnimationFrame(move)})}
// Keep 3D motion extremely subtle; omit on low-powered/mobile devices.
if(fine){$$('[data-tilt]').filter(el=>!el.classList.contains('hero-art')).forEach(el=>{let raf=0;el.addEventListener('pointermove',ev=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const r=el.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width-.5,y=(ev.clientY-r.top)/r.height-.5;el.style.setProperty('--tilt-x',(-y*1.3).toFixed(2)+'deg');el.style.setProperty('--tilt-y',(x*1.3).toFixed(2)+'deg')})},{passive:true});el.addEventListener('pointerleave',()=>{el.style.setProperty('--tilt-x','0deg');el.style.setProperty('--tilt-y','0deg')})})}
// V18: Perspective-projected 3D data field, without Three.js or external dependencies.
// The virtual camera responds to pointer movement; nodes live in 3D space.
const canvas=$('#particles'),ctx=canvas?.getContext('2d',{alpha:true});if(!ctx)return;
let width=0,height=0,dpr=1,nodes=[],edges=[],raf=0,active=true,last=0;
const pointer={x:.5,y:.5,tx:.5,ty:.5,inside:false,px:-1000,py:-1000};
const isSmall=matchMedia('(max-width: 720px)').matches;
const motionBudget=isSmall?44:105;
const depth=880,viewAngle=620;
function makeNodes(){
  nodes=Array.from({length:motionBudget},(_,i)=>({
    x:(Math.random()-.5)*width*1.7,
    y:(Math.random()-.5)*height*1.7,
    z:(Math.random()-.5)*depth,
    r:Math.random()*1.35+.65,
    phase:Math.random()*6.283,
    speed:.35+Math.random()*.65,
    layer:i%4
  }));
  // Precompute a sparse graph using proximity in 3D; avoids O(n²) each frame.
  edges=[];
  const near= isSmall?190:230;
  for(let i=0;i<nodes.length;i++){
    let neighbors=[];
    for(let j=i+1;j<nodes.length;j++){
      const a=nodes[i],b=nodes[j];
      const d=Math.hypot(a.x-b.x,a.y-b.y,(a.z-b.z)*.65);
      if(d<near)neighbors.push([j,d]);
    }
    neighbors.sort((a,b)=>a[1]-b[1]);
    neighbors.slice(0,3).forEach(([j])=>edges.push([i,j]));
  }
}
function resize(){
  const oldW=width,oldH=height;
  dpr=Math.min(devicePixelRatio||1,isSmall?1.3:1.65);
  width=Math.max(document.documentElement.clientWidth,320);
  height=Math.min(980,Math.max(680,innerHeight+130));
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  canvas.style.height=height+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  makeNodes();
}
function project(node,time){
  // Gentle layered field rotation plus cursor-driven camera yaw/pitch.
  const yaw=(pointer.x-.5)*.50+Math.sin(time*.00009)*.045;
  const pitch=(pointer.y-.5)*-.32+Math.cos(time*.00011)*.03;
  const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  let x=node.x*cy-node.z*sy;
  let z=node.x*sy+node.z*cy;
  const y=node.y*cp-z*sp;
  z=node.y*sp+z*cp;
  z+=Math.sin(time*.00024*node.speed+node.phase)*18;
  const perspective=viewAngle/(viewAngle+z+depth*.67);
  return {x:width*.50+x*perspective,y:height*.48+y*perspective,
    scale:perspective,alpha:Math.max(.12,Math.min(1,(perspective-.25)*1.6))};
}
function draw(time){
  if(!active){raf=0;return}
  // Throttle to ~45 FPS; preserve smooth movement while saving battery.
  raf=requestAnimationFrame(draw);
  if(time-last<21)return;
  last=time;
  pointer.x+=(pointer.tx-pointer.x)*.055;
  pointer.y+=(pointer.ty-pointer.y)*.055;
  ctx.clearRect(0,0,width,height);
  const projected=nodes.map(n=>project(n,time));
  // Subtle perspective reference grid (rendered as lines, not a large opaque overlay).
  const gx=(pointer.x-.5)*26,gy=(pointer.y-.5)*16;
  ctx.lineWidth=.65;
  for(let i=-6;i<=6;i++){
    const sx=width*.5+i*Math.max(width/13,70)+gx;
    ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx+(sx-width*.5)*.20,height);
    ctx.strokeStyle='rgba(61,139,218,.026)';ctx.stroke();
  }
  for(let i=0;i<10;i++){
    const yy=i*height/9+gy;
    ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(width,yy);
    ctx.strokeStyle='rgba(61,139,218,.023)';ctx.stroke();
  }
  for(const [i,j] of edges){
    const a=projected[i],b=projected[j];
    const alpha=Math.min(a.alpha,b.alpha)*.22;
    if(alpha<.02)continue;
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
    ctx.strokeStyle=`rgba(76,175,245,${alpha.toFixed(3)})`;
    ctx.lineWidth=Math.min(1.1,.65*(a.scale+b.scale));ctx.stroke();
  }
  for(let i=0;i<nodes.length;i++){
    const p=projected[i],n=nodes[i];
    const wave=.78+.22*Math.sin(time*.0012+n.phase);
    const radius=Math.max(.45,Math.min(3.5,n.r*p.scale*wave));
    const dx=p.x-pointer.px,dy=p.y-pointer.py;
    const near=pointer.inside&&dx*dx+dy*dy<155*155;
    const alpha=Math.min(1,p.alpha*(near?1:.72));
    if(near){
      ctx.beginPath();ctx.arc(p.x,p.y,radius*4.5,0,Math.PI*2);
      ctx.fillStyle=`rgba(61,175,248,${(alpha*.045).toFixed(3)})`;ctx.fill();
    }
    ctx.beginPath();ctx.arc(p.x,p.y,radius*(near?1.6:1),0,Math.PI*2);
    ctx.fillStyle=`rgba(${near?'163,228,255':'101,194,255'},${alpha.toFixed(3)})`;
    ctx.fill();
  }
  if(pointer.inside&&!isSmall){
    // Cursor energy halo: faint and kept below the content layer.
    const g=ctx.createRadialGradient(pointer.px,pointer.py,0,pointer.px,pointer.py,170);
    g.addColorStop(0,'rgba(61,157,240,.065)');g.addColorStop(1,'rgba(61,157,240,0)');
    ctx.fillStyle=g;ctx.fillRect(pointer.px-170,pointer.py-170,340,340);
  }
}
function start(){if(active&&!raf)raf=requestAnimationFrame(draw)}
function stop(){if(raf)cancelAnimationFrame(raf);raf=0}
resize();start();
if(fine){window.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch')return;
  const r=canvas.getBoundingClientRect();
  const inside=e.clientY>=r.top&&e.clientY<=r.bottom;
  pointer.inside=inside;
  pointer.tx=Math.max(0,Math.min(1,e.clientX/Math.max(width,1)));
  pointer.ty=Math.max(0,Math.min(1,(e.clientY-r.top)/Math.max(height,1)));
  pointer.px=e.clientX;pointer.py=e.clientY-r.top;
},{passive:true});
window.addEventListener('pointerleave',()=>{pointer.inside=false;pointer.tx=pointer.ty=.5});}
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{stop();resize();start()},200)},{passive:true});
document.addEventListener('visibilitychange',()=>{active=!document.hidden;if(active)start();else stop()});
if('IntersectionObserver' in window){
  const bgIO=new IntersectionObserver(entries=>{active=entries[0].isIntersecting&&!document.hidden;if(active)start();else stop()},{threshold:0});
  bgIO.observe($('.hero'));window.addEventListener('pagehide',()=>bgIO.disconnect(),{once:true});
}
})();
