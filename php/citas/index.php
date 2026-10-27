<?php
    session_start();
    require_once __DIR__ . '/../conexion.php';
    header('Content-Type: application/json');
    date_default_timezone_set('America/Bogota');

    // Horario de atención (formato HH:MM)
    $HORAS = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'];

    // Servicios que se reservan con hora (en mayúsculas)
    $SERVICIOS_CITA = ['CONSULTAR H.CLINICA', 'CONTROL', 'EXAMEN VISUAL'];

    function horasOcupadas($db, $fecha) {
        $stmt = $db->prepare(
            "SELECT TIME_FORMAT(o.HORA, '%H:%i') AS hora
               FROM ordenes o
               LEFT JOIN estados e ON e.ID_ESTADO = o.ESTADO_SERVICIO
              WHERE o.FECHA = :f
                AND (e.NOMBRE IS NULL OR UPPER(e.NOMBRE) NOT LIKE 'CANCEL%')"
        );
        $stmt->execute([':f' => $fecha]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    try {
        if (empty($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["code" => 401, "msg" => "Inicia sesión para agendar una cita"]);
            exit;
        }
        $idUsuario = (int)$_SESSION['id_usuario'];
        $db = ConexionBD::getInstancia()->getConexion();

        $marcas = implode(',', array_fill(0, count($SERVICIOS_CITA), '?'));

        // ── Consultar servicios y horas ocupadas ──
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $stmt = $db->prepare(
                "SELECT ID_SERVICIOS AS id, NOMBRE AS nombre, PRECIO AS precio
                   FROM servicios
                  WHERE UPPER(NOMBRE) IN ($marcas)
                  ORDER BY NOMBRE"
            );
            $stmt->execute($SERVICIOS_CITA);
            $servicios = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $ocupadas = [];
            $fecha = $_GET['fecha'] ?? '';
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
                $ocupadas = horasOcupadas($db, $fecha);
            }

            echo json_encode([
                "code" => 200,
                "servicios" => $servicios,
                "horas" => $HORAS,
                "ocupadas" => $ocupadas
            ]);
            exit;
        }

        // ── Guardar una cita nueva ──
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $in = json_decode(file_get_contents('php://input'), true) ?: [];
            $idServicio = (int)($in['id_servicio'] ?? 0);
            $fecha = $in['fecha'] ?? '';
            $hora  = $in['hora'] ?? '';

            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha) || !in_array($hora, $HORAS, true) || $idServicio <= 0) {
                http_response_code(400);
                echo json_encode(["code" => 400, "msg" => "Completa servicio, fecha y hora"]);
                exit;
            }
            $dt = DateTime::createFromFormat('Y-m-d H:i', "$fecha $hora");
            if (!$dt || $dt->format('Y-m-d') !== $fecha) {
                http_response_code(400);
                echo json_encode(["code" => 400, "msg" => "Fecha no válida"]);
                exit;
            }
            if ($dt < new DateTime()) {
                http_response_code(400);
                echo json_encode(["code" => 400, "msg" => "No puedes agendar en una fecha u hora pasada"]);
                exit;
            }
            if ($dt->format('w') === '0') {
                http_response_code(400);
                echo json_encode(["code" => 400, "msg" => "No atendemos los domingos"]);
                exit;
            }

            // El servicio debe existir Y ser uno de los que se reservan con hora
            $stmt = $db->prepare(
                "SELECT PRECIO FROM servicios
                  WHERE ID_SERVICIOS = ? AND UPPER(NOMBRE) IN ($marcas)"
            );
            $stmt->execute(array_merge([$idServicio], $SERVICIOS_CITA));
            $servicio = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$servicio) {
                http_response_code(400);
                echo json_encode(["code" => 400, "msg" => "Ese servicio no se puede reservar con cita"]);
                exit;
            }

            if (in_array($hora, horasOcupadas($db, $fecha), true)) {
                http_response_code(409);
                echo json_encode(["code" => 409, "msg" => "Esa hora ya fue reservada. Elige otra"]);
                exit;
            }

            $est = $db->query("SELECT ID_ESTADO FROM estados WHERE UPPER(NOMBRE) = 'PENDIENTE' LIMIT 1")->fetchColumn();
            if (!$est) {
                http_response_code(500);
                echo json_encode(["code" => 500, "msg" => "No existe el estado PENDIENTE en la tabla estados"]);
                exit;
            }

            $ins = $db->prepare(
                "INSERT INTO ordenes (FECHA, HORA, VALOR_ORDEN, ID_USUARIO, ID_TIPO_SERVICIO, ESTADO_SERVICIO, ESTADO_PAGO_)
                 VALUES (:f, :h, :v, :u, :s, :e, 'Pendiente')"
            );
            $ins->execute([
                ':f' => $fecha, ':h' => $hora . ':00', ':v' => $servicio['PRECIO'],
                ':u' => $idUsuario, ':s' => $idServicio, ':e' => (int)$est
            ]);

            http_response_code(200);
            echo json_encode(["code" => 200, "msg" => "Cita agendada", "id" => (int)$db->lastInsertId()]);
            exit;
        }

        http_response_code(405);
        echo json_encode(["code" => 405, "msg" => "Método no permitido"]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["code" => 500, "msg" => "Error en el servidor: " . $e->getMessage()]);
    }
?>