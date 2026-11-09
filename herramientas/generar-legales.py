# Genera privacidad.html, cookies.html y aviso-legal.html desde las plantillas de la skill (adaptadas a «usted»)
# con los datos de la sección 9 de la ficha. Borrador: llevan el aviso «Texto legal pendiente de revisión».
# Uso: python herramientas/generar-legales.py
import html
import pathlib

d = {
    'fecha': '5 de noviembre de 2026',
    'titular': 'Iria Souto Varela',
    'nombre_comercial': 'Tesoira Estudio de Pelo',
    'nif': '00000000T',
    'direccion_fiscal': 'Rúa do Muíño 14, bajo · 36002 Pontevedra',
    'email_legal': 'hola@tesoira.example',
    'telefono': '986 000 000',
    'hosting': 'Netlify, Inc.',
}
P = '<span class="provisional" data-estado="provisional">Dato ficticio</span>'
e = {k: html.escape(v) for k, v in d.items()}


def actual(slug, enlace):
    return ' aria-current="page"' if slug == enlace else ''


def pagina(slug, titulo, cuerpo):
    return f'''<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>{titulo} · Tesoira (demostración)</title>
  <meta name="theme-color" content="#12100e">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/variables.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/legal.css">
</head>
<body class="pagina-legal">
  <!-- BORRADOR: texto legal pendiente de revisión (ver LEGAL-REVISION.md). Negocio ficticio: no publicar como texto real. -->
  <a class="saltar" href="#contenido">Saltar al contenido</a>
  <header class="legal__cabecera">
    <a class="legal__marca" href="index.html" aria-label="Tesoira, volver a la web">Tesoira</a>
    <a class="enlace-flecha" href="index.html">← Volver a la web</a>
  </header>
  <main class="legal" id="contenido">
    <p class="legal__aviso" role="note" data-estado="provisional"><strong>Texto legal pendiente de revisión.</strong> Es un borrador para un negocio ficticio: los datos del titular son inventados.</p>
    <h1>{titulo}</h1>
    <p class="legal__fecha">Última actualización: {e['fecha']}</p>
{cuerpo}
  </main>
  <footer class="legal__pie">
    <nav aria-label="Textos legales"><a href="privacidad.html"{actual(slug, 'privacidad')}>Privacidad</a><a href="cookies.html"{actual(slug, 'cookies')}>Cookies</a><a href="aviso-legal.html"{actual(slug, 'aviso-legal')}>Aviso legal</a></nav>
    <p>Tesoira Estudio de Pelo · Demostración de una web para un negocio ficticio.</p>
  </footer>
  <p class="franja-demo" role="note">Demostración: negocio ficticio.<span class="franja-demo__mas"> Datos y fotos de prueba.</span></p>
</body>
</html>
'''


titular = f'''    <ul>
      <li>Titular: {e['titular']} {P}</li>
      <li>NIF/CIF: {e['nif']} {P}</li>
      <li>Dirección: {e['direccion_fiscal']} {P}</li>
      <li>Email: <a href="mailto:{e['email_legal']}">{e['email_legal']}</a></li>
    </ul>'''

privacidad = f'''    <h2>Quién es el responsable de sus datos</h2>
{titular}

    <h2>Qué datos tratamos y para qué</h2>
    <p><strong>Solicitud de cita.</strong> Si pide cita desde la web, se abre WhatsApp con un mensaje que incluye su nombre, su teléfono, el servicio, el día, la hora y su comentario. Usted decide si lo envía. Esta web no guarda esos datos: los recibe {e['nombre_comercial']} en su WhatsApp y los usa solo para gestionar su cita.</p>
    <p class="legal__nota">En esta demostración la reserva no abre WhatsApp ni envía nada: solo muestra el mensaje que se enviaría.</p>
    <ul>
      <li>Base legal: aplicar medidas precontractuales a petición suya (art. 6.1.b del RGPD).</li>
      <li>Conservación: el tiempo necesario para gestionar la cita y, después, el que exijan las obligaciones legales.</li>
      <li>WhatsApp es un servicio de WhatsApp Ireland Limited (grupo Meta), con su propia política de privacidad.</li>
    </ul>
    <p><strong>Visitas a la web.</strong> El proveedor de alojamiento, {e['hosting']}, registra datos técnicos de cada visita (como la dirección IP y el navegador) para que la web funcione y por seguridad.</p>
    <ul>
      <li>Base legal: interés legítimo en mantener la web segura (art. 6.1.f del RGPD).</li>
      <li>{e['hosting']} actúa como encargado del tratamiento.</li>
    </ul>
    <p><strong>Mapa.</strong> El mapa de Google solo se carga si pulsa «Ver mapa». Al hacerlo, Google recibe su dirección IP y puede usar cookies, según su política de privacidad.</p>

    <h2>Menores</h2>
    <p>Si tiene menos de 14 años, pida a su padre, madre o tutor que solicite la cita por usted.</p>

    <h2>Sus derechos</h2>
    <p>Puede pedir el acceso, la rectificación, la supresión, la oposición, la limitación o la portabilidad de sus datos escribiendo a <a href="mailto:{e['email_legal']}">{e['email_legal']}</a>. Si cree que no hemos respetado sus derechos, puede reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>).</p>'''

cookies = '''    <h2>Qué son las cookies</h2>
    <p>Son pequeños archivos que una web guarda en su navegador para recordar información.</p>

    <h2>Cookies de esta web</h2>
    <p>Esta web <strong>no usa cookies propias de análisis, publicidad ni redes sociales</strong>, y no graba su navegación. Por eso no le pide aceptar cookies al entrar.</p>
    <p>La web guarda en su navegador, solo durante la visita, si ya ha visto la animación de entrada, para no repetirla (<code>sessionStorage</code>). No contiene datos personales y se borra al cerrar la pestaña.</p>

    <h2>Servicios de terceros</h2>
    <ul>
      <li><strong>Google Maps:</strong> solo se carga si pulsa «Ver mapa». A partir de ese momento, Google puede usar sus propias cookies. Más información en la política de privacidad de Google.</li>
      <li><strong>Enlaces a otros servicios</strong> (Google Maps en otra pestaña, las fotos de Wikimedia Commons): le llevan a sus webs, que tienen sus propias políticas de cookies.</li>
    </ul>

    <h2>Cómo borrar o bloquear cookies</h2>
    <p>Puede borrarlas o bloquearlas desde la configuración de su navegador.</p>'''

aviso = f'''    <h2>Datos del titular</h2>
    <p>En cumplimiento del artículo 10 de la Ley 34/2002 de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI), estos son los datos del titular de esta web:</p>
    <ul>
      <li>Titular: {e['titular']} {P}</li>
      <li>Nombre comercial: {e['nombre_comercial']}</li>
      <li>NIF/CIF: {e['nif']} {P}</li>
      <li>Dirección: {e['direccion_fiscal']} {P}</li>
      <li>Email: <a href="mailto:{e['email_legal']}">{e['email_legal']}</a></li>
      <li>Teléfono: {e['telefono']} {P}</li>
    </ul>

    <h2>Uso de la web</h2>
    <p>Esta web informa sobre los servicios de {e['nombre_comercial']} y permite solicitar cita. Quien la usa se compromete a hacerlo de buena fe y conforme a la ley.</p>
    <p>Los precios y horarios publicados son orientativos y pueden cambiar. La cita solo queda confirmada cuando el negocio la confirma.</p>

    <h2>Propiedad intelectual</h2>
    <p>Los textos y el diseño de esta web pertenecen a {e['titular']}. Las fotos se usan con licencia de sus autores (ver los créditos al pie de la web). No se pueden copiar ni reutilizar sin autorización.</p>

    <h2>Enlaces</h2>
    <p>Esta web enlaza con servicios de terceros (Google Maps, Wikimedia Commons). {e['titular']} no responde de su contenido ni de su funcionamiento.</p>

    <h2>Ley aplicable</h2>
    <p>Este aviso se rige por la legislación española.</p>'''

base = pathlib.Path(__file__).resolve().parent.parent / 'sitio'
for slug, titulo, cuerpo in [('privacidad', 'Política de privacidad', privacidad),
                             ('cookies', 'Política de cookies', cookies),
                             ('aviso-legal', 'Aviso legal', aviso)]:
    (base / f'{slug}.html').write_text(pagina(slug, titulo, cuerpo), encoding='utf-8', newline='\n')
    print('creada', slug + '.html')
