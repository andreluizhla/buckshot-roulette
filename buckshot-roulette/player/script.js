import { getDatabase, set, ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const database = window.firebaseDatabase;

if (!database) {
    console.error("Firebase Database não foi inicializado.");
}

const player = window.prompt("Digite o seu nome para jogar:")
// Testando o Firebase
const salaId = window.prompt("Digite o código da sala:")

// Criando a referência correta usando ref() e set()
//const salaRef = ref(database, 'salas/', salaId, '/');  // Caminho onde os dados estão armazenados
const salaRef = database.colection('salas').doc(salaId)

update(salaRef, {
    
    jogador : firebase.firestore.FieldValue.arreyUnion(player),
    status: "andamento"
})

get(salaRef).then((snapshot) => {
    if (snapshot.exists()) {
        console.log(snapshot.val());  // Exibe os dados da sala
    } else {
        console.log("Não há dados disponíveis.");
    }
}).catch((error) => {
    console.error("Erro ao ler dados:", error);
});
