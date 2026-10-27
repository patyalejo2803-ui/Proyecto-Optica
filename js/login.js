import { enviarPeticion, ir } from './herramientas.js';

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("mensaje").style.display = "none";
});

document.addEventListener("click", (e) => {
  if (e.target && e.target.id == "btn-ingresar") {
    e.preventDefault();
    validarFormulario();
  }
});

// Permite ingresar con la tecla Enter
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.target.id === "correo" || e.target.id === "clave")) {
    e.preventDefault();
    validarFormulario();
  }
});

// Muestra un mensaje de error del servidor dentro de la página
function mostrarErrorServidor(texto) {
  var el = document.getElementById("error-servidor");
  if (!el) {
    el = document.createElement("p");
    el.id = "error-servidor";
    el.className = "error";
    document.getElementById("miFormulario").appendChild(el);
  }
  el.textContent = texto;
  el.style.display = texto ? "block" : "none";
}

function validarFormulario() {

  var correo = document.getElementById("correo").value.trim();
  var clave  = document.getElementById("clave").value;

  document.getElementById("error-correo").style.display = "none";
  document.getElementById("error-clave").style.display  = "none";
  document.getElementById("mensaje").style.display = "none";
  mostrarErrorServidor("");

  var hayError = false;

  if (correo == "" || !correo.includes("@") || !correo.includes(".")) {
    document.getElementById("error-correo").style.display = "block";
    hayError = true;
  }

  if (clave.length < 6) {
    document.getElementById("error-clave").style.display = "block";
    hayError = true;
  }

  if (hayError == false) {
    validarLogin(correo, clave);
  }
}

async function validarLogin(correo, clave) {

  var boton = document.getElementById("btn-ingresar");
  boton.disabled = true;
  boton.textContent = "Ingresando…";

  try {
    await enviarPeticion({
      url: "php/login_procesar.php",
      method: "POST",
      param: { correo: correo, contrasena: clave },
      fSuccess: (resp) => {
        if (resp.code == 200) {
          localStorage.setItem("nombreUsuario", resp.usuario.NOMBRES);
          localStorage.setItem("idRol", resp.usuario.ID_ROL);
          // Cliente (rol 1) a su área; personal al panel administrativo
          ir(Number(resp.usuario.ID_ROL) === 1 ? "citas.html" : "dashboard.html");
        } else {
          mostrarErrorServidor(resp.msg || "No se pudo iniciar sesión.");
          boton.disabled = false;
          boton.textContent = "Ingresar";
        }
      }
    });
  } catch (err) {
    mostrarErrorServidor("No se pudo conectar con el servidor.");
    boton.disabled = false;
    boton.textContent = "Ingresar";
    console.error(err);
  }
}