// Clase Producto
class Producto {
    constructor(id, nombre, categoria, precio, descuento = 0, stock = 0) {
        this.id = id;
        this.nombre = nombre.toUpperCase();
        this.categoria = categoria.toUpperCase();
        this.precio = parseFloat(precio);
        this.descuento = parseFloat(descuento); // porcentaje
        this.stock = parseInt(stock);
    }

    aplicarIVA() {
        this.precio *= 1.21;
    }

    precioFinal() {
        return this.precio - (this.precio * (this.descuento / 100));
    }
}

// Variables globales
let productos = [];
let carrito = [];

// Cargar datos iniciales
function cargarProductosBase() {
    productos = [
        new Producto(1, "Remera básica", "Ropa", 10500, 0, 10),
        new Producto(2, "Pantalón Cargo", "Ropa", 19000, 0, 5),
        new Producto(3, "Zapatillas Urbanas", "Calzado", 27500, 10, 8),
        new Producto(4, "Mochila Urbana", "Accesorios", 20500, 0, 3),
        new Producto(5, "Campera Rompeviento", "Ropa", 32000, 15, 4)
    ];
    productos.forEach(p => p.aplicarIVA());
}

//helper function para guardar datos en LocalStorage
function guardarEnLocalStorage(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

function obtenerDeLocalStorage(clave) {
    return JSON.parse(localStorage.getItem(clave));
}

// Generar catálogo
function mostrarCatalogo(lista) {
    const contenedor = document.getElementById("catalogo");
    contenedor.innerHTML = "";

    lista.forEach(prod => {
        let card = document.createElement("div");
        card.className = "col-md-4";
        card.innerHTML = `
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">${prod.nombre}</h5>
                    <p class="card-text">Categoría: ${prod.categoria}</p>
                    <p class="card-text">Precio: $${prod.precioFinal().toFixed(2)}</p>
                    <p class="card-text">Stock: ${prod.stock}</p>
                    <button class="btn btn-primary btn-agregar" data-id="${prod.id}">Agregar al carrito</button>
                </div>
            </div>
        `;
        contenedor.appendChild(card);
    });

    // Eventos para botones de agregar
    document.querySelectorAll(".btn-agregar").forEach(btn => {
        btn.addEventListener("click", e => {
            let id = parseInt(e.target.getAttribute("data-id"));
            agregarAlCarrito(id);
        });
    });
}

// Carrito
function agregarAlCarrito(id) {
    let prod = productos.find(p => p.id === id);
    if (!prod) return;

    let existe = carrito.some(p => p.id === id);
    if (existe) {
        alert("Este producto ya está en el carrito");
        return;
    }

    carrito.push(prod);
    guardarEnLocalStorage("carrito", carrito);
    actualizarContadorCarrito();
}

function mostrarCarrito() {
    const contenedor = document.getElementById("contenidoCarrito");
    contenedor.innerHTML = "";

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p>El carrito está vacío.</p>";
        return;
    }

    let total = carrito.reduce((acc, prod) => acc + prod.precioFinal(), 0);

    carrito.forEach(prod => {
        let div = document.createElement("div");
        div.className = "d-flex justify-content-between align-items-center border-bottom py-2";
        div.innerHTML = `
            <span>${prod.nombre}</span>
            <span>$${prod.precioFinal().toFixed(2)}</span>
        `;
        contenedor.appendChild(div);
    });

    let totalDiv = document.createElement("div");
    totalDiv.className = "mt-3 fw-bold";
    totalDiv.textContent = `Total: $${total.toFixed(2)}`;
    contenedor.appendChild(totalDiv);
}

function actualizarContadorCarrito() {
    document.getElementById("contadorCarrito").textContent = carrito.length;
}

// Administrador: agregar producto
function agregarProductoDesdeFormulario() {
    const nombre = document.getElementById("nombreProducto").value;
    const categoria = document.getElementById("categoriaProducto").value;
    const precio = document.getElementById("precioProducto").value;
    const descuento = document.getElementById("descuentoProducto").value;
    const stock = document.getElementById("stockProducto").value;

    if (!nombre || !categoria || !precio) {
        alert("Completa los campos obligatorios");
        return;
    }

    const id = productos.length ? productos[productos.length - 1].id + 1 : 1;
    const nuevoProd = new Producto(id, nombre, categoria, precio, descuento, stock);
    nuevoProd.aplicarIVA();
    productos.push(nuevoProd);

    guardarEnLocalStorage("productos", productos);
    mostrarCatalogo(productos);
}

// Filtros y búsquedas
function filtrarPorNombre(texto) {
    const resultado = productos.filter(p => p.nombre.includes(texto.toUpperCase()));
    if (resultado.length > 0) {
        mostrarCatalogo(resultado);
    } else {
        document.getElementById("catalogo").innerHTML = "<p>No hay productos que coincidan con la búsqueda.</p>";
    }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    // Cargar productos de localStorage o base inicial
    if (obtenerDeLocalStorage("productos")) {
        productos = obtenerDeLocalStorage("productos");
    } else {
        cargarProductosBase();
    }

    // Cargar carrito si existe
    if (obtenerDeLocalStorage("carrito")) {
        carrito = obtenerDeLocalStorage("carrito");
    }

    mostrarCatalogo(productos);
    actualizarContadorCarrito();

    // Eventos
    document.getElementById("iconoCarrito").addEventListener("click", mostrarCarrito);
    document.getElementById("finalizarCompra").addEventListener("click", () => {
        alert("Compra finalizada. ¡Gracias!");
        carrito = [];
        guardarEnLocalStorage("carrito", carrito);
        actualizarContadorCarrito();
        mostrarCarrito();
    });

    // Si tenés formulario de admin
    if (document.getElementById("formAdmin")) {
        document.getElementById("formAdmin").addEventListener("submit", e => {
            e.preventDefault();
            agregarProductoDesdeFormulario();
        });
    }

    // Si tenés barra de búsqueda
    if (document.getElementById("busqueda")) {
        document.getElementById("busqueda").addEventListener("input", e => {
            filtrarPorNombre(e.target.value);
        });
    }
});
