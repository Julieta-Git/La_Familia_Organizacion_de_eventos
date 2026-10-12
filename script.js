(() => {
  "use strict";

  /* ---------- Año en el footer ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Menú móvil ---------- */
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");

  const desktopNav = window.matchMedia("(min-width: 1100px)");
  function closeNav() {
    if (!mainNav.classList.contains("is-open")) return;
    mainNav.classList.remove("is-open");
    document.body.style.overflow = "";
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú");
  }
  function openNav() {
    mainNav.classList.add("is-open");
    document.body.style.overflow = "hidden";
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
      if (e.key === "Escape" && mainNav.classList.contains("is-open")) {
        closeNav();
        navToggle.focus();
      }
    });
    // Si se agranda la ventana con el menú abierto, se cierra solo.
    desktopNav.addEventListener("change", (e) => { if (e.matches) closeNav(); });
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

  let lightboxOpener = null;
  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const label = item.getAttribute("data-ph") || "";
      lightboxContent.setAttribute("data-ph", label);
      lightboxContent.setAttribute("aria-label", label);
      lightboxOpener = item;
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      lightboxClose.focus();
    });
  });

  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lightboxOpener) lightboxOpener.focus();
  }
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  window.addEventListener("keydown", (e) => {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    // El único control del visor es "Cerrar": el foco no se escapa detrás del visor.
    if (e.key === "Tab") { e.preventDefault(); lightboxClose.focus(); }
  });

  /* ---------- Formulario de presupuesto → WhatsApp ---------- */
  const form = document.getElementById("budget-form");
  const formError = document.getElementById("form-error");
  const budgetSuccess = document.getElementById("budget-success");
  const budgetSuccessLink = document.getElementById("budget-success-link");
  const budgetSuccessBack = document.getElementById("budget-success-back");
  const WHATSAPP_NUMBER = "5493704573516"; // Raúl. Cambiar si prefieren otro número como principal.

  if (form) {
    // La fecha del evento no puede ser anterior a hoy.
    const hoy = new Date();
    form.fecha.min = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = form.nombre.value.trim();
      const telefono = form.telefono.value.trim();
      const evento = form.evento.value;

      // Un teléfono argentino tiene al menos 8 dígitos (sin contar espacios ni guiones).
      const telefonoValido = telefono.replace(/\D/g, "").length >= 8;
      const invalidos = [
        [form.nombre, !nombre],
        [form.telefono, !telefonoValido],
        [form.evento, !evento],
      ];
      invalidos.forEach(([campo, mal]) => campo.setAttribute("aria-invalid", String(mal)));
      const primero = invalidos.find(([, mal]) => mal);
      if (primero) {
        formError.textContent = !telefonoValido && telefono
          ? "Revisá el teléfono: escribilo con código de área, por ejemplo 3704 573516."
          : "Completá nombre, teléfono y tipo de evento para poder enviar la consulta.";
        formError.hidden = false;
        primero[0].focus();
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
      if (fecha) {
        const [a, m, d] = fecha.split("-");
        lineas.push(`Fecha: ${d}/${m}/${a}`);
      }
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
