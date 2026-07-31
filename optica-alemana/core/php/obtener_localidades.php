<?php
header('Content-Type: application/json; charset=utf-8');
require_once "conexion.php";

// Ajusta "NOMBRE" si la columna de tu tabla localidad se llama distinto
$resultado = $conexion->query("SELECT ID_LOCALIDAD, NOMBRE FROM localidad ORDER BY NOMBRE");

$localidades = [];
if ($resultado) {
    while ($fila = $resultado->fetch_assoc()) {
        $localidades[] = $fila;
    }
}

echo json_encode($localidades);
$conexion->close();
?>