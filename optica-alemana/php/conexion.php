<?php
$servidor = "localhost";
$usuario = "root";
$password = "";
$basedatos = "db_optica";

$conexion = new mysqli($servidor, $usuario, $password, $basedatos);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}else {
    echo "Conexion exitosa a la base de datos";
}

?>