document.documentElement.style.scrollBehavior = "smooth";

document.querySelectorAll('[data-open]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('overlay-' + link.dataset.open).classList.add('open');
    });
});
document.querySelectorAll('.overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.hasAttribute('data-close')) {
            overlay.classList.remove('open');
        }
    });
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    }
});