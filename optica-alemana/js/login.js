import { enviarPeticion, ir } from './herramientas.js';

export async function validarLogin(correo, clave) {

     await enviarPeticion({
            url: "php/usuario/index.php",
            method: "POST",
            param: {usuario: correo, clave: clave},
            fSuccess: (resp)=>{
                if(resp.code == 200){
                    alert("El usuario ha iniciado sesión correctamente.");
                    ir("admin.html")
                }
                else {
                    alert(resp.msg);
                    mensaje.style.display = "none";
                }
            }
        });
}