import { enviarPeticion } from './herramientas.js';

document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'btn-recuperar') {
    e.preventDefault();
    solicitar();
  }
});

async function solicitar() {
  const correo = document.getElementById('correo').value.trim();
  const errorCorreo = document.getElementById('error-correo');
  const resultado = document.getElementById('resultado');

  errorCorreo.style.display = 'none';
  resultado.style.display = 'none';

  if (!correo || !correo.includes('@') || !correo.includes('.')) {
    errorCorreo.style.display = 'block';
    return;
  }

  await enviarPeticion({
    url: 'php/usuario/recuperar.php',
    method: 'POST',
    param: { correo },
    fSuccess: (resp) => {
      resultado.style.display = 'block';

      if (resp.dev_link) {
        // MODO DESARROLLO: mostramos el enlace directo porque XAMPP
        // no tiene correo configurado. En producción esto no se muestra.
        resultado.innerHTML = `
          <div style="background:#fff8e6; border:1px solid #e8c766; color:#7a5c00; padding:14px; border-radius:8px; font-size:0.86rem;">
            <strong>Modo desarrollo:</strong> como el servidor local no envía correos reales, aquí tienes el enlace directo:<br><br>
            <a href="${resp.dev_link}" style="color:#B08D57; font-weight:600; word-break:break-all;">${resp.dev_link}</a>
          </div>
        `;
      } else {
        resultado.innerHTML = `
          <div style="background:rgba(74,222,128,0.12); border:1px solid #4ade80; color:#157347; padding:14px; border-radius:8px; font-size:0.86rem;">
            ${resp.msg}
          </div>
        `;
      }
    }
  });
}