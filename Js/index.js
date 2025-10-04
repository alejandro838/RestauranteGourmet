document.addEventListener("DOMContentLoaded",function (){
    document.getElementById("btnIncio").onclick=function(){
        document.getElementById("Contenedor").src = "Vista/presentación.html"
    };
    document.getElementById("btnCarta").onclick= function (){
        AbrirPagina("Vista/Carta.html");
    };
    document.getElementById("btnReserva").onclick = function (){
        AbrirPagina("Vista/Reserva.html");
    };
    document.getElementById("btnReservas").onclick = function (){
        AbrirPagina("Vista/Reservas.html");
    }
});

//FUNCTION PARA ABRIR PAGINA
function AbrirPagina(Url){
    document.getElementById("Contenedor").src=Url;
}