console.log("app.js cargado correctamente");

// Clase Producto
class Producto {
  constructor(id, nombre, categoria, precio, descuento = 0, stock = 0) {
    this.id = id;
    this.nombre = nombre.toUpperCase();
    this.categoria = categoria.toUpperCase();
    this.precio = parseFloat(precio);
    this.descuento = parseFloat(descuento);
    this.stock = parseInt(stock);
    this.imagen = "";
    this.colores = [];
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

// Cargar productos base con imagen y colores
function cargarProductosBase() {
  productos = [
    new Producto(1, "Remera rayada", "Ropa", 8000, 0, 10),
    new Producto(2, "Conjunto", "Ropa", 12500, 0, 5),
    new Producto(3, "Campera Ecocuero", "Ropa", 28000, 0, 8)
  ];

  productos[0].imagen = "assets/remera.webp";
  productos[0].colores = ["#607d8b", "#795548"];

  productos[1].imagen = "assets/conjunto.webp";
  productos[1].colores = ["#ff6384", "#000", "#fff"];

  productos[2].imagen = "assets/campera.webp";
  productos[2].colores = ["#000", "#fff"];

  productos.forEach(p => p.aplicarIVA());
}

// Guardar y obtener localStorage
function guardarEnLocalStorage(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

function obtenerDeLocalStorage(clave) {
  return JSON.parse(localStorage.getItem(clave));
}

// Crear círculo de color
function crearColorCircle(color) {
  const span = document.createElement("span");
  span.className = "color-circle selectable";
  span.style.backgroundColor = color;
  if (color.toLowerCase() === "#fff" || color.toLowerCase() === "white") {
    span.style.border = "1px solid #ccc";
  }
  span.style.cursor = "pointer";
  return span;
}

// Crear tarjeta producto 
function crearTarjetaProducto(prod) {
  const article = document.createElement("article");
  article.className = "col-12 col-sm-6 col-lg-4";

  const card = document.createElement("section");
  card.className = "card h-100 shadow-sm";

  // Imagen
  const img = document.createElement("img");
  img.src = prod.imagen;
  img.alt = prod.nombre;
  img.className = "card-img-top";

  // Colores
  const coloresContainer = document.createElement("section");
  coloresContainer.className = "color-options d-flex justify-content-center gap-2 my-2";

  let colorSeleccionado = null;

  prod.colores.forEach(color => {
    const colorSpan = crearColorCircle(color);

    colorSpan.addEventListener("click", () => {
      // Deseleccionar todos los colores
      coloresContainer.querySelectorAll(".color-circle").forEach(c => c.classList.remove("selected"));
      // Seleccionar este
      colorSpan.classList.add("selected");
      colorSeleccionado = color;
    });

    coloresContainer.appendChild(colorSpan);
  });

  // Cuerpo tarjeta
  const cardBody = document.createElement("section");
  cardBody.className = "card-body text-center";

  const titulo = document.createElement("h5");
  titulo.className = "card-title";
  titulo.textContent = prod.nombre;

  const precio = document.createElement("p");
  precio.className = "card-text";
  precio.textContent = `$${prod.precioFinal().toFixed(2)}`;

  const btnAgregar = document.createElement("button");
  btnAgregar.className = "btn btn-primary btn-agregar";
  btnAgregar.textContent = "Agregar al carrito";

  btnAgregar.addEventListener("click", () => {
    if (!colorSeleccionado) {
      alert("Por favor, seleccioná un color antes de agregar al carrito.");
      return;
    }
    let cantidad = prompt("¿Cuántas unidades querés agregar?", "1");
    cantidad = parseInt(cantidad);
    if (!cantidad || cantidad < 1) {
      alert("Cantidad inválida.");
      return;
    }
    agregarAlCarrito(prod.id, colorSeleccionado, cantidad);
  });

  // Armar estructura
  cardBody.appendChild(titulo);
  cardBody.appendChild(precio);
  cardBody.appendChild(btnAgregar);

  card.appendChild(img);
  card.appendChild(coloresContainer);
  card.appendChild(cardBody);

  article.appendChild(card);

  return article;
}

// Mostrar catálogo
function mostrarCatalogo(lista) {
  const contenedor = document.getElementById("catalogo");
  contenedor.innerHTML = ""; // Limpio contenedor

  lista.forEach(prod => {
    const tarjeta = crearTarjetaProducto(prod);
    contenedor.appendChild(tarjeta);
  });
}

// Agregar al carrito
function agregarAlCarrito(id, color, cantidad) {
  const prod = productos.find(p => p.id === id);
  if (!prod) return;

  const itemExistente = carrito.find(item => item.id === id && item.color === color);
  if (itemExistente) {
    itemExistente.cantidad += cantidad;
  } else {
    carrito.push({ id, color, cantidad, producto: prod });
  }
  guardarEnLocalStorage("carrito", carrito);
  actualizarContadorCarrito();
  mostrarCarrito();  // Mostrar el carrito automáticamente cuando agregas
  abrirModal();
}

// Actualizar contador carrito
function actualizarContadorCarrito() {
  const contador = document.getElementById("contadorCarrito");
  const totalCantidad = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  contador.textContent = totalCantidad;
}

// Mostrar carrito en modal
function mostrarCarrito() {
  const carritoContainer = document.getElementById("carritoContainer");
  carritoContainer.innerHTML = "";

  if (carrito.length === 0) {
    carritoContainer.textContent = "El carrito está vacío.";
    return;
  }

  let total = 0;

  carrito.forEach((item, index) => {
    if (!item.producto) return; // seguridad

    const precioItem = item.producto.precioFinal() * item.cantidad;
    total += precioItem;

    const div = document.createElement("div");
    div.className = "carrito-item d-flex justify-content-between align-items-center border-bottom py-2";

    div.innerHTML = `
      <div>
        <strong>${item.producto.nombre}</strong> - Color: 
        <span class="color-circle" style="background-color:${item.color}; border:1px solid #ccc; display:inline-block; width:15px; height:15px; vertical-align:middle; margin-left:5px;"></span> - 
        Cantidad: ${item.cantidad}
      </div>
      <div>
        <span>Precio: $${precioItem.toFixed(2)}</span>
        <button class="btn btn-sm btn-danger ms-3">Eliminar</button>
      </div>
    `;

    div.querySelector("button").addEventListener("click", () => {
      carrito.splice(index, 1);
      guardarEnLocalStorage("carrito", carrito);
      actualizarContadorCarrito();
      mostrarCarrito();
    });

    carritoContainer.appendChild(div);
  });

  // Agregar total al final
  const divTotal = document.createElement("div");
  divTotal.className = "total-carrito mt-3 text-end fw-bold fs-5";
  divTotal.textContent = `Total: $${total.toFixed(2)}`;
  carritoContainer.appendChild(divTotal);
}

// Abrir y cerrar modal carrito
function abrirModal() {
  const modal = document.getElementById("modalCarrito");
  modal.style.display = "block";
  mostrarCarrito();
}

function cerrarModal() {
  const modal = document.getElementById("modalCarrito");
  modal.style.display = "none";
}

// Inicialización y eventos
document.addEventListener("DOMContentLoaded", () => {
  const prodsLS = obtenerDeLocalStorage("productos");
  if (prodsLS && prodsLS.length > 0) {
    productos = prodsLS.map(p => {
      const prod = new Producto(p.id, p.nombre, p.categoria, p.precio, p.descuento, p.stock);
      prod.imagen = p.imagen || "";
      prod.colores = p.colores || [];
      return prod;
    });
  } else {
    cargarProductosBase();
    guardarEnLocalStorage("productos", productos);
  }

  // Cargar carrito y reconstruir la propiedad producto
  carrito = obtenerDeLocalStorage("carrito") || [];
  carrito = carrito.map(item => {
    const prod = productos.find(p => p.id === item.id);
    return {
      id: item.id,
      color: item.color,
      cantidad: item.cantidad,
      producto: prod || null
    };
  });

  mostrarCatalogo(productos);
  actualizarContadorCarrito();

  // Mostrar modal al clickear icono carrito
  document.getElementById("iconoCarrito").addEventListener("click", abrirModal);

  // Cerrar modal al clickear la X
  document.getElementById("cerrarModal").addEventListener("click", cerrarModal);

  // Cerrar modal al hacer click fuera del contenido
  window.addEventListener("click", e => {
    const modal = document.getElementById("modalCarrito");
    if (e.target === modal) {
      cerrarModal();
    }
  });
});
