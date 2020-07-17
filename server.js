// Creo las siguientes variables para mis dependencias 
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var urlencodedParser = bodyParser.urlencoded({extended : false});
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Uso express y bodyParser 
app.use(express.static(__dirname));
app.use(bodyParser.json());

// Declaro este par de variables con valores de tipo array 
var mensajes = [];
var usuarios = [];

// Hacemos uso del archivo index.html para mostrar la interface del chat 
app.get('/', function(req, res){
   res.sendFile(__dirname + '/index.html');
});

// Usamos las ruta /enviar_mensaje para enviar los mensajes de los usuarios en el chat 
app.post('/enviar_mensaje', urlencodedParser, (req,res) => {
   mensajes.push(req.body);
   io.emit('mensaje');
   res.sendStatus(200);
});

// Obtenemos los mensajes y con JSON.stringify() convertimos los objetos en una cadena de texto JSON 
app.get('/mensajes', (req,res)=>{
   res.send(JSON.stringify(mensajes));
});

// Cuando el usuario conecta al chat 
io.on('connection', (socket)=>{   

   // Configuramos su nombre de usuario 
   socket.on('configurarNombreUsuario', (datos)=>{ 
      usuarios.push(datos);
      socket.emit('configurarUsuario', {nombreusuario:datos}); 
   });

   // Pasamos los datos que el usuario esta escribiendo en el chat 
   socket.on('escribiendo', (datos)=>{
      // Si el usuario esta escribiendo un mensaje 
      if(datos.escribiendo == true){
         io.emit('display', datos);
      }
      else {
         io.emit('display', datos);
      }
   });

});

// Corremos el servidor en el puerto 3000 
http.listen(3000, function(){
   console.log('Servidor funcionando en el puerto 3000');
});
