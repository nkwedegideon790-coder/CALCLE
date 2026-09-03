// Mobile nav toggle
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  menuToggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));

  // Route rail active-section highlight
  const waypoints = document.querySelectorAll('.route-rail .wp');
  const sectionEls = Array.from(waypoints).map(wp => document.getElementById(wp.dataset.target)).filter(Boolean);
  if ('IntersectionObserver' in window && sectionEls.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const wp = document.querySelector('.route-rail .wp[data-target="'+id+'"]');
        if (!wp) return;
        if (entry.isIntersecting) {
          waypoints.forEach(w => w.classList.remove('active'));
          wp.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    sectionEls.forEach(el => io.observe(el));
  }
  waypoints.forEach(wp => {
    wp.style.cursor = 'pointer';
    wp.addEventListener('click', () => {
      const target = document.getElementById(wp.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Consultation form validation + Formspree submission
  const form = document.getElementById('consultForm');
  const status = document.getElementById('formStatus');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const nameField = document.getElementById('field-name');
    const nameInput = document.getElementById('name');
    if (!nameInput.value.trim()) { nameField.classList.add('invalid'); valid = false; }
    else nameField.classList.remove('invalid');

    const contactField = document.getElementById('field-contact');
    const contactInput = document.getElementById('contact');
    const contactVal = contactInput.value.trim();
    const looksValid = /\S+@\S+\.\S+/.test(contactVal) || /[\d+][\d\s-]{6,}/.test(contactVal);
    if (!looksValid) { contactField.classList.add('invalid'); valid = false; }
    else contactField.classList.remove('invalid');

    const serviceField = document.getElementById('field-service');
    const serviceInput = document.getElementById('service');
    if (!serviceInput.value) { serviceField.classList.add('invalid'); valid = false; }
    else serviceField.classList.remove('invalid');

    if (!valid) {
      status.classList.remove('show');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    status.classList.remove('show', 'error');

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    })
      .then((response) => {
        if (response.ok) {
          status.textContent = 'Message received — we\'ll get back to you shortly.';
          status.classList.add('show');
          form.reset();
        } else {
          return response.json().then((data) => {
            const msg = (data && data.errors) ? data.errors.map(er => er.message).join(', ') : 'Something went wrong. Please try again.';
            status.textContent = msg;
            status.classList.add('show', 'error');
          });
        }
      })
      .catch(() => {
        status.textContent = 'Could not send right now — please try again or email us directly.';
        status.classList.add('show', 'error');
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
        setTimeout(() => status.classList.remove('show'), 8000);
      });
  });