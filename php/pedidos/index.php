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

        // Solo usuarios que iniciaron sesión
        if (empty($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["code" => 401, "msg" => "Inicia sesión para ver los pedidos"]);
            exit;
        }

        $idUsuario = (int)$_SESSION['id_usuario'];
        $idRol = (int)($_SESSION['id_rol'] ?? 1);

        $db = ConexionBD::getInstancia()->getConexion();

        $sql = "SELECT o.ID_ORDEN AS id_orden,
                       o.FECHA AS fecha,
                       o.VALOR_ORDEN AS total,
                       u.NOMBRES AS cliente,
                       COALESCE(e.NOMBRE, o.ESTADO_SERVICIO) AS estado,
                       COALESCE(ep.NOMBRE, o.ESTADO_PAGO_) AS pago,
                       (SELECT GROUP_CONCAT(CONCAT(p.NOMBRE, ' x', op.CANTIDAD) SEPARATOR ', ')
                          FROM orden_producto op
                          JOIN productos p ON p.id_PRODUCTOS = op.ID_PRODUCTO
                         WHERE op.ID_ORDEN = o.ID_ORDEN) AS productos
                FROM ordenes o
                LEFT JOIN usuario u ON u.ID_USUARIO = o.ID_USUARIO
                LEFT JOIN estados e ON e.ID_ESTADO = o.ESTADO_SERVICIO
                LEFT JOIN estados ep ON ep.ID_ESTADO = o.ESTADO_PAGO_";

        // El cliente (rol 1) solo ve sus pedidos; el personal ve todos
        if ($idRol === 1) {
            $sql .= " WHERE o.ID_USUARIO = :uid";
        }
        $sql .= " ORDER BY o.ID_ORDEN DESC";

        $stmt = $db->prepare($sql);
        if ($idRol === 1) {
            $stmt->bindValue(':uid', $idUsuario, PDO::PARAM_INT);
        }
        $stmt->execute();

        http_response_code(200);
        echo json_encode([
            "code" => 200,
            "rol"  => $idRol,
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["code" => 500, "msg" => "Error en el servidor: " . $e->getMessage()]);
    }
?>