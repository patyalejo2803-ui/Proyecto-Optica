<?php
require_once __DIR__ . '/conexion.php';
header('Content-Type: text/plain; charset=utf-8');

$db = ConexionBD::getInstancia()->getConexion();

$correoPrueba = 'diagnostico2_' . time() . '@test.com';
$passwordPrueba = 'DiagTest123';
$hash = password_hash($passwordPrueba, PASSWORD_DEFAULT);
$identificacion = 'TEMP-' . uniqid();

echo "=== PRUEBA CRUDA (sin pasar por UsuarioController) ===\n\n";
echo "Correo: [$correoPrueba] (longitud: " . strlen($correoPrueba) . ")\n\n";

$sqlInsert = "INSERT INTO usuario (IDENTIFICACION, NOMBRES, EMAIL, PASSWORD, ID_LOCALIDAD, ID_ROL)
              VALUES (:identificacion, :nombre, :email, :password, :id_localidad, :id_rol)";
$stmt = $db->prepare($sqlInsert);
$ok = $stmt->execute([
    ':identificacion' => $identificacion,
    ':nombre' => 'Diagnostico2',
    ':email' => $correoPrueba,
    ':password' => $hash,
    ':id_localidad' => 1,
    ':id_rol' => 2
]);
echo "1. INSERT ejecutado: " . ($ok ? "true" : "false") . "\n";
echo "   ID insertado (lastInsertId): " . $db->lastInsertId() . "\n\n";

$total = $db->query("SELECT COUNT(*) as c FROM usuario")->fetch();
echo "2. Total de filas en tabla usuario AHORA MISMO: " . $total['c'] . "\n\n";

$stmt2 = $db->prepare("SELECT ID_USUARIO, EMAIL, LENGTH(EMAIL) as len_email FROM usuario WHERE EMAIL = :email");
$stmt2->execute([':email' => $correoPrueba]);
$fila = $stmt2->fetch();
echo "3. SELECT WHERE EMAIL = correo exacto recien insertado:\n";
if ($fila) {
    echo "   ENCONTRADO: ID=" . $fila['ID_USUARIO'] . " EMAIL=[" . $fila['EMAIL'] . "] longitud_guardada=" . $fila['len_email'] . "\n";
} else {
    echo "   NO ENCONTRADO (0 filas)\n";
}
echo "\n";

$stmt3 = $db->prepare("SELECT ID_USUARIO, EMAIL FROM usuario WHERE EMAIL LIKE :patron ORDER BY ID_USUARIO DESC LIMIT 5");
$stmt3->execute([':patron' => '%diagnostico2%']);
$filas = $stmt3->fetchAll();
echo "4. Busqueda con LIKE '%diagnostico2%' (ultimas 5):\n";
foreach ($filas as $f) {
    echo "   ID=" . $f['ID_USUARIO'] . " EMAIL=[" . $f['EMAIL'] . "]\n";
}
if (count($filas) === 0) echo "   NINGUN RESULTADO\n";
echo "\n";

$stmt4 = $db->query("SELECT DATABASE() as db_actual, @@hostname as host, @@port as puerto");
$info = $stmt4->fetch();
echo "5. Conexion actual usa:\n";
echo "   Base de datos: " . $info['db_actual'] . "\n";
echo "   Host: " . $info['host'] . "\n";
echo "   Puerto: " . $info['puerto'] . "\n";

echo "\n=== FIN ===\n";