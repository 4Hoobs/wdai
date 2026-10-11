var hamburger = document.querySelector('.hamburger');
var navLinks = document.querySelector('.nav-links');
var KEY = 'navOpen';

function setOpen(open) {
    navLinks.classList.toggle('open', open); // set class when open is true, unset when false
    hamburger.setAttribute('aria-expanded', open);
}

hamburger.addEventListener('click', function () {
    var open = !navLinks.classList.contains('open');
    setOpen(open);
    try {
        localStorage.setItem(KEY, open);
    } catch (e) { /* ignore */ }
});

try {
    setOpen(localStorage.getItem(KEY) === 'true');
} catch (e) { /* storage unavailable: stay collapsed */ }