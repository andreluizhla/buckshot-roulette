// Era uma vez...

// Importação e configuração do Firebase Database
import { ref, set, get, update, onValue, serverTimestamp, push, onChildAdded, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// --- Configurações do jogo ---

// Variáveis do site
const shotgun = document.getElementById("shotgun");
const cartuchoSite = document.querySelector("#cartucho");
const playerAudios = document.getElementById("playerAudios");
const barraVida = document.getElementById("barra-vida");
const caixa = document.getElementById("caixa");
const imgItens = document.querySelectorAll(".item");
const descricaoDiv = document.getElementById("descricao-item");
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const playerList = document.getElementById('players-list')


// Variáveis do jogo
let cartucho_atual = [];
let num_vazio = 0;
let numBalaVerdade = 0;
let numBalaFalsa = 0;
let rodada = 0;
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

// Caso necessário:
function reset() {
    cartucho_atual = [];
    num_vazio = 0;
    numBalaVerdade = 0;
    numBalaFalsa = 0;
    rodada = 0;
    vida = 3;
    itensAtualizados = 0;
    itensPegos = false;
    vivo = true
    dano = 1
    ordem = 1
}

const assets = {
    imagens: {
        shotgun: "../img/shotgun.png",
        shotgun_atirando: "../img/shotgun-atirando.png",
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
    id: '',
    nickname: localStorage.getItem('nickname'),
    itens: [[[[], []], [[], []]], [[[], []], [[], []]]],
    vida: vida,
    vivo: vivo,
    suaVez: true,
    bloqueado: false
}

//Configurações do banco de dados

const app = window.firebaseApp;
const database = window.firebaseDatabase;

// Verificadores de banco de dados
if (!app) console.error("Erro ao importar o APP");
if (!database) console.error("Firebase Database não foi inicializado.");

// let salaId = localStorage.getItem("salaId");
let params = new URLSearchParams(window.location.search)
let salaId = params.get('salaId')
if (params.has('salaId')) {
    if (localStorage.getItem('nickname') == 'undefined' || localStorage.getItem('nickname') == null) {
        jogador.nickname = window.prompt('Andtes de começar, digite o seu nickname')
        localStorage.setItem('nickname', jogador.nickname)
    }
} else {
    window.alert('Não foi possível entrar na sala pois tem algo de errado com o link\nRedirecionando para a página inicial...')
    window.location = '../index.html'
}

const jogadorRef = ref(database, `salas/${salaId}/jogadores/${jogador.nickname}`);
const salaRef = ref(database, `salas/${salaId}`);
const mensagensRef = ref(database, `salas/${salaId}/mensagens`)
const jogadoresRef = ref(database, `salas/${salaId}/jogadores`)


let adversarios = []

// Funções usando banco de dados
function adicionarJogador(salaId, jogador) {
    const playerRef = push(jogadoresRef)
    const playerId = playerRef.key
    set(jogadorRef, {
        id: playerId,
        nickname: jogador.nickname,
        itens: jogador.itens,
        vida: jogador.vida,
        vivo: jogador.vivo,
        suaVez: jogador.suaVez,
        bloqueado: jogador.bloqueado
    })
    .then(() => {
        console.log(`${jogador.nickname} adicionado à sala ${salaId}, com o ID: ${playerId}`)
        adicionarMensagem('entrou no jogo')
})
    .catch((err) => console.error("Erro ao adicionar jogador:", err));
    jogador.id = playerId
    console.log(jogador)
}

function atualizarDados(jogador){
    update(jogadorRef, {
        nickname: jogador.nickname,
        itens: jogador.itens,
        vida: jogador.vida,
        vivo: jogador.vivo,
        suaVez: jogador.suaVez,
        bloqueado: jogador.bloqueado
    })
    .then(() => console.log(`${jogador.nickname} atualizou suas informações`))
    .catch((err) => console.error("Erro ao atualizar as iformações do jogador:", err));
    get(jogadorRef).then((snapshot) => {
        let dados = snapshot.val()
        jogador.id = dados.id
    })
    console.log('Dados atualizados: ', jogador)
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
    update(salaRef, {
        cartucho: cartucho_atual
    })

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
    playerAudios.currentTime = 0;
    playerAudios.src = assets.audios[tipoSom];
    playerAudios.play();
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
            const players = document.querySelectorAll('.player');
            const optionsDiv = document.getElementById('target-options');
            optionsDiv.innerHTML = ''; // Limpar opções anteriores
        
            players.forEach(player => {
                const playerId = player.dataset.player;
                const life = player.querySelector('.life').textContent;
        
                const option = document.createElement('div');
                option.textContent = `Jogador ${playerId} (Vida: ${life})`;
                option.classList.add('div-options')
                option.addEventListener('click', () => shootPlayer(playerId));
                
        
                optionsDiv.appendChild(option);
            });
            
            modal.classList.add('show');
            overlay.classList.add('show');
            
        } else {
            window.alert('Calma calabreso kkkkk, pegue os itens da caixa antes')
        }
    } else {
        shotgun.src = assets.imagens.shotgun;
        window.alert('Acabou as balas')
    }
};

function shootPlayer(playerId) {
    const player = document.querySelector(`.player[data-player="${playerId}"]`);
    let life = player.querySelector('.life');
    const bala = cartucho_atual.shift();
    if (bala){
        som("tiro")
        if (dano == 1) {
        shotgun.src = bala ? assets.imagens.shotgun_atirando : assets.imagens.shotgun;
    } else {
        shotgun.src = bala ? assets.imagens.shotgun_dobro_atirando : assets.imagens.shotgun;
        dano /= 2
    }
    
    life.textContent = Math.max(0, life.textContent - dano); // Reduz vida
    } else {
        som("tirofake");
        shotgun.src = assets.imagens.shotgun
    }
    
    atualizaCartuchoSite();
    if (cartucho_atual.length == 0) {
        novaRodada()
    }
    
    modal.classList.remove('show')
    overlay.classList.remove('show')
}

overlay.addEventListener('click', () => {
    modal.classList.remove('show');
    overlay.classList.remove('show');
});


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
}

// Funções dos itens
function acaoVacina() {
    adicionarMensagem(`usou a Vacina do SUS`)
}

function acaoNokia() {
    adicionarMensagem(`usou o Nokia`)

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
    adicionarMensagem(`usou a Cerra`)

    if (dano == 1) {
        dano *= 2
        shotgun.src = assets.imagens.shotgun_dobro
    } else {
        window.alert('Você é um safado mesmo kkkkkkk, tentando duplicar o dano dobrado')
    }
}

function acaoCingarro() {
    adicionarMensagem(`fumou um Cigarro`)

    vida++
    atualizaVida()
}

function acaoHeineken() {
    adicionarMensagem(`usou tomou uma Heineken`)

    cartucho_atual.shift()
    som('tirofake')
    atualizaCartuchoSite()
}

function acaoLupa() {
    adicionarMensagem(`usou a Lupa`)

    if (cartucho_atual.length > 0) {
        window.alert(`A próxima bala é ${cartucho_atual[0] == true ? "Verdadeira" : "Falsa"}`)
    } else {adicionarMensagem(``)
        window.alert('Não tem o que ver')
    }
}

function acaoParacetamol() {
    adicionarMensagem(`tomou uma cartela inteira de Paracetamol Vencido`)

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
    atualizaVida()
}

function acaoReverso() {
    adicionarMensagem(`usou o Reverso e gritou: "UNO!"`)

    ordem = ordem === 1 ? -1 : 1;
    update(salaRef, {
        ordem: ordem
    })
    ordem === 1 ? console.log('Ordem crescente'): console.log('Ordem Decrescente')
}

function acaoBloqueio() {
    adicionarMensagem(`usou um bloqueio no Jogador`)

    get(jogadoresRef)
        .then((snapshot) => {
            let jogadores = snapshot.val()
            console.log(jogadores)
        })
}

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

            if (!Array.isArray(jogador.itens[lado][linha][coluna])) {
                jogador.itens[lado][linha][coluna] = []
            }
            jogador.itens[lado][linha][coluna].push(item_aleatorio.nomealt);

            try {
                update(jogadorRef, { itens: jogador.itens });
                console.log("Item atualizado com sucesso!");
            } catch (err) {
                console.error("Erro ao atualizar item no Firebase:", err);
            }
            atualizarDados(jogador)

            imgItens[cont].src = item_aleatorio.src;
            imgItens[cont].alt = `${item_aleatorio.nome}: ${item_aleatorio.descricao}`;
            imgItens[cont].setAttribute('data-item', `${item_aleatorio.nomealt}`)

            const onMouseOver = (event) => {
                descricaoDiv.style.display = "block";
                descricaoDiv.style.left = event.pageX - 10 + "px";
                descricaoDiv.style.top = event.pageY + 10 + "px";
                descricaoDiv.innerHTML = `<strong>${item_aleatorio.nome}</strong><br>${item_aleatorio.descricao}`;
            };

            const onMouseOut = () => {
                descricaoDiv.style.display = "none";
            };

            const onClick = (event) => {
                const img = event.target;

                switch (event.target.dataset.item) {
                    case "vacina":
                        acaoVacina()
                        break;

                    case "nokia":
                        acaoNokia()
                        break;

                    case "cerra":
                        acaoCerra()
                        break;

                    case "cingarro":
                        acaoCingarro()
                        break;

                    case "heineken":
                        acaoHeineken()
                        break;

                    case "lupa":
                        acaoLupa()
                        break;

                    case "paracetamol":
                        acaoParacetamol()
                        break;

                    case "reverso":
                        acaoReverso()
                        break;

                    case "bloqueio":
                        acaoBloqueio()
                        break;

                    default:
                        break;
                }

                img.setAttribute('data-item', ``)

                img.src = "../" + assets.imagens.item_nada;
                img.alt = "Nada";
                img.classList.toggle('nada')

                descricaoDiv.style.display = "none";
                descricaoDiv.innerHTML = "";

                img.removeEventListener("mouseover", onMouseOver);
                img.removeEventListener("mouseout", onMouseOut);

                if (itensAtualizados > 0) {
                    itensAtualizados--;
                }

            };

            imgItens[cont].addEventListener("mouseover", onMouseOver);
            imgItens[cont].addEventListener("mouseout", onMouseOut);
            imgItens[cont].addEventListener("click", onClick);
            imgItens[cont].classList.toggle('nada')


            itensAtualizados++;
        }
        cont++;
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

function novaRodada() {
    if (rodada < maxRodadas) {
        if (cartucho_atual.length === 0) {
            rodada++;
            update(salaRef, {
                rodada: rodada
            })

            setTimeout(() => {
                console.log(`Iniciando a rodada ${rodada}`);
    
                criarCartuchoGeral();
    
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
            }, 1500)
        } else {
            console.log("O cartucho ainda não foi utilizado por completo.");
        }
    } else {
        // Fim do jogo
        update(salaRef, {
            ordem: 1,
            status: 'aguardando',
            rodada: 0
        })
        console.log("O jogo acabou! Obrigado por jogar!");
        reset()
    }
}

window.onload = () => {
    let dadosSala
    atualizaVida()
    get(salaRef).then((snapshot) => {
        dadosSala = snapshot.val()
        if (dadosSala.jogadores?.hasOwnProperty(jogador.nickname)) {
            console.log(`${jogador.nickname} já existe na sala`)
            atualizarDados(jogador)
        } else {
            adicionarJogador(salaId, jogador)
        }
    }).catch(error => {
        console.error("Erro ao carregar os dados da sala:", error);
    });
    
}
    
document.getElementById('pronto').onclick = () => {
    update(salaRef, {
        status: 'jogando',
        rodada: rodada,
        ordem: ordem
    })
    getAllPlayers()

    novaRodada()
}

document.getElementById('sair-sala').onclick = () => {
    get(salaRef).then((snapshot) => {
        let dadosSala = snapshot.val()
        let jogadores = dadosSala.jogadores
        if (dadosSala.status === "aguardando") {
            if (dadosSala.jogadores?.hasOwnProperty(jogador.nickname)) {
                update(salaRef, {
                    jogadores: delete jogadores[jogador.nickname],
                })
                adicionarMensagem(`saiu da partida`)
                window.location.href = '/index.html'
            } else {
                alert('Jogador já não se encontra na sala')
            }
        } else {
            alert('Não é possível sair da sala enquanto a partida está acontecendo')
        }
    })
}

// Adicionar mensagens
function adicionarMensagem(textoMensagem) {
    push(mensagensRef, {
        jogador: jogador.nickname,
        texto: textoMensagem,
        timestamp: serverTimestamp()
    })
}

onChildAdded(mensagensRef, (snapshot) => {
    const mensagem = snapshot.val()
    exibirMensagemNaTela(mensagem.jogador, mensagem.texto, mensagem.timestamp)
    
})

function exibirMensagemNaTela(jogador, texto, timestamp) {
    const mensagemContainer = document.getElementById('mensagensContainer')
    const mensagemElement = document.createElement('p')
    
    mensagemElement.innerHTML = `${new Date(timestamp).toLocaleTimeString()} - O <strong class="nickname">${jogador}</strong> ${texto}`
    mensagemContainer.appendChild(mensagemElement)

    mensagemContainer.scrollTop = mensagemContainer.scrollHeight
}

function getAllPlayers() {
    get(jogadoresRef).then((snapshot) => {
        if (snapshot.exists()) {
            const players = snapshot.val();
            console.log(`Todos os jogadores: `, players)

            if (jogador.id){
                const adversarios = Object.keys(players)
                    .filter(playerId => players[playerId].id !== jogador.id)
                    .map(playerId => ({
                        id: players[playerId].id,
                        nickname: players[playerId].nickname,
                        vida: players[playerId].vida
                    }));
                console.log(adversarios)
            } else {
                console.error('Erro ao pegar o id do jogador atual!')
                console.log(jogador.id)
            }
        } else {
            console.log('Nenhum jogador encontrado')
        }
    }).catch((error) => {
        console.error(`Erro ao obter jogadores: ${error}`)
    })
}

// Fim.