<?php
    include_once '../conexion.php';

    class CategoriaController {

        public function listar() {
            $db = ConexionBD::getInstancia()->getConexion();
            $sql = "SELECT ID_CATEGORIAS AS id_categoria,
                           NOMBRE        AS nombre
                    FROM categorias
                    ORDER BY NOMBRE ASC";
            $stmt = $db->query($sql);
            return $stmt->fetchAll();
        }

        public function crear($nombre) {
            $db = ConexionBD::getInstancia()->getConexion();
            $sql = "INSERT INTO categorias (NOMBRE) VALUES (:nombre)";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->execute();
            return $db->lastInsertId();
        }

        public function actualizar($id, $nombre) {
            $db = ConexionBD::getInstancia()->getConexion();
            $sql = "UPDATE categorias SET NOMBRE = :nombre WHERE ID_CATEGORIAS = :id";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        }

        public function eliminar($id) {
            $db = ConexionBD::getInstancia()->getConexion();

            // Verificamos que no haya productos usando esta categoría antes de borrar
            $check = $db->prepare("SELECT COUNT(*) FROM productos WHERE ID_CATEGORIA = :id");
            $check->bindParam(':id', $id);
            $check->execute();

            if ($check->fetchColumn() > 0) {
                throw new Exception("No se puede eliminar: hay productos usando esta categoría.");
            }

            $stmt = $db->prepare("DELETE FROM categorias WHERE ID_CATEGORIAS = :id");
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        }
    }
?>