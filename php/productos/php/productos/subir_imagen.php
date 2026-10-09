<?php
require_once __DIR__ . '/../conexion.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        http_response_code(401);
        echo json_encode(["code" => 401, "msg" => "No autorizado"]);
        exit;
    }

    if (empty($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(402);
        echo json_encode(["code" => 402, "msg" => "No se recibió ninguna imagen válida"]);
        exit;
    }

    $idProducto = isset($_POST['id_producto']) ? intval($_POST['id_producto']) : 0;
    if ($idProducto <= 0) {
        http_response_code(402);
        echo json_encode(["code" => 402, "msg" => "Falta el ID del producto"]);
        exit;
    }

    // Límite de tamaño: 3 MB
    if ($_FILES['imagen']['size'] > 3 * 1024 * 1024) {
        http_response_code(413);
        echo json_encode(["code" => 413, "msg" => "La imagen supera el tamaño máximo (3 MB)"]);
        exit;
    }

    // Se revisa el contenido real del archivo, no solo la extensión del nombre
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($_FILES['imagen']['tmp_name']);
    $tiposPermitidos = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp'
    ];

    if (!isset($tiposPermitidos[$mime])) {
        http_response_code(415);
        echo json_encode(["code" => 415, "msg" => "Formato de imagen no permitido (usa JPG, PNG o WEBP)"]);
        exit;
    }
    $extension = $tiposPermitidos[$mime];

    // Crea la carpeta si no existe
    $carpeta = __DIR__ . '/../../uploads/productos/';
    if (!is_dir($carpeta)) {
        mkdir($carpeta, 0755, true);
    }

    $nombreArchivo = 'producto_' . $idProducto . '_' . uniqid() . '.' . $extension;
    $rutaDestino   = $carpeta . $nombreArchivo;
    $rutaRelativa  = 'uploads/productos/' . $nombreArchivo;

    if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaDestino)) {
        http_response_code(500);
        echo json_encode(["code" => 500, "msg" => "No se pudo guardar la imagen en el servidor"]);
        exit;
    }

    $db = ConexionBD::getInstancia()->getConexion();
    $stmt = $db->prepare("UPDATE productos SET imagen = :imagen WHERE id_PRODUCTOS = :id");
    $stmt->execute([':imagen' => $rutaRelativa, ':id' => $idProducto]);

    http_response_code(200);
    echo json_encode(["code" => 200, "msg" => "Imagen guardada correctamente", "ruta" => $rutaRelativa]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["code" => 500, "msg" => "Error en el servidor: " . $e->getMessage()]);
}
