<?php
error_reporting(0);
ini_set('display_errors', '0');

session_start();
header('Content-Type: application/json; charset=utf-8');
require_once "conexion.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["exito" => false, "mensaje" => "Método no permitido"]);
    exit;
}

// 1. Leer los datos enviados desde el JS
$usuario = trim($_POST['usuario'] ?? '');
$clave   = $_POST['clave'] ?? '';

if ($usuario === '' || $clave === '') {
    echo json_encode(["exito" => false, "mensaje" => "Usuario y clave son obligatorios."]);
    exit;
}

// 2. Buscar al usuario por su nombre completo (NOMBRES)
$stmt = $conexion->prepare("SELECT ID_USUARIO, NOMBRES, PASSWORD, ID_ROL FROM usuario WHERE NOMBRES = ?");
$stmt->bind_param("s", $usuario);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    echo json_encode(["exito" => false, "mensaje" => "Usuario o contraseña incorrectos."]);
    $stmt->close();
    exit;
}

$fila = $resultado->fetch_assoc();
$stmt->close();

// 3. Verificar la contraseña contra el hash guardado
if (!password_verify($clave, $fila['PASSWORD'])) {
    echo json_encode(["exito" => false, "mensaje" => "Usuario o contraseña incorrectos."]);
    exit;
}

// 4. Login correcto: guardamos datos en la sesión
$_SESSION['id_usuario'] = $fila['ID_USUARIO'];
$_SESSION['nombre']     = $fila['NOMBRES'];
$_SESSION['id_rol']     = $fila['ID_ROL'];

echo json_encode([
    "exito"  => true,
    "mensaje" => "Ingreso exitoso.",
    "nombre" => $fila['NOMBRES']
]);

$conexion->close();
?>