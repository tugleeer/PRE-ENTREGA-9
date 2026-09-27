class Persona {
    constructor(id, nombre, añoNacimiento, relacion) {
        this.id = id;
        this.nombre = nombre;
        this.añoNacimiento = añoNacimiento;
        this.relacion = relacion;
    }

    calcularEdad(añoActual) {
        return añoActual - this.añoNacimiento;
    }
}

const claveStorage = "personasSimulador";

const personasIniciales = [
    new Persona(1, "Alex", 1998, "Amigo/a"),
    new Persona(2, "Sam", 2005, "Familiar"),
    new Persona(3, "Taylor", 2000, "Compañero/a"),
    new Persona(4, "Cami", 2002, "Usuario")
];

let datosGuardados;

try {
    datosGuardados = JSON.parse(localStorage.getItem(claveStorage) ?? "null");
} catch {
    datosGuardados = null;
}

const personasGuardadas = Array.isArray(datosGuardados)
    ? datosGuardados
    : personasIniciales;

let personas = personasGuardadas.map((persona) => {
    const {
        id,
        nombre,
        añoNacimiento,
        relacion
    } = persona;

    return new Persona(id, nombre, añoNacimiento, relacion);
});

const añoActual = new Date().getFullYear();

const formulario = document.querySelector("#formulario-persona");
const inputNombre = document.querySelector("#nombre");
const inputAñoNacimiento = document.querySelector("#año-nacimiento");
const inputRelacion = document.querySelector("#relacion");
const inputBusqueda = document.querySelector("#busqueda");
const botonAgregar = document.querySelector("#boton-agregar");
const botonVaciar = document.querySelector("#vaciar-lista");
const listaPersonas = document.querySelector("#lista-personas");
const mensaje = document.querySelector("#mensaje");
const avisoTemporizado = document.querySelector("#aviso-temporizado");

function guardarPersonas() {
    localStorage.setItem(claveStorage, JSON.stringify(personas));
}

function mostrarMensaje(texto, esError = false) {
    mensaje.textContent = texto;
    mensaje.classList.toggle("error", esError);
}

function mostrarPersonas(lista) {
    const tarjetas = lista.map((persona) => {
        const nombre = persona?.nombre ?? "Sin nombre";
        const relacion = persona?.relacion ?? "Sin relación";
        const edad = persona.calcularEdad(añoActual);

        return `
            <article class="tarjeta-persona">
                <div>
                    <h3>${nombre}</h3>
                    <p>${relacion} · Aproximadamente ${edad} años</p>
                </div>
                <button class="boton-eliminar" data-id="${persona.id}" type="button">
                    Eliminar
                </button>
            </article>
        `;
    }).join("");

    listaPersonas.innerHTML = tarjetas || `<p class="vacio">No hay personas para mostrar.</p>`;
}

function actualizarVista() {
    const textoBusqueda = inputBusqueda.value.trim().toLowerCase();

    const personasFiltradas = personas.filter((persona) => {
        return persona.nombre.toLowerCase().includes(textoBusqueda);
    });

    mostrarPersonas(personasFiltradas);
}

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    botonAgregar.disabled = true;

    try {
        const nombre = inputNombre.value.trim();
        const añoNacimiento = Number(inputAñoNacimiento.value);
        const relacion = inputRelacion.value.trim();

        if (nombre === "" || relacion === "") {
            throw new Error("Completa todos los campos.");
        }

        if (añoNacimiento <= 0 || añoNacimiento > añoActual) {
            throw new Error("Ingresa un año de nacimiento válido.");
        }

        const nuevoId = personas.length > 0
            ? Math.max(...personas.map((persona) => persona.id)) + 1
            : 1;

        const nuevaPersona = new Persona(
            nuevoId,
            nombre,
            añoNacimiento,
            relacion
        );

        personas.push(nuevaPersona);
        guardarPersonas();
        formulario.reset();
        actualizarVista();
        mostrarMensaje(`${nombre} se agregó y quedó guardado.`);
    } catch (error) {
        mostrarMensaje(error.message || "No se pudo agregar la persona. Intenta de nuevo.", true);
    } finally {
        botonAgregar.disabled = false;
    }
});

inputBusqueda.addEventListener("input", actualizarVista);

listaPersonas.addEventListener("click", (evento) => {
    if (!evento.target.matches(".boton-eliminar")) {
        return;
    }

    try {
        const idPersona = Number(evento.target.dataset.id);
        const personaEliminada = personas.find((persona) => persona.id === idPersona);

        personas = personas.filter((persona) => persona.id !== idPersona);

        guardarPersonas();
        actualizarVista();

        const nombreEliminado = personaEliminada?.nombre ?? "La persona";
        mostrarMensaje(`${nombreEliminado} se eliminó y se actualizó el almacenamiento.`);
    } catch {
        mostrarMensaje("No se pudo eliminar la persona. Intenta de nuevo.", true);
    }
});

botonVaciar.addEventListener("click", () => {
    try {
        personas = [];
        guardarPersonas();
        actualizarVista();
        mostrarMensaje("Se vació la lista y se borraron los datos guardados.");
    } catch {
        mostrarMensaje("No se pudo vaciar la lista. Intenta de nuevo.", true);
    }
});

if (localStorage.getItem(claveStorage) === null) {
    guardarPersonas();
}

actualizarVista();

setTimeout(() => {
    avisoTemporizado.textContent =
        "Consejo: agrega a tus familiares y amistades para tener sus edades aproximadas en un solo lugar.";
    avisoTemporizado.classList.add("visible");
}, 3000);