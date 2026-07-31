<?php

class ConexionBD {
    // Propiedad estática para guardar la única instancia
    private static $instancia = null;
    
    // Propiedad para almacenar el objeto PDO
    private $conexion;

    // Parámetros de conexión
    private $servidor  = "localhost";
    private $usuario   = "root";
    private $password  = "";
    private $basedatos = "db_optica";
    private $charset   = "utf8mb4";

    // Constructor PRIVADO para prevenir la creación de instancias con 'new'
    private function __construct() {
        try {
            // Data Source Name (DSN)
            $dsn = "mysql:host={$this->servidor};dbname={$this->basedatos};charset={$this->charset}";
            
            // Opciones de configuración para PDO
            $opciones = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Lanza excepciones en caso de error
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,     // Devuelve arrays asociativos por defecto
                PDO::ATTR_EMULATE_PREPARES   => false,                 // Desactiva la emulación para mayor seguridad frente a SQL Injection
            ];

            // Instancia de PDO
            $this->conexion = new PDO($dsn, $this->usuario, $this->password, $opciones);
            
        } catch (PDOException $e) {
            die("Error de conexión: " . $e->getMessage());
        }
    }

    // Previene la clonación del objeto
    private function __clone() {}

    // Previene la deserialización del objeto
    public function __wakeup() {
        throw new \Exception("No se puede deserializar una clase Singleton.");
    }

    // Método estático público para obtener la instancia única
    public static function getInstancia() {
        if (self::$instancia === null) {
            self::$instancia = new self();
        }
        return self::$instancia;
    }

    // Método para obtener el objeto de la conexión PDO
    public function getConexion() {
        return $this->conexion;
    }
}