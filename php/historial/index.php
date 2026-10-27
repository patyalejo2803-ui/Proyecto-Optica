<?php
    session_start();
    require_once __DIR__ . '/../conexion.php';
    header('Content-Type: application/json');

    try {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(["code" => 405, "msg" => "Método no permitido"]);
            exit;
        }

        if (empty($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["code" => 401, "msg" => "Inicia sesión para ver tu historial"]);
            exit;
        }

        $idUsuario = (int)$_SESSION['id_usuario'];
        $db = ConexionBD::getInstancia()->getConexion();

        // Siempre el historial de la persona con sesión iniciada
        $stmt = $db->prepare(
            "SELECT o.ID_ORDEN AS id,
                    o.FECHA AS fecha,
                    TIME_FORMAT(o.HORA, '%H:%i') AS hora,
                    o.VALOR_ORDEN AS total,
                    COALESCE(s.NOMBRE, 'Sin detalle') AS servicio,
                    e.NOMBRE AS estado,
                    o.ESTADO_PAGO_ AS pago
               FROM ordenes o
               LEFT JOIN servicios s ON s.ID_SERVICIOS = o.ID_TIPO_SERVICIO
               LEFT JOIN estados e ON e.ID_ESTADO = o.ESTADO_SERVICIO
              WHERE o.ID_USUARIO = :u
              ORDER BY o.FECHA DESC, o.HORA DESC, o.ID_ORDEN DESC"
        );
        $stmt->execute([':u' => $idUsuario]);

        http_response_code(200);
        echo json_encode([
            "code" => 200,
            "cliente" => $_SESSION['nombre'] ?? '',
            "hoy" => date('Y-m-d'),
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["code" => 500, "msg" => "Error en el servidor: " . $e->getMessage()]);
    }
?>