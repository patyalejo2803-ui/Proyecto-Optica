<?php
    require_once 'UsuarioController.php';
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json');

    try{
        if($_SERVER["REQUEST_METHOD"]=="POST"){
            try{
                //Validacion de parametros
                $_POST = json_decode(file_get_contents('php://input'), true);
                // Validar parámetros
                if (!empty($_POST['usuario']) && !empty($_POST['clave'])) {
                    $usuario = htmlspecialchars(trim($_POST['usuario']));
                    $clave = htmlspecialchars(trim($_POST['clave']));
                    $controller = new UsuarioController();
                    $result = $controller->autenticar($usuario, $clave);
                    //var_dump($result);
                    if(count($result) > 0){
                        http_response_code(200);
                        echo json_encode(array("code"=>200, "msg" => "Usuario OK", "user" => $result[0]["NOMBRES"]));
                    } else {
                        http_response_code(203);
                        echo json_encode(array("code"=>203, "msg" => "Las credenciales no son válidas"));
                    }
                                   
                } else {
                    http_response_code(402);
                    echo json_encode(array("code"=>402, "msg" => "Error, faltan parámetros necesarios"));
                }

            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(["code"=>500,"msg"=>"Error en el servidor \n".$e->getMessage()]);
            }
        }else{
            http_response_code(401);
            echo json_encode(["code"=>401,"msg"=>"No autorizado"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["code"=>500,"msg"=>"Error en el servidor \n".$e->getMessage()]);
    }
?>