window.addEventListener("load", () => {
  gsap.utils.toArray(".tab-wrapper").forEach(wrapper => {
    const tab = wrapper.querySelector(".tab");
    const bar = wrapper.querySelector(".progress");
    const section = document.querySelector(tab.getAttribute("href"));
    gsap.fromTo(bar, 
      { width: "0%" },
      {
        width: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top center",
          end: "bottom center",
          scrub: true, // 🔥 THIS makes it smooth
          onLeave: () => gsap.set(bar, { width: "0%" }),
          onEnterBack: () => gsap.set(bar, { width: "0%" })
        }
      }
    );
  });
});

(function(){
const sec = document.getElementById('clout-sec');
const r1 = document.getElementById('r1');
const r2 = document.getElementById('r2');
const pf = document.getElementById('pf');
const cursor = document.getElementById('cc');
let t1=0,c1=0,t2=0,c2=0;
let half1=r1.scrollWidth/2;
let half2=r2.scrollWidth/2;
let budget=0;
/* ✅ AUTO SCROLL CONFIG */
let isInteracting = false;
let idleTimer = null;
const IDLE_DELAY = 500; // time before autoplay starts
const AUTO_SPEED = 0.4; // autoplay speed
function startIdleTimer(){
  clearTimeout(idleTimer);
  idleTimer = setTimeout(()=>{
    isInteracting = false;
  }, IDLE_DELAY);
}
function handleInteraction(){
  isInteracting = true;
  startIdleTimer();
}
/* RESIZE */
function resize(){
  half1 = r1.scrollWidth/2;
  half2 = r2.scrollWidth/2;
}
window.addEventListener('resize', resize);
/* DESKTOP SCROLL */
sec.addEventListener('wheel', e=>{
  handleInteraction();
  const d = e.deltaY * 0.7;
  t1 += d;
  t2 += d * 0.6;
  budget += Math.abs(e.deltaY);
  pf.style.width = Math.min(100, budget/30) + '%';
});
/* MOBILE TOUCH */
let lastX = 0;
sec.addEventListener('touchstart', e=>{
  handleInteraction();
  lastX = e.touches[0].clientX;
});
sec.addEventListener('touchmove', e=>{
  handleInteraction();
  const x = e.touches[0].clientX;
  const dx = x - lastX;
  t1 -= dx;
  t2 -= dx * 0.6;
  lastX = x;
});
/* LOOP */
function loop(){
  /* ✅ AUTO CAROUSEL WHEN IDLE */
  if(!isInteracting){
    t1 += AUTO_SPEED;
    t2 += AUTO_SPEED * 0.6;
  }
  c1 += (t1 - c1) * 0.08;
  c2 += (t2 - c2) * 0.08;
  if(c1 >= half1){ c1 -= half1; t1 -= half1; }
  if(c1 < 0){ c1 += half1; t1 += half1; }
  if(c2 >= half2){ c2 -= half2; t2 -= half2; }
  if(c2 < 0){ c2 += half2; t2 += half2; }
  r1.style.transform = `translateX(${-c1}px)`;
  r2.style.transform = `translateX(${-c2}px)`;
  requestAnimationFrame(loop);
}
loop();
/* CURSOR */
sec.addEventListener('mousemove', e=>{
  handleInteraction();
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  cursor.style.opacity = 1;
});
sec.addEventListener('mouseleave', ()=>{
  cursor.style.opacity = 0;
});
/* INIT */
startIdleTimer();
})();