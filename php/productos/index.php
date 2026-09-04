<?php
    require_once 'ProductoController.php';
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');

    $controller = new ProductoController();
    $metodo = $_SERVER['REQUEST_METHOD'];

    try {

        // LEER (todos los productos)
        if ($metodo == 'GET') {
            $productos = $controller->listar();
            http_response_code(200);
            echo json_encode(["code" => 200, "data" => $productos]);
        }

        // CREAR
        elseif ($metodo == 'POST') {
            $body = json_decode(file_get_contents('php://input'), true);

            if (!empty($body['nombre']) && !empty($body['id_categoria']) && !empty($body['marca']) && !empty($body['estado'])) {
                $nuevoId = $controller->crear(
                    htmlspecialchars(trim($body['nombre'])),
                    (int)$body['id_categoria'],
                    htmlspecialchars(trim($body['marca'])),
                    htmlspecialchars(trim($body['estado']))
                );
                http_response_code(200);
                echo json_encode(["code" => 200, "msg" => "Producto creado correctamente", "id" => $nuevoId]);
            } else {
                http_response_code(402);
                echo json_encode(["code" => 402, "msg" => "Faltan datos obligatorios"]);
            }
        }

        // ACTUALIZAR
        elseif ($metodo == 'PUT') {
            $body = json_decode(file_get_contents('php://input'), true);

            if (!empty($body['id']) && !empty($body['nombre']) && !empty($body['id_categoria']) && !empty($body['marca']) && !empty($body['estado'])) {
                $controller->actualizar(
                    (int)$body['id'],
                    htmlspecialchars(trim($body['nombre'])),
                    (int)$body['id_categoria'],
                    htmlspecialchars(trim($body['marca'])),
                    htmlspecialchars(trim($body['estado']))
                );
                http_response_code(200);
                echo json_encode(["code" => 200, "msg" => "Producto actualizado correctamente"]);
            } else {
                http_response_code(402);
                echo json_encode(["code" => 402, "msg" => "Faltan datos obligatorios"]);
            }
        }

        // ELIMINAR
        elseif ($metodo == 'DELETE') {
            $body = json_decode(file_get_contents('php://input'), true);

            if (!empty($body['id'])) {
                $controller->eliminar((int)$body['id']);
                http_response_code(200);
                echo json_encode(["code" => 200, "msg" => "Producto eliminado correctamente"]);
            } else {
                http_response_code(402);
                echo json_encode(["code" => 402, "msg" => "Falta el ID del producto"]);
            }
        }

        else {
            http_response_code(405);
            echo json_encode(["code" => 405, "msg" => "Método no permitido"]);
        }

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(["code" => 400, "msg" => $e->getMessage()]);
    }
?>