<?php
    include_once __DIR__ . '/../conexion.php';

    class UsuarioController{

        public function __construct() {
            // Constructor vacío o inicialización si es necesario
        }

        public function autenticar($usuario, $clave) {
            try {
                $db = ConexionBD::getInstancia()->getConexion();

                // Buscamos al usuario SOLO por el correo
                $stmt = $db->prepare("SELECT * FROM usuario WHERE EMAIL = :usuario");
                $stmt->bindParam(':usuario', $usuario);
                $stmt->execute();

                $user = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$user) {
                    return [];
                }

                // Comparamos la clave en texto plano contra el hash guardado (bcrypt)
                if (password_verify($clave, $user['PASSWORD'])) {
                    return [$user]; // Login correcto
                } else {
                    return []; // Clave incorrecta
                }

            } catch (Exception $e) {
                throw new Exception("Error al realizar la autenticación: " . $e->getMessage());
            }
        }

        public function registrar($nombre, $correo, $contrasena) {
            try {
                $db = ConexionBD::getInstancia()->getConexion();

                // Verificamos que el correo no exista ya
                $check = $db->prepare("SELECT ID_USUARIO FROM usuario WHERE EMAIL = :correo");
                $check->bindParam(':correo', $correo);
                $check->execute();

                if ($check->fetch()) {
                    return false; // correo ya registrado
                }

                // Hasheamos la contraseña con bcrypt antes de guardarla
                $hash = password_hash($contrasena, PASSWORD_DEFAULT);

                // Generamos un valor único temporal para IDENTIFICACION (no se pide aún en el formulario)
                $identificacionTemporal = 'TEMP-' . uniqid();

                // Insertamos el nuevo usuario. ID_ROL = 1 (CLIENTE), ID_LOCALIDAD = 1 (KENNEDY)
                $stmt = $db->prepare("INSERT INTO usuario (NOMBRES, EMAIL, PASSWORD, ID_ROL, ID_LOCALIDAD, IDENTIFICACION) VALUES (:nombre, :correo, :hash, 1, 1, :identificacion)");
                $stmt->bindParam(':nombre', $nombre);
                $stmt->bindParam(':correo', $correo);
                $stmt->bindParam(':hash', $hash);
                $stmt->bindParam(':identificacion', $identificacionTemporal);
                $stmt->execute();

                return true;

            } catch (Exception $e) {
                throw new Exception("Error al registrar el usuario: " . $e->getMessage());
            }
        }
    }
?>