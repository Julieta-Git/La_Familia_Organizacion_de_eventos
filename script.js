(() => {
  "use strict";

  /* ---------- Año en el footer ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Menú móvil ---------- */
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");

  function closeNav() {
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú");
  }
  function openNav() {
    mainNav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Cerrar menú");
  }
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.contains("is-open");
      isOpen ? closeNav() : openNav();
    });
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Una noche con nosotros: se enciende al llegar cada momento ---------- */
  const storySteps = document.querySelectorAll(".story-step");
  if (storySteps.length && "IntersectionObserver" in window) {
    const lightIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-lit");
            lightIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "-45% 0px -45% 0px" } // se enciende al cruzar el centro de la pantalla
    );
    storySteps.forEach((el) => lightIO.observe(el));
  } else {
    storySteps.forEach((el) => el.classList.add("is-lit"));
  }

  /* ---------- Revelado al hacer scroll ---------- */
  const revealTargets = document.querySelectorAll(
    ".story-step, .event-item, .package-card, .gallery-item, .faq-item, .contact-card, .about-content, .about-media, .hero-content"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Carrusel de testimonios ---------- */
  const track = document.getElementById("testimonial-track");
  const dotsWrap = document.getElementById("testimonial-dots");

  if (track && dotsWrap) {
    const slides = Array.from(track.children);
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", `Ver testimonio ${i + 1}`);
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", () => {
        slides[i].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      });
      dotsWrap.appendChild(dot);
    });

    const dots = Array.from(dotsWrap.children);
    const syncDots = () => {
      const trackRect = track.getBoundingClientRect();
      let closestIndex = 0;
      let closestDist = Infinity;
      slides.forEach((slide, i) => {
        const dist = Math.abs(slide.getBoundingClientRect().left - trackRect.left);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = i;
        }
      });
      dots.forEach((d, i) => d.classList.toggle("is-active", i === closestIndex));
    };
    track.addEventListener("scroll", () => {
      window.requestAnimationFrame(syncDots);
    }, { passive: true });
  }

  /* ---------- Lightbox de galería ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxContent = document.getElementById("lightbox-content");
  const lightboxClose = document.getElementById("lightbox-close");

  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      lightboxContent.setAttribute("data-ph", item.getAttribute("data-ph") || "");
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
  });

  /* ---------- Formulario de presupuesto → WhatsApp ---------- */
  const form = document.getElementById("budget-form");
  const formError = document.getElementById("form-error");
  const budgetSuccess = document.getElementById("budget-success");
  const budgetSuccessLink = document.getElementById("budget-success-link");
  const budgetSuccessBack = document.getElementById("budget-success-back");
  const WHATSAPP_NUMBER = "5493704573516"; // Raúl. Cambiar si prefieren otro número como principal.

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = form.nombre.value.trim();
      const telefono = form.telefono.value.trim();
      const evento = form.evento.value;

      if (!nombre || !telefono || !evento) {
        formError.hidden = false;
        formError.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      formError.hidden = true;

      const fecha = form.fecha.value;
      const invitados = form.invitados.value.trim();
      const lugar = form.lugar.value.trim();
      const comentarios = form.comentarios.value.trim();
      const servicios = Array.from(form.querySelectorAll('input[name="servicios"]:checked'))
        .map((cb) => cb.value);

      const lineas = [
        "Hola, quiero solicitar un presupuesto:",
        `Nombre: ${nombre}`,
        `Teléfono: ${telefono}`,
        `Tipo de evento: ${evento}`,
      ];
      if (fecha) lineas.push(`Fecha: ${fecha}`);
      if (lugar) lineas.push(`Lugar: ${lugar}`);
      if (invitados) lineas.push(`Cantidad de invitados: ${invitados}`);
      if (servicios.length) lineas.push(`Servicios: ${servicios.join(", ")}`);
      if (comentarios) lineas.push(`Comentarios: ${comentarios}`);

      const mensaje = encodeURIComponent(lineas.join("\n"));
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`;

      // Abrir de forma síncrona con el clic, para que el navegador no lo bloquee.
      window.open(whatsappUrl, "_blank", "noopener");

      // Reconocer el esfuerzo de completar el formulario con una confirmación
      // cálida, en vez de mandar a la persona a WhatsApp sin más.
      if (budgetSuccess) {
        budgetSuccessLink.href = whatsappUrl;
        form.hidden = true;
        budgetSuccess.hidden = false;
        budgetSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // NOTA para quien despliegue este sitio:
      // Este sitio es estático (sin backend), así que el envío por correo
      // no puede hacerse solo con este código. Para que la solicitud también
      // llegue por email, conectar este formulario a un servicio como
      // Formspree, EmailJS o Web3Forms, y llamarlo acá antes o además de
      // abrir WhatsApp.
    });
  }

  if (budgetSuccessBack) {
    budgetSuccessBack.addEventListener("click", () => {
      budgetSuccess.hidden = true;
      form.hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
})();