<?php
require_once __DIR__ . '/../auth.php'; requerirRol([2, 3]);
require_once __DIR__ . '/../conexion.php';
header('Content-Type: application/json');

try {
    $db = ConexionBD::getInstancia()->getConexion();
    $metodo = $_SERVER['REQUEST_METHOD'];

    // ── Listar órdenes y estados disponibles ──
    if ($metodo === 'GET') {
        $estados = $db->query("SELECT ID_ESTADO AS id, NOMBRE AS nombre FROM estados ORDER BY ID_ESTADO")
                      ->fetchAll(PDO::FETCH_ASSOC);

        $ordenes = $db->query(
            "SELECT o.ID_ORDEN AS id,
                    o.FECHA AS fecha,
                    TIME_FORMAT(o.HORA, '%H:%i') AS hora,
                    o.VALOR_ORDEN AS total,
                    o.ESTADO_SERVICIO AS id_estado,
                    o.ESTADO_PAGO_ AS pago,
                    u.NOMBRES AS cliente,
                    COALESCE(s.NOMBRE, 'Sin detalle') AS servicio
               FROM ordenes o
               LEFT JOIN usuario u ON u.ID_USUARIO = o.ID_USUARIO
               LEFT JOIN servicios s ON s.ID_SERVICIOS = o.ID_TIPO_SERVICIO
              ORDER BY o.ID_ORDEN DESC
              LIMIT 300"
        )->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["code" => 200, "estados" => $estados, "data" => $ordenes]);
        exit;
    }

    // ── Cambiar estado del servicio y/o del pago ──
    if ($metodo === 'POST') {
        $in = json_decode(file_get_contents('php://input'), true) ?: [];
        $idOrden = (int)($in['id_orden'] ?? 0);
        $idEstado = (int)($in['id_estado'] ?? 0);
        $pago = $in['pago'] ?? '';

        if ($idOrden <= 0) {
            http_response_code(400);
            echo json_encode(["code" => 400, "msg" => "Falta el número de orden"]);
            exit;
        }

        $existe = $db->prepare("SELECT COUNT(*) FROM ordenes WHERE ID_ORDEN = :id");
        $existe->execute([':id' => $idOrden]);
        if (!(int)$existe->fetchColumn()) {
            http_response_code(404);
            echo json_encode(["code" => 404, "msg" => "La orden no existe"]);
            exit;
        }

        if ($idEstado > 0) {
            $ok = $db->prepare("SELECT COUNT(*) FROM estados WHERE ID_ESTADO = :e");
            $ok->execute([':e' => $idEstado]);
            if (!(int)$ok->fetchColumn()) {
                http_response_code(400);
                echo json_encode(["code" => 400, "msg" => "Estado no válido"]);
                exit;
            }
            $up = $db->prepare("UPDATE ordenes SET ESTADO_SERVICIO = :e WHERE ID_ORDEN = :id");
            $up->execute([':e' => $idEstado, ':id' => $idOrden]);
        }

        if ($pago !== '') {
            if (!in_array($pago, ['Pagado', 'Pendiente'], true)) {
                http_response_code(400);
                echo json_encode(["code" => 400, "msg" => "Estado de pago no válido"]);
                exit;
            }
            $up = $db->prepare("UPDATE ordenes SET ESTADO_PAGO_ = :p WHERE ID_ORDEN = :id");
            $up->execute([':p' => $pago, ':id' => $idOrden]);
        }

        echo json_encode(["code" => 200, "msg" => "Orden #" . str_pad((string)$idOrden, 4, '0', STR_PAD_LEFT) . " actualizada"]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["code" => 405, "msg" => "Método no permitido"]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["code" => 500, "msg" => "Error en el servidor: " . $e->getMessage()]);
}
?>
