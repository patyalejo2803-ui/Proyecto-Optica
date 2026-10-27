<?php
    session_start();
    require_once __DIR__ . '/../conexion.php';
    header('Content-Type: application/json');
    date_default_timezone_set('America/Bogota');

    try {
        if (empty($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["code" => 401, "msg" => "Inicia sesión para hacer un pedido"]);
            exit;
        }

        $db = ConexionBD::getInstancia()->getConexion();
        $metodo = $_SERVER['REQUEST_METHOD'];

        // LISTAR los servicios disponibles
        if ($metodo === 'GET') {
            $stmt = $db->query("SELECT ID_SERVICIOS AS id_servicio,
                                       NOMBRE        AS nombre,
                                       DESCRIPCION   AS descripcion,
                                       PRECIO        AS precio
                                FROM servicios
                                ORDER BY NOMBRE");
            http_response_code(200);
            echo json_encode(["code" => 200, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }

        // CREAR el pedido
        elseif ($metodo === 'POST') {
            $body = json_decode(file_get_contents('php://input'), true);

            $idServicio = (int)($body['id_servicio'] ?? 0);
            $medio = trim($body['medio'] ?? '');
            $mediosPermitidos = ['Tarjeta', 'Transferencia', 'Efectivo'];

            if ($idServicio <= 0 || !in_array($medio, $mediosPermitidos, true)) {
                http_response_code(402);
                echo json_encode(["code" => 402, "msg" => "Faltan datos: elige un servicio y un medio de pago"]);
                exit;
            }

            // El precio se lee de la base de datos, no del navegador
            $stmtPrecio = $db->prepare("SELECT PRECIO, NOMBRE FROM servicios WHERE ID_SERVICIOS = :id");
            $stmtPrecio->execute([':id' => $idServicio]);
            $servicio = $stmtPrecio->fetch(PDO::FETCH_ASSOC);

            if (!$servicio) {
                http_response_code(404);
                echo json_encode(["code" => 404, "msg" => "El servicio elegido no existe"]);
                exit;
            }

            $ahora = date('Y-m-d H:i:s');

            $sql = "INSERT INTO ordenes
                        (FECHA, HORA, VALOR_ORDEN, ID_USUARIO, ID_TIPO_SERVICIO,
                         METODO_PAGO_, ESTADO_SERVICIO, FECHA_PAGO_, ESTADO_PAGO_)
                    VALUES
                        (:fecha, :hora, :valor, :usuario, :servicio,
                         :metodo, 1, :fecha_pago, 'Pagado')";
            $stmt = $db->prepare($sql);
            $stmt->execute([
                ':fecha'      => date('Y-m-d'),
                ':hora'       => date('H:i:s'),
                ':valor'      => $servicio['PRECIO'],
                ':usuario'    => (int)$_SESSION['id_usuario'],
                ':servicio'   => $idServicio,
                ':metodo'     => $medio,
                ':fecha_pago' => $ahora
            ]);

            http_response_code(200);
            echo json_encode([
                "code"     => 200,
                "msg"      => "Pedido registrado correctamente",
                "id_orden" => (int)$db->lastInsertId(),
                "servicio" => $servicio['NOMBRE'],
                "total"    => (float)$servicio['PRECIO']
            ]);
        }

        else {
            http_response_code(405);
            echo json_encode(["code" => 405, "msg" => "Método no permitido"]);
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["code" => 500, "msg" => "Error en el servidor: " . $e->getMessage()]);
    }
?>
