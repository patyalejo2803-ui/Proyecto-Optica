// Variables para guardar lo que el usuario elige
var doctorSeleccionado = "";
var horaSeleccionada   = "";
var motivoSeleccionado = "";

// ── Seleccionar un optometrista ──
function seleccionarDoctor(elemento, nombre) {

  // Quitamos "seleccionado" a todos los doctores
  var doctores = document.getElementsByClassName("doctor");
  for (var i = 0; i < doctores.length; i++) {
    doctores[i].classList.remove("seleccionado");
  }

  // Marcamos el que se eligió
  elemento.classList.add("seleccionado");

  // Guardamos el nombre
  doctorSeleccionado = nombre;

  // Ocultamos el error
  document.getElementById("error-doctor").style.display = "none";
}

// ── Seleccionar una hora ──
function seleccionarHora(elemento, hora) {

  // Quitamos "seleccionado" a todas las horas
  var horas = document.getElementsByClassName("hora");
  for (var i = 0; i < horas.length; i++) {
    horas[i].classList.remove("seleccionado");
  }

  // Marcamos la elegida
  elemento.classList.add("seleccionado");

  // Guardamos la hora
  horaSeleccionada = hora;

  // Ocultamos el error
  document.getElementById("error-hora").style.display = "none";
}

// ── Seleccionar el motivo ──
function seleccionarMotivo(elemento, motivo) {

  // Quitamos "seleccionado" a todos los motivos
  var motivos = document.getElementsByClassName("motivo");
  for (var i = 0; i < motivos.length; i++) {
    motivos[i].classList.remove("seleccionado");
  }

  // Marcamos el elegido
  elemento.classList.add("seleccionado");

  // Guardamos el motivo
  motivoSeleccionado = motivo;

  // Ocultamos el error
  document.getElementById("error-motivo").style.display = "none";
}

// ── Agendar la cita ──
function agendarCita() {

  // Leemos la fecha
  var fecha = document.getElementById("fecha").value;

  // Ocultamos todos los errores
  document.getElementById("error-doctor").style.display = "none";
  document.getElementById("error-fecha").style.display  = "none";
  document.getElementById("error-hora").style.display   = "none";
  document.getElementById("error-motivo").style.display = "none";
  document.getElementById("confirmacion").style.display = "none";

  // Variable para detectar errores
  var hayError = false;

  // Validamos cada campo
  if (doctorSeleccionado == "") {
    document.getElementById("error-doctor").style.display = "block";
    hayError = true;
  }

  if (fecha == "") {
    document.getElementById("error-fecha").style.display = "block";
    hayError = true;
  }

  if (horaSeleccionada == "") {
    document.getElementById("error-hora").style.display = "block";
    hayError = true;
  }

  if (motivoSeleccionado == "") {
    document.getElementById("error-motivo").style.display = "block";
    hayError = true;
  }

  // Si no hay errores, mostramos la confirmación
  if (hayError == false) {

    // Generamos un número de cita
    var numeroCita = "CITA-" + Math.floor(Math.random() * 90000 + 10000);

    // Llenamos los datos de la confirmación
    document.getElementById("c-doctor").textContent = doctorSeleccionado;
    document.getElementById("c-fecha").textContent  = fecha;
    document.getElementById("c-hora").textContent   = horaSeleccionada;
    document.getElementById("c-motivo").textContent = motivoSeleccionado;
    document.getElementById("c-numero").textContent = numeroCita;

    // Mostramos la confirmación
    document.getElementById("confirmacion").style.display = "block";
  }
}