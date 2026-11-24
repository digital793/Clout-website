document.addEventListener("DOMContentLoaded", function () {
  /* =========================
     CUSTOM CURSOR
  ========================= */
  const cursor     = document.querySelector(".custom-cursor");
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
  const hero = document.querySelector(".hero-section_new");
  if (hero) {
    hero.addEventListener("mouseenter", () => cursor.style.opacity = "0");
    hero.addEventListener("mouseleave", () => cursor.style.opacity = "1");
  }
  /* =========================
     FILTER SYSTEM
  ========================= */
  const tabs  = document.querySelectorAll("[filter-tab], .filter-tab-mob");
  const cards = document.querySelectorAll(".filter-card");
  function filterCards(tab) {
    if (!tab || !cards.length) return;
    /* --- active state --- */
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    /* --- filter logic --- */
    const filter = (
      tab.getAttribute("filter-tab") ||
      tab.getAttribute("data-filter") ||
      "all"
    ).toLowerCase();
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
    /* --- update dropdown toggle label --- */
    const dropdown = tab.closest(".w-dropdown");
    if (dropdown) {
      const dropdownList   = dropdown.querySelector(".w-dropdown-list");
      const dropdownToggle = dropdown.querySelector(".w-dropdown-toggle");
      const selectedLabel  = tab.textContent.trim();
      if (dropdownToggle) {
        let updated = false;
        /* Try 1: direct child element that is NOT the icon */
        for (const child of dropdownToggle.children) {
          if (!child.classList.contains("w-icon-dropdown-toggle")) {
            child.textContent = selectedLabel;
            updated = true;
            break;
          }
        }
        /* Try 2: plain text node (Webflow "T" text block renders as text node) */
        if (!updated) {
          for (const node of dropdownToggle.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
              node.textContent = " " + selectedLabel + " ";
              updated = true;
              break;
            }
          }
        }
        /* Try 3: nuclear — any element that only contains text */
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
      /* close the dropdown */
      dropdown.classList.remove("w--open");
      if (dropdownList)   dropdownList.classList.remove("w--open");
      if (dropdownToggle) {
        dropdownToggle.classList.remove("w--open");
        dropdownToggle.setAttribute("aria-expanded", "false");
      }
    }
  }
  if (tabs.length && cards.length) {
    tabs.forEach(tab => {
      tab.addEventListener("click", function (e) {
        e.preventDefault();
        filterCards(tab);
      });
    });
    const defaultTab =
      document.querySelector('[filter-tab="all"]') ||
      document.querySelector('[data-filter="all"]') ||
      document.querySelector(".filter-tab-mob");
    if (defaultTab) filterCards(defaultTab);
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
/* =========================
   WHATSAPP WIDGET
========================= */
(function (w, d, s, u) {
  w.gbwawc = {
    url: u,
    options: {
      waId: "917418485333",
      siteName: "Cloutgency",
      siteTag: "Usually reply in 4 minutes",
      siteLogo: "https://files.gallabox.com/646c6e3679c459c418ffb514/9d57a7f2-bdd3-4e10-a9ae-6b3c0566d459-download8.jpeg",
      widgetPosition: "RIGHT",
      welcomeMessage: "Welcome to Cloutgency!!!",
      brandColor: "#25D366",
      messageText: "Looking for",
      replyOptions: ["I'd like to talk to sales", "I'd like the brochure"],
      version: "v1",
      widgetPositionMarginX: 12,
      widgetPositionMarginY: 12
    }
  };
  const firstScript  = d.getElementsByTagName(s)[0];
  const widgetScript = d.createElement(s);
  widgetScript.async = true;
  widgetScript.src   = u + "/whatsapp-widget.min.js?_=" + Date.now();
  firstScript.parentNode.insertBefore(widgetScript, firstScript);
})(window, document, "script", "https://waw.gallabox.com");
/* =========================
   GSAP TAB PROGRESS
========================= */
window.addEventListener("load", function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.utils.toArray(".tab-wrapper").forEach(wrapper => {
    const tab = wrapper.querySelector(".tab");
    const bar = wrapper.querySelector(".progress");
    if (!tab || !bar) return;
    const href = tab.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    const section = document.querySelector(href);
    if (!section) return;
    gsap.fromTo(bar,
      { width: "0%" },
      {
        width: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top center",
          end: "bottom center",
          scrub: true,
          onLeave:     () => gsap.set(bar, { width: "0%" }),
          onEnterBack: () => gsap.set(bar, { width: "0%" })
        }
      }
    );
  });
});