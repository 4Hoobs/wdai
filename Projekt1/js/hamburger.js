var hamburger = document.querySelector('.hamburger');
var navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', function () {
  var open = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
});