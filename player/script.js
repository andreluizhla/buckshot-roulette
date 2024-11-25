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

// Variáveis do site
const shotgun = document.getElementById("shotgun");
const cartuchoSite = document.querySelector("#cartucho");
const player = document.getElementById("player");
const barraVida = document.getElementById("barra-vida");
const caixa = document.getElementById("caixa");
const img_itens = document.querySelectorAll(".item");
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

const assets = {
    imagens: {
        shotgun: "../img/shotgun.png",
        shotgun_atirando: "../img/shotgun_atirando.png",
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
        cartucho_verdadeiro: '<img src="../img/cartucho-verdadeiro.png" alt="Bala Verdadeira" class="bala">',
        cartucho_falso: '<img src="../img/cartucho-falso.png" alt="Bala Falsa" class="bala">',
        cartucho_nada: '<img src="../img/cartucho-nada.png" alt="Nada" class="bala">',
    },
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
    iconeVida.className = "bx bxs-bolt vida";
    iconeVida.style.color = "#ffffff";
    barraVida.appendChild(iconeVida);
}

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

// Funções dos itens
function acaoVacina() {
    
}

function acaoNokia() {
    
}

function acaoCerra() {
    
}

function acaoCingarro() {
    
}

function acaoHeineken() {
    
}

function acaoLupa() {
    
}

function acaoParacetamol() {
    
}

function acaoReverso() {
    
}

function acaoBloqueio() {
    
}

// Lista da mesa
// Mapa da mesa: [ mesa [ lado [ linha [ coluna ] ] ]]
const mesa = [[[[], []], [[], []]], [[[], []], [[], []]]]

// Criação de itens na mesa
function criarItens() {
    itensAtualizados = 0
    let cont = 0;

    while (cont < 8 && itensAtualizados < maxAtualizacoes) {
        
        if (img_itens[cont].src.endsWith(assets.imagens.item_nada)) {
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
            img_itens[cont].src = item_aleatorio.src;
            img_itens[cont].alt = `${item_aleatorio.nome}: ${item_aleatorio.descricao}`;
            img_itens[cont].setAttribute('data-item', `${item_aleatorio.nomealt}`)
            
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
            img_itens[cont].addEventListener("mouseover", onMouseOver);
            img_itens[cont].addEventListener("mouseout", onMouseOut);
            img_itens[cont].addEventListener("click", onClick);
            img_itens[cont].classList.toggle('nada')

            
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

// Controle de rodadas
document.getElementById('nova-rodada').onclick = () => {
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
};
