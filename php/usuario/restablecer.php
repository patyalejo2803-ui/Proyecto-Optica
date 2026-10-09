<?php
require_once 'UsuarioController.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $token = trim($data['token'] ?? '');
        $nueva = trim($data['nueva'] ?? '');

        if (empty($token)) {
            http_response_code(402);
            echo json_encode(['code' => 402, 'msg' => 'Enlace inválido']);
            exit;
        }

        if (strlen($nueva) < 6) {
            http_response_code(402);
            echo json_encode(['code' => 402, 'msg' => 'La contraseña debe tener mínimo 6 caracteres']);
            exit;
        }

        $controller = new UsuarioController();
        $ok = $controller->restablecerContrasena($token, $nueva);

        if ($ok) {
            http_response_code(200);
            echo json_encode(['code' => 200, 'msg' => 'Contraseña actualizada correctamente']);
        } else {
            http_response_code(410);
            echo json_encode(['code' => 410, 'msg' => 'El enlace no es válido o ya expiró. Solicita uno nuevo.']);
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['code' => 500, 'msg' => 'Error en el servidor: ' . $e->getMessage()]);
    }
} else {
    http_response_code(401);
    echo json_encode(['code' => 401, 'msg' => 'No autorizado']);
}