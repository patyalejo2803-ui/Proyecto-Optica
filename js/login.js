import { enviarPeticion, ir } from './herramientas.js';

document.addEventListener("DOMContentLoaded", (e) => {
  document.getElementById("mensaje").style.display = "none";
});

document.addEventListener("click", (e) => {
  if (e.target && e.target.id == "btn-ingresar") {
    e.preventDefault();
    validarFormulario();
  }
});

// Función que valida el formulario y, si todo está bien, llama al backend
function validarFormulario() {

  // 1. Obtenemos los valores que el usuario escribió
  var correo = document.getElementById("correo").value;
  var clave  = document.getElementById("clave").value;

  // 2. Ocultamos todos los errores antes de validar
  document.getElementById("error-correo").style.display = "none";
  document.getElementById("error-clave").style.display  = "none";
  document.getElementById("mensaje").style.display = "none";

  // 3. Variable para saber si hay algún error
  var hayError = false;

  // 4. Validar correo: debe tener @ y un punto
  if (correo == "" || !correo.includes("@") || !correo.includes(".")) {
    document.getElementById("error-correo").style.display = "block";
    hayError = true;
  }

  // 5. Validar clave: mínimo 6 caracteres
  if (clave.length < 6) {
    document.getElementById("error-clave").style.display = "block";
    hayError = true;
  }

  // 6. Si no hay errores, encriptamos y enviamos
  if (hayError == false) {
    let claveEncriptada = md5(clave);
    document.getElementById("mensaje").style.display = "block";
    validarLogin(correo, claveEncriptada);
  }
}

// Función que habla con el backend
async function validarLogin(correo, clave) {

  await enviarPeticion({
    url: "php/usuario/index.php",
    method: "POST",
    param: { usuario: correo, clave: clave },
    fSuccess: (resp) => {
      if (resp.code == 200) {
        alert("El usuario ha iniciado sesión correctamente.");
        ir("dashboard.html");
      } else {
        alert(resp.msg);
        document.getElementById("mensaje").style.display = "none";
      }
    }
  });
}