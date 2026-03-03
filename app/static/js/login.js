document.addEventListener('DOMContentLoaded', function() {
    cargarNotificacionesLogin();
});

function cargarNotificacionesLogin() {
    // Reutilizamos el endpoint que creamos en tu routes.py
    fetch('/api/mensajes')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('flash-container');
            if (!container) return; // Medida de seguridad por si el div no existe
            
            container.innerHTML = ''; 

            data.forEach(item => {
                // 1. Creamos el contenedor del mensaje
                const wrapper = document.createElement('div');
                wrapper.className = 'flash flash-messages'; // Añadimos 'flash' para tus animaciones CSS

                // 2. Creamos el texto
                const p = document.createElement('p');
                
                // 3. Asignamos clases dinámicas según si es error o éxito
                if (item.category === 'error' || item.category === 'danger') {
                    p.className = 'error-msg'; // Clase original de tu login.css
                } else if (item.category === 'success') {
                    p.className = 'success-msg'; // Por si el usuario cierra sesión exitosamente
                } else {
                    p.className = 'warning-msg'; // Para el "Debes iniciar sesión para acceder"
                }
                
                // CORRECCIÓN VITAL: usamos .message (en inglés, como lo manda Flask)
                p.textContent = item.message; 
                
                // 4. Armamos la estructura y la metemos al HTML
                wrapper.appendChild(p);
                container.appendChild(wrapper);

                // 5. Lógica de desaparición incorporada aquí mismo (Asíncrona)
                setTimeout(() => {
                    wrapper.classList.add('hide');
                    // Esperamos a que la animación CSS termine (ej. 500ms) y lo borramos del DOM
                    setTimeout(() => {
                        wrapper.remove();
                    }, 500); 
                }, 3000);
            });
        })
        .catch(error => console.error('Error verificando alertas:', error));
}