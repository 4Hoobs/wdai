function loadTemplate(placeholderId, templatePath) {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) return Promise.resolve();

  return fetch(templatePath)
    .then(res => res.text())
    .then(html => { placeholder.innerHTML = html; })
    .catch(err => console.error(`Failed to load ${templatePath}:`, err));
}

document.addEventListener('DOMContentLoaded', () => {
  loadTemplate('nav-placeholder', 'templates/nav.html').then(() => {
    const s = document.createElement('script');
    s.src = 'js/hamburger.js';
    document.body.appendChild(s);   // scripts created via createElement DO run
  });
  loadTemplate('social-placeholder', 'templates/social_media.html');
  loadTemplate('footer-placeholder', 'templates/footer.html');
});