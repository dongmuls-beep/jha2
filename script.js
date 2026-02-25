(function () {
  const tocShell = document.querySelector(".toc-shell");
  const tocToggle = document.getElementById("toc-toggle");
  const tocPanel = document.getElementById("toc-panel");
  const tocLinks = Array.from(document.querySelectorAll('.toc-panel a[href^="#"]'));
  const mobileMedia = window.matchMedia("(max-width: 767px)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!tocShell || !tocToggle || !tocPanel || tocLinks.length === 0) {
    return;
  }

  const sections = tocLinks
    .map((link) => document.getElementById(link.getAttribute("href").slice(1)))
    .filter(Boolean);

  function openToc() {
    if (!mobileMedia.matches) {
      return;
    }
    tocShell.classList.add("is-open");
    tocToggle.setAttribute("aria-expanded", "true");
  }

  function closeToc() {
    tocShell.classList.remove("is-open");
    tocToggle.setAttribute("aria-expanded", "false");
  }

  tocToggle.addEventListener("click", function () {
    if (tocShell.classList.contains("is-open")) {
      closeToc();
      return;
    }
    openToc();
  });

  document.addEventListener("click", function (event) {
    if (!mobileMedia.matches) {
      return;
    }
    if (tocShell.contains(event.target)) {
      return;
    }
    closeToc();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && tocShell.classList.contains("is-open")) {
      closeToc();
      tocToggle.focus();
    }
  });

  tocLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (mobileMedia.matches) {
        closeToc();
      }
    });
  });

  function syncTocForViewport() {
    if (!mobileMedia.matches) {
      closeToc();
    }
  }

  mobileMedia.addEventListener("change", syncTocForViewport);
  syncTocForViewport();

  function setActiveLink(id) {
    tocLinks.forEach(function (link) {
      const isMatch = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", isMatch);
      if (isMatch) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function detectCurrentSection() {
    const offset = window.innerWidth >= 1200 ? 170 : 130;
    let currentId = sections[0].id;

    for (let i = 0; i < sections.length; i += 1) {
      const section = sections[i];
      if (section.getBoundingClientRect().top - offset <= 0) {
        currentId = section.id;
      }
    }

    if (location.hash) {
      const hashId = location.hash.slice(1);
      if (document.getElementById(hashId)) {
        currentId = hashId;
      }
    }

    setActiveLink(currentId);
  }

  let scrollTicking = false;
  function onScrollOrResize() {
    if (scrollTicking) {
      return;
    }
    scrollTicking = true;
    window.requestAnimationFrame(function () {
      detectCurrentSection();
      scrollTicking = false;
    });
  }

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);
  window.addEventListener("hashchange", detectCurrentSection);
  detectCurrentSection();

  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  const revealObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.12,
    }
  );

  revealItems.forEach(function (el) {
    revealObserver.observe(el);
  });
})();
