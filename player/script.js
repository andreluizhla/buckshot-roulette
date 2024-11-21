// importa e cria e verifica as variaveis do banco de dados
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
const app = window.firebaseApp
const database = window.firebaseDatabase
if (!app){
    div.error('Erro ao importar o APP')
}
if (!database) {
    div.error("Firebase Database não foi inicializado.");
}

let div = document.getElementById('dados')

document.getElementById('entrar').onclick = () => {
    div.innerHTML = ''
    const player = window.prompt("Digite o seu nome para jogar:")
    const salaId = window.prompt("Digite o código da sala:")
    
    const salaRef = ref(database, 'salas/', salaId, '/');  // Caminho onde os dados estão armazenados
    // const salaRef = database.colection('salas').doc(salaId)
    
    // update(salaRef, {
    //     
    //     jogador : firebase.firestore.FieldValue.arreyUnion(player),
    //     status: "andamento"
    // })
    
    div.innerHTML += `<p>Nome : ${player}</p>`
    div.innerHTML += `<p>Sala do jogo : ${salaId}</p>`
    div.innerHTML += `<p>Sala de referência : ${salaRef}</p>`


    get(salaRef).then((snapshot) => {
        if (snapshot.exists()) {
            div.innerHTML += snapshot.val()  // Exibe os dados da sala
            console.log(snapshot.val())
        } else {
            div.innerHTML += "Não há dados disponíveis."
        }
    }).catch((error) => {
        div.innerHTML += "Erro ao ler dados: ", error
        });

    salaRef.update({
        //jogador : 
    })
}
