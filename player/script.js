// importa e cria e verifica as variaveis do banco de dados
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
const app = window.firebaseApp
const database = window.firebaseDatabase
if (!app){
    console.error('Erro ao importar o APP')
}
if (!database) {
    console.error("Firebase Database não foi inicializado.");
}

// Definir classe Item
class Item {
    constructor(nome, src, descricao) {
        this.nome = nome;
        this.src = src;
        this.descricao = descricao;
    }
}

// Variáveis usando a classe Item
const vacina = new Item("Vacina do SUS", "../img/vacina.png", "Esse item faz co mque você pegue imprestado (rouba) um item do seu amiguinho e usa imediatamente")
const nokia = new Item('Nokia', '../img/nokia.png', 'Uma voz misteriosa te conta sobre a posição e tipo da bala a partir desta ligação')
const cerra = new Item('Cerra do Tio', '../img/cerra.png', 'Dobra o dano da shotgun nesse turno')
const cingarro = new Item('Cingarro', '../img/cingarro.png', 'Ganha +1 de vida')
const heineken = new Item('Heineken', '../img/heineken.png', 'Descarta a bala atual')
const lupa = new Item('Lupa do tio Sherlock', '../img/lupa.png', 'Veja qual é a bala atual')
const paracetamol = new Item('Paracetamol Vencido', '../img/paracetamol.png', '50% de chance de ganhar 2 de vida e 50% de chance de perder 1 de vida')
const reverso = new Item('Carta Reverso', '../img/reverso.png', 'Inverte a direção que o jogo roda')
const bloqueio = new Item('Carta Bloqueio', '../img/bloqueio.png', 'Bloqueia a vez de quem você quizer')


// Lista dos itens
const itens = [vacina, nokia, cerra, cingarro, heineken, lupa, paracetamol, reverso, bloqueio]

// Lista da mesa
// Mapa da mesa: [ mesa [ lado [ linha [ coluna ] ] ]]
const mesa = [[[[], []], [[], []]], [[[], []], [[], []]]]


document.getElementById('entrar').onclick = () => {

    // const player = window.prompt("Digite o seu nome para jogar:")
    const salaId = window.prompt("Digite o código da sala:")
    
    
    // Caminho onde os dados estão armazenados:
    const salaRef = ref(database, 'salas/', salaId);
    
    // update(salaRef, {
        //     
        //     jogador : firebase.firestore.FieldValue.arreyUnion(player),
        //     status: "andamento"
        // })
        
    console.log('Nome : ', player)
    console.log('Sala do jogo : ', salaId)
    console.log('Sala de referência : ', salaRef)
    
    
    get(salaRef).then((snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val())  // Exibe os dados da sala
        } else {
            console.error("Não há dados disponíveis.")
        }
    }).catch((error) => {
        console.error("Erro ao ler dados: ", error)
    });
    
    salaRef.update({
        //jogador : 
    })
}

document.addEventListener('mousemove', (event) => {
    const descricaoDiv = document.getElementById('descricao-item');
    if (descricaoDiv.style.display === 'block') {
        descricaoDiv.style.left = event.pageX + 'px';
        descricaoDiv.style.top = event.pageY + 'px';
    }
})
    
document.getElementById('criar-itens').onclick = () => {
    const img_itens = document.querySelectorAll('.item')
    const descricaoDiv = document.getElementById('descricao-item')

    let index_aleatorio 
    let item_aleatorio
    let cont = 0
    
    for (let lado = 0; lado < 2; lado++){
        for (let linha = 0; linha < 2; linha++){
            for (let coluna = 0; coluna < 2; coluna++){
                // aleatoriza um índice para ter um item aleatório
                index_aleatorio = Math.floor(Math.random() * itens.length)
                const item_aleatorio = itens[index_aleatorio]
                
                // Adiciona item na lista
                mesa[lado][linha][coluna].push(item_aleatorio)

                // altera a imagem do item e o texto alternativo
                img_itens[cont].src = item_aleatorio.src
                img_itens[cont].alt = `${item_aleatorio.nome}: ${item_aleatorio.descricao}`;
                // Sim, pode parecer estranho o que eu vou dizer
                // mas, se alguêm tirar o ponto e virgua
                // da linha de alterar o parâmentro alt da imagem
                // o site quebra
                // pode acreditar, ele vai colocar apenas 1 img e pronto, morreu

                
                // Adiciona eventos para mostrar e esconder a descrição
                ((img, item) => {
                    img.addEventListener('mouseover', (event) => {
                        descricaoDiv.style.display = 'block';
                        descricaoDiv.style.left = event.pageX + 'px';
                        descricaoDiv.style.top = event.pageY + 'px';
                        descricaoDiv.innerHTML = `<strong>${item.nome}</strong><br>${item.descricao}`;
                    });

                    img.addEventListener('mouseout', () => {
                        descricaoDiv.style.display = 'none';
                    });
                })(img_itens[cont], item_aleatorio);

                cont++
            }
        }
    }
    console.log(mesa)
}

// document.