<?php
    require_once 'usuario/UsuarioController.php';
    header('Content-Type: application/json');

    try {
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            try {
                $_POST = json_decode(file_get_contents('php://input'), true);

                if (!empty($_POST['nombre']) && !empty($_POST['correo']) && !empty($_POST['contrasena'])) {
                    $nombre     = htmlspecialchars(trim($_POST['nombre']));
                    $correo     = htmlspecialchars(trim($_POST['correo']));
                    $contrasena = trim($_POST['contrasena']); // no se limpia con htmlspecialchars, se hashea tal cual
                    $fecha      = trim($_POST['fecha'] ?? '');

                    // Si llega fecha, debe ser una fecha real (AAAA-MM-DD) y no futura
                    if ($fecha !== '') {
                        $d = DateTime::createFromFormat('Y-m-d', $fecha);
                        $valida = $d && $d->format('Y-m-d') === $fecha;
                        if (!$valida || $d > new DateTime('today') || $d < new DateTime('1900-01-01')) {
                            http_response_code(400);
                            echo json_encode(["code" => 400, "msg" => "Fecha de nacimiento no válida"]);
                            exit;
                        }
                    } else {
                        $fecha = null;
                    }

                    $controller = new UsuarioController();
                    $resultado = $controller->registrar($nombre, $correo, $contrasena, $fecha);

                    if ($resultado) {
                        http_response_code(200);
                        echo json_encode(["code" => 200, "msg" => "Usuario registrado correctamente"]);
                    } else {
                        http_response_code(409);
                        echo json_encode(["code" => 409, "msg" => "El correo ya está registrado"]);
                    }

                } else {
                    http_response_code(402);
                    echo json_encode(["code" => 402, "msg" => "Error, faltan parámetros necesarios"]);
                }

            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(["code" => 500, "msg" => "Error en el servidor \n" . $e->getMessage()]);
            }
        } else {
            http_response_code(401);
            echo json_encode(["code" => 401, "msg" => "No autorizado"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["code" => 500, "msg" => "Error en el servidor \n" . $e->getMessage()]);
    }
?>