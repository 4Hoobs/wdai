var form = document.querySelector('.newsletter');

form.addEventListener('submit', function (event) {
    event.preventDefault();
    var email = document.querySelector('#newsletter-left').value.trim();
    if (!email.includes('@')){
        window.alert("Enter a valid email address");
        return;
    }
    window.alert("Sent!");
    form.reset();
});