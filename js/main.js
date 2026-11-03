/* =========================================================
   BEE LASER REMOVE — interacciones generales
   ========================================================= */

(() => {
  "use strict";

  const config = window.BEE_SITE || {};
  const email = (config.email || "").trim();
  const phone = (config.phone || "").trim();
  const phoneHref = phone.replace(/[^\d+]/g, "");
  const instagram = (config.instagram || "").trim();
  const instagramHandle = (config.instagramHandle || "").trim();
  const whatsapp = (config.whatsapp || "").replace(/[^\d]/g, "");
  const whatsappMessage = (config.whatsappMessage || "Hola, me gustaría información sobre vuestros tratamientos.").trim();
  const studioAddress = (config.studioAddress || "").trim();
  const mapsUrl = (config.mapsUrl || "").trim();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Contact data ---------- */

  if (email) {
    document.querySelectorAll("[data-email-link]").forEach((link) => {
      link.setAttribute("href", `mailto:${email}`);
    });

    document.querySelectorAll("[data-email-text]").forEach((el) => {
      el.textContent = email;
    });
  } else {
    document.querySelectorAll("[data-email-link]").forEach((link) => {
      link.setAttribute("hidden", "");
    });
  }

  if (phone) {
    document.querySelectorAll("[data-phone-row], [data-phone-link]").forEach((link) => {
      link.removeAttribute("hidden");
      link.setAttribute("href", `tel:${phoneHref || phone}`);
    });
    document.querySelectorAll("[data-phone-text]").forEach((el) => {
      el.textContent = phone;
    });
  }

  if (whatsapp) {
    const whatsappHref = (message = whatsappMessage) =>
      `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

    document.querySelectorAll("[data-whatsapp-row], [data-whatsapp-link]").forEach((link) => {
      link.removeAttribute("hidden");
      link.setAttribute("href", whatsappHref());
    });

    document.querySelectorAll("[data-whatsapp-cta]").forEach((link) => {
      const treatment = (link.dataset.treatmentLink || "").trim();
      const message = treatment
        ? `Hola, me gustaría información sobre: ${treatment}.`
        : whatsappMessage;

      link.setAttribute("href", whatsappHref(message));
    });
  } else {
    document.querySelectorAll("[data-whatsapp-cta]").forEach((link) => {
      link.setAttribute("hidden", "");
    });
  }

  if (instagram) {
    document.querySelectorAll("[data-instagram-link]").forEach((link) => {
      link.setAttribute("href", instagram);
    });

    if (instagramHandle) {
      document.querySelectorAll("[data-instagram-text]").forEach((el) => {
        el.textContent = instagramHandle;
      });
    }
  } else {
    document.querySelectorAll("[data-instagram-link]").forEach((link) => {
      link.setAttribute("hidden", "");
    });
  }

  const studioTexts = document.querySelectorAll("[data-studio-text]");
  if (studioAddress) {
    studioTexts.forEach((el) => {
      el.textContent = studioAddress;
    });
  }

  if (studioAddress || mapsUrl) {
    const fallbackMap = studioAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(studioAddress)}`
      : "";
    const mapHref = mapsUrl || fallbackMap;

    document.querySelectorAll("[data-maps-link]").forEach((link) => {
      link.setAttribute("href", mapHref);
      link.setAttribute(
        "aria-label",
        `Ubicación del estudio: ${studioAddress || "ver en el mapa"}`
      );
    });
  }

  if (config.hours) {
    document.querySelectorAll("[data-hours-text]").forEach((el) => {
      el.textContent = config.hours;
    });
  }

  // Mantiene el mensaje de WhatsApp alineado con el tratamiento consultado.
  // (El enlace se construye al cargar, por eso no hace falta un listener de clic.)

  /* ---------- Year ---------- */

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Header ---------- */

  const header = document.querySelector("[data-header]");
  if (header) {
    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  /* ---------- Mobile menu ---------- */

  const menu = document.querySelector("[data-menu]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  let menuOpen = false;
  let lastFocused = null;

  const getMenuFocusables = () => {
    if (!menu) return [];
    return [
      ...menu.querySelectorAll('a[href], button:not([disabled])'),
      ...(menuToggle ? [menuToggle] : [])
    ];
  };

  const openMenu = () => {
    if (!menu || !menuToggle || menuOpen) return;
    menuOpen = true;
    lastFocused = document.activeElement;

    document.documentElement.classList.add("menu-open");
    document.body.classList.add("menu-open");
    menu.setAttribute("aria-hidden", "false");
    menu.inert = false;
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Cerrar menú");

    const firstLink = menu.querySelector(".mobile-menu__nav a");
    window.setTimeout(() => firstLink?.focus({ preventScroll: true }), 120);
  };

  const closeMenu = ({ restoreFocus = true } = {}) => {
    if (!menu || !menuToggle || !menuOpen) return;
    menuOpen = false;

    document.documentElement.classList.remove("menu-open");
    document.body.classList.remove("menu-open");
    menu.setAttribute("aria-hidden", "true");
    menu.inert = true;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");

    if (restoreFocus && lastFocused instanceof HTMLElement) {
      lastFocused.focus({ preventScroll: true });
    }
  };

  if (menu && menuToggle) {
    menu.inert = true;

    menuToggle.addEventListener("click", () => {
      if (menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menu.querySelectorAll("a[href]").forEach((link) => {
      link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
    });

    document.addEventListener("keydown", (event) => {
      if (!menuOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") return;

      const focusables = getMenuFocusables();
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1020 && menuOpen) {
        closeMenu({ restoreFocus: false });
      }
    });
  }

  /* ---------- Scroll reveal ---------- */

  const revealItems = Array.from(document.querySelectorAll(".reveal"));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  /* ---------- Treatments accordion ---------- */

  const accordion = document.querySelector("[data-accordion]");
  if (accordion) {
    const items = Array.from(accordion.querySelectorAll(".treatment"));

    const setItemState = (item, open) => {
      const trigger = item.querySelector(".treatment__trigger");
      const panel = item.querySelector(".treatment__panel");
      if (!trigger || !panel) return;

      item.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
    };

    items.forEach((item) => {
      const trigger = item.querySelector(".treatment__trigger");
      if (!trigger) return;

      trigger.addEventListener("click", () => {
        const willOpen = !item.classList.contains("is-open");

        items.forEach((other) => {
          if (other !== item) setItemState(other, false);
        });

        setItemState(item, willOpen);
      });
    });
  }

  /* ---------- Orbital diagram tilt ---------- */

  const tilt = document.querySelector("[data-tilt]");
  const orbit = tilt?.querySelector(".orbit");

  if (tilt && orbit && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    tilt.addEventListener("pointermove", (event) => {
      const rect = tilt.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      orbit.style.setProperty("--tilt-x", (-y * 7).toFixed(2));
      orbit.style.setProperty("--tilt-y", (x * 9).toFixed(2));
    });

    tilt.addEventListener("pointerleave", () => {
      orbit.style.setProperty("--tilt-x", "0");
      orbit.style.setProperty("--tilt-y", "0");
    });
  }
})();
