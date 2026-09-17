<?php
/* =========================================================
   ÓPTICA ALEMANA — api_dashboard.php
   ---------------------------------------------------------
   Un solo archivo que junta la información de:
   productos, categorias, servicios, usuarios, ordenes,
   orden_producto, estados, localidad, roles y
   tipo_identificacion de db_optica, y la entrega en una
   sola respuesta JSON.

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

    // 3. Categorías (esta tabla solo tiene ID_CATEGORIAS y NOMBRE)
    $sqlCategorias = "SELECT ID_CATEGORIAS AS id_categoria,
                              NOMBRE       AS nombre
                       FROM categorias
                       ORDER BY ID_CATEGORIAS ASC";
    $categorias = $db->query($sqlCategorias)->fetchAll();

    // 4. Servicios
    $sqlServicios = "SELECT ID_SERVICIOS AS id_servicio,
                             NOMBRE       AS nombre,
                             DESCRIPCION  AS descripcion,
                             PRECIO       AS precio
                      FROM servicios
                      ORDER BY ID_SERVICIOS ASC";
    $servicios = $db->query($sqlServicios)->fetchAll();

    // 5. Usuarios (con nombre de rol, SIN password)
    $sqlUsuarios = "SELECT u.ID_USUARIO AS id_usuario,
                            u.NOMBRES    AS nombre,
                            u.TELEFONO   AS telefono,
                            r.NOMBRE     AS rol
                     FROM usuario u
                     LEFT JOIN roles r ON u.ID_ROL = r.ID_ROL
                     ORDER BY u.ID_USUARIO ASC";
    $usuarios = $db->query($sqlUsuarios)->fetchAll();

    // 6. Órdenes (con nombre del cliente y estado)
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

    // 7. Detalle de órdenes (orden_producto) — tabla de relación orden <-> producto
    $sqlOrdenProducto = "SELECT op.ID_ORDEN        AS id_orden,
                                 p.NOMBRE           AS producto,
                                 op.CANTIDAD        AS cantidad,
                                 op.VALOR_UNITARIO  AS precio_unitario,
                                 op.TOTAL_          AS total
                          FROM orden_producto op
                          LEFT JOIN productos p ON op.ID_PRODUCTO = p.id_PRODUCTOS
                          ORDER BY op.ID_ORDEN DESC";
    $ordenProducto = $db->query($sqlOrdenProducto)->fetchAll();

    // 8. Estados
    $sqlEstados = "SELECT ID_ESTADO AS id_estado,
                           NOMBRE   AS nombre
                    FROM estados
                    ORDER BY ID_ESTADO ASC";
    $estados = $db->query($sqlEstados)->fetchAll();

    // 9. Localidad
    // OJO: ajusta columnas si tu tabla localidad tiene CIUDAD/DEPARTAMENTO en vez de NOMBRE
    $sqlLocalidad = "SELECT ID_LOCALIDAD AS id_localidad,
                             NOMBRE       AS nombre
                      FROM localidad
                      ORDER BY ID_LOCALIDAD ASC";
    $localidad = $db->query($sqlLocalidad)->fetchAll();

    // 10. Roles
    $sqlRoles = "SELECT ID_ROL AS id_rol,
                        NOMBRE AS nombre
                 FROM roles
                 ORDER BY ID_ROL ASC";
    $roles = $db->query($sqlRoles)->fetchAll();

    // 11. Tipo de identificación
    $sqlTipoId = "SELECT ID_TIPO_IDENTIFICACION AS id_tipo,
                         NOMBRE                  AS nombre,
                         DESCRIPCION             AS descripcion
                  FROM tipo_identificacion
                  ORDER BY ID_TIPO_IDENTIFICACION ASC";
    $tipoIdentificacion = $db->query($sqlTipoId)->fetchAll();

    // 12. Armamos la respuesta única con todo junto
    http_response_code(200);
    echo json_encode([
        "ok"                  => $conexionOk,
        "productos"           => $productos,
        "categorias"          => $categorias,
        "servicios"           => $servicios,
        "usuario"             => $usuarios,
        "ordenes"             => $ordenes,
        "orden_producto"      => $ordenProducto,
        "estados"             => $estados,
        "localidad"           => $localidad,
        "roles"               => $roles,
        "tipo_identificacion" => $tipoIdentificacion
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "ok"    => false,
        "error" => $e->getMessage()
    ]);
}
?>