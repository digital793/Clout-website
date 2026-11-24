document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.querySelector(".custom-cursor");
  const cursorText = document.querySelector(".cursor-text");
  let mouseX = 0;
  let mouseY = 0;
  // FOLLOW CURSOR WITH OFFSET
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX + 22;
    mouseY = e.clientY + 2;
    cursor.style.left = mouseX + "px";
    cursor.style.top = mouseY + "px";
  });
  // HOVER ELEMENTS
  const hoverItems = document.querySelectorAll("[cursor-text]");
  hoverItems.forEach(item => {
    item.addEventListener("mouseenter", () => {
      cursor.classList.add("active");
      const text = item.getAttribute("cursor-text");
      cursorText.textContent = text;
    });
    item.addEventListener("mouseleave", () => {
      cursor.classList.remove("active");
      cursorText.textContent = "";
    });
  });
  // HERO HIDE ONLY DOT
  const hero = document.querySelector(".hero-section_new");
  if(hero){
    hero.addEventListener("mouseenter", () => {
      cursor.style.opacity = "0";
    });
    hero.addEventListener("mouseleave", () => {
      cursor.style.opacity = "1";
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const counters = document.querySelectorAll('[data-target]');
  const animateCounter = function(el) {
    const target = +el.getAttribute('data-target');
    const suffix = el.getAttribute('data-suffix') || '';
    const steps = 2000 / 20;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(function() {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current) + suffix;
    }, 20);
  };
  const counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) { animateCounter(entry.target); counterObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach(function(c) { counterObserver.observe(c); });
});

document.addEventListener("DOMContentLoaded", function () {
  const items = document.querySelectorAll('[data-value]');
  const inputField = document.querySelector('input[name="Interested in"]');
  const label = document.querySelector('.dropdown-label');
  const dropdown = document.querySelector('.w-dropdown');
  items.forEach(item => {
    item.style.cursor = "pointer";
    item.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const value = this.getAttribute('data-value');
      if (label) label.textContent = value;
      if (inputField) inputField.value = value;
      setTimeout(() => {
        if (dropdown) {
          const toggle = dropdown.querySelector('.w-dropdown-toggle');
          const list = dropdown.querySelector('.w-dropdown-list');
          dropdown.classList.remove('w--open');
          if (toggle) { toggle.classList.remove('w--open'); toggle.setAttribute('aria-expanded', 'false'); }
          if (list) list.classList.remove('w--open');
        }
      }, 100);
    });
  });
});

document.addEventListener("DOMContentLoaded", function() {
  const btn = document.querySelector('.Button_Class_contact');
  const form = document.querySelector('wf-form-Email-form');
  if (btn && form) {
    btn.addEventListener('click', function(e) { e.preventDefault(); form.submit(); });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  /* ==========================================
     1. COUNTER ANIMATION
  ========================================== */
  const counters = document.querySelectorAll('[data-target]');
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target')) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const interval = 20;
    const steps = duration / interval;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(function () {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current) + suffix;
    }, interval);
  }
  const counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5
  });
  counters.forEach(function (counter) {
    counterObserver.observe(counter);
  });
  /* ==========================================
     2. TAB + DROPDOWN SWITCHING
  ========================================== */
  const tabs = document.querySelectorAll('.tab-item');
  const grids = document.querySelectorAll('.team-grid');
  const dropdownLinks = document.querySelectorAll('.w-dropdown-list a');
  function switchTeam(target) {
    // Desktop tabs active state
    tabs.forEach(function (tab) {
      if (tab.getAttribute('data-tab') === target) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    // Team grid switching
    grids.forEach(function (grid) {
      if (grid.getAttribute('data-grid') === target) {
        grid.classList.remove('hidden');
      } else {
        grid.classList.add('hidden');
      }
    });
  }
  // Desktop Tabs
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const target = tab.getAttribute('data-tab');
      if (target) {
        switchTeam(target);
      }
    });
  });
  /* ==========================================
     MOBILE DROPDOWN
  ========================================== */
  dropdownLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const target = link.getAttribute('data-tab');
      if (!target) return;
      // Switch Team Grid
      switchTeam(target);
      // Update Dropdown Selected Text
      const dropdownText = document.querySelector('.dropdown-selected-text');
      if (dropdownText) {
        dropdownText.textContent = link.textContent.trim();
      }
      // Close dropdown properly
      const dropdown = link.closest('.w-dropdown');
      if (dropdown) {
        const toggle = dropdown.querySelector('.w-dropdown-toggle');
        if (toggle) {
          toggle.click();
        }
      }
    });
  });
  /* ==========================================
     3. TILT + SHEEN EFFECT
  ========================================== */
  const cards = document.querySelectorAll('.flip-card');
  cards.forEach(function (card) {
    const tiltWrapper = card.querySelector('.tilt-wrapper');
    if (!tiltWrapper) return;
    const faces = card.querySelectorAll(
      '.flip-card-front, .flip-card-back'
    );
    // Mouse Move Tilt
    card.addEventListener('mousemove', function (e) {
      if (window.innerWidth <= 768) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      const rotX = -(y - midY) / 20;
      const rotY = (x - midX) / 20;
      tiltWrapper.style.transform = `
        rotateX(${rotX}deg)
        rotateY(${rotY}deg)
        translate(
          ${(x - midX) / 25}px,
          ${(y - midY) / 25}px
        )
      `;
      // Sheen variables
      faces.forEach(function (face) {
        face.style.setProperty('--mx', x + 'px');
        face.style.setProperty('--my', y + 'px');
      });
    });
    // Reset Tilt
    card.addEventListener('mouseleave', function () {
      tiltWrapper.style.transform =
        'rotateX(0deg) rotateY(0deg) translate(0px, 0px)';
    });
    // Mobile Flip
    card.addEventListener('click', function () {
      if (window.innerWidth <= 768) {
        const inner = card.querySelector('.flip-card-inner');
        if (inner) {
          inner.classList.toggle('flipped');
        }
      }
    });
  });
});

const CW=265;
const CH=290;
const SW=165;
const SH=205;
let cur=0;
let busy=false;
const stage=document.querySelector('.ts-stage');
const cards=[...document.querySelectorAll('.ts-card')];
const outer=document.querySelector('.testimonial-outer');
const prevBtn=document.querySelector('.prev-btn');
const nextBtn=document.querySelector('.next-btn');
/* CREATE INFO + DOTS AUTOMATICALLY */
const infoRow=document.createElement('div');
infoRow.className='ts-info-row';
const dotsEl=document.createElement('div');
dotsEl.className='ts-dots';
outer.after(infoRow);
infoRow.after(dotsEl);
/* POSITION */
function getPos(rel,W){
    const cx=W/2;
    if(rel===0){
        return{
            left:cx-CW/2,
            w:CW,
            h:CH,
            op:1,
            zi:10,
            fi:'brightness(1)'
        };
    }
    if(rel===-1){
        return{
            left:cx-CW/2-SW-18,
            w:SW,
            h:SH,
            op:.78,
            zi:5,
            fi:'brightness(.45)'
        };
    }
    if(rel===1){
        return{
            left:cx+CW/2+18,
            w:SW,
            h:SH,
            op:.78,
            zi:5,
            fi:'brightness(.45)'
        };
    }
    if(rel<=-2){
        return{
            left:-SW-50,
            w:SW,
            h:SH,
            op:0,
            zi:1,
            fi:'brightness(.2)'
        };
    }
    return{
        left:W+50,
        w:SW,
        h:SH,
        op:0,
        zi:1,
        fi:'brightness(.2)'
    };
}
/* INFO FROM CUSTOM ATTRIBUTES */
function buildInfo(){
    infoRow.innerHTML='';
    cards.forEach((card,i)=>{
        const quote=card.dataset.quote || '';
        const name=card.dataset.name || '';
        const role=card.dataset.role || '';
        const slide=document.createElement('div');
        slide.className='ts-info-slide';
        slide.id='info-'+i;
        slide.innerHTML=`
            <p class="ts-quote">${quote}</p>
            <p class="ts-name">${name}</p>
            <p class="ts-role">${role}</p>
        `;
        infoRow.appendChild(slide);
    });
}
/* INFO ANIMATION */
function positionInfo(){
    cards.forEach((_,i)=>{
        const slide=document.getElementById('info-'+i);
        let rel=((i-cur+cards.length)%cards.length);
        if(rel>cards.length/2){
            rel-=cards.length;
        }
        slide.style.transform=
        `translateX(${rel*110}%)`;
        slide.style.opacity=
        rel===0?1:0;
    });
}
/* DOTS AUTO */
function renderDots(){
    dotsEl.innerHTML='';
    cards.forEach((_,i)=>{
        const dot=document.createElement('div');
        dot.className=
        'dot'+(i===cur?' active':'');
        dot.onclick=()=>{
            if(!busy){
                goTo(i);
            }
        };
        dotsEl.appendChild(dot);
    });
}
/* MAIN RENDER */
function render(){
    const W=stage.offsetWidth;
    cards.forEach((card,i)=>{
        let rel=((i-cur+cards.length)%cards.length);
        if(rel>cards.length/2){
            rel-=cards.length;
        }
        const p=getPos(rel,W);
        card.style.left=p.left+'px';
        card.style.width=p.w+'px';
        card.style.height=p.h+'px';
        card.style.opacity=p.op;
        card.style.zIndex=p.zi;
        card.style.filter=p.fi;
        card.classList.toggle('active',rel===0);
        if(Math.abs(rel)===1){
    // side cards move slider
    card.style.cursor='pointer';
    card.onclick=()=>{
        if(!busy){
            goTo(i);
        }
    };
}
else if(rel===0){
    // center card opens popup
    card.style.cursor='pointer';
    card.onclick=()=>{
        const popup =
        card.querySelector('.ts-popup');
        if(popup){
            popup.classList.add('active');
        }
    };
}
else{
    card.onclick=null;
    card.style.cursor='default';
}
    });
    positionInfo();
    renderDots();
}
function goTo(i){
    if(busy||i===cur)return;
    busy=true;
    cur=
    ((i%cards.length)+cards.length)
    %cards.length;
    render();
    setTimeout(()=>{
        busy=false;
    },650);
}
/* ARROWS */
prevBtn?.addEventListener('click',()=>{
    if(!busy){
        goTo(cur-1);
    }
});
nextBtn?.addEventListener('click',()=>{
    if(!busy){
        goTo(cur+1);
    }
});
/* RESIZE */
window.addEventListener('resize',render);
/* START */
buildInfo();
render();

document.addEventListener("DOMContentLoaded", function () {
  const playBtns = document.querySelectorAll(".play-btn");
  const popups = document.querySelectorAll(".ts-popup");
  playBtns.forEach(function(btn){
    btn.addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      const card = btn.closest(".ts-card");
      if(!card) return;
      const popupId = card.getAttribute("data-popup");
      if(!popupId) return;
      const popup = document.getElementById(popupId);
      if(!popup) return;
      popup.classList.add("active");
      document.body.style.overflow = "hidden";
      const video = popup.querySelector("video");
      if(video){
        video.currentTime = 0;
        video.play();
      }
    });
  });
  popups.forEach(function(popup){
    const closeBtn = popup.querySelector(".close-btn");
    const bg = popup.querySelector(".ts-popup-bg");
    function closePopup(){
      popup.classList.remove("active");
      document.body.style.overflow = "";
      const video = popup.querySelector("video");
      if(video){
        video.pause();
        video.currentTime = 0;
      }
    }
    closeBtn?.addEventListener("click", closePopup);
    bg?.addEventListener("click", closePopup);
  });
});

/* ─────────────────────────────────────────────
   BUILD TAPE SCROLLS
   Each .tape-chunk IS the yellow band — background,
   perforated dots AND text are all inside it.
   When translateX fires, EVERYTHING moves: yellow,
   dots, text — the whole tape as one piece.
───────────────────────────────────────────── */
function buildScroll(id) {
  const el = document.getElementById(id);
  const unit = () =>
    `<span class="tape-unit"><span class="dot"></span>WARNING<span class="dot"></span>No Boring Stuff Beyond This Point</span>`;
  // One chunk: 26 units wide (~26×340px ≈ 8840px, safely > 320vw)
  let chunk = `<span class="tape-chunk">`;
  for (let i = 0; i < 26; i++) chunk += unit();
  chunk += `</span>`;
  // Double it — second copy starts exactly where first ends → seamless loop
  el.innerHTML = chunk + chunk;
}
buildScroll('scroll1');
buildScroll('scroll2');
/* ─────────────────────────────────────────────
   GEN-Z ANIMATED FIRE CANVAS MASK
───────────────────────────────────────────── */
document.fonts.ready.then(() => {
  const canvas = document.getElementById('genzCanvas');
  const ctx    = canvas.getContext('2d');
  const fsPx = Math.min(110, Math.max(56, window.innerWidth * 0.075));
  const font = `900 ${fsPx}px 'Outfit', sans-serif`;
  ctx.font = font;
  const met = ctx.measureText('GEN-Z');
  const W = Math.ceil(met.width) + 8;
  const H = Math.ceil(fsPx * 1.42);
  canvas.width = W; canvas.height = H;
  const off = document.createElement('canvas');
  off.width = W; off.height = H;
  const oc = off.getContext('2d');
  let t = 0;
  const lerp = (a, b, f) => a + (b - a) * f;
  function drawFire() {
    t += 0.028;
    oc.clearRect(0, 0, W, H);
    const p1 = (Math.sin(t * 1.2) + 1) / 2;
    const p2 = (Math.sin(t * 2.0 + 1.0) + 1) / 2;
    const p3 = (Math.sin(t * 0.8 + 2.5) + 1) / 2;
    const gx = oc.createLinearGradient(
      Math.sin(t * 0.4) * W * 0.25, 0,
      W + Math.cos(t * 0.35) * W * 0.2, H
    );
    gx.addColorStop(0,    `hsl(${lerp(8,  22, p1)}, 100%, ${lerp(46,54,p2)}%)`);
    gx.addColorStop(0.3,  `hsl(${lerp(18, 32, p2)}, 100%, 50%)`);
    gx.addColorStop(0.55, `hsl(${lerp(28, 44, p3)}, 100%, 52%)`);
    gx.addColorStop(0.8,  `hsl(${lerp(38, 50, p1)}, 100%, 54%)`);
    gx.addColorStop(1,    `hsl(${lerp(44, 56, p2)}, 100%, 58%)`);
    oc.fillStyle = gx;
    oc.fillRect(0, 0, W, H);
    const sx = ((t * 0.38) % 1.6 - 0.3) * W;
    const sh = oc.createLinearGradient(sx - 35, 0, sx + 35, 0);
    sh.addColorStop(0,   'rgba(255,230,0,0)');
    sh.addColorStop(0.5, 'rgba(255,240,80,0.3)');
    sh.addColorStop(1,   'rgba(255,230,0,0)');
    oc.fillStyle = sh;
    oc.fillRect(0, 0, W, H);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(off, 0, 0);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.font = font;
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'top';
    ctx.fillText('GEN-Z', 4, (H - fsPx * 1.05) / 2);
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(drawFire);
  }
  drawFire();
});