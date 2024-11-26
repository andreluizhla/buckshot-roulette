// Importação e configuração do Firebase Database
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// --- Configurações do jogo ---

// Caso necessário:
function reset() {
    var cartucho_atual = [];
    var num_vazio = 0;
    var numBalaVerdade = 0;
    var numBalaFalsa = 0;
    var rodada = 1;
    var vida = 3;
    var itensAtualizados = 0;
    var itensPegos = false;
    var vivo = true
    var dano = 1
    var ordem = 1
}


// Variáveis do site
const shotgun = document.getElementById("shotgun");
const cartuchoSite = document.querySelector("#cartucho");
const player = document.getElementById("player");
const barraVida = document.getElementById("barra-vida");
const caixa = document.getElementById("caixa");
const imgItens = document.querySelectorAll(".item");
const descricaoDiv = document.getElementById("descricao-item");

// Variáveis do jogo
let cartucho_atual = [];
let num_vazio = 0;
let numBalaVerdade = 0;
let numBalaFalsa = 0;
let rodada = 1;
let vida = 3;
let itensAtualizados = 0;
let maxVida = 4;
let maxAtualizacoes = 3;
let maxRodadas = 3;
let itensPegos = false;
let vivo = true
let dano = 1
let ordem = 1 // 1 para ordem horária e -1 para ordem anti-horária
const maxJogadores = 4


const assets = {
    imagens: {
        shotgun: "../img/shotgun.png",
        shotgun_atirando: "../img/shotgun_atirando.png",
        shotgun_dobro: "../img/shotgun-dobro.png",
        shotgun_dobro_atirando: "../img/shotgun-dobro-atirando.png",
        caixa_aberta: "../img/caixa-aberta.png",
        caixa_fechada: "../img/caixa-fechada.png",
        item_nada: "img/nada.png",
    },
    audios: {
        tiro: "../sounds/tiro.mp3",
        tirofake: "../sounds/tiro-fake.mp3",
        recarregar: "../sounds/recarregando.mp3",
    },
    img_html: {
        bala_verdadeiro: '<img src="../img/bala-verdadeiro.png" alt="Bala Verdadeira" class="bala">',
        bala_falso: '<img src="../img/bala-falso.png" alt="Bala Falsa" class="bala">',
        bala_nada: '<img src="../img/bala-nada.png" alt="Nada" class="bala">',
    },
};


// Lista da mesa
// Mapa da mesa: [ mesa [ lado [ linha [ coluna ] ] ]]
const mesa = [[[[], []], [[], []]], [[[], []], [[], []]]]


// Itens e classe Item
class Item {
    constructor(nome, nomealt, src, descricao) {
        this.nome = nome;
        this.nomealt = nomealt;
        this.src = src;
        this.descricao = descricao;
    }
}

const itens = [
    new Item("Vacina do SUS", 'vacina', "../img/vacina.png", "Esse item faz com que você pegue emprestado (você rouba) um item do seu amiguinho e usa imediatamente"),
    new Item('Nokia (Celular do André)', 'nokia', '../img/nokia.png', 'Uma voz misteriosa te conta sobre a posição e tipo da bala a partir desta ligação. Deve ser Telemarketing de São Paulo.'),
    new Item('Cerra do Tio', 'cerra', '../img/cerra.png', 'Dobra o dano da shotgun nesse turno. Não pe pergunte como conseguiram essa cerra.'),
    new Item('Cingarro Brochante', 'cingarro', '../img/cingarro.png', 'Ganha +1 de vida. E sim... aqui, fumar faz bem para a saúde'),
    new Item('Heineken Batizada', 'heineken', '../img/heineken.png', 'Descarta a bala atual. Te transforma em um cachaceiro do carai (fal o L).'),
    new Item('Lupa do Tio Sherlock', 'lupa', '../img/lupa.png', 'Veja qual é a bala atual. Antigamente era usado para ver cu de curioso'),
    new Item('Paracetamol Vencido', 'paracetamol', '../img/paracetamol.png', '50% de chance de ganhar 2 de vida e 50% de chance de perder 1 de vida.'),
    new Item('Carta Reverso', 'reverso', '../img/reverso.png', 'Inverte a direção que o jogo roda. Não acontece nada quando tem apenas 2 jogadores.'),
    new Item('Carta Bloqueio', 'bloqueio', '../img/bloqueio.png', 'Bloqueia a vez de quem você quizer (Exceto você mesmo). É uma pena que você não consegue se bloquear.')
]


// Variáveis do Jogador
let jogador = {
    nickname: localStorage.getItem('nickname'),
    itens: mesa,
    vida: vida,
    vivo: vivo,
    suaVez: false,
    bloqueado: false
}
console.log(jogador)
//Configurações do banco de dados

const app = window.firebaseApp;
const database = window.firebaseDatabase;
let idSalaLocal = localStorage.getItem("idSalaLocal")

// Verificadores de banco de dados
if (!app) console.error("Erro ao importar o APP");
if (!database) console.error("Firebase Database não foi inicializado.");


// Criação de uma sala
// {
//     if (!database) {
//         console.error("Firebase Database não foi inicializado.");
//         return;
//     }

//     const salaId = Math.random().toString(36).substr(2, 9);
//     const salaRef = ref(database, `salas/${salaId}`);

//     localStorage.setItem(idSalaLocal, salaId)
//     localStorage.setItem(refSalaLocal, salaRef)

//     set(salaRef, {
//         status: "aguardando",
//         jogadores: {},
//         rodada: 1,
//         cartucho: [],
//         ordem: 1
//     })
//         .then(() => {
//             console.log("Sala criada com sucesso!", salaId);
//             window.alert(`Sala criada! Código: ${salaId}`);
//         })
//         .catch((error) => {
//             console.error("Erro ao criar sala:", error);
//         });
    
// };

// Entrada de jogadores
// document.getElementById('entrar').onclick = () => {
//     console.log(jogador)
//     jogador.nickname = window.prompt('nickname do jogador')
//     const salaId = window.prompt('Código da sala')
//     console.log(jogador.nickname)
//     console.log(salaId)
//     
// }

function adicionarJogador(salaId, jogador) {
    const jogadorRef = ref(database, `salas/${salaId}/jogadores/${jogador.nickname}`);
    set(jogadorRef, { vida: jogador.vida, itens: jogador.itens || [] })
        .then(() => console.log(`${jogador.nickname} adicionado à sala ${salaId}`))
        .catch((err) => console.error("Erro ao adicionar jogador:", err));
}

function atualizarMesa(){

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
            ? assets.img_html.bala_verdadeiro
            : assets.img_html.bala_falso;
        c++
    });
    if (c < 10)
        for (c; c < 10; c++)
            cartuchoSite.innerHTML += assets.img_html.bala_nada
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
        if (itensPegos) {
            const bala = cartucho_atual.shift();
            som(bala ? "tiro" : "tirofake");
            if (dano == 1) {
                shotgun.src = bala ? assets.imagens.shotgun_atirando : assets.imagens.shotgun;
            } else {
                shotgun.src = bala ? assets.imagens.shotgun_dobro_atirando : assets.imagens.shotgun;
                dano /= 2
            }
            atualizaCartuchoSite();
            setTimeout(() => {if (cartucho_atual.length == 0) {
                novaRodada()
            }
        }, 1500)  
        } else {
            window.alert('Calma calabreso kkkkk, pegue os itens da caixa antes')
        }
    } else {
        shotgun.src = assets.imagens.shotgun;
        window.alert('Acabou as balas')
    }
};

// Controle de vida
function atualizaVida() {
    barraVida.innerHTML = ''
    if (vida <= 0) {
        vivo = false
        vida = 0
        window.alert('Parabéns, você morreu!')
    } else if (vida > maxVida) {
        vida = maxVida
        window.alert('Máximo de vida atingido!')
    }
    for (let c = 0; c < vida; c++) {
        const iconeVida = document.createElement("i");
        iconeVida.className = "bx bxs-bolt vida";
        iconeVida.style.color = "#ffffff";
        barraVida.appendChild(iconeVida);
    }
    console.log(vida)
}

// Funções dos itens
function acaoVacina() {

}

function acaoNokia() {
    if (cartucho_atual.length > 1) {
        let posicaoBala
        do {
            posicaoBala = Math.floor(Math.random() * cartucho_atual.length)
        } while (posicaoBala == 0)
        window.alert(`A ${posicaoBala + 1} bala é ${cartucho_atual[posicaoBala] == true ? "Verdadeira" : "Falsa"}`)
    } else {
        window.alert('Não tem o que falar')
    }
}


function acaoCerra() {
    if (dano == 1) {
        dano *= 2
        shotgun.src = assets.imagens.shotgun_dobro
    } else {
        window.alert('Você é um safado mesmo kkkkkkk, tentando duplicar o dano dobrado')
    }
}

function acaoCingarro() {
    vida++
    atualizaVida()
}

function acaoHeineken() {
    cartucho_atual.shift()
    som('tirofake')
    atualizaCartuchoSite()
}

function acaoLupa() {
    if (cartucho_atual.length > 0) {
        window.alert(`A próxima bala é ${cartucho_atual[0] == true ? "Verdadeira" : "Falsa"}`)
    } else {
        window.alert('Não tem o que ver')
    }
}

function acaoParacetamol() {
    if (Math.random() > 0.5) {
        vida--
        console.log('Perdeu -1 de vida')
    } else {
        if ((vida + 2) >= maxVida) {
            vida = maxVida
            console.log('Vida máxima atingida')
        } else {
            vida += 2
            console.log('Ganhou +2 de vida')
        }
    }
    console.log(vida)
    atualizaVida()
}

function acaoReverso() {

}

function acaoBloqueio() {

}

// Criação de itens na mesa
function criarItens() {
    itensAtualizados = 0
    let cont = 0;

    while (cont < 8 && itensAtualizados < maxAtualizacoes) {

        if (imgItens[cont].src.endsWith(assets.imagens.item_nada)) {
            const item_aleatorio = itens[Math.floor(Math.random() * itens.length)];

            // Atualiza a matriz com o novo item
            const lado = Math.floor(cont / 4); // Índice para o "lado" (0 ou 1)
            const linha = Math.floor((cont % 4) / 2); // Índice para "linha" (0 ou 1)
            const coluna = cont % 2; // Índice para "coluna" (0 ou 1)

            if (!Array.isArray(mesa[lado][linha][coluna])) {
                mesa[lado][linha][coluna] = [];
            }
            mesa[lado][linha][coluna].push(item_aleatorio);

            // Atualiza os atributos da imagem
            imgItens[cont].src = item_aleatorio.src;
            imgItens[cont].alt = `${item_aleatorio.nome}: ${item_aleatorio.descricao}`;
            imgItens[cont].setAttribute('data-item', `${item_aleatorio.nomealt}`)

            // Eventos para a imagem
            const onMouseOver = (event) => {
                descricaoDiv.style.display = "block";
                descricaoDiv.style.left = event.pageX - 10 + "px";
                descricaoDiv.style.top = event.pageY + 10 + "px"; // Desloca a div para baixo
                descricaoDiv.innerHTML = `<strong>${item_aleatorio.nome}</strong><br>${item_aleatorio.descricao}`;
            };

            const onMouseOut = () => {
                descricaoDiv.style.display = "none";
            };

            const onClick = (event) => {
                const img = event.target; // Elemento que disparou o evento

                switch (event.target.dataset.item) {
                    case "vacina":
                        console.log('Vacina Clicada!')
                        acaoVacina()
                        break;

                    case "nokia":
                        console.log('Nokia Clicada!')
                        acaoNokia()
                        break;

                    case "cerra":
                        console.log('Cerra Clicada!')
                        acaoCerra()
                        break;

                    case "cingarro":
                        console.log('Cingarro Clicada!')
                        acaoCingarro()
                        break;

                    case "heineken":
                        console.log('Heineken Clicada!')
                        acaoHeineken()
                        break;

                    case "lupa":
                        console.log('Lupa Clicada!')
                        acaoLupa()
                        break;

                    case "paracetamol":
                        console.log('Paracetamol Clicada!')
                        acaoParacetamol()
                        break;

                    case "reverso":
                        console.log('Reverso Clicada!')
                        acaoReverso()
                        break;

                    case "bloqueio":
                        console.log('Bloqueio Clicada!')
                        acaoBloqueio()
                        break;

                    default:
                        console.error('[ERRO]: Item não identificado!')
                        break;
                }

                img.setAttribute('data-item', ``)

                // Troca a imagem para "nada"
                img.src = "../" + assets.imagens.item_nada;
                img.alt = "Nada";
                img.classList.toggle('nada')

                // Oculta a descrição e limpa o conteúdo
                descricaoDiv.style.display = "none";
                descricaoDiv.innerHTML = "";

                // Desvincula os eventos de descrição
                img.removeEventListener("mouseover", onMouseOver);
                img.removeEventListener("mouseout", onMouseOut);

                // Atualiza o contador de itens atualizados
                if (itensAtualizados > 0) {
                    itensAtualizados--;
                }

            };


            // Vincula os eventos
            imgItens[cont].addEventListener("mouseover", onMouseOver);
            imgItens[cont].addEventListener("mouseout", onMouseOut);
            imgItens[cont].addEventListener("click", onClick);
            imgItens[cont].classList.toggle('nada')


            itensAtualizados++;
        }
        cont++;
    }
    itensPegos = true
    // console.log(mesa)       
}


// Movimentação da descrição
document.addEventListener("mousemove", (event) => {
    const descricaoDiv = document.getElementById("descricao-item");
    if (descricaoDiv.style.display === "block") {
        descricaoDiv.style.left = event.pageX + "px";
        descricaoDiv.style.top = event.pageY + 20 + "px";
    }
});

function novaRodada() {
    // Verifica se o número máximo de rodadas foi alcançado
    if (rodada <= maxRodadas) {
        if (cartucho_atual.length === 0) {
            console.log(`Iniciando a rodada ${rodada}`);

            // Criação de novo cartucho
            criarCartuchoGeral();

            // Atualiza o estado da caixa para aberta e habilita o evento de clique
            caixa.src = assets.imagens.caixa_aberta;
            caixa.classList.toggle('fechado')
            caixa.classList.toggle('aberto')
            caixa.alt = 'Caixa Aberta'
            itensPegos = false;


            caixa.onclick = () => {
                if (!itensPegos) {
                    criarItens(); // Cria 3 itens
                    caixa.src = assets.imagens.caixa_fechada; // Fecha a caixa
                    caixa.classList.toggle('aberto')
                    caixa.classList.toggle('fechado')
                    caixa.alt = 'Caixa Fechada'
                    itensPegos = true; // Impede a criação duplicada
                    console.log(`Itens criados na rodada ${rodada}`);
                } else {
                    console.log("Os itens já foram criados nesta rodada.");
                }
            };

            // Incrementa a rodada
            rodada++;
        } else {
            console.log("O cartucho ainda não foi utilizado por completo.");
        }
    } else {
        // Fim do jogo
        console.log("O jogo acabou! Obrigado por jogar!");
        window.alert("O jogo acabou! Obrigado por jogar!");
    }
}

document.body.onload = () => {
    atualizaVida()
    novaRodada()
    adicionarJogador(localStorage.getItem(idSalaLocal), jogador)
}
