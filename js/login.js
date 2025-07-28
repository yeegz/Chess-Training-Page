document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email === "" || password === "") {
        alert("Please fill in all fields.");
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];

    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        localStorage.setItem('isLoggedIn', 'true');

        alert("Login successful!");
        window.location.href = "home.html";
    } else {
        alert("Invalid email or password.");
    }
});
