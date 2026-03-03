document.addEventListener('DOMContentLoaded', function() {
    cargarNotificacionesLogin();
});

document.addEventListener('DOMContentLoaded', function() {
            const togglePassword = document.querySelector('#togglePassword');
            const passwordInput = document.querySelector('#password');

            if (togglePassword && passwordInput) {
                togglePassword.addEventListener('click', function() {
                    // Cambiar el tipo de input
                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInput.setAttribute('type', type);

                    // Cambiar el icono
                    this.classList.toggle('fa-eye');
                    this.classList.toggle('fa-eye-slash');
                    
                    // Animacion sutil al hacer click
                    this.style.transform = "scale(1.2)";
                    setTimeout(() => {
                        this.style.transform = "scale(1)";
                    }, 200);
                });
            }

            // Enfoque automático en el campo usuario
            document.getElementById('username')?.focus();
        });