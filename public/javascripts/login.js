document.getElementById('signInForm').addEventListener('submit', function (event) {
    var username = document.getElementById('username');
    var password = document.getElementById('password');

    if (username.value === '') {
        event.preventDefault();
        username.classList.add('is-invalid');
    } else {
        username.classList.remove('is-invalid');
    }

    if (password.value === '') {
        event.preventDefault();
        password.classList.add('is-invalid');
    } else {
        password.classList.remove('is-invalid');
    }
});