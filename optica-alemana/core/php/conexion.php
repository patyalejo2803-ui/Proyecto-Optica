<?php
$servidor = "localhost";
$usuario = "root";
$password = "";
$basedatos = "db_optica";

$conexion = new mysqli($servidor, $usuario, $password, $basedatos);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// No imprimimos nada aquí si la conexión es exitosa,
// porque este archivo se incluye dentro de otros scripts
// (obtener_localidades.php, registrar.php) que devuelven JSON.
// Un echo aquí rompería ese JSON.

?>