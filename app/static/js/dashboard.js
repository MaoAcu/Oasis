
        // ===== CONFIGURACIÓN INICIAL =====
        const nombresCategoria = {
            '1': 'cerveza',
            '2': 'licor',
            '3': 'tabaco',
            '4': 'para-picar',
            '5': 'bebidas-sin-licor'
        };

        // ===== DATOS DE EJEMPLO (ajustados a los nombres de categoría) =====
        let categorias = [
            { id: 1, nombre: 'Cerveza', icono: 'fa-beer', slug: '1' },
            { id: 2, nombre: 'Licor', icono: 'fa-wine-bottle', slug: '2' },
            { id: 3, nombre: 'Tabaco', icono: 'fa-smoking', slug: '3' },
            { id: 4, nombre: 'Para picar', icono: 'fa-bowl-food', slug: '4' },
            { id: 5, nombre: 'Bebidas sin licor', icono: 'fa-wine-glass-alt', slug: '5' }
        ];

        let productos = [];
        let currentSection = 'categorias';
        let editingItem = null;
        let editingCategoria = null;
        let deleteCallback = null;
        let selectedImageFile = null;

        // ===== FUNCIONES DE LOADER =====
        function showLoader() {
            document.getElementById('loader').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function hideLoader() {
            document.getElementById('loader').classList.add('hidden');
            document.body.style.overflow = '';
        }

        // ===== FUNCIONES DE MODALES =====
        function showInfoModal(title, message, icon = 'check-circle') {
            document.getElementById('infoModalIcon').innerHTML = `<i class="fas fa-${icon}"></i>`;
            document.getElementById('infoModalTitle').textContent = title;
            document.getElementById('infoModalMessage').textContent = message;
            document.getElementById('infoModal').classList.add('active');
        }

        function closeInfoModal() {
            document.getElementById('infoModal').classList.remove('active');
        }

        function showDeleteModal(title, message, callback) {
            document.getElementById('deleteModalTitle').textContent = title;
            document.getElementById('deleteModalMessage').textContent = message;
            deleteCallback = callback;
            
            const confirmBtn = document.getElementById('confirmDeleteBtn');
            const newBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
            newBtn.addEventListener('click', function() {
                if (deleteCallback) {
                    deleteCallback();
                    closeDeleteModal();
                }
            });
            
            document.getElementById('deleteModal').classList.add('active');
        }

        function closeDeleteModal() {
            document.getElementById('deleteModal').classList.remove('active');
            deleteCallback = null;
        }

        // ===== FUNCIONES DE CARGA DE DATOS =====
        async function cargarMenu() {
            showLoader();
            try {
                const response = await fetch('/menu/getmenu');
                if (!response.ok) throw new Error('Error al obtener el menú');
                const data = await response.json();
                productos = data.map(item => ({
                    id: item.idmenu,
                    nombre: item.nombre,
                    descripcion: item.descripcion,
                    precio: Number(item.precio),
                    categoria: item.categoria,
                    imagen: item.imagen ? `${URL_IMG_BASE}${item.imagen}` : URL_IMG_DEFAULT,
                    destacado: Boolean(item.destacado),
                    status: item.estado === '1' ? 'active' : 'inactive'
                }));
                if (currentSection === 'categorias') {
                    renderCategorias();
                } else if (currentSection !== 'config') {
                    renderProductos(currentSection);
                }
                hideLoader();
                return productos;
            } catch (error) {
                console.error('Error cargando menú:', error);
                productos = [];
                hideLoader();
                return [];
            }
        }

        // ===== FUNCIONES DE CATEGORÍAS =====
        function renderCategorias() {
            const grid = document.getElementById('categoriasGrid');
            const lista = document.getElementById('categoriasList');
            
            grid.innerHTML = categorias.map(cat => `
                <div class="categoria-card">
                    <div class="categoria-icon">
                        <i class="fas ${cat.icono}"></i>
                    </div>
                    <div class="categoria-info">
                        <h4>${cat.nombre}</h4>
                        <p>${productos.filter(p => p.categoria === cat.slug).length} productos</p>
                    </div>
                    <div class="categoria-actions">
                        <button class="btn-edit" onclick="openCategoriaModal(${cat.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="confirmDeleteCategoria(${cat.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');

            lista.innerHTML = categorias.map(cat => `
                <li data-section="${cat.slug}">
                    <i class="fas ${cat.icono}"></i>
                    <span>${cat.nombre}</span>
                </li>
            `).join('') + `
                <li class="sidebar-divider" style="height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); margin: 15px 20px; pointer-events: none;"></li>
                <div class="sidebar-section-title">ADMINISTRACIÓN</div>
                <li id="menuCategorias" data-section="categorias">
                    <i class="fas fa-folder"></i>
                    <span>Gestionar Categorías</span>
                </li>
                <li data-section="config">
                    <i class="fas fa-cog"></i>
                    <span>Configuración</span>
                </li>
            `;

            asignarEventosSidebar();
        }

        function asignarEventosSidebar() {
            document.querySelectorAll('#categoriasList li').forEach(item => {
                item.addEventListener('click', (e) => {
                    const section = e.currentTarget.dataset.section;
                    switchSection(section);
                    if (window.innerWidth <= 768) toggleSidebar(false);
                });
            });

            const menuCategorias = document.getElementById('menuCategorias');
            if (menuCategorias) {
                menuCategorias.addEventListener('click', () => {
                    switchSection('categorias');
                    if (window.innerWidth <= 768) toggleSidebar(false);
                });
            }

            const configItem = document.querySelector('[data-section="config"]');
            if (configItem) {
                configItem.addEventListener('click', () => {
                    switchSection('config');
                    if (window.innerWidth <= 768) toggleSidebar(false);
                });
            }
        }

        function openCategoriaModal(id = null) {
            editingCategoria = id ? categorias.find(c => c.id === id) : null;
            document.getElementById('categoriaModalTitle').textContent = editingCategoria ? 'Editar Categoría' : 'Nueva Categoría';
            document.getElementById('categoriaId').value = editingCategoria?.id || '';
            document.getElementById('categoriaNombre').value = editingCategoria?.nombre || '';
            document.getElementById('categoriaIcono').value = editingCategoria?.icono || 'fa-beer';
            document.getElementById('categoriaModal').classList.add('active');
        }

        function closeCategoriaModal() {
            document.getElementById('categoriaModal').classList.remove('active');
            editingCategoria = null;
        }

        function saveCategoria(e) {
            e.preventDefault();
            const id = document.getElementById('categoriaId').value;
            const nombre = document.getElementById('categoriaNombre').value;
            const icono = document.getElementById('categoriaIcono').value;
            const slug = nombre.toLowerCase().replace(/\s+/g, '-');

            if (id) {
                const index = categorias.findIndex(c => c.id === parseInt(id));
                categorias[index] = { ...categorias[index], nombre, icono, slug };
                showInfoModal('Éxito', 'Categoría actualizada correctamente');
            } else {
                const newId = Math.max(...categorias.map(c => c.id), 0) + 1;
                categorias.push({ id: newId, nombre, icono, slug });
                showInfoModal('Éxito', 'Categoría creada correctamente');
            }

            closeCategoriaModal();
            renderCategorias();
            if (currentSection === 'categorias') {
                document.getElementById('categoriasSection').style.display = 'block';
            }
        }

        function confirmDeleteCategoria(id) {
            const categoria = categorias.find(c => c.id === id);
            const productosEnCategoria = productos.filter(p => p.categoria === categoria.slug);
            
            if (productosEnCategoria.length > 0) {
                showInfoModal('No se puede eliminar', 'Esta categoría tiene productos asociados', 'exclamation-triangle');
                return;
            }

            showDeleteModal(
                '¿Eliminar categoría?',
                `¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`,
                () => {
                    categorias = categorias.filter(c => c.id !== id);
                    renderCategorias();
                    showInfoModal('Éxito', 'Categoría eliminada correctamente');
                    if (currentSection === categoria.slug) {
                        switchSection('categorias');
                    }
                }
            );
        }

        // ===== FUNCIONES DE PRODUCTOS =====
        function renderProductos(categoria) {
            const container = document.getElementById('productosSection');
            const items = productos.filter(p => p.categoria === categoria);
            const cat = categorias.find(c => c.slug === categoria);
            
            container.innerHTML = `
                <div class="content-section" style="display: block;">
                    <div class="section-header">
                        <h2><i class="fas ${cat?.icono || 'fa-utensils'}"></i> ${cat?.nombre || categoria}</h2>
                        <button class="btn-add-item" onclick="openItemModal(null, '${categoria}')">
                            <i class="fas fa-plus"></i> Agregar Producto
                        </button>
                    </div>
                    <div class="items-grid">
                        ${items.map(item => createItemCard(item)).join('')}
                        ${items.length === 0 ? '<p style="text-align: center; padding: 40px; grid-column: 1/-1; color: var(--text-soft);">No hay productos en esta categoría</p>' : ''}
                    </div>
                </div>
            `;
        }

        function createItemCard(item) {
            const estrellaDestacado = item.destacado ? 
                '<span class="destacado-badge"><i class="fas fa-star"></i> Destacado</span>' : '';
            
            return `
                <div class="item-card">
                    <div class="item-image">
                        <img src="${item.imagen}" alt="${item.nombre}" onerror="this.src='${URL_IMG_DEFAULT}'">
                        ${estrellaDestacado}
                    </div>
                    <div class="item-info">
                        <div class="item-header">
                            <h3 class="item-name">${item.nombre}</h3>
                            <span class="item-price">₡${item.precio.toFixed(2)}</span>
                        </div>
                        <p class="item-description">${item.descripcion}</p>
                        <div class="item-status">
                            <span class="status-badge ${item.status}">
                                <i class="fas fa-${item.status === 'active' ? 'check' : 'pause'}"></i>
                                ${item.status === 'active' ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <div class="item-actions">
                            <button class="btn-edit" onclick="openItemModal(${item.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn-delete" onclick="confirmDeleteItem(${item.id})">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        function actualizarEstrellaSimple(valor) {
            const estrella = document.getElementById('estrellaSimple');
            if (!estrella) return;
            
            const icon = estrella.querySelector('i');
            const text = document.getElementById('destacadoText');
            const input = document.getElementById('itemDestacado');
            
            if (!icon || !text || !input) return;
            
            input.value = valor;
            
            if (valor == 1) {
                estrella.classList.add('activado');
                icon.className = 'fas fa-star';
                text.textContent = 'Destacado ⭐';
            } else {
                estrella.classList.remove('activado');
                icon.className = 'far fa-star';
                text.textContent = 'No destacado';
            }
        }

        function resetImageUpload() {
            const fileInput = document.getElementById('itemImageFile');
            if (fileInput) fileInput.value = '';
            
            const preview = document.querySelector('#imagePreview img');
            if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }
            
            const fileName = document.getElementById('imageFileName');
            if (fileName) fileName.textContent = '';
            
            selectedImageFile = null;
        }

        function handleImageSelect(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                showInfoModal('Error', 'Formato no válido. Use JPG, PNG o WEBP', 'exclamation-triangle');
                return;
            }
            
            document.getElementById('imageFileName').textContent = file.name;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.querySelector('#imagePreview img');
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
            
            selectedImageFile = file;
        }

        function openItemModal(id = null, categoriaDefault = null) {
            editingItem = id ? productos.find(p => p.id === id) : null;
            
            document.getElementById('modalTitle').textContent = editingItem ? 'Editar Producto' : 'Nuevo Producto';
            document.getElementById('itemId').value = editingItem?.id || '';
            document.getElementById('itemName').value = editingItem?.nombre || '';
            document.getElementById('itemDescription').value = editingItem?.descripcion || '';
            document.getElementById('itemPrice').value = editingItem?.precio || '';
            
            // Llenar select de categorías
            const categoriaSelect = document.getElementById('categoria');
            categoriaSelect.innerHTML = '<option value="">Seleccionar categoría</option>' +
                categorias.map(cat => `<option value="${cat.slug}">${cat.nombre}</option>`).join('');
            categoriaSelect.value = editingItem?.categoria || categoriaDefault || '';
            
            const status = editingItem?.status || 'active';
            document.getElementById('itemStatus').value = status;
            document.querySelectorAll('.status-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.status === status) btn.classList.add('active');
            });
            
            const destacado = editingItem?.destacado ? 1 : 0;
            actualizarEstrellaSimple(destacado);
            
            resetImageUpload();
            
            if (editingItem?.imagen && editingItem.imagen !== URL_IMG_DEFAULT) {
                const preview = document.querySelector('#imagePreview img');
                if (preview) {
                    preview.src = editingItem.imagen;
                    preview.style.display = 'block';
                }
                const fileName = document.getElementById('imageFileName');
                if (fileName) fileName.textContent = `📁 ${editingItem.imagen.split('/').pop()}`;
            }
            
            document.getElementById('editModal').classList.add('active');
        }

        function closeItemModal() {
            document.getElementById('editModal').classList.remove('active');
            editingItem = null;
        }

        function saveItem(e) {
            e.preventDefault();
            
            const id = document.getElementById('itemId').value;
            const nombre = document.getElementById('itemName').value;
            const descripcion = document.getElementById('itemDescription').value;
            const categoria = document.getElementById('categoria').value;
            const precio = parseFloat(document.getElementById('itemPrice').value);
            const estado = document.getElementById('itemStatus').value;
            const destacado = document.getElementById('itemDestacado').value;
            
            if (!nombre || !precio || !categoria) {
                showInfoModal('Error', 'Nombre, precio y categoría son obligatorios', 'exclamation-triangle');
                return;
            }
            
            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('descripcion', descripcion);
            formData.append('precio', precio);
            formData.append('categoria', categoria);
            formData.append('estado', estado);
            formData.append('destacado', destacado);
            
            if (selectedImageFile) {
                formData.append('image', selectedImageFile);
            }
            
            const url = id ? `/menu/UpdateMenu/${id}` : '/menu/createItem';
            const method = id ? 'PATCH' : 'POST';
            
            fetch(url, {
                method: method,
                body: formData,
                credentials: 'same-origin'
            })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Error en la petición');
                return data;
            })
            .then(data => {
                showInfoModal('Éxito', id ? 'Producto actualizado' : 'Producto creado', 'check-circle');
                cargarMenu().then(() => {
                    closeItemModal();
                });
            })
            .catch(error => {
                console.error('Error:', error);
                showInfoModal('Error', error.message || 'No se pudo guardar', 'exclamation-triangle');
            });
        }

        function confirmDeleteItem(id) {
            const item = productos.find(p => p.id === id);
            showDeleteModal(
                '¿Eliminar producto?',
                `¿Estás seguro de eliminar "${item.nombre}"?`,
                () => {
                    fetch(`/menu/DeleteMenu/${id}`, {
                        method: 'DELETE',
                        credentials: 'same-origin'
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.error) {
                            showInfoModal('Error', data.error, 'exclamation-triangle');
                            return;
                        }
                        productos = productos.filter(p => p.id !== id);
                        showInfoModal('Éxito', 'Producto eliminado correctamente', 'check-circle');
                        if (currentSection !== 'categorias' && currentSection !== 'config') {
                            renderProductos(currentSection);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showInfoModal('Error', 'No se pudo eliminar', 'exclamation-triangle');
                    });
                }
            );
        }

        // ===== FUNCIONES DE NAVEGACIÓN =====
        function toggleSidebar(forceState) {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.sidebar-overlay');
            
            if (typeof forceState !== 'undefined') {
                window.isSidebarOpen = forceState;
            } else {
                window.isSidebarOpen = !window.isSidebarOpen;
            }
            
            if (window.isSidebarOpen) {
                sidebar.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        function switchSection(section) {
            currentSection = section;
            
            document.querySelectorAll('.sidebar-nav li').forEach(li => {
                li.classList.remove('active');
            });
            
            if (section === 'categorias') {
                document.getElementById('menuCategorias')?.classList.add('active');
            } else if (section === 'config') {
                document.querySelector('[data-section="config"]')?.classList.add('active');
            } else {
                document.querySelector(`[data-section="${section}"]`)?.classList.add('active');
            }

            const categoria = categorias.find(c => c.slug === section);
            document.getElementById('sectionTitle').textContent = categoria ? categoria.nombre : 
                section === 'categorias' ? 'Gestionar Categorías' : 
                section === 'config' ? 'Configuración' : '';

            document.getElementById('categoriasSection').style.display = section === 'categorias' ? 'block' : 'none';
            document.getElementById('configSection').style.display = section === 'config' ? 'block' : 'none';
            document.getElementById('productosSection').style.display = (section !== 'categorias' && section !== 'config') ? 'block' : 'none';
            document.getElementById('fabCategorias').style.display = 
                (section !== 'categorias' && section !== 'config') ? 'flex' : 'none';

            if (section !== 'categorias' && section !== 'config') {
                renderProductos(section);
            }
        }

        function loadConfigData() {
            document.getElementById('restaurantName').value = 'Bar Oasis';
            document.getElementById('restaurantDescription').value = 'Restaurante & Bar con la mejor gastronomía en un ambiente único';
            document.getElementById('restaurantHours').value = 'Lunes a Domingo: 9:00 - 22:00';
        }

        function saveConfig() {
            showInfoModal('Configuración', 'Configuración guardada correctamente');
        }

        // ===== INICIALIZACIÓN =====
        document.addEventListener('DOMContentLoaded', () => {
            // Elementos del DOM
            const menuToggle = document.getElementById('menuToggle');
            const overlay = document.querySelector('.sidebar-overlay');
            const btnNuevaCategoriaHeader = document.getElementById('btnNuevaCategoriaHeader');
            const categoriaForm = document.getElementById('categoriaForm');
            const itemForm = document.getElementById('itemForm');
            const saveConfigBtn = document.getElementById('saveConfigBtn');
            const logoutBtn = document.getElementById('logoutBtn');
            const fileInput = document.getElementById('itemImageFile');
            const estrellaBtn = document.getElementById('estrellaSimple');

            // Event listeners
            if (menuToggle) menuToggle.addEventListener('click', () => toggleSidebar());
            if (overlay) overlay.addEventListener('click', () => toggleSidebar(false));
            if (btnNuevaCategoriaHeader) btnNuevaCategoriaHeader.addEventListener('click', () => openCategoriaModal());
            if (categoriaForm) categoriaForm.addEventListener('submit', saveCategoria);
            if (itemForm) itemForm.addEventListener('submit', saveItem);
            if (saveConfigBtn) saveConfigBtn.addEventListener('click', saveConfig);
            
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showDeleteModal('Cerrar sesión', '¿Estás seguro de que deseas salir del sistema?', () => {
                        window.location.href = URL_LOG;
                    });
                });
            }

            if (fileInput) {
                fileInput.addEventListener('change', handleImageSelect);
            }

            if (estrellaBtn) {
                estrellaBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const destacadoInput = document.getElementById('itemDestacado');
                    const nuevoValor = destacadoInput.value == 1 ? 0 : 1;
                    actualizarEstrellaSimple(nuevoValor);
                });
            }

            // Status toggle
            document.querySelectorAll('.status-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const status = e.target.dataset.status;
                    document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    document.getElementById('itemStatus').value = status;
                });
            });

            // Cerrar modales al hacer clic fuera
            window.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    closeItemModal();
                    closeCategoriaModal();
                }
            });

            // Cargar datos iniciales
            loadConfigData();
            cargarMenu().then(() => {
                renderCategorias();
                switchSection('categorias');
            });
        });

        // Funciones globales
        window.openCategoriaModal = openCategoriaModal;
        window.closeCategoriaModal = closeCategoriaModal;
        window.openItemModal = openItemModal;
        window.closeItemModal = closeItemModal;
        window.closeDeleteModal = closeDeleteModal;
        window.closeInfoModal = closeInfoModal;
        window.confirmDeleteCategoria = confirmDeleteCategoria;
        window.confirmDeleteItem = confirmDeleteItem;
        window.switchSection = switchSection;