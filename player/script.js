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

class Item {
    constructor(nome, src, descricao) {
        this.nome = nome;
        this.src = src;
        this.descricao = descricao;
    }
}

var adrenalina = new Item("adrenalina", "../img/adrenalina.png", "Esse item faz co mque você pegue imprestado (rouba) um item do seu amiguinho e usa imediatamente")
var celular = new Item('celular', '../img/celular.png', 'Uma voz misteriosa te conta sobre a posição e tipo da bala a partir desta ligação')
var cerra = new Item('cerra', '../img/cerra.png', 'Dobra o dano da shotgun nesse turno')
var cigarro = new Item('cigarro', '../img/cigarro.png', 'Ganha +1 de vida')
var heineken = new Item('heineken', '../img/heineken.png', 'Descarta a bala atual')
var lupa = new Item('lupa', '../img/lupa.png', 'Veja qual é a bala atual')
var paracetamol = new Item('paracetamol', '../img/paracetamol.png', '50% de chance de ganhar 2 de vida e 50% de chance de perder 1 de vida')
var reverso = new Item('reverso', '../img/reverso.png', 'Inverte a direção que o jogo roda')
var bloqueio = new Item('bloqueio', '../img/bloqueio.png', 'Bloqueia a vez de quem você quizer')

let itens = [adrenalina, celular, cerra, cigarro, heineken, lupa, paracetamol, reverso, bloqueio]
let mesa = [[[[], []], [[], []]], [[[], []], [[], []]]]


document.getElementById('entrar').onclick = () => {
    div.innerHTML = ''
    // const player = window.prompt("Digite o seu nome para jogar:")
    const salaId = window.prompt("Digite o código da sala:")
    
    
    // Caminho onde os dados estão armazenados:
    const salaRef = ref(database, 'salas/', salaId);  
    
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
    
document.getElementById('criar-itens').onclick = () => {
    let img_itens = document.querySelectorAll('.item')
    let index_aleatorio 
    let item_aleatorio
    let cont = 0
    for (let lado = 0; lado < 2 ; lado++){
        for (let linha = 0; linha < 2; linha++){
            for (let coluna = 0; coluna < 2; coluna++){
                index_aleatorio = Math.floor(Math.random() * itens.length)
                item_aleatorio = itens[index_aleatorio]
                mesa[lado][linha][coluna].push(item_aleatorio)
                img_itens[cont].src = item_aleatorio.src
                img_itens[cont].alt = `${item_aleatorio.nome}: ${item_aleatorio.descricao}`
                
                cont++
            }
        }
    }
    console.log(mesa)
}

// document.