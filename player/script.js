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

// Configurações do jogo
const shotgun = document.getElementById("shotgun");
const cartucho_site = document.querySelector("#cartucho");
const audio = document.getElementById("audio");
const barraVida = document.getElementById("barra-vida");

let cartucho_atual = [];
let num_vazio = 0;
let num_bala_verdade = 0;
let num_bala_falsa = 0;

const audios = {
    tiro: "../sounds/tiro.mp3",
    tirofake: "../sounds/tiro-fake.mp3",
    recarregar: "../sounds/recarregando.mp3"
};

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
        if (8 > variavel > 0) return variavel;
    }
}

function criaBalas() {
    num_vazio = geraVazio();
    num_bala_verdade = geradorNumeroBalas();
    num_bala_falsa = 10 - (num_bala_verdade + num_vazio);
}

function criaCartucho() {
    cartucho_atual = [];
    let c = 0;
    while (c < 10) {
        if (c < num_bala_verdade) cartucho_atual.push(true);
        else if (c < num_bala_verdade + num_bala_falsa) cartucho_atual.push(false);
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
    cartucho_site.innerHTML = "";
    let c = 0
    cartucho_atual.forEach((bala) => {
        cartucho_site.innerHTML += bala
            ? '<img src="../img/cartucho-verdadeiro.png" alt="Bala Verdadeira" class="bala">'
            : '<img src="../img/cartucho-falso.png" alt="Bala Falsa" class="bala">';
        c++
    });
    if (c < 10) 
        for (c; c < 10; c++)
            cartucho_site.innerHTML += '<img src="../img/cartucho-nada.png" alt="Nada" class="bala">'
}

function som(tipoSom) {
    audio.currentTime = 0;
    audio.src = audios[tipoSom];
    audio.play();
}

// Interações do jogo
document.getElementById("gerar-balas").onclick = () => {
    criaBalas();
    criaCartucho();
    console.log(`Número de Vazio: ${num_vazio}`);
    console.log(`Número de Balas Verdadeiras: ${num_bala_verdade}`);
    console.log(`Número de Balas Falsas: ${num_bala_falsa}`);
    console.log(`Cartucho Atual: ${cartucho_atual}`);
    som("recarregar");
    atualizaCartuchoSite();
};

document.getElementById("shotgun").onclick = () => {
    if (cartucho_atual.length > 0) {
        const bala = cartucho_atual.shift();
        som(bala ? "tiro" : "tirofake");
        shotgun.src = bala ? "../img/shotgun_atirando.png" : "../img/shotgun.png";
        atualizaCartuchoSite();
    } else {
        window.alert("A shotgun não está carregada. Clique para gerar as balas primeiro.");
        shotgun.src = "../img/shotgun.png";
    }
};

// Controle de vida
let vida = 3;
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
document.getElementById("criar-itens").onclick = () => {
    const img_itens = document.querySelectorAll(".item");
    const descricaoDiv = document.getElementById("descricao-item");
    let cont = 0;

    for (let lado = 0; lado < 2; lado++) {
        for (let linha = 0; linha < 2; linha++) {
            for (let coluna = 0; coluna < 2; coluna++) {
                const item_aleatorio = itens[Math.floor(Math.random() * itens.length)];
                mesa[lado][linha][coluna].push(item_aleatorio);
                img_itens[cont].src = item_aleatorio.src;
                img_itens[cont].alt = `${item_aleatorio.nome}: ${item_aleatorio.descricao}`;
                ((img, item) => {
                    img.addEventListener("mouseover", (event) => {
                        descricaoDiv.style.display = "block";
                        descricaoDiv.style.left = event.pageX + "px";
                        descricaoDiv.style.top = event.pageY + "px";
                        descricaoDiv.innerHTML = `<strong>${item.nome}</strong><br>${item.descricao}`;
                    });
                    img.addEventListener("mouseout", () => {
                        descricaoDiv.style.display = "none";
                    });
                })(img_itens[cont], item_aleatorio);
                cont++;
            }
        }
    }
    console.log(mesa);
};

// Movimentação da descrição
document.addEventListener("mousemove", (event) => {
    const descricaoDiv = document.getElementById("descricao-item");
    if (descricaoDiv.style.display === "block") {
        descricaoDiv.style.left = event.pageX + "px";
        descricaoDiv.style.top = event.pageY + "px";
    }
});