<?php
    session_start();
    require_once 'UsuarioController.php';
    header('Content-Type: application/json');

    try{
        if($_SERVER["REQUEST_METHOD"]=="POST"){
            try{
                $_POST = json_decode(file_get_contents('php://input'), true);

                if (!empty($_POST['usuario']) && !empty($_POST['clave'])) {
                    $usuario = htmlspecialchars(trim($_POST['usuario']));
                    $clave = trim($_POST['clave']); // sin htmlspecialchars: no se debe alterar antes de password_verify()
                    $controller = new UsuarioController();
                    $result = $controller->autenticar($usuario, $clave);

                    if(count($result) > 0){
                        // Guarda la sesión en el servidor (la usan Pedidos y otros módulos)
                        session_regenerate_id(true);
                        $_SESSION['id_usuario'] = (int)$result[0]["ID_USUARIO"];
                        $_SESSION['nombre']     = $result[0]["NOMBRES"];
                        $_SESSION['id_rol']     = (int)$result[0]["ID_ROL"];

                        http_response_code(200);
                        echo json_encode(array(
                            "code" => 200,
                            "msg" => "Usuario OK",
                            "user" => $result[0]["NOMBRES"],
                            "id_rol" => $result[0]["ID_ROL"]
                        ));
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