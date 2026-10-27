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
            echo json_encode(["code" => 401, "msg" => "Inicia sesión para ver las promociones"]);
            exit;
        }

        $db = ConexionBD::getInstancia()->getConexion();

        // Solo promociones activas y dentro de su fecha de vigencia
        $stmt = $db->query(
            "SELECT ID_PROMOCION AS id,
                    TITULO AS titulo,
                    DESCRIPCION AS descripcion,
                    ETIQUETA AS etiqueta,
                    FECHA_FIN AS fin,
                    DATEDIFF(FECHA_FIN, CURDATE()) AS dias
               FROM promociones
              WHERE ACTIVA = 1
                AND CURDATE() BETWEEN FECHA_INICIO AND FECHA_FIN
              ORDER BY FECHA_FIN ASC"
        );

        http_response_code(200);
        echo json_encode(["code" => 200, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["code" => 500, "msg" => "Error en el servidor: " . $e->getMessage()]);
    }
?>