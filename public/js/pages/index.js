window.addEventListener('load', function () {
  var newsletterEl = document.querySelector('.slider-main .splide');
  if (!newsletterEl) {
    console.warn('Splide element not found: .slider-main .splide');
    return;
  }
  if (typeof Splide === 'undefined') {
    console.error('Splide core library did not load.');
    return;
  }
  if (typeof splide === 'undefined' || !splide.Extensions || !splide.Extensions.AutoScroll) {
    console.error('AutoScroll extension did not load.');
    return;
  }
  var main = new Splide(newsletterEl, {
    type: 'loop',
    drag: 'free',
    perPage: 3,
    perMove: 1,
    gap: '1.5rem',
    arrows: false,
    pagination: false,
    /* The curved black waves above/below the strip grow with the screen
       width (~6.2vw each), so the slide height grows too (+12.5vw) to keep
       the visible part of each image tall on wide monitors. Keep in sync
       with .slider-main .splide__slide in /css/pages/index.css */
    height: 'max(500px, calc(400px + 12.5vw))',
    /* The images are square, so slides are square too (width = height):
       nothing gets cropped off the sides. perPage is ignored when
       fixedWidth is set; as many slides show as fit. */
    fixedWidth: 'max(500px, calc(400px + 12.5vw))',
    autoScroll: {
      speed: 1,
      pauseOnHover: true,
    },
    breakpoints: {
      992: {          // tablets
        perPage: 2,
        height: 'max(400px, calc(320px + 12.5vw))',
        fixedWidth: 'max(400px, calc(320px + 12.5vw))',
        gap: '1rem',
      },
      576: {          // mobile
        perPage: 1,
        height: 'max(300px, calc(260px + 12.5vw))',
        fixedWidth: 'min(100%, max(300px, calc(260px + 12.5vw)))',
        gap: '0.75rem',
      },
    },
  });
  main.mount(splide.Extensions);
  console.log('Splide mounted successfully:', main);
});

document.addEventListener("DOMContentLoaded", function () {
  /* =========================
     CUSTOM CURSOR
  ========================= */
  const cursor = document.querySelector(".custom-cursor");
  const cursorText = document.querySelector(".cursor-text");
  window.addEventListener("mousemove", (e) => {
    cursor.style.left = (e.clientX + 22) + "px";
    cursor.style.top  = (e.clientY + 2)  + "px";
  });
  document.querySelectorAll("[cursor-text]").forEach(item => {
    item.addEventListener("mouseenter", () => {
      cursor.classList.add("active");
      cursorText.textContent = item.getAttribute("cursor-text");
    });
    item.addEventListener("mouseleave", () => {
      cursor.classList.remove("active");
      cursorText.textContent = "";
    });
  });
  const hero = document.querySelector(".hero_v2");
  if (hero) {
    hero.addEventListener("mouseenter", () => cursor.style.opacity = "0");
    hero.addEventListener("mouseleave", () => cursor.style.opacity = "1");
  }
  /* =========================
     COUNTER ANIMATION
  ========================= */
  const counters = document.querySelectorAll("[data-target]");
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el        = entry.target;
      const target    = +el.getAttribute("data-target");
      const suffix    = el.getAttribute("data-suffix") || "";
      const steps     = 2000 / 20;
      const increment = target / steps;
      let current     = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = Math.floor(current) + suffix;
      }, 20);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));
  /* =========================
     DROPDOWN — INTERESTED IN
  ========================= */
  const dropdownItems = document.querySelectorAll("[data-value]");
  const inputField    = document.querySelector('input[name="Interested in"]');
  const label         = document.querySelector(".dropdown-label");
  const dropdown      = document.querySelector(".w-dropdown");
  dropdownItems.forEach(item => {
    item.style.cursor = "pointer";
    item.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const value = this.getAttribute("data-value");
      if (label)      label.textContent  = value;
      if (inputField) inputField.value   = value;
      setTimeout(() => {
        if (dropdown) {
          const toggle = dropdown.querySelector(".w-dropdown-toggle");
          const list   = dropdown.querySelector(".w-dropdown-list");
          dropdown.classList.remove("w--open");
          if (toggle) { toggle.classList.remove("w--open"); toggle.setAttribute("aria-expanded", "false"); }
          if (list)   list.classList.remove("w--open");
        }
      }, 100);
    });
  });
  /* =========================
     CONTACT FORM SUBMIT BTN
  ========================= */
  const btn  = document.querySelector(".Button_Class_contact");
  const form = document.querySelector("wf-form-Email-form");
  if (btn && form) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      form.submit();
    });
  }
  /* ==========================================================================
     WORK CARDS ENTRANCE ANIMATION (DESKTOP + MOBILE)
     Matches Live Site: https://cloutgency.com/
     - Desktop (>767px): signature tilted fly-in (-496px, 480px, -26deg) & (+496px, 480px, 26deg)
     - Mobile (<=767px): slide-in (-70px / +70px)
  ========================================================================== */
  function initWorkCardsAnimation() {
    const cards = document.querySelectorAll(
      ".Left_card_wraper, .Right_Card_Wrapper, " +
      ".left_card_wraper, .right_card_wraper, " +
      ".Left_card_wrapper_ourwork, .Right_Card_Wrapper_ourwork, " +
      ".left_card_wraper_ourwork, .right_card_wraper_ourwork"
    );

    if (!cards.length) return;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach(card => {
        card.style.setProperty("opacity", "1", "important");
        card.style.setProperty("transform", "none", "important");
      });
      return;
    }

    const isMobile = () => window.innerWidth <= 767;

    const setInitialState = (card) => {
      const isLeft =
        card.classList.contains("Left_card_wraper")          ||
        card.classList.contains("left_card_wraper")          ||
        card.classList.contains("Left_card_wrapper_ourwork") ||
        card.classList.contains("left_card_wraper_ourwork");

      card.style.setProperty("will-change", "opacity, transform", "important");
      card.style.setProperty("opacity", "0", "important");

      if (isMobile()) {
        card.style.setProperty("transform", isLeft ? "translateX(-50px)" : "translateX(50px)", "important");
        card.style.setProperty("transition", "opacity .5s ease, transform .5s cubic-bezier(.16,1,.3,1)", "important");
      } else {
        const desktopTransform = isLeft
          ? "translate3d(-180px, 140px, 0) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(-14deg) skew(0deg, 0deg)"
          : "translate3d(180px, 140px, 0) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(14deg) skew(0deg, 0deg)";
        card.style.setProperty("transform", desktopTransform, "important");
        card.style.setProperty("transition", "opacity 0.45s ease-out, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)", "important");
      }
    };

    const animateIn = (card) => {
      card.dataset.cardAnimated = "true";
      card.style.setProperty("opacity", "1", "important");
      if (isMobile()) {
        card.style.setProperty("transform", "translateX(0)", "important");
      } else {
        card.style.setProperty("transform", "translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)", "important");
      }
    };

    cards.forEach(card => setInitialState(card));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateIn(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.01,
      rootMargin: "150px 0px 80px 0px"
    });

    cards.forEach(card => observer.observe(card));

    window.__animateWorkCardIn = animateIn;

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cards.forEach(card => {
          if (card.dataset.cardAnimated === "true") {
            if (isMobile()) {
              card.style.setProperty("transform", "translateX(0)", "important");
            } else {
              card.style.setProperty("transform", "translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)", "important");
            }
          } else {
            setInitialState(card);
          }
        });
      }, 150);
    });
  }
  initWorkCardsAnimation();
});

document.addEventListener("DOMContentLoaded", function () {
  /* =========================
     FILTER SYSTEM
  ========================= */
  const tabs  = document.querySelectorAll("[filter-tab], .filter-tab-mob");
  const cards = document.querySelectorAll(".filter-card");
  function updateDropdownLabel(dropdown, selectedLabel) {
    const dropdownToggle = dropdown.querySelector(".w-dropdown-toggle");
    if (!dropdownToggle) return;
    let updated = false;
    /* Try 1: direct child element that is NOT the webflow arrow icon */
    for (const child of dropdownToggle.children) {
      if (!child.classList.contains("w-icon-dropdown-toggle")) {
        child.textContent = selectedLabel;
        updated = true;
        break;
      }
    }
    /* Try 2: plain text node (Webflow "T" text block) */
    if (!updated) {
      for (const node of dropdownToggle.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          node.textContent = " " + selectedLabel + " ";
          updated = true;
          break;
        }
      }
    }
    /* Try 3: nuclear — deepest text-only child element */
    if (!updated) {
      const allChildren = dropdownToggle.querySelectorAll("*");
      for (const el of allChildren) {
        if (
          !el.classList.contains("w-icon-dropdown-toggle") &&
          el.children.length === 0 &&
          el.textContent.trim()
        ) {
          el.textContent = selectedLabel;
          break;
        }
      }
    }
  }
  function closeDropdown(dropdown) {
    const dropdownToggle = dropdown.querySelector(".w-dropdown-toggle");
    const dropdownList   = dropdown.querySelector(".w-dropdown-list");
    dropdown.classList.remove("w--open");
    if (dropdownList) {
      dropdownList.classList.remove("w--open");
    }
    if (dropdownToggle) {
      dropdownToggle.classList.remove("w--open");
      dropdownToggle.setAttribute("aria-expanded", "false");
    }
  }
  function filterCards(tab) {
    if (!tab || !cards.length) return;
    /* --- active state on all tabs --- */
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    /* --- get filter value --- */
    const filter = (
      tab.getAttribute("filter-tab") ||
      tab.getAttribute("data-filter") ||
      "all"
    ).toLowerCase();
    /* --- show / hide cards --- */
    cards.forEach(card => {
      const cardWrap   = card.closest("a") || card;
      const categories = (card.getAttribute("filter-item") || "")
        .toLowerCase()
        .split(" ");
      const match = (filter === "all" || categories.includes(filter));
      cardWrap.style.display = match ? "" : "none";
      if (match && typeof window.__animateWorkCardIn === "function") {
        const rect = cardWrap.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          window.__animateWorkCardIn(cardWrap);
        }
      }
    });
    /* --- update dropdown toggle label if tab is inside a dropdown --- */
    const dropdown = tab.closest(".w-dropdown");
    if (dropdown) {
      updateDropdownLabel(dropdown, tab.textContent.trim());
      closeDropdown(dropdown);
    }
  }
  /* --- bind click events --- */
  if (tabs.length && cards.length) {
    tabs.forEach(tab => {
      tab.addEventListener("click", function (e) {
        e.preventDefault();
        filterCards(tab);
      });
    });
    /* --- trigger default "all" tab on load --- */
    const defaultTab =
      document.querySelector('[filter-tab="all"]') ||
      document.querySelector('[data-filter="all"]') ||
      document.querySelector(".filter-tab-mob");
    if (defaultTab) filterCards(defaultTab);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".floating-section").forEach(section => {
    const card = section.querySelector(".floating-visual");
    if (!card) return;
    let x = 0, y = 0;
    let targetX = section.offsetWidth / 2;
    let targetY = section.offsetHeight / 2;
    let isScrolling = false;
    let scrollTimer = null;
    function hideCard() {
      card.style.opacity = "0";
      card.style.visibility = "hidden";
    }
    function showCard() {
      if (isScrolling) return;
      card.style.visibility = "visible";
      card.style.opacity = "1";
    }
    function startScrollHide() {
      isScrolling = true;
      hideCard();
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isScrolling = false;
      }, 300);
    }
    window.addEventListener("scroll", startScrollHide, { passive:true });
    window.addEventListener("wheel", startScrollHide, { passive:true });
    window.addEventListener("touchmove", startScrollHide, { passive:true });
    section.addEventListener("mousemove", e => {
      if (isScrolling) return;
      const rect = section.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      showCard();
    });
    section.addEventListener("mouseleave", hideCard);
    function animate() {
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      card.style.transform =
        `translate(${x - 175}px, ${y - 120}px)`;
      requestAnimationFrame(animate);
    }
    hideCard();
    animate();
  });
});

window.Webflow ||= [];
window.Webflow.push(() => {
    const services = document.querySelectorAll('.list_services');
    function updateActiveService() {
        services.forEach(service => {
            const heading = service.querySelector('.serve_mob_heading');
            if (!heading) return;
            const height = service.offsetHeight;
            if (height > 200) {
                heading.classList.add('active');
            } else {
                heading.classList.remove('active');
            }
        });
    }
    updateActiveService();
    setInterval(updateActiveService, 100);
});