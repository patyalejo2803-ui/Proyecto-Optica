<?php
require_once __DIR__ . '/../conexion.php';

class UsuarioController {

    private $db;

    public function __construct() {
        $this->db = ConexionBD::getInstancia()->getConexion();
    }

    /**
     * Registra un nuevo usuario.
     */
    public function registrar($nombre, $correo, $contrasena) {

        $sqlVerifica = "SELECT ID_USUARIO FROM usuario WHERE EMAIL = :email";
        $stmtVerifica = $this->db->prepare($sqlVerifica);
        $stmtVerifica->execute([':email' => $correo]);

        if ($stmtVerifica->rowCount() > 0) {
            return false;
        }

        $hash = password_hash($contrasena, PASSWORD_DEFAULT);
        $identificacionTemp = 'TEMP-' . uniqid();

        $sqlInsert = "INSERT INTO usuario (IDENTIFICACION, NOMBRES, TELEFONO, EMAIL, PASSWORD, ID_LOCALIDAD, ID_ROL, DIRECCION)
                      VALUES (:identificacion, :nombre, :telefono, :email, :password, :id_localidad, :id_rol, :direccion)";
        $stmtInsert = $this->db->prepare($sqlInsert);

        return $stmtInsert->execute([
            ':identificacion' => $identificacionTemp,
            ':nombre'         => $nombre,
            ':telefono'       => '',
            ':email'          => $correo,
            ':password'       => $hash,
            ':id_localidad'   => 1,
            ':id_rol'         => 1, // CLIENTE — antes decía 2 (ADMINISTRADOR) por error
            ':direccion'      => ''
        ]);
    }

    /**
     * Autentica un usuario por correo y contraseña.
     */
    public function autenticar($correo, $contrasena) {

        error_log("=== AUTENTICAR LLAMADO ===");
        error_log("Correo recibido: [" . $correo . "] longitud=" . strlen($correo));
        error_log("Password recibido: [" . $contrasena . "] longitud=" . strlen($contrasena));

        $sql = "SELECT ID_USUARIO, NOMBRES, EMAIL, PASSWORD, ID_ROL
                FROM usuario
                WHERE EMAIL = :email";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':email' => $correo]);

        $usuario = $stmt->fetch();

        error_log("Fetch devolvio: " . ($usuario ? "UNA FILA (ID=" . $usuario['ID_USUARIO'] . ")" : "FALSE (nada)"));

        if (!$usuario) {
            error_log("=== SALIENDO: no se encontro el usuario ===");
            return [];
        }

        error_log("Hash guardado en BD: [" . $usuario['PASSWORD'] . "]");
        $resultadoVerify = password_verify($contrasena, $usuario['PASSWORD']);
        error_log("password_verify resultado: " . ($resultadoVerify ? "TRUE" : "FALSE"));

        if ($resultadoVerify) {
            unset($usuario['PASSWORD']);
            error_log("=== LOGIN EXITOSO ===");
            return [$usuario];
        }

        error_log("=== SALIENDO: password_verify fallo ===");
        return [];
    }

    /* =====================================================
       NUEVO: Recuperación de contraseña
       ===================================================== */

    /**
     * Genera un token de recuperación para el correo dado.
     * Devuelve el token en texto plano (solo se muestra una vez,
     * en la base de datos se guarda su hash) o null si el correo
     * no existe. El método que llama a esto decide si revela o no
     * esa información al usuario final (por seguridad, normalmente NO).
     */
    public function solicitarRecuperacion($correo) {
        $sql = "SELECT ID_USUARIO FROM usuario WHERE EMAIL = :email";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':email' => $correo]);
        $usuario = $stmt->fetch();

        if (!$usuario) {
            return null;
        }

        $token = bin2hex(random_bytes(32));       // token real que recibe el usuario
        $tokenHash = hash('sha256', $token);       // lo que se guarda en la BD
        $expira = date('Y-m-d H:i:s', time() + 3600); // válido por 1 hora

        $sqlUpdate = "UPDATE usuario
                      SET RESET_TOKEN = :token, RESET_EXPIRA = :expira
                      WHERE ID_USUARIO = :id";
        $stmtUpdate = $this->db->prepare($sqlUpdate);
        $stmtUpdate->execute([
            ':token'  => $tokenHash,
            ':expira' => $expira,
            ':id'     => $usuario['ID_USUARIO']
        ]);

        return $token;
    }

    /**
     * Verifica si un token de recuperación es válido y no ha expirado.
     */
    public function validarTokenRecuperacion($token) {
        $tokenHash = hash('sha256', $token);
        $sql = "SELECT ID_USUARIO FROM usuario
                WHERE RESET_TOKEN = :token AND RESET_EXPIRA > NOW()";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':token' => $tokenHash]);
        return $stmt->fetch() ? true : false;
    }

    /**
     * Cambia la contraseña si el token es válido y no ha expirado.
     * Al usarse, el token se invalida (no se puede reutilizar).
     */
    public function restablecerContrasena($token, $nuevaContrasena) {
        $tokenHash = hash('sha256', $token);
        $sql = "SELECT ID_USUARIO FROM usuario
                WHERE RESET_TOKEN = :token AND RESET_EXPIRA > NOW()";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':token' => $tokenHash]);
        $usuario = $stmt->fetch();

        if (!$usuario) {
            return false;
        }

        $hash = password_hash($nuevaContrasena, PASSWORD_DEFAULT);
        $sqlUpdate = "UPDATE usuario
                      SET PASSWORD = :password, RESET_TOKEN = NULL, RESET_EXPIRA = NULL
                      WHERE ID_USUARIO = :id";
        $stmtUpdate = $this->db->prepare($sqlUpdate);
        return $stmtUpdate->execute([
            ':password' => $hash,
            ':id'       => $usuario['ID_USUARIO']
        ]);
    }
}