/* =====================================================================
   SERVICES CUBE – behaviour  (homepage "Our Services")
   ---------------------------------------------------------------------
   • The page's scroll position is the single source of truth: the cube
     angle is computed from it every frame, so the cube can never drift
     out of step with the page.
   • Each service has a "hold zone": the cube rests on a face for part of
     its scroll distance and turns over a short eased stretch in between.
     No snap timers, so slow mouse-wheel scrolling no longer rolls back.
   • A critically-damped spring smooths the motion on top of that.
   • Click-drag (desktop) / sideways swipe (mobile) turns the cube; on
     release the page scrolls to that service's position, so drag and
     scroll stay consistent.
   • Videos only play on the face that is in front.
   • Respects prefers-reduced-motion (instant turns).
   ===================================================================== */
(() => {
  'use strict';
  document.documentElement.classList.remove('svc-no-js');

  const mod   = (a, n) => ((a % n) + n) % n;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const pad2  = n => String(n).padStart(2, '0');
  const VIDEO = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i;
  const h = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };

  /* fraction of each step spent holding on a face (split before/after the turn) */
  const HOLD = 0.4;
  /* smootherstep: zero velocity and acceleration at both ends */
  const ease = t => t * t * t * (t * (t * 6 - 15) + 10);

  class ServicesCube {
    constructor(root) {
      this.root   = root;
      this.pin    = root.querySelector('.svc__pin');
      this.stage  = root.querySelector('.svc__stage');
      this.srcEl  = root.querySelector('.svc__src');
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)');
      this.mobile  = matchMedia('(max-width: 767px)');   // stacked layout
      this.opts = {
        smooth: +root.dataset.smooth || 0.35,
        drag:   root.dataset.drag !== 'false'
      };

      const data = this.readItems();
      this.count = data.length;                       // real number of services
      if (!this.count) return;
      let list = data.slice();
      while (list.length < 4) list = list.concat(data); // need ≥ 4 entries for the 4 faces
      this.entries = list.map(d => this.makeEntry(d));
      this.N = this.entries.length;

      root.style.setProperty('--svc-n', this.count);
      this.build();

      this.vel = 0;
      this.running = false; this.dragging = false; this.syncTo = null;
      this.slotItem = [-1, -1, -1, -1];
      this.measure();
      this.pos = this.target = this.scrollTarget();
      this.render();
      this.bind();
      root.__svc = this;
    }

    /* ---------- data ---------- */
    readItems() {
      return [...this.srcEl.children].map((li, i) => {
        const src = li.dataset.mediaSrc || '';
        return {
          index: i,
          title:   (li.querySelector('h3')?.textContent || '').trim(),
          tagline: (li.querySelector('p')?.textContent  || '').trim(),
          tags:    [...li.querySelectorAll('ul > li')].map(t => t.textContent.trim()),
          media: {
            src,
            type:   li.dataset.mediaType || (VIDEO.test(src) ? 'video' : 'image'),
            poster: li.dataset.mediaPoster || '',
            alt:    li.dataset.mediaAlt || ''
          }
        };
      });
    }

    makeEntry(d) {
      const card = h('div', 'card');
      const num = h('span', 'card__num');   num.textContent = pad2(d.index + 1);
      const ttl = h('h3', 'card__title');   ttl.textContent = d.title;
      ttl.style.setProperty('--len', Math.max(12, d.title.length));
      const tag = h('p',  'card__tag');     tag.textContent = d.tagline;
      const ul  = h('ul', 'card__list');
      d.tags.slice(0, 4).forEach(t => { const li = h('li'); li.textContent = t; ul.append(li); });
      card.append(num, ttl, tag, ul);

      const media = h('div', 'media');
      let video = null;
      if (!d.media.src) {
        media.classList.add('is-empty');
      } else if (d.media.type === 'video') {
        video = document.createElement('video');
        video.muted = video.defaultMuted = true;
        video.loop = true; video.playsInline = true; video.disablePictureInPicture = true;
        video.preload = 'metadata';
        video.setAttribute('muted', ''); video.setAttribute('playsinline', ''); video.setAttribute('aria-hidden', 'true');
        if (d.media.poster) video.poster = d.media.poster;
        video.src = d.media.src;
        media.append(video);
      } else {
        const img = new Image();
        img.alt = d.media.alt; img.decoding = 'async'; img.draggable = false; img.src = d.media.src;
        media.append(img);
      }
      return { card, media, video, active: false, data: d };
    }

    /* ---------- DOM ---------- */
    build() {
      const make = side => {
        const cube = h('div', `cube cube--${side}`);
        const fix = h('div', 'cube__fix'), rig = h('div', 'cube__rig');
        const faces = [0, 1, 2, 3].map(k => {
          const el = h('div', 'face'); el.style.setProperty('--k', k);
          const shade = h('i', 'face__shade');
          el.append(shade); rig.append(el);
          return { el, shade };
        });
        fix.append(rig); cube.append(fix);
        return { cube, rig, faces };
      };
      this.L = make('l'); this.R = make('r');
      this.stage.replaceChildren(this.L.cube, this.R.cube);
    }

    assign(slot, idx) {
      const e = this.entries[idx];
      this.slotItem[slot] = idx;
      const L = this.L.faces[slot], R = this.R.faces[slot];
      L.el.replaceChildren(e.card,  L.shade);
      R.el.replaceChildren(e.media, R.shade);
    }

    /* ---------- rendering ---------- */
    render() {
      const a = this.pos * 90;
      /* desktop: roll up / down (X axis) · mobile: swing sideways (Y axis) */
      const ax = this.mobile.matches ? 'Y' : 'X', sg = ax === 'Y' ? -1 : 1;
      this.L.rig.style.transform = `rotate${ax}(${(a * sg).toFixed(3)}deg)`;
      this.R.rig.style.transform = `rotate${ax}(${(-a * sg).toFixed(3)}deg)`;
      for (let slot = 0; slot < 4; slot++) {
        const s   = slot + 4 * Math.round((this.pos - slot) / 4); // the step this face currently stands for
        const idx = mod(s, this.N);
        if (this.slotItem[slot] !== idx) this.assign(slot, idx);
        const d = s - this.pos;
        const shade = (Math.min(1, Math.abs(d)) * 0.5).toFixed(3);
        this.L.faces[slot].shade.style.opacity = shade;
        this.R.faces[slot].shade.style.opacity = shade;

        const e = this.entries[idx], act = Math.abs(d) < 0.7;
        if (e.video && e.active !== act) {
          e.active = act;
          if (act) { const p = e.video.play(); if (p && p.catch) p.catch(() => {}); }
          else e.video.pause();
        }
      }
    }

    /* critically-damped spring toward `target` → smooth start & stop */
    frame = now => {
      const dt = Math.min(0.05, (now - this.last) / 1000 || 0.016);
      this.last = now;
      const st = this.reduced.matches ? 0.001 : (this.dragging ? 0.08 : this.opts.smooth);
      const om = 2 / st, x = om * dt, ex = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
      const ch = this.pos - this.target, tmp = (this.vel + om * ch) * dt;
      this.vel = (this.vel - om * tmp) * ex;
      this.pos = this.target + (ch + tmp) * ex;
      if (Math.abs(this.pos - this.target) < 5e-4 && Math.abs(this.vel) < 5e-4) {
        this.pos = this.target; this.vel = 0; this.running = false;
      }
      this.render();
      if (this.running) requestAnimationFrame(this.frame);
    };
    kick() {
      if (this.running) return;
      this.running = true; this.last = performance.now();
      requestAnimationFrame(this.frame);
    }

    /* ---------- scroll → cube position ---------- */
    measure() {
      this.total  = Math.max(1, this.root.offsetHeight - this.pin.offsetHeight);
      this.stepPx = this.total / Math.max(1, this.count - 1);
    }
    scrollFloat() {
      return clamp(-this.root.getBoundingClientRect().top, 0, this.total) / this.stepPx;
    }
    /* raw progress s (0 … count-1) → cube position with hold zones */
    mapScroll(s) {
      const i = Math.floor(s), f = s - i;
      const half = HOLD / 2;
      return i + ease(clamp((f - half) / (1 - HOLD), 0, 1));
    }
    scrollTarget() { return this.mapScroll(this.scrollFloat()); }

    onScroll = () => {
      if (this.ticking) return;
      this.ticking = true;
      requestAnimationFrame(() => {
        this.ticking = false;
        if (this.dragging) return;
        const t = this.scrollTarget();
        if (this.syncTo !== null) {                 // page is scrolling to where a drag ended
          if (Math.abs(t - this.syncTo) > 0.01 && performance.now() < this.syncUntil) return;
          this.syncTo = null;
        }
        if (t !== this.target) { this.target = t; this.kick(); }
      });
    };

    /* absolute page Y at which service k is centred in its hold zone */
    scrollYFor(k) {
      const top = this.root.getBoundingClientRect().top + window.scrollY;
      return top + k * this.stepPx;
    }

    /* ---------- click / drag to rotate ---------- */
    bindDrag() {
      const st = this.stage;
      let id = null, x0 = 0, y0 = 0, t0 = 0, moved = false, dir = 1;
      st.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        if (e.pointerType !== 'mouse' && !this.mobile.matches) return;  // touch swipe only in the stacked layout
        id = e.pointerId; x0 = e.clientX; y0 = e.clientY; t0 = this.target; moved = false;
      });
      st.addEventListener('pointermove', e => {
        if (e.pointerId !== id) return;
        const mob = this.mobile.matches;
        const dx = e.clientX - x0, dy = e.clientY - y0;
        if (!moved) {
          const along = Math.abs(mob ? dx : dy), across = Math.abs(mob ? dy : dx);
          if (along < 6 || along < across) return;
          moved = true; this.dragging = true; this.syncTo = null; st.classList.add('is-dragging');
          try { st.setPointerCapture(id); } catch (_) {}
        }
        const size = (mob ? this.L.cube.offsetWidth : this.L.cube.offsetHeight) * 0.8;
        const nt = clamp(t0 + (mob ? -dx : -dy) / size, -0.35, this.count - 1 + 0.35); // drag up / left = next
        if (nt !== this.target) dir = nt > this.target ? 1 : -1;
        this.target = nt; this.kick();
      });
      const end = e => {
        if (e.pointerId !== id) return;
        id = null;
        if (!moved) return;
        this.dragging = false; st.classList.remove('is-dragging');
        const k = clamp(dir > 0 ? Math.ceil(this.target - 0.2) : Math.floor(this.target + 0.2), 0, this.count - 1);
        this.target = k; this.kick();
        /* move the page to service k so scroll and cube agree */
        this.syncTo = k; this.syncUntil = performance.now() + 1500;
        window.scrollTo({ top: this.scrollYFor(k), behavior: this.reduced.matches ? 'auto' : 'smooth' });
      };
      st.addEventListener('pointerup', end);
      st.addEventListener('pointercancel', end);
      st.addEventListener('dragstart', e => e.preventDefault());
    }

    bind() {
      addEventListener('scroll', this.onScroll, { passive: true });
      new ResizeObserver(() => { this.measure(); this.onScroll(); }).observe(this.root);
      this.mobile.addEventListener?.('change', () => { this.measure(); this.render(); });
      if (this.opts.drag) this.bindDrag();
    }
  }

  window.ServicesCube = ServicesCube;
  document.querySelectorAll('[data-services-cube]').forEach(el => new ServicesCube(el));
})();
