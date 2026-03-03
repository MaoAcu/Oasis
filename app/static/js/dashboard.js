document.addEventListener('DOMContentLoaded', function() {
    console.log("Dashboard del Bar Oasis cargado."); 
    // VISTA INICIAL: Forzamos el inventario visible y usuarios ocultos
    const secInventario = document.getElementById('section-inventario');
    const secUsuarios = document.getElementById('section-usuarios');
    if (secInventario) secInventario.style.display = 'block';
    if (secUsuarios) secUsuarios.style.display = 'none';

    cargarProductos(); 
    cargarNotificaciones();
});

// ==========================================
// 0. NOTIFICACIONES Y MENSAJES FLASH
// ==========================================
function cargarNotificaciones() {
    fetch('/api/mensajes')
        .then(res => res.json())
        .then(data => {
            data.forEach(item => mostrarNotificacionDinamica(item.message, item.category));
        }).catch(err => console.error('Error notificaciones:', err));
}

function mostrarNotificacionDinamica(mensaje, tipo) {
    const container = document.getElementById('flash-container');
    const alerta = document.createElement('div');
    alerta.className = `flash-messages flash-${tipo === 'success' ? 'success' : 'warning'}`;
    alerta.textContent = mensaje;
    container.appendChild(alerta);
    setTimeout(() => {
        alerta.style.opacity = '0';
        setTimeout(() => alerta.remove(), 500);
    }, 5000);
}

// ==========================================
// 1. GESTIÓN DEL MENÚ (INVENTARIO)
// ==========================================
function cargarProductos() {
    fetch('/api/productos')
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('tabla-productos-body');
            tbody.innerHTML = ''; 
            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Menú vacío.</td></tr>';
                return;
            }
            const cats = {'1': 'Cervezas', '2': 'Licor', '4': 'Para Picar', '5': 'Bebidas sin Licor'};
            data.forEach(item => {
                tbody.innerHTML += `
                    <tr>
                        <td><strong>${item.nombre}</strong></td>
                        <td><span class="category-badge">${cats[item.categoria] || item.categoria}</span></td> 
                        <td class="price-tag">C$ ${item.precio.toFixed(2)}</td>
                        <td class="actions-cell">
                            <button class="btn-action btn-edit-gray" onclick="abrirModalEditar('${item.id}')">Editar</button>
                            <button class="btn-action btn-delete-red" onclick="abrirModalEliminar('${item.id}', '${item.nombre}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>`;
            });
        });
}

// ==========================================
// 2. CRUD PREMIUM (USUARIOS)
// ==========================================
function cargarUsuarios() {
    fetch('/api/usuarios')
        .then(res => res.json())
        .then(usuarios => {
            const tabla = document.getElementById('tabla-usuarios-body');
            tabla.innerHTML = '';
            usuarios.forEach(u => {
                tabla.innerHTML += `
                    <tr>
                        <td>${u.username}</td>
                        <td><span class="category-badge">${u.role}</span></td>
                        <td class="actions-cell">
                            <button class="btn-action btn-edit-gray" onclick="prepararEdicionUsuario(${u.id}, '${u.username}', '${u.role}')">Editar</button>
                            <button class="btn-action btn-delete-red" onclick="eliminarUsuario(${u.id})">Eliminar</button>
                        </td>
                    </tr>`;
            });
        });
}

function abrirModalUsuario() {
    document.getElementById('formUsuario').reset();
    document.getElementById('user_id').value = '';
    document.getElementById('tituloModalUsuario').innerText = 'Nuevo Acceso';
    document.getElementById('req_pass').style.display = 'inline';
    document.getElementById('help_pass').style.display = 'none';
    
    // Resetear visibilidad de contraseña al abrir
    resetearVisibilidadPassword();
    
    document.getElementById('modalUsuario').style.display = 'flex';
}

function cerrarModalUsuario() {
    document.getElementById('modalUsuario').style.display = 'none';
    // BLINDAJE: Siempre ocultar la contraseña al cerrar por seguridad
    resetearVisibilidadPassword();
}

function prepararEdicionUsuario(id, username, role) {
    abrirModalUsuario();
    document.getElementById('user_id').value = id;
    document.getElementById('user_username').value = username;
    document.getElementById('user_role').value = role;
    document.getElementById('tituloModalUsuario').innerText = 'Editar Acceso';
    document.getElementById('req_pass').style.display = 'none';
    document.getElementById('help_pass').style.display = 'block';
}

function guardarUsuario(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const id = formData.get('id');
    const url = id ? '/api/usuario/editar' : '/api/usuario/crear';

    fetch(url, { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
        mostrarNotificacionDinamica(data.message, data.status);
        if (data.status === 'success') {
            cerrarModalUsuario();
            cargarUsuarios();
        }
    });
}

function eliminarUsuario(id) {
    if(confirm("¿Seguro que deseas eliminar este acceso?")) {
        fetch(`/api/usuario/eliminar/${id}`, { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                mostrarNotificacionDinamica(data.message, data.status);
                cargarUsuarios();
            });
    }
}

/**
 * LÓGICA DE VISIBILIDAD DE CONTRASEÑA
 */
function alternarVisibilidadPassword() {
    const inputPass = document.getElementById('user_password');
    const icono = document.getElementById('icon-eye');

    if (inputPass.type === "password") {
        inputPass.type = "text";
        icono.classList.remove('fa-eye');
        icono.classList.add('fa-eye-slash');
    } else {
        inputPass.type = "password";
        icono.classList.remove('fa-eye-slash');
        icono.classList.add('fa-eye');
    }
}

function resetearVisibilidadPassword() {
    const inputPass = document.getElementById('user_password');
    const icono = document.getElementById('icon-eye');
    if(inputPass && icono) {
        inputPass.type = "password";
        icono.classList.remove('fa-eye-slash');
        icono.classList.add('fa-eye');
    }
}

// ==========================================
// 3. NAVEGACIÓN Y VISIBILIDAD
// ==========================================
function mostrarSeccionUsuarios() {
    document.getElementById('section-inventario').style.display = 'none';
    document.getElementById('section-usuarios').style.display = 'block';
    actualizarActiveSidebar('usuarios');
    cargarUsuarios();
}

function mostrarSeccionInventario() {
    document.getElementById('section-usuarios').style.display = 'none';
    document.getElementById('section-inventario').style.display = 'block';
    actualizarActiveSidebar('inventario');
}

function actualizarActiveSidebar(seccion) {
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    if (seccion === 'usuarios') {
        const link = document.querySelector('a[onclick="mostrarSeccionUsuarios()"]');
        if(link) link.classList.add('active');
    } else {
        const link = document.querySelector('a[onclick="mostrarSeccionInventario()"]');
        if(link) link.classList.add('active');
    }
}

// Funciones básicas de modales de productos
function abrirModal() { document.getElementById('modalCrear').style.display = 'flex'; }
function cerrarModalCrear() { document.getElementById('modalCrear').style.display = 'none'; }

// Cierre global al hacer clic fuera
window.onclick = function(event) {
    const modals = ['modalCrear', 'modalUsuario', 'modalEditar', 'modalEliminar'];
    modals.forEach(id => {
        const m = document.getElementById(id);
        if (m && event.target == m) {
            if (id === 'modalUsuario') cerrarModalUsuario();
            else m.style.display = "none";
        }
    });
}