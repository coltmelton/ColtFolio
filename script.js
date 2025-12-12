document.addEventListener("DOMContentLoaded", () => {
  // Ensure fresh load starts at the top for portfolio flow.
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);
  document.body.classList.add("splash-active", "welcome-active");

  const reveals = document.querySelectorAll(".reveal");
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav__links a");
  const cursorEl = document.querySelector("#cursor");

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  reveals.forEach(el => revealObserver.observe(el));

  const navObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = document.querySelector(`.nav__links a[href="#${id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(section => navObserver.observe(section));
  const navCta = document.querySelector(".nav__cta");

  // Custom cursor
  if (cursorEl) {
    const moveCursor = e => {
      cursorEl.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      cursorEl.style.opacity = 1;
    };
    window.addEventListener("mousemove", moveCursor, { passive: true });
  }

  // Click-driven image flip: left half goes backward, right half goes forward.
  document.querySelectorAll(".project__image").forEach(wrapper => {
    const img = wrapper.querySelector("img");
    if (!img) return;
    const images = (wrapper.dataset.images || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    if (!images.length) return;

    let index = 0;

    const showImage = newIndex => {
      index = (newIndex + images.length) % images.length;
      img.src = images[index];
    };

    wrapper.addEventListener("click", e => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;
      if (ratio < 0.5) {
        showImage(index - 1);
      } else {
        showImage(index + 1);
      }
    });
  });

  // Archive: left titles, right 3x3 thumbs
  const archiveItems = document.querySelectorAll(".archive__item");
  const archiveThumbs = document.querySelectorAll(".archive__thumb");

  const highlightById = id => {
    archiveItems.forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.archiveId === id);
    });
  };

  archiveThumbs.forEach(thumb => {
    const img = thumb.querySelector("img");
    const thumbId = thumb.dataset.archiveId;
    let idx = 1;
    let timer = null;

    const getImages = () =>
      (thumb.dataset.images || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      const images = getImages();
      if (images.length && img) {
        img.src = images[0];
        idx = 1;
      }
      if (thumbId) highlightById(null);
    };

    const start = () => {
      const images = getImages();
      if (!img || !images.length) return;
      stop();
      if (thumbId) highlightById(thumbId);
      timer = setInterval(() => {
        img.src = images[idx % images.length];
        idx += 1;
      }, 180);
    };

    thumb.addEventListener("mouseenter", start);
    thumb.addEventListener("mouseleave", stop);
    thumb.addEventListener("focus", start);
    thumb.addEventListener("blur", stop);
  });

  const welcomeSection = document.querySelector(".welcome");
  const welcomeInner = document.querySelector(".welcome__inner");
  const introSection = document.querySelector(".intro");
  const introInner = document.querySelector(".intro__inner");
  let welcomeDone = false;

  const transitionFromWelcome = () => {
    if (welcomeDone) return;
    welcomeDone = true;
    if (welcomeInner) welcomeInner.classList.add("is-fading");
    setTimeout(() => {
      document.body.classList.remove("welcome-active");
      if (introSection) {
        window.scrollTo({ top: introSection.offsetTop, behavior: "smooth" });
      }
    }, 800);
  };

  // Auto fade "Hello" and move to name/occupation
  setTimeout(transitionFromWelcome, 600);
  if (welcomeSection) {
    welcomeSection.addEventListener("click", transitionFromWelcome);
  }

  const updateIntroFade = () => {
    if (!introSection || !introInner) return;
    const start = introSection.offsetTop;
    const height = introSection.offsetHeight || 1;
    const progress = Math.min(Math.max((window.scrollY - start) / (height * 0.6), 0), 1);
    introInner.style.opacity = String(1 - progress);
    introInner.style.transform = `translateY(${(-10 * progress).toFixed(2)}px)`;
    if (progress < 0.05) {
      introInner.classList.remove("is-fading");
    } else {
      introInner.classList.add("is-fading");
    }
  };

  const updateSplashState = () => {
    let hideNav = document.body.classList.contains("welcome-active");
    if (!hideNav && introSection) {
      const threshold = introSection.offsetTop + introSection.offsetHeight * 0.6;
      hideNav = window.scrollY < threshold;
    }
    if (hideNav) {
      document.body.classList.add("splash-active");
    } else {
      document.body.classList.remove("splash-active");
    }
  };

  const onScroll = () => {
    updateIntroFade();
    updateSplashState();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  updateIntroFade();
  updateSplashState();

  // Mobile archive: vertical stack is handled in CSS; add a gentle rotate-on-scroll for thumbs.
  const applyMobileArchiveMotion = () => {
    const isMobile = window.matchMedia("(max-width: 700px)").matches;
    if (!isMobile) return;
    const imgs = document.querySelectorAll(".archive__thumb img");
    if (!imgs.length) return;
    const handleScroll = () => {
      imgs.forEach((img, idx) => {
        const angle = Math.sin((window.scrollY + idx * 40) / 140) * 6;
        img.style.transform = `rotate(${angle.toFixed(3)}deg)`;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  };

  applyMobileArchiveMotion();
});
