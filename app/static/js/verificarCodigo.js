(function() {
            // ----- GESTIÓN DE INPUTS OTP (auto-focus, pegar, juntar código) -----
            const otpInputs = document.querySelectorAll('.otp-input');
            const hiddenCodigo = document.getElementById('codigo');
            const form = document.getElementById('otp-form');
            const submitBtn = document.getElementById('submitBtn');
            const flashContainer = document.getElementById('flash-container');

            // Función para mostrar mensajes flotantes (simula popup)
            function showFlash(message, category = 'success') {
                const flashDiv = document.createElement('div');
                flashDiv.className = `flash ${category}`;
                flashDiv.textContent = message;
                flashContainer.appendChild(flashDiv);

                // Desaparece después de 4 segundos
                setTimeout(() => {
                    flashDiv.style.opacity = '0';
                    flashDiv.style.transition = 'opacity 0.5s';
                    setTimeout(() => flashDiv.remove(), 600);
                }, 3800);
            }

            // Enfocar primer input al cargar
            if (otpInputs.length) otpInputs[0].focus();

            // Manejo de entrada: solo dígitos, avanzar, borrar, pegar
            otpInputs.forEach((input, index) => {
                // Restringir a números
                input.addEventListener('input', (e) => {
                    let value = e.target.value;
                    // eliminar cualquier no-dígito
                    value = value.replace(/\D/g, '');
                    e.target.value = value;

                    if (value.length === 1) {
                        // si hay próximo input, enfocarlo
                        if (index < otpInputs.length - 1) {
                            otpInputs[index + 1].focus();
                        } else {
                            // último input: opcionalmente podríamos quitar foco
                            otpInputs[index].blur();
                        }
                    }
                    // actualizar campo oculto
                    updateHiddenCode();
                });

                // Tecla backspace: si está vacío y hay anterior, volver y borrar
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace') {
                        if (e.target.value === '' && index > 0) {
                            otpInputs[index - 1].focus();
                            otpInputs[index - 1].value = '';   // limpiar anterior
                            updateHiddenCode();
                        } else {
                            // Si hay contenido, se borrará con el evento input después; solo actualizamos tras borrar
                            // Para asegurar, hacemos update en un pequeño timeout
                            setTimeout(updateHiddenCode, 10);
                        }
                    }
                });

                // Pegado de números (pegar todo el código de una vez)
                input.addEventListener('paste', (e) => {
                    e.preventDefault();
                    const pasteData = (e.clipboardData || window.clipboardData).getData('text');
                    const digits = pasteData.replace(/\D/g, '').split('').slice(0, 6);
                    
                    digits.forEach((digit, i) => {
                        if (otpInputs[i]) {
                            otpInputs[i].value = digit;
                        }
                    });
                    // Enfocar el siguiente al último pegado o el último si se llenaron
                    if (digits.length < 6) {
                        otpInputs[digits.length].focus();
                    } else {
                        otpInputs[5].blur();
                    }
                    updateHiddenCode();
                });
            });

            // Actualizar el campo oculto con los 6 dígitos concatenados
            function updateHiddenCode() {
                let code = '';
                otpInputs.forEach(input => { code += input.value; });
                hiddenCodigo.value = code;
            }

           // ----- ENVÍO DEL FORMULARIO -----
form.addEventListener('submit', (e) => {
    // 1. Actualizamos el código oculto justo antes de validar
    updateHiddenCode();
    const fullCode = hiddenCodigo.value;

    // 2. Validación de seguridad
    if (fullCode.length !== 6 || !/^\d+$/.test(fullCode)) {
        e.preventDefault(); // AQUÍ SÍ lo detenemos si está mal
        showFlash('⚠️ Ingresa los 6 dígitos del código', 'error');
        return;
    }

    // 3. Si llegamos aquí, el código es válido. 
    // NO usamos e.preventDefault() para que el formulario viaje a Flask.
    
    // Activar feedback visual
    submitBtn.classList.add('loading');
    submitBtn.disabled = true; // Evita doble clic
});
            // ----- REENVIAR CÓDIGO (simulado) -----
            const resendLink = document.getElementById('resendLink');
            resendLink.addEventListener('click', (e) => {
                e.preventDefault();
                showFlash('📲 Se ha reenviado un nuevo código a tu dispositivo.', 'success');
                // En un caso real podrías disparar una petición POST a /reenviar-codigo
                // y manejar respuesta
                // también podrías limpiar inputs para nuevo código
                otpInputs.forEach(inp => inp.value = '');
                otpInputs[0].focus();
                updateHiddenCode();
            });

            // Inicializar campo oculto vacío
            updateHiddenCode();

            // Opcional: simular un flash de bienvenida o notificación (solo para mostrar el estilo)
            window.addEventListener('load', () => {
                // mostrar mensaje de demostración (puedes eliminarlo)
                // lo dejamos como ejemplo de popup funcional
                setTimeout(() => {
                    showFlash('🌟 Bienvenido a Oasis. Introduce tu código.', 'success');
                }, 300);
            });
        })();