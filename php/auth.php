<?php
/* =========================================================
   ÓPTICA ALEMANA — auth.php
   Protege los servicios que solo debe usar el personal.
   Uso:  requerirRol([2, 3]);   (2 = administrador, 3 = gerente)
   ========================================================= */
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function requerirRol(array $rolesPermitidos) {
    header('Content-Type: application/json');

    if (empty($_SESSION['id_usuario'])) {
        http_response_code(401);
        echo json_encode(["code" => 401, "msg" => "Inicia sesión para continuar"]);
        exit;
    }

    if (!in_array((int)($_SESSION['id_rol'] ?? 0), $rolesPermitidos, true)) {
        http_response_code(403);
        echo json_encode(["code" => 403, "msg" => "No tienes permiso para esta acción"]);
        exit;
    }
}
