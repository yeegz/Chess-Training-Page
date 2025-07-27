(function () {
    emailjs.init("8opY8YaFj9jjp51vJ");
})();

document.getElementById("register-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const form = this;
    const password = form.password.value;
    const confirm = form.confirmPassword.value;

    if (password !== confirm) {
        alert("Passwords do not match.");
        return;
    }

    const templateParams = {
        username: form.username.value,
        email: form.email.value,
    };

    emailjs.send("service_mhwjpli", "template_c53bg1s", templateParams)
        .then(function () {
            alert("Registration sent successfully!");
            form.reset();
        }, function (error) {
            alert("Failed to send registration. Error: " + JSON.stringify(error));
        });
});

