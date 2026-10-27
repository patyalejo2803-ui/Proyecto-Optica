const API_PROMOCIONES = 'php/promociones/index.php';

document.addEventListener('DOMContentLoaded', cargarPromociones);

function formatoFecha(fecha) {
  const p = String(fecha || '').split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : '—';
}

function mostrarVacio(texto, conLogin) {
  const lista = document.getElementById('lista');
  lista.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'vacio';
  p.textContent = texto + ' ';
  if (conLogin) {
    const a = document.createElement('a');
    a.href = 'login.html';
    a.textContent = 'Ir al login';
    p.appendChild(a);
  }
  lista.appendChild(p);
}

async function cargarPromociones() {
  try {
    const res = await fetch(API_PROMOCIONES);
    const data = await res.json();

    if (data.code === 401) { mostrarVacio(data.msg + '.', true); return; }
    if (data.code !== 200) { mostrarVacio('Error: ' + data.msg); return; }

    document.getElementById('totalPromos').textContent = data.data.length;

    if (data.data.length === 0) {
      mostrarVacio('Por ahora no hay promociones vigentes.');
      return;
    }

    const lista = document.getElementById('lista');
    lista.innerHTML = '';

    data.data.forEach(p => {
      const dias = Number(p.dias);
      const card = document.createElement('div');
      card.className = 'promo';

      const info = document.createElement('div');

      const t = document.createElement('p');
      t.className = 'promo-titulo';
      t.textContent = p.titulo;

      const d = document.createElement('p');
      d.className = 'promo-desc';
      d.textContent = p.descripcion || '';

      const v = document.createElement('p');
      v.className = 'promo-vigencia' + (dias <= 7 ? ' pronto' : '');
      v.textContent = dias === 0 ? 'Último día de la promoción'
        : dias <= 7 ? 'Termina en ' + dias + (dias === 1 ? ' día' : ' días')
        : 'Vigente hasta el ' + formatoFecha(p.fin);

      info.appendChild(t);
      info.appendChild(d);
      info.appendChild(v);

      const e = document.createElement('div');
      e.className = 'promo-etiqueta';
      e.textContent = p.etiqueta;

      card.appendChild(info);
      card.appendChild(e);
      lista.appendChild(card);
    });
  } catch (err) {
    mostrarVacio('No se pudo conectar con el servidor.');
    console.error(err);
  }
}