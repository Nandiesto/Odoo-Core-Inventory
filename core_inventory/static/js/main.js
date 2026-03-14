// ═══════════════════════════════════════════════════════════════
// Core Inventory — Dynamic Interactions
// Premium micro-animations, smooth reveals, and interactive fx
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  // ── Sidebar Toggle (mobile) ──────────────────────────────────
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }

  // ── Auto-dismiss messages after 5s ───────────────────────────
  document.querySelectorAll('.message').forEach((msg, i) => {
    setTimeout(() => {
      msg.style.opacity = '0';
      msg.style.transform = 'translateY(-10px) scale(0.98)';
      msg.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      setTimeout(() => msg.remove(), 400);
    }, 5000 + i * 200);
  });

  // ── Scroll-triggered reveal animation ────────────────────────
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe cards and table-wrappers for scroll reveal
  document.querySelectorAll('.card, .kpi-card').forEach(el => {
    el.classList.add('reveal-on-scroll');
    revealObserver.observe(el);
  });

  // ── Card tilt effect on hover ────────────────────────────────
  document.querySelectorAll('.kpi-card, .quick-action-btn').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -3;
      const rotateY = (x - centerX) / centerX * 3;

      card.style.transform = `translateY(-4px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
      setTimeout(() => {
        card.style.transition = '';
      }, 500);
    });
  });

  // ── Button ripple effect ─────────────────────────────────────
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      this.style.setProperty('--ripple-x', x + '%');
      this.style.setProperty('--ripple-y', y + '%');
    });
  });

  // ── Number counting animation for KPI values ────────────────
  document.querySelectorAll('.kpi-value').forEach(el => {
    const target = parseInt(el.textContent, 10);
    if (isNaN(target)) return;

    el.textContent = '0';
    const duration = 800;
    const start = performance.now();

    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(animate);
    }

    // Start counting when visible
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          requestAnimationFrame(animate);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    countObserver.observe(el);
  });

  // ── Smooth hover glow for table rows ─────────────────────────
  document.querySelectorAll('tbody tr').forEach(row => {
    row.addEventListener('mouseenter', () => {
      row.style.transition = 'all 0.2s ease';
    });
  });

  // ── Staggered entrance for activity items ────────────────────
  document.querySelectorAll('.activity-item').forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-12px)';
    setTimeout(() => {
      item.style.transition = 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
      item.style.opacity = '1';
      item.style.transform = 'translateX(0)';
    }, 100 + i * 80);
  });

  // ── Nav link hover sound-like visual pulse ───────────────────
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
      const icon = link.querySelector('.nav-icon');
      if (icon) {
        icon.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        icon.style.transform = 'scale(1.15)';
      }
    });
    link.addEventListener('mouseleave', () => {
      const icon = link.querySelector('.nav-icon');
      if (icon) {
        icon.style.transform = 'scale(1)';
      }
    });
  });
});

// ── CSS for scroll reveal (injected dynamically) ──────────────
const revealStyles = document.createElement('style');
revealStyles.textContent = `
  .reveal-on-scroll {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .reveal-on-scroll.revealed {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(revealStyles);
