document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (username === "" || email === "" || password === "" || confirmPassword === "") {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const userData = {
        username: username,
        email: email,
        password: password
    };

    let users = JSON.parse(localStorage.getItem('users')) || [];

    users.push(userData);

    localStorage.setItem('users', JSON.stringify(users));

    alert("Registration successful!");
    window.location.href = "login.html";
});
