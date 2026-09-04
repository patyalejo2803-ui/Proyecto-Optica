<?php
    include_once '../conexion.php';

    class ProductoController {

        public function listar() {
            $db = ConexionBD::getInstancia()->getConexion();
            $sql = "SELECT p.id_PRODUCTOS AS id_producto,
                           p.NOMBRE       AS nombre,
                           p.ID_CATEGORIA AS id_categoria,
                           c.NOMBRE       AS categoria,
                           p.MARCA        AS marca,
                           p.ESTADO       AS estado
                    FROM productos p
                    LEFT JOIN categorias c ON p.ID_CATEGORIA = c.ID_CATEGORIAS
                    ORDER BY p.id_PRODUCTOS DESC";
            $stmt = $db->query($sql);
            return $stmt->fetchAll();
        }

        public function crear($nombre, $idCategoria, $marca, $estado) {
            $db = ConexionBD::getInstancia()->getConexion();
            $sql = "INSERT INTO productos (NOMBRE, ID_CATEGORIA, MARCA, ESTADO)
                    VALUES (:nombre, :idCategoria, :marca, :estado)";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':idCategoria', $idCategoria);
            $stmt->bindParam(':marca', $marca);
            $stmt->bindParam(':estado', $estado);
            $stmt->execute();
            return $db->lastInsertId();
        }

        public function actualizar($id, $nombre, $idCategoria, $marca, $estado) {
            $db = ConexionBD::getInstancia()->getConexion();
            $sql = "UPDATE productos
                    SET NOMBRE = :nombre,
                        ID_CATEGORIA = :idCategoria,
                        MARCA = :marca,
                        ESTADO = :estado
                    WHERE id_PRODUCTOS = :id";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':idCategoria', $idCategoria);
            $stmt->bindParam(':marca', $marca);
            $stmt->bindParam(':estado', $estado);
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        }

        public function eliminar($id) {
            $db = ConexionBD::getInstancia()->getConexion();
            $stmt = $db->prepare("DELETE FROM productos WHERE id_PRODUCTOS = :id");
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        }
    }
?>