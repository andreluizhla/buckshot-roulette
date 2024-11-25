// Importação e configuração do Firebase Database
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const app = window.firebaseApp;
const database = window.firebaseDatabase;

if (!app) console.error("Erro ao importar o APP");
if (!database) console.error("Firebase Database não foi inicializado.");

// Criação de uma sala
document.getElementById("criar-sala").onclick = () => {
    if (!database) {
        console.error("Firebase Database não foi inicializado.");
        return;
    }

    const salaId = Math.random().toString(36).substr(2, 9);
    const salaRef = ref(database, `salas/${salaId}`);

    set(salaRef, {
        status: "aguardando",
        jogadores: []
    })
        .then(() => {
            console.log("Sala criada com sucesso!", salaId);
            window.alert(`Sala criada! Código: ${salaId}`);
        })
        .catch((error) => {
            console.error("Erro ao criar sala:", error);
        });
};

// --- Configurações do jogo ---

// Variaveis do site
const shotgun = document.getElementById("shotgun");
const cartuchoSite = document.querySelector("#cartucho");
const player = document.getElementById("player");
const barraVida = document.getElementById("barra-vida");
const caixa = document.getElementById('caixa')
const img_itens = document.querySelectorAll(".item");
const descricaoDiv = document.getElementById("descricao-item");

// Variaveis do jogo
let cartucho_atual = [];
let num_vazio = 0;
let numBalaVerdade = 0;
let numBalaFalsa = 0;
let rodada = 0
let vida = 3
let itensAtualizados = 0
let maxVida = 4;
let maxAtualizacoes = 3
let maxRodadas = 3
let itensPegos = false

const assets = {
    imagens : {
        shotgun : "../img/shotgun.png",
        shotgun_atirando : "../img/shotgun_atirando.png",
        caixa_aberta: "../img/caixa-aberta.png",
        caixa_fechada: "../img/caixa-fechada.png",
        item_nada : "img/nada.png"
    },

    audios : {
        tiro: "../sounds/tiro.mp3",
        tirofake: "../sounds/tiro-fake.mp3",
        recarregar: "../sounds/recarregando.mp3"
    }, 
    
    img_html : {
        cartucho_verdadeiro : '<img src="../img/cartucho-verdadeiro.png" alt="Bala Verdadeira" class="bala">',
        cartucho_falso : '<img src="../img/cartucho-falso.png" alt="Bala Falsa" class="bala">',
        cartucho_nada : '<img src="../img/cartucho-nada.png" alt="Nada" class="bala">'
    }
}

// Funções utilitárias
function geradorNumeroBalas() {
    while (true) {
        let variavel = Math.ceil(Math.random() * 10);
        if (10 > variavel + num_vazio) return variavel;
    }
}

function geraVazio() {
    while (true) {
        let variavel = Math.ceil(Math.random() * 10);
        if (variavel > 0 && variavel < 8) return variavel;
    }
}

function criaBalas() {
    num_vazio = geraVazio();
    numBalaVerdade = geradorNumeroBalas();
    numBalaFalsa = 10 - (numBalaVerdade + num_vazio);
}

function criaCartucho() {
    cartucho_atual = [];
    let c = 0;
    while (c < 10) {
        if (c < numBalaVerdade) cartucho_atual.push(true);
        else if (c < numBalaVerdade + numBalaFalsa) cartucho_atual.push(false);
        c++;
    }
    cartucho_atual = embaralharCartucho(cartucho_atual);
}

function embaralharCartucho(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function atualizaCartuchoSite() {
    cartuchoSite.innerHTML = "";
    let c = 0
    cartucho_atual.forEach((bala) => {
        cartuchoSite.innerHTML += bala
            ? assets.img_html.cartucho_verdadeiro
            : assets.img_html.cartucho_falso;
        c++
    });
    if (c < 10) 
        for (c; c < 10; c++)
            cartuchoSite.innerHTML += assets.img_html.cartucho_nada
}

function som(tipoSom) {
    player.currentTime = 0;
    player.src = assets.audios[tipoSom];
    player.play();
}

// Interações do jogo
function criarCartuchoGeral() {
    criaBalas();
    criaCartucho();
    console.group("Detalhes do cartucho");
    console.log(`Número de vazio: ${num_vazio}`);
    console.log(`Número de balas verdadeiras: ${numBalaVerdade}`);
    console.log(`Número de balas falsas: ${numBalaFalsa}`);
    console.log(`Cartucho atual:`, cartucho_atual);
    console.groupEnd();
    som("recarregar");
    atualizaCartuchoSite();
};

document.getElementById("shotgun").onclick = () => {
    if (cartucho_atual.length > 0) {
        const bala = cartucho_atual.shift();
        som(bala ? "tiro" : "tirofake");
        shotgun.src = bala ? assets.imagens.shotgun_atirando : assets.imagens.shotgun;
        atualizaCartuchoSite();
    } else {
        shotgun.src = assets.imagens.shotgun;
    }
};

// Controle de vida
for (let c = 0; c < vida; c++) {
    const iconeVida = document.createElement("i");
    iconeVida.className = "bx bxs-bolt";
    iconeVida.style.color = "#ffffff";
    barraVida.appendChild(iconeVida);
}

// Itens e classe Item
class Item {
    constructor(nome, src, descricao) {
        this.nome = nome;
        this.src = src;
        this.descricao = descricao;
    }
}

const itens = [
    new Item("Vacina do SUS", "../img/vacina.png", "Esse item faz com que você pegue emprestado (você rouba) um item do seu amiguinho e usa imediatamente"),
    new Item('Nokia (Celular do André)', '../img/nokia.png', 'Uma voz misteriosa te conta sobre a posição e tipo da bala a partir desta ligação. Deve ser Telemarketing de São Paulo.'),
    new Item('Cerra do Tio', '../img/cerra.png', 'Dobra o dano da shotgun nesse turno. Não pe pergunte como conseguiram essa cerra.'),
    new Item('Cingarro do seu Pai', '../img/cingarro.png', 'Ganha +1 de vida. E sim... aqui, fumar faz bem para a saúde'),
    new Item('Heineken Batizada', '../img/heineken.png', 'Descarta a bala atual. Te transforma em um cachaceiro do carai (fal o L).'),
    new Item('Lupa do Tio Sherlock', '../img/lupa.png', 'Veja qual é a bala atual. Antigamente era usado para ver cu de curioso'),
    new Item('Paracetamol Vencido', '../img/paracetamol.png', '50% de chance de ganhar 2 de vida e 50% de chance de perder 1 de vida.'),
    new Item('Carta Reverso', '../img/reverso.png', 'Inverte a direção que o jogo roda. Não acontece nada quando tem apenas 2 jogadores.'),
    new Item('Carta Bloqueio', '../img/bloqueio.png', 'Bloqueia a vez de quem você quizer (Exceto você mesmo). É uma pena que você não consegue se bloquear.')
]

// Lista da mesa
// Mapa da mesa: [ mesa [ lado [ linha [ coluna ] ] ]]
const mesa = [[[[], []], [[], []]], [[[], []], [[], []]]]

// Criação de itens na mesa
function criarItens() {

    let cont = 0;

    // ----- Código para Backup (se necessário) -----
    // for (let lado = 0; lado < 1; lado++) {
    //     for (let linha = 0; linha < 2; linha++) {
    //         for (let coluna = 0; coluna < 2; coluna++) {
                
    //             if (img_itens[cont].src.endsWith(assets.imagens.item_nada)) {
    //                 const item_aleatorio = itens[Math.floor(Math.random() * itens.length)];
    //                 mesa[lado][linha][coluna].push(item_aleatorio);
    //                 // img_itens[cont].innerHTML = ''
    //                 img_itens[cont].src = item_aleatorio.src;
    //                 img_itens[cont].alt = `${item_aleatorio.nome}: ${item_aleatorio.descricao}`;
    //                 ((img, item) => {
    //                     img.addEventListener("mouseover", (event) => {
    //                         descricaoDiv.style.display = "block";
    //                         descricaoDiv.style.left = event.pageX + "px";
    //                         descricaoDiv.style.top = event.pageY + "px";
    //                         descricaoDiv.innerHTML = `<strong>${item.nome}</strong><br>${item.descricao}`;
    //                     });
    //                     img.addEventListener("mouseout", () => {
    //                         descricaoDiv.style.display = "none";
    //                     });
    //                 })(img_itens[cont], item_aleatorio);
    //             } else {
    //                 console.log("Nah, I'd win")
    //             }
    //             cont++;
                
    //         }
    //     }
    // }
    // console.log(mesa);

    
    // Código acima, porém refatorado:

    if (!itensPegos) {
        itensAtualizados = 0
        while (cont < 8 && itensAtualizados < maxAtualizacoes){
            if (img_itens[cont].src.endsWith(assets.imagens.item_nada)) {
                const item_aleatorio = itens[Math.floor(Math.random() * itens.length)]
    
                // Atualiza a matriz com o novo item
                const lado = Math.floor(cont / 4); // Índice para o "lado" (0 ou 1)
                const linha = Math.floor((cont % 4) / 2); // Índice para "linha" (0 ou 1)
                const coluna = cont % 2; // Índice para "coluna" (0 ou 1)
                mesa[lado][linha][coluna].push(item_aleatorio);
    
                img_itens[cont].src = item_aleatorio.src;
                img_itens[cont].alt = `${item_aleatorio.nome}: ${item_aleatorio.descricao}`;
                
                // Vincula os eventos
                img_itens[cont].addEventListener("mouseover", (event) => {
                    descricaoDiv.style.display = "block";
                    descricaoDiv.style.left = event.pageX - 10 + "px";
                    descricaoDiv.style.top = event.pageY + 10 + "px"; // Desloca a div para baixo
                    descricaoDiv.innerHTML = `<strong>${item_aleatorio.nome}</strong><br>${item_aleatorio.descricao}`;
                });
                img_itens[cont].addEventListener("mouseout", () => {
                    descricaoDiv.style.display = "none";
                });
                img_itens[cont].addEventListener("click", () => {
                    // Troca a imagem para "nada"
                    img_itens[cont].src = "../" + assets.imagens.item_nada;

                    // Desvincula os eventos de descrição
                    img.removeEventListener("mouseover", onMouseOver);
                    img.removeEventListener("mouseout", onMouseOut);

                    // Atualiza o contador de itens atualizados
                    if (itensAtualizados > 0) {
                        itensAtualizados--;
                    }
                });
                
                itensAtualizados++
            }
            cont++
        }
    }
    itensPegos = true

}

// Movimentação da descrição
document.addEventListener("mousemove", (event) => {
    const descricaoDiv = document.getElementById("descricao-item");
    if (descricaoDiv.style.display === "block") {
        descricaoDiv.style.left = event.pageX + "px";
        descricaoDiv.style.top = event.pageY + 20 + "px";
    }
});

// Criação de uma rodada nova
document.getElementById('nova-rodada').onclick = () => {
    if (maxRodadas > rodada && cartucho_atual.length == 0) {
        rodada++
        criarCartuchoGeral()
        caixa.src = assets.imagens.caixa_aberta
        caixa.addEventListener('click', () => {
            criarItens()
            caixa.src = assets.imagens.caixa_fechada
        })
    }
}