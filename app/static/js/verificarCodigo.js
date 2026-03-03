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

            // ----- ENVÍO DEL FORMULARIO (simula validación, loading y flash) -----
            form.addEventListener('submit', (e) => {
                e.preventDefault();  // prevenimos envío real para demo, pero puedes quitarlo

                updateHiddenCode();
                const fullCode = hiddenCodigo.value;

                // validación simple de 6 dígitos
                if (fullCode.length !== 6 || !/^\d+$/.test(fullCode)) {
                    showFlash('⚠️ Ingresa los 6 dígitos del código', 'error');
                    return;
                }

                // activar loading
                submitBtn.classList.add('loading');

                // simular petición asíncrona (verificación)
                setTimeout(() => {
                    submitBtn.classList.remove('loading');

                    // SIMULACIÓN: aceptamos cualquier código de 6 dígitos para demostración.
                    // en un caso real se enviaría mediante POST.
                    if (fullCode === '123456') {
                        // podrías redirigir, pero mostramos éxito
                        showFlash('✅ Código verificado. Redirigiendo...', 'success');
                        // simular redirect después de 1s
                        setTimeout(() => {
                            window.location.href = '/dashboard'; // solo simbólico
                        }, 1200);
                    } else {
                        // código "inválido" didáctico, pero aceptaremos cualquiera para no bloquear demo
                        // realmente no queremos bloquear al usuario que prueba, así que pondremos éxito.
                        // Para mantener la experiencia, lanzamos éxito igual (solo demo)
                        showFlash('✅ (Demo) Código aceptado. Redirigiendo...', 'success');
                        setTimeout(() => {
                            // reiniciamos demo: borrar inputs
                            otpInputs.forEach(inp => inp.value = '');
                            otpInputs[0].focus();
                            updateHiddenCode();
                            // también se podría comentar el redirect de prueba
                            window.location.href = '#'; // no redirige de verdad
                        }, 1500);
                    }
                }, 1000);
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