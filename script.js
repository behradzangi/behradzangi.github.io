// Lightweight interactions: no frameworks or analytics.
const menuButton=document.querySelector('.menu-toggle');
const mobileMenu=document.querySelector('.mobile-menu');
function closeMenu(){menuButton?.setAttribute('aria-expanded','false');menuButton?.setAttribute('aria-label','Open menu');if(mobileMenu)mobileMenu.hidden=true;document.body.classList.remove('menu-open')}
menuButton?.addEventListener('click',()=>{const opening=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(opening));menuButton.setAttribute('aria-label',opening?'Close menu':'Open menu');mobileMenu.hidden=!opening;document.body.classList.toggle('menu-open',opening);if(opening)mobileMenu.querySelector('a')?.focus()});
mobileMenu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
window.addEventListener('keydown',e=>{if(e.key==='Escape'){const expanded=menuButton?.getAttribute('aria-expanded')==='true';closeMenu();if(expanded)menuButton?.focus()}});
window.addEventListener('resize',()=>{if(window.innerWidth>900)closeMenu()});
const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if('IntersectionObserver' in window && !reduceMotion){const observer=new IntersectionObserver((entries)=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}},{threshold:.06,rootMargin:'0px 0px -20px 0px'});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el))}else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'))}
const header=document.querySelector('.site-header');const progress=document.querySelector('.scroll-progress');const backToTop=document.querySelector('.back-to-top');
let scrollRequested=false;
function updateScroll(){const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);const y=window.scrollY;header?.classList.toggle('is-scrolled',y>42);backToTop?.classList.toggle('show',y>650);if(progress)progress.style.transform=`scaleX(${Math.min(1,y/max)})`;scrollRequested=false}
window.addEventListener('scroll',()=>{if(!scrollRequested){requestAnimationFrame(updateScroll);scrollRequested=true}},{passive:true});updateScroll();
if('IntersectionObserver' in window){const links=[...document.querySelectorAll('.desktop-nav a')];const sections=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);const activeObserver=new IntersectionObserver(entries=>{const seen=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);if(!seen.length)return;const id='#'+seen[0].target.id;links.forEach(a=>{if(a.getAttribute('href')===id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})},{rootMargin:'-20% 0px -57% 0px',threshold:0});sections.forEach(section=>activeObserver.observe(section))}

// Close the mobile menu when the pointer moves outside the header.
document.addEventListener('pointerdown',event=>{if(menuButton?.getAttribute('aria-expanded')==='true'&&!event.target.closest('.site-header'))closeMenu()});
// Keep keyboard focus inside the mobile navigation while expanded.
document.addEventListener('keydown',event=>{if(event.key!=='Tab'||menuButton?.getAttribute('aria-expanded')!=='true'||!mobileMenu)return;const items=[menuButton,...mobileMenu.querySelectorAll('a')];const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}});
