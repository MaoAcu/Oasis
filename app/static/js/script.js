document.addEventListener('DOMContentLoaded', function() {
    cargarMenuPublico();
    iniciarTabs();
});

// Mapa: ID de base de datos (texto o número) -> ID del contenedor HTML
// Nota: Como en tu BD ahora 'categoria' es un texto ("1", "Bebidas", etc.), 
// asegúrate de que estas claves coincidan con lo que guarda el administrador.
const categoryMap = {
    '1': 'cerveza',
    '2': 'licor',
    '3': 'tabaco',
    '4': 'para-picar',
    '5': 'bebidas-sin-licor'
};

function cargarMenuPublico() {
    fetch('/api/productos')
        .then(response => response.json())
        .then(data => {
            // 1. Limpiar los mensajes de "Cargando..."
            Object.values(categoryMap).forEach(id => {
                const el = document.getElementById(id);
                if(el) el.innerHTML = '';
            });

            // 2. Insertar productos
            data.forEach(item => {
                // CORRECCIÓN: Usamos item.categoria (como lo envía Flask)
                const containerId = categoryMap[item.categoria];
                const container = document.getElementById(containerId);

                if (container) {
                    // PREVENCIÓN DE ERRORES: Escapar comillas simples
                    const safeName = item.nombre ? item.nombre.replace(/'/g, "\\'") : ''; 
                    const safeDesc = item.descripcion ? item.descripcion.replace(/'/g, "\\'") : ''; // Usamos item.descripcion

                    // Lógica del botón de imagen
                    let botonImagen = '';
                    if (item.img && item.img.trim() !== '' && item.img !== 'default.jpg') {
                        const imgPath = `/static/img/${item.img}`;
                        // CORRECCIÓN: Pasamos item.precio
                        botonImagen = `
                            <button class="btn-eye" onclick="verPlato('${safeName}', '${safeDesc}', '${item.precio}', '${imgPath}')">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFC107" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <span class="eye-text">Ver</span>
                            </button>
                        `;
                    }

                    // Crear la tarjeta HTML
                    // CORRECCIÓN: Mostramos item.precio y usamos item.descripcion
                    const card = `
                        <div class="menu-item">
                            <div class="item-info">
                                <h4 class="item-name">
                                    ${item.nombre}
                                    ${botonImagen}
                                </h4>
                                <p class="item-desc">${item.descripcion || ''}</p> 
                            </div>
                            <div class="item-price">C$ ${item.precio.toFixed(2)}</div> 
                        </div>
                    `;
                    
                    container.innerHTML += card;
                }
            });
        })
        .catch(err => console.error("Error cargando menú:", err));
}

// Lógica de Tabs (Pestañas) - Permanece igual
function iniciarTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.menu-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// Lógica del Modal (Ver Plato)
function verPlato(nombre, desc, precio, imgUrl) {
    const modal = document.getElementById('modalPlato');
    document.getElementById('tituloPlato').textContent = nombre;
    
    // Si no hay descripción, mostramos un mensaje por defecto o lo dejamos vacío
    document.getElementById('descPlato').textContent = desc ? desc : 'Un delicioso platillo de Bar Oasis.';
    
    document.getElementById('precioPlato').textContent = 'C$ ' + parseFloat(precio).toFixed(2);
    document.getElementById('imgPlato').src = imgUrl;
    
    modal.style.display = 'flex';
}

function cerrarPlato(event) {
    if (event) event.stopPropagation();
    if (event.target.id === 'modalPlato' || event.target.classList.contains('close-modal')) {
        document.getElementById('modalPlato').style.display = 'none';
    }
}