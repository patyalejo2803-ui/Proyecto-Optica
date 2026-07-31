<?php
    include_once '../conexion.php';

    class UsuarioController{
        
        public function __construct() {
            // Constructor vacío o inicialización si es necesario
        }

        public function autenticar($usuario, $clave) {
            try {
                $db = ConexionBD::getInstancia()->getConexion();

                // Preparar la consulta para verificar el usuario y la contraseña
                $stmt = $db->prepare("SELECT * FROM usuario WHERE EMAIL = :usuario AND PASSWORD = :clave");
                $stmt->bindParam(':usuario', $usuario);
                $stmt->bindParam(':clave', $clave);
                $stmt->execute();

                // Obtener el resultado
                $result = $stmt->fetchAll();

                return $result;
            } catch (Exception $e) {
                // Manejo de errores: podrías loguear o lanzar una excepción personalizada
                throw new Exception("Error al realizar la autenticación: " . $e->getMessage());
            }
        }
    }
?>