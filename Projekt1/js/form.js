var form = document.querySelector('.contact_form');
form.addEventListener('submit', function (event) {
    event.preventDefault();
    var name = document.querySelector('#contact-name').value.trim();
    var email = document.querySelector('#contact-email').value.trim();
    var subject = document.querySelector('#contact-subject').value;
    var message = document.querySelector('#contact-message').value.trim();
    if (!name || !email || !subject || !message) {
        window.alert('Please fill in all fields.');
        return;
    }
    if (!email.includes('@')){
        window.alert("Enter a valid email address");
        return;
    }
    window.alert("Sent!");
    form.reset();
});