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

document.getElementById("criar-sala").onclick = () => {

    if (!database) {
        console.error("Firebase Database não foi inicializado.");
        return;
    }

    // Testando o Firebase
    const salaId = Math.random().toString(36).substr(2, 9);
    
    // Criando a referência correta usando ref() e set()
    const salaRef = ref(database, `salas/${salaId}`);
    set(salaRef, {
        status: "aguardando",
        jogadores : []
    }).then(() => {
        console.log("Sala criada com sucesso!", salaId);
        window.alert(`Sala criada! Código: ${salaId}`);
    }).catch((error) => {
        console.error("Erro ao criar sala:", error);
    });
};


let cartucho_atual = []
let num_vazio = 0
let num_bala_verdade = 0
let num_bala_falsa = 0
let cartucho_site = document.querySelector('#cartucho')
let img_bala_verdade = '<img src="../img/cartucho-verdadeiro.png" alt="Bala Verdadeira" class="bala">'
let img_bala_falsa = '<img src="../img/cartucho-falso.png" alt="Bala Falsa" class="bala">'
let shotgun = document.getElementById('shotgun')

const audios = {
    'tiro' : `sounds/tiro.mp3`,
    'tirofake' : `sounds/tiro-fake.mp3`,
    'recarregar' : `sounds/recarregando.mp3`
}
// let player = document.getElementById('player')
const player = document.getElementById('player')
// let sound_tiro_fake = '../sounds/tiro-fake.mp3'
// let sound_tiro = '../sounds/tiro.mp3'
// let sound_recarregando = '../sounds/recarregando.mp3'

function geradorNumeroBalas(){
    let variavel
    while (true){
        variavel = Math.ceil(Math.random() * 10)
        if (10 > variavel + num_vazio){
            return variavel
        }
    }
}

function geraVazio(){
    let variavel
    while (true){
        variavel = Math.ceil(Math.random() * 10)
        if (8 > variavel > 0){
            return variavel
        }
    }
}

function criaBalas(){
    num_vazio = geraVazio()
    num_bala_verdade = geradorNumeroBalas()
    num_bala_falsa = 10 - (num_bala_verdade + num_vazio)
}

function criaCartuho(){
    cartucho_atual = []
    var c = 0
    while(c < (num_bala_verdade + num_bala_falsa + num_vazio)){
        if(c < (num_bala_verdade + num_bala_falsa + num_vazio)) {
            if (c < num_bala_verdade){
                cartucho_atual.push(true)
            }
            if (c < num_bala_falsa){
                cartucho_atual.push(false)
            }
        }
        c++
    }
    cartucho_atual = embaralharCartucho(cartucho_atual)
}

function embaralharCartucho(array) {
    for (let i = array.length - 1; i > 0; i--) {
        
        // Escolhe um índice aleatório
        const j = Math.floor(Math.random() * (i + 1));

        // Troca os elementos
        [array[i], array[j]] = [array[j], array[i]]; 
        
    }
    return array;
}

function atualizaCartuchoSite(){
    cartucho_site.innerHTML = ''
    cartucho_atual.forEach(bala => {
        cartucho_site.innerHTML += bala ? img_bala_verdade : img_bala_falsa
    })
}

function som(tipoSom){
    player.currentTime = 0

    player.src = audios[tipoSom]
    player.play()
}

document.getElementById('gerar-balas').onclick = async () => {
    criaBalas()
    criaCartuho()
    console.log(`Número de Vazio: ${num_vazio}`)
    console.log(`Número de Balas Verdadeiras: ${num_bala_verdade}`)
    console.log(`Número de Balas Falsas: ${num_bala_falsa}`)
    console.log(`Cartucho Atual: ${cartucho_atual}`)
    await som('recarregar')
    atualizaCartuchoSite()
}

document.getElementById('shotgun').onclick = () =>{
    if (cartucho_atual.length > 0){
        if (cartucho_atual[0] == true){
            som('tiro')
            shotgun.src = "../img/shotgun_atirando.png"
            cartucho_atual.splice(0, 1)
        } else {
            som('tirofake')
            shotgun.src = "../img/shotgun.png"
            cartucho_atual.splice(0, 1)
        }
        atualizaCartuchoSite()
    } else {
        window.alert('A shotgun não está carregada, clique para gerar as balas primeiro para atirar.')
        shotgun.src = "../img/shotgun.png"
    }
}
