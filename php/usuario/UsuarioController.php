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
            ':id_rol'         => 2,
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
}