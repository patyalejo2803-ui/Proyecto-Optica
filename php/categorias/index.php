<?php
    require_once 'CategoriaController.php';
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');

    $controller = new CategoriaController();
    $metodo = $_SERVER['REQUEST_METHOD'];

    try {

        // LEER (todas las categorías)
        if ($metodo == 'GET') {
            $categorias = $controller->listar();
            http_response_code(200);
            echo json_encode(["code" => 200, "data" => $categorias]);
        }

        // CREAR
        elseif ($metodo == 'POST') {
            $body = json_decode(file_get_contents('php://input'), true);

            if (!empty($body['nombre'])) {
                $nuevoId = $controller->crear(htmlspecialchars(trim($body['nombre'])));
                http_response_code(200);
                echo json_encode(["code" => 200, "msg" => "Categoría creada correctamente", "id" => $nuevoId]);
            } else {
                http_response_code(402);
                echo json_encode(["code" => 402, "msg" => "Falta el nombre de la categoría"]);
            }
        }

        // ACTUALIZAR
        elseif ($metodo == 'PUT') {
            $body = json_decode(file_get_contents('php://input'), true);

            if (!empty($body['id']) && !empty($body['nombre'])) {
                $controller->actualizar((int)$body['id'], htmlspecialchars(trim($body['nombre'])));
                http_response_code(200);
                echo json_encode(["code" => 200, "msg" => "Categoría actualizada correctamente"]);
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
                echo json_encode(["code" => 200, "msg" => "Categoría eliminada correctamente"]);
            } else {
                http_response_code(402);
                echo json_encode(["code" => 402, "msg" => "Falta el ID de la categoría"]);
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