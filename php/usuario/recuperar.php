<?php
require_once 'UsuarioController.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $correo = htmlspecialchars(trim($data['correo'] ?? ''));

        if (empty($correo)) {
            http_response_code(402);
            echo json_encode(['code' => 402, 'msg' => 'Escribe tu correo electrónico']);
            exit;
        }

        $controller = new UsuarioController();
        $token = $controller->solicitarRecuperacion($correo);

        // Por seguridad, el mensaje es igual exista o no el correo
        // (así nadie puede usar este formulario para averiguar qué
        // correos están registrados en el sistema).
        $respuesta = [
            'code' => 200,
            'msg'  => 'Si el correo está registrado, se generó un enlace de recuperación.'
        ];

        if ($token) {
            // MODO DESARROLLO: como XAMPP no tiene correo configurado,
            // mostramos el enlace directo en pantalla en vez de enviarlo
            // por email. En producción, aquí iría el envío real del correo
            // y esta línea se eliminaría.
            $respuesta['dev_link'] = 'restablecer.html?token=' . $token;
        }

        http_response_code(200);
        echo json_encode($respuesta);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['code' => 500, 'msg' => 'Error en el servidor: ' . $e->getMessage()]);
    }
} else {
    http_response_code(401);
    echo json_encode(['code' => 401, 'msg' => 'No autorizado']);
}