// Declaramos las siguientes variables 
var socket = io();
var usuario;
var escribiendo = false;
var timeout = undefined;

// Crear nombre de usuario 
function configurarNombreUsuario(){
    socket.emit('configurarNombreUsuario', $('#item').val());
}


$(document).ready(function(){

    // Si el usuario presiona la tecla ENTER luego de escribir su nombre de usuario
    // llamamos al método configurarNombreUsuario() 
    $('#item').keydown(function (e){
        if(e.keyCode == 13){
            configurarNombreUsuario();
        }
    })

    // Configuración para que el usuario pueda enviar mensajes en el chat 
    socket.on('configurarUsuario', (datos)=>{
        usuario = datos.nombreusuario;
        console.log(usuario);
        $("#nombreusuario").html("<label class='txt_negrita'>Escribe un Mensaje:</label>");
        $("#item").val("");
        $("#item").attr("placeholder", "");
        
        $("#enviar").attr("onclick", "enviarMensaje()");
        $("#enviar").attr("value", "Enviar");         

        // Mostramos los mensajes del usuario en el chat 
        obtenerMensajes();
    });

    // Hacemos uso del método 'keypress' de jQuery que detecta si el usuario esta escribiendo en el chat
    // y mostramos el mensaje 'Usuario esta escribiendo...' al otro usuario 
    $('#item').keypress((e)=>{
    
        if($("#item").attr("placeholder") != "Nombre de Usuario:"){

            if(e.which != 13){
                escribiendo = true;
                socket.emit('escribiendo', {usuario:usuario, escribiendo:true});
                clearTimeout(timeout);
                timeout = setTimeout(finTiempoEscritura, 100);
            }
            else {
                clearTimeout(timeout);
                finTiempoEscritura();
                enviarMensaje();
            }
        }

    });

    // Si un usuario esta escribiendo un mensaje, mostramos al otro usuario
    // el texto 'Usuario esta escribiendo...'
    socket.on('display', (datos)=>{

        if(datos.escribiendo == true) {

            // Detectamos la ventana del chat activa 
            // y cuando usuario esta escribiendo su mensaje, le ocultamos el texto 'Usuario esta escribiendo...'           
            if (document.hasFocus()) {
                $('.escribiendo').hide();
            }
            else {
                $('.escribiendo').show(); 
            }

            
        }
        else {
            // Si aún no se crea un nombre de usuario, ocultamos el texto 'Usuario esta escribiendo...' 
            if(usuario == undefined){
                $('.escribiendo').text("");
            }
            else {    
                // Al otro usuario le mostramos el texto 'Usuario esta escribiendo...'                                                
                $('.escribiendo').text(`${datos.usuario} esta escribiendo...`);
                setTimeout(function() {
                    $('.escribiendo').fadeOut('fast');
                }, 1500)                
            }
        }
    });
});

// Obtenemos los mensajes en tiempo real 
socket.on('mensaje',obtenerMensajes);

// Dejamos de mostrar el mensaje 
function finTiempoEscritura(){
    escribiendo = false;
    socket.emit('escribiendo', {usuario:usuario, escribiendo:false});
}

// Obtenemos los mensajes para mostrarlos en el chat 
function obtenerMensajes(){
    
    $.getJSON("http://localhost:3000/mensajes/", (datos)=>{
        
        var mensaje = [];
        $.each(datos, (key, val) => {
            $.each(val, (key, val) => {
                var nombreusuario = key;
                var msg = val;

                // Mostramos en el chat el nombre de usuario y su mensaje que ha enviado 
                mensaje.push(`<strong>${nombreusuario}</strong><p>${msg}</p>`);
            });
        });
    
        // Mostramos los mensajes en el contenedor del Chat 
        $(".ventanachat").html(mensaje);

        // Mantenemos el scroll siempre activo en el último mensaje enviado al Chat 
        $(".ventanachat").animate({ scrollTop: $(document).height() }, "slow");
        return false;
    });

};

// Con este método enviamos el mensaje del usuario al Chat 
function enviarMensaje() {

    var nombreUsuario = usuario; 
    var mensaje = $('#item').val();

    if(nombreUsuario == undefined){
        var item = `{"Bienvenido: " : "${mensaje}"}`;
    }
    else {
        var item = `{"${nombreUsuario}" : "${mensaje}"}`;
    }

    $.post('/enviar_mensaje', JSON.parse(item), ()=>{
        console.log('mensaje enviado');
    });

    $('#item').val("");

}