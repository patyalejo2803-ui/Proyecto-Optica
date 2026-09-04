<?php
/* =========================================================
   ÓPTICA ALEMANA — api_dashboard.php
   ---------------------------------------------------------
   Un solo archivo que junta la información de:
   productos, servicios, usuarios y órdenes de db_optica,
   y la entrega en una sola respuesta JSON.

   Se guarda en: php/api_dashboard.php
   Se llama desde el navegador así:
   http://localhost/Proyecto-Optica/optica-alemana/php/api_dashboard.php
   ========================================================= */

require_once 'conexion.php';
header('Content-Type: application/json');

try {
    $db = ConexionBD::getInstancia()->getConexion();

    // 1. Verificamos que la conexión esté viva
    $db->query("SELECT 1");
    $conexionOk = true;

    // 2. Productos (con nombre de categoría)
    $sqlProductos = "SELECT p.id_PRODUCTOS AS id_producto,
                             p.NOMBRE      AS nombre,
                             c.NOMBRE      AS categoria,
                             p.MARCA       AS marca,
                             p.ESTADO      AS estado
                      FROM productos p
                      LEFT JOIN categorias c ON p.ID_CATEGORIA = c.ID_CATEGORIAS
                      ORDER BY p.id_PRODUCTOS DESC";
    $productos = $db->query($sqlProductos)->fetchAll();

    // 3. Servicios
    $sqlServicios = "SELECT ID_SERVICIOS AS id_servicio,
                             NOMBRE       AS nombre,
                             DESCRIPCION  AS descripcion,
                             PRECIO       AS precio
                      FROM servicios
                      ORDER BY ID_SERVICIOS ASC";
    $servicios = $db->query($sqlServicios)->fetchAll();

    // 4. Usuarios (con nombre de rol, SIN password)
    $sqlUsuarios = "SELECT u.ID_USUARIO AS id_usuario,
                            u.NOMBRES    AS nombre,
                            u.TELEFONO   AS telefono,
                            r.NOMBRE     AS rol
                     FROM usuario u
                     LEFT JOIN roles r ON u.ID_ROL = r.ID_ROL
                     ORDER BY u.ID_USUARIO ASC";
    $usuarios = $db->query($sqlUsuarios)->fetchAll();

    // 5. Órdenes (con nombre del cliente y estado)
    $sqlOrdenes = "SELECT o.ID_ORDEN    AS id_orden,
                          u.NOMBRES     AS usuario,
                          o.FECHA       AS fecha,
                          e.NOMBRE      AS estado,
                          o.VALOR_ORDEN AS total
                   FROM ordenes o
                   LEFT JOIN usuario u ON o.ID_USUARIO = u.ID_USUARIO
                   LEFT JOIN estados e ON o.ESTADO_SERVICIO = e.ID_ESTADO
                   ORDER BY o.ID_ORDEN DESC";
    $ordenes = $db->query($sqlOrdenes)->fetchAll();

    // 6. Armamos la respuesta única con todo junto
    http_response_code(200);
    echo json_encode([
        "ok"        => $conexionOk,
        "productos" => $productos,
        "servicios" => $servicios,
        "usuario"   => $usuarios,
        "ordenes"   => $ordenes
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "ok"    => false,
        "error" => $e->getMessage()
    ]);
}
?>