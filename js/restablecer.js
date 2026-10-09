import { enviarPeticion } from './herramientas.js';

// Leemos el token desde la URL: restablecer.html?token=xxxx
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'btn-restablecer') {
    e.preventDefault();
    restablecer();
  }
});

async function restablecer() {
  const nueva = document.getElementById('nueva').value;
  const confirmar = document.getElementById('confirmar').value;
  const errorNueva = document.getElementById('error-nueva');
  const errorConfirmar = document.getElementById('error-confirmar');
  const resultado = document.getElementById('resultado');

  errorNueva.style.display = 'none';
  errorConfirmar.style.display = 'none';
  resultado.style.display = 'none';

  let hayError = false;

  if (nueva.length < 6) {
    errorNueva.style.display = 'block';
    hayError = true;
  }
  if (nueva !== confirmar) {
    errorConfirmar.style.display = 'block';
    hayError = true;
  }
  if (!token) {
    resultado.style.display = 'block';
    resultado.innerHTML = mensajeError('Este enlace no es válido. Solicita uno nuevo desde "Recuperar contraseña".');
    hayError = true;
  }

  if (hayError) return;

  await enviarPeticion({
    url: 'php/usuario/restablecer.php',
    method: 'POST',
    param: { token, nueva },
    fSuccess: (resp) => {
      resultado.style.display = 'block';
      if (resp.code === 200) {
        resultado.innerHTML = `
          <div style="background:rgba(74,222,128,0.12); border:1px solid #4ade80; color:#157347; padding:14px; border-radius:8px; font-size:0.86rem;">
            ✅ ${resp.msg} — <a href="login.html" style="color:#157347; font-weight:600;">Inicia sesión aquí</a>
          </div>
        `;
        document.getElementById('formRestablecer').style.display = 'none';
      } else {
        resultado.innerHTML = mensajeError(resp.msg);
      }
    }
  });
}

function mensajeError(texto) {
  return `
    <div style="background:#fdecea; border:1px solid #c0392b; color:#c0392b; padding:14px; border-radius:8px; font-size:0.86rem;">
      ${texto}
    </div>
  `;
}