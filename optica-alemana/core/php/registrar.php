<?php
header('Content-Type: application/json; charset=utf-8');
require_once "conexion.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["exito" => false, "mensaje" => "Método no permitido"]);
    exit;
}

// 1. Leer los datos que llegan desde el fetch() del JS
$nombre          = trim($_POST['nombre'] ?? '');
$identificacion  = trim($_POST['identificacion'] ?? '');
$correo          = trim($_POST['correo'] ?? '');
$telefono        = trim($_POST['telefono'] ?? '');
$direccion       = trim($_POST['direccion'] ?? '');
$id_localidad    = intval($_POST['id_localidad'] ?? 0);
$contrasena      = $_POST['contrasena'] ?? '';

// 2. Validaciones en el SERVIDOR (nunca confíes solo en el JS del navegador,
//    cualquiera puede desactivarlo o llamar a este PHP directamente)
$errores = [];

if ($nombre === '')                                    $errores[] = "El nombre es obligatorio.";
if ($identificacion === '')                             $errores[] = "La identificación es obligatoria.";
if ($correo === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) $errores[] = "Correo inválido.";
if (strlen($contrasena) < 6)                            $errores[] = "La contraseña debe tener mínimo 6 caracteres.";
if ($id_localidad <= 0)                                  $errores[] = "Selecciona una localidad.";

if (!empty($errores)) {
    echo json_encode(["exito" => false, "mensaje" => implode(" ", $errores)]);
    exit;
}

// 3. Evitar correos o identificaciones duplicadas
$stmt = $conexion->prepare("SELECT ID_USUARIO FROM usuario WHERE EMAIL = ? OR IDENTIFICACION = ?");
$stmt->bind_param("ss", $correo, $identificacion);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    echo json_encode(["exito" => false, "mensaje" => "Ya existe un usuario con ese correo o identificación."]);
    $stmt->close();
    exit;
}
$stmt->close();

// 4. Encriptar la contraseña (¡NUNCA se guarda en texto plano!)
$hash = password_hash($contrasena, PASSWORD_DEFAULT);

// 5. Insertar el nuevo usuario. Rol por defecto = 1 (CLIENTE, según tu tabla roles)
$id_rol = 1;

$stmt = $conexion->prepare(
    "INSERT INTO usuario (IDENTIFICACION, NOMBRES, TELEFONO, EMAIL, PASSWORD, ID_LOCALIDAD, ID_ROL, DIRECCION)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);
$stmt->bind_param(
    "sssssiis",
    $identificacion, $nombre, $telefono, $correo, $hash, $id_localidad, $id_rol, $direccion
);

if ($stmt->execute()) {
    echo json_encode(["exito" => true, "mensaje" => "Cuenta creada exitosamente."]);
} else {
    echo json_encode(["exito" => false, "mensaje" => "Error al registrar: " . $stmt->error]);
}

$stmt->close();
$conexion->close();
?>