<?php
error_reporting(0);
ini_set('display_errors', '0');

session_start();
header('Content-Type: application/json; charset=utf-8');

// 1. Verificar que haya sesión iniciada
if (!isset($_SESSION['id_usuario'])) {
    http_response_code(401);
    echo json_encode(["autenticado" => false, "mensaje" => "No has iniciado sesión."]);
    exit;
}

// 2. Verificar que el rol sea ADMINISTRADOR (2) o GERENTE (3)
$rolPermitido = in_array($_SESSION['id_rol'], [2, 3]);
if (!$rolPermitido) {
    http_response_code(403);
    echo json_encode(["autenticado" => false, "mensaje" => "No tienes permisos para ver este panel."]);
    exit;
}

require_once "conexion.php";

function contar($conexion, $tabla) {
    $resultado = $conexion->query("SELECT COUNT(*) AS total FROM `$tabla`");
    if ($resultado) {
        $fila = $resultado->fetch_assoc();
        return intval($fila['total']);
    }
    return 0;
}

$datos = [
    "autenticado"     => true,
    "nombre"          => $_SESSION['nombre'],
    "id_rol"          => intval($_SESSION['id_rol']),
    "totalUsuarios"   => contar($conexion, "usuario"),
    "totalProductos"  => contar($conexion, "productos"),
    "totalOrdenes"    => contar($conexion, "ordenes"),
    "totalServicios"  => contar($conexion, "servicios")
];

echo json_encode($datos);

$conexion->close();
?>