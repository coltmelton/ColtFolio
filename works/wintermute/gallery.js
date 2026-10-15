(() => {
  const gallery = document.querySelector('[data-wintermute-gallery]');
  const dialog = document.querySelector('.case-lightbox');
  if (!gallery || !dialog || typeof dialog.showModal !== 'function') return;

  const enlarged = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');
  gallery.addEventListener('click', event => {
    const link = event.target.closest('a[data-gallery-image]');
    if (!link) return;
    event.preventDefault();
    const image = link.querySelector('img');
    enlarged.src = link.href;
    enlarged.alt = image.alt;
    enlarged.classList.toggle('case-lightbox__image--diagram', link.dataset.imageBackground === 'light');
    caption.textContent = link.closest('figure').querySelector('figcaption').textContent;
    dialog.showModal();
  });

  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => enlarged.removeAttribute('src'));
})();
