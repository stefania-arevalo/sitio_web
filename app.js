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
  
  const base = (typeof window !== 'undefined' && window.BASE) ? window.BASE : '';
  productos[0].imagen = `${base}assets/remera.webp`;
  productos[0].colores = ["#607d8b", "#795548"];

  productos[1].imagen = `${base}assets/conjunto.webp`;
  productos[1].colores = ["#ff6384", "#000", "#fff"];

  productos[2].imagen = `${base}assets/campera.webp`;
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

// Crear tarjeta producto con input cantidad y botón al lado
function crearTarjetaProducto(prod) {
  const article = document.createElement("article");
  article.className = "col-12 col-sm-6 col-lg-4 mb-3";

  const card = document.createElement("section");
  card.className = "card h-100 shadow-sm d-flex flex-column";

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

      // Ocultar mensaje error si estaba visible
      mensajeError.style.display = "none";
      mensajeStock.style.display = "none";
    });

    coloresContainer.appendChild(colorSpan);
  });

  // Cuerpo tarjeta
  const cardBody = document.createElement("section");
  cardBody.className = "card-body text-center d-flex flex-column justify-content-between flex-grow-1";

  const titulo = document.createElement("h5");
  titulo.className = "card-title";
  titulo.textContent = prod.nombre;

  const precio = document.createElement("p");
  precio.className = "card-text";
  precio.textContent = `$${prod.precioFinal().toFixed(2)}`;

  // Contenedor input cantidad y botón agregar
  const cantidadAgregarContainer = document.createElement("div");
  cantidadAgregarContainer.className = "d-flex justify-content-center align-items-center gap-2 mb-3";

  const inputCantidad = document.createElement("input");
  inputCantidad.type = "number";
  inputCantidad.min = "1";
  inputCantidad.value = "1";
  inputCantidad.style.width = "60px";
  inputCantidad.className = "form-control form-control-sm text-center";

  const btnAgregar = document.createElement("button");
  btnAgregar.className = "btn btn-primary btn-agregar";
  btnAgregar.textContent = "Agregar al carrito";

  cantidadAgregarContainer.appendChild(inputCantidad);
  cantidadAgregarContainer.appendChild(btnAgregar);

  // Mensajes de error
  const mensajeError = document.createElement("p");
  mensajeError.style.color = "red";
  mensajeError.style.fontSize = "0.9rem";
  mensajeError.style.display = "none";
  mensajeError.textContent = "Por favor, seleccioná un color antes de agregar al carrito.";

  const mensajeStock = document.createElement("p");
  mensajeStock.style.color = "red";
  mensajeStock.style.fontSize = "0.9rem";
  mensajeStock.style.display = "none";
  mensajeStock.textContent = "No hay stock suficiente para la cantidad solicitada.";

  // Evento agregar al carrito
  btnAgregar.addEventListener("click", () => {
    if (!colorSeleccionado) {
      mensajeError.style.display = "block";
      mensajeStock.style.display = "none";
      return;
    }
    let cantidad = parseInt(inputCantidad.value);
    if (!cantidad || cantidad < 1) {
      cantidad = 1;
      inputCantidad.value = "1";
    }
    // Verificar stock disponible
    // Cantidad ya en carrito para este producto y color
    const itemEnCarrito = carrito.find(item => item.id === prod.id && item.color === colorSeleccionado);
    const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
    const stockDisponible = prod.stock - cantidadEnCarrito;

    if (cantidad > stockDisponible) {
      mensajeStock.style.display = "block";
      mensajeError.style.display = "none";
      return;
    }

    mensajeError.style.display = "none";
    mensajeStock.style.display = "none";
    agregarAlCarrito(prod.id, colorSeleccionado, cantidad);
    inputCantidad.value = "1"; // reset cantidad
  });

  // Armar estructura
  cardBody.appendChild(titulo);
  cardBody.appendChild(precio);
  cardBody.appendChild(coloresContainer);
  cardBody.appendChild(cantidadAgregarContainer);
  cardBody.appendChild(mensajeError);
  cardBody.appendChild(mensajeStock);

  card.appendChild(img);
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
    if (!item.producto) return;

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

  const divTotal = document.createElement("div");
  divTotal.className = "total-carrito mt-3 text-end fw-bold fs-5";
  divTotal.textContent = `Total: $${total.toFixed(2)}`;
  carritoContainer.appendChild(divTotal);
}

// Mostrar mensaje dinámico
function mostrarMensaje(texto, tipo) {
  const contenedor = document.getElementById("mensaje");
  contenedor.innerHTML = `<div class="alert alert-${tipo === "error" ? "danger" : "success"}">${texto}</div>`;
  setTimeout(() => contenedor.innerHTML = "", 3000);
}

// Filtrar productos (BUSCADOR)
function filtrarProductos(termino) {
  const resultado = productos.filter(p => p.nombre.includes(termino.toUpperCase()));
  if (resultado.length > 0) {
    mostrarCatalogo(resultado);
  } else {
    mostrarMensaje("No se encontraron productos.", "error");
  }
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

  // Eventos modal carrito
  document.getElementById("iconoCarrito").addEventListener("click", abrirModal);
  document.getElementById("cerrarModal").addEventListener("click", cerrarModal);

  window.addEventListener("click", e => {
    const modal = document.getElementById("modalCarrito");
    if (e.target === modal) {
      cerrarModal();
    }
  });

  // Buscador con lupa
  const iconoBuscador = document.getElementById("iconoBuscador");
  const buscador = document.getElementById("buscador");

  if (iconoBuscador && buscador) {
    iconoBuscador.addEventListener("click", () => buscador.classList.toggle("d-none"));

    buscador.addEventListener("input", e => {
      const termino = e.target.value.trim();
      if (termino.length === 0) {
        mostrarCatalogo(productos);
      } else {
        filtrarProductos(termino);
      }
    });
  }
});
