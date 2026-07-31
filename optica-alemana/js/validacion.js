import { validarLogin } from './login.js';

document.addEventListener("DOMContentLoaded", (e)=> {
    document.getElementById("mensaje").style.display = "none";
})

document.addEventListener("click", (e)=> {
  if(e.target && e.target.id == "btn-ingresar"){
    e.preventDefault();
    validarFormulario();
  }
})

// Función principal que se ejecuta al hacer clic en "Ingresar"
export function validarFormulario() {

  // 1. Obtenemos los valores que el usuario escribió
  var correo = document.getElementById("correo").value;
  var clave  = document.getElementById("clave").value;

  // 2. Ocultamos todos los errores antes de validar
  document.getElementById("error-correo").style.display = "none";
  document.getElementById("error-clave").style.display  = "none";
  document.getElementById("mensaje").style.display = "none";

  // 3. Variable para saber si hay algún error
  var hayError = false;

  // 5. Validar correo: debe tener @ y un punto
  if (correo == "" || !correo.includes("@") || !correo.includes(".")) {
    document.getElementById("error-correo").style.display = "block";
    hayError = true;
  }

  // 6. Validar clave: mínimo 6 caracteres
  if (clave.length < 6) {
    document.getElementById("error-clave").style.display = "block";
    hayError = true;
  }

  // 7. Encriptar la clave usando MD5
  let claveencriptada = md5(clave);

  // 8. Si no hay errores, mostramos el mensaje de éxito
  if (hayError == false) {
    document.getElementById("mensaje").style.display = "block";
    validarLogin(correo, claveencriptada);
  }

}