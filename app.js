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
  
  lista.forEach((prod, index) => {
    const tarjeta = crearTarjetaProducto(prod);
    //clases de Animate.css
    tarjeta.classList.add("animate__animated", "animate__fadeInUp");
    tarjeta.style.setProperty("--animate-delay", `${index * 0.1}s`); // retraso escalonado

    contenedor.appendChild(tarjeta); 
  });
}

//FILTROS Y ORDEN
const filtroCategoria = document.getElementById("filtroCategoria");
const ordenPrecio = document.getElementById("ordenPrecio");

function aplicarFiltros() {
  let lista = [...productos];

  // Filtro categoría
  if (filtroCategoria && filtroCategoria.value !== "todos") {
    lista = lista.filter(p => p.categoria === filtroCategoria.value);
  }

  // Orden por precio
  if (ordenPrecio) {
    if (ordenPrecio.value === "asc") {
      lista.sort((a, b) => a.precioFinal() - b.precioFinal());
    } else if (ordenPrecio.value === "desc") {
      lista.sort((a, b) => b.precioFinal() - a.precioFinal());
    }
  }

  mostrarCatalogo(lista);
}

if (filtroCategoria) filtroCategoria.addEventListener("change", aplicarFiltros);
if (ordenPrecio) ordenPrecio.addEventListener("change", aplicarFiltros);


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
  // ✅ Mostrar notificación Toastify
  Toastify({
    text: `${prod.nombre} agregado al carrito`,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: "#ff69b4"
  }).showToast();

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
        <span class="color-circle" style="background-color:${item.color}; border:1px solid #ccc; display:inline-block; width:15px; height:15px; vertical-align:middle; margin-left:5px;"></span>
      </div>
      <div class="d-flex align-items-center gap-2">
        <input type="number" min="1" value="${item.cantidad}" class="form-control form-control-sm cantidad-input" style="width:60px;">
        <span>$${precioItem.toFixed(2)}</span>
        <button class="btn btn-sm btn-danger">Eliminar</button>
      </div>
    `;
  
    // Modificar cantidad
    div.querySelector(".cantidad-input").addEventListener("change", (e) => {
      let nuevaCantidad = parseInt(e.target.value);
      if (isNaN(nuevaCantidad) || nuevaCantidad < 1) nuevaCantidad = 1;
      carrito[index].cantidad = nuevaCantidad;
      guardarEnLocalStorage("carrito", carrito);
      mostrarCarrito();
      actualizarContadorCarrito();
    });
  
    // Eliminar
    div.querySelector("button").addEventListener("click", () => {
      carrito.splice(index, 1);
      guardarEnLocalStorage("carrito", carrito);
      actualizarContadorCarrito();
      mostrarCarrito();
    });
  
    carritoContainer.appendChild(div);
  });
  
  // Contenedor total + botón vaciar
  const divAcciones = document.createElement("div");
  divAcciones.className = "d-flex justify-content-between align-items-center mt-3";

  // Botón vaciar (más chico y a la izquierda)
  const btnVaciar = document.createElement("button");
  btnVaciar.className = "btn btn-sm btn-danger"; // más chico
  btnVaciar.textContent = "Vaciar carrito";
  btnVaciar.addEventListener("click", () => {
    carrito = [];
    guardarEnLocalStorage("carrito", carrito);
    actualizarContadorCarrito();
    mostrarCarrito();
  });

  // Total (a la derecha)
  const divTotal = document.createElement("div");
  divTotal.className = "fw-bold fs-5";
  divTotal.textContent = `Total: $${total.toFixed(2)}`;

  // Agregar ambos al contenedor
  divAcciones.appendChild(btnVaciar);
  divAcciones.appendChild(divTotal);

  // Agregar al carritoContainer
  carritoContainer.appendChild(divAcciones);


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
document.addEventListener("DOMContentLoaded", async () => {
  const contenedorCatalogo = document.getElementById("catalogo");

  if (contenedorCatalogo) { // Solo si existe el contenedor
    try {
      // MOSTRAR LOADER
      contenedorCatalogo.innerHTML = `<div class="loader"></div>`;
      // Cargar productos desde productos.json
      const response = await fetch("../productos.json");
      const data = await response.json();

      productos = data.map(p => {
        const prod = new Producto(
          p.id,
          p.nombre,
          p.categoria,
          p.precio,
          p.descuento,
          p.stock
        );
        prod.imagen = p.imagen || "";
        prod.colores = p.colores || [];
        prod.aplicarIVA?.(); // si tu clase Producto tiene este método
        return prod;
      });

      // Restaurar carrito desde LocalStorage
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

      // Mostrar catálogo inicial
      mostrarCatalogo(productos);
      actualizarContadorCarrito();

      // Eventos modal carrito
      const iconoCarrito = document.getElementById("iconoCarrito");
      const cerrarCarrito = document.getElementById("cerrarModal");
      if (iconoCarrito) {
        iconoCarrito.addEventListener("click", abrirModal);
      }
      if (cerrarCarrito) {
        cerrarCarrito.addEventListener("click", cerrarModal);
      }

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
        iconoBuscador.addEventListener("click", () =>
          buscador.classList.toggle("d-none")
        );

        buscador.addEventListener("input", e => {
          const termino = e.target.value.trim();
          if (termino.length === 0) {
            mostrarCatalogo(productos);
          } else {
            filtrarProductos(termino);
          }
        });
      }
    } catch (error) {
      // Mostrar notificación de error con Toastify
      Toastify({
        text: "Error al cargar productos",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "red"
      }).showToast();
    }
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formContacto");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value.trim();
      const email = document.getElementById("email").value.trim();
      const mensaje = document.getElementById("mensaje").value.trim();

      if (!nombre || !email || !mensaje) {
        Toastify({
          text: "Todos los campos son obligatorios",
          duration: 3000,
          gravity: "top",
          position: "center",
          backgroundColor: "red"
        }).showToast();
        return;
      }

      // Validar email simple
      const regexEmail = /\S+@\S+\.\S+/;
      if (!regexEmail.test(email)) {
        Toastify({
          text: "Email inválido",
          duration: 3000,
          gravity: "top",
          position: "center",
          backgroundColor: "orange"
        }).showToast();
        return;
      }

      // Guardar mensaje en LocalStorage
      const mensajes = JSON.parse(localStorage.getItem("mensajesContacto")) || [];
      mensajes.push({ nombre, email, mensaje, fecha: new Date().toLocaleString() });
      localStorage.setItem("mensajesContacto", JSON.stringify(mensajes));

      form.reset();

      Toastify({
        text: "¡Mensaje enviado con éxito!",
        duration: 3000,
        gravity: "top",
        position: "center",
        backgroundColor: "green"
      }).showToast();
    });
  }
});