// ── Sidebar Toggle (mobile) ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
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

  // ── Auto-dismiss messages after 5s ─────────────────────────
  document.querySelectorAll('.message').forEach(msg => {
    setTimeout(() => {
      msg.style.opacity = '0';
      msg.style.transform = 'translateY(-10px)';
      msg.style.transition = 'all 0.3s ease';
      setTimeout(() => msg.remove(), 300);
    }, 5000);
  });
});
