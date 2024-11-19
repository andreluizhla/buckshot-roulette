let cartucho_atual = []
let num_vazio = 0
let num_bala_verdade = 0
let num_bala_falsa = 0
let cartucho_site = document.querySelector('#cartucho')
let img_bala_verdade = '<img src="../img/cartucho-verdadeiro.png" alt="Bala Verdadeira" class="bala">'
let img_bala_falsa = '<img src="../img/cartucho-falso.png" alt="Bala Falsa" class="bala">'

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
        if (7 > variavel > 0){
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
            if (c < num_vazio){
                cartucho_atual.push(null)
            }
        }
        c++
    }
    cartucho_atual = embaralharCartucho(cartucho_atual)
}

function embaralharCartucho(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Escolhe um índice aleatório
        [array[i], array[j]] = [array[j], array[i]]; // Troca os elementos
    }
    return array;
}

document.getElementById('gerar-balas').onclick = () => {
    cartucho_site.innerHTML = ''
    criaBalas()
    criaCartuho()
    console.log(`Número de Vazio: ${num_vazio}`)
    console.log(`Número de Balas Verdadeiras: ${num_bala_verdade}`)
    console.log(`Número de Balas Falsas: ${num_bala_falsa}`)
    console.log(`Cartucho Atual: ${cartucho_atual}`)
    //var c = 0 
    //while (c <= num_bala_verdade){
    //    if(c == num_bala_verdade){
    //        break
    //    } else {
    //        cartucho_site.innerHTML += img_bala_verdade
    //        c++
    //    }
    //}
    //c = 0
    //while (c <= num_bala_falsa){
    //    if(c == num_bala_falsa){
    //        break
    //    } else {
    //        cartucho_site.innerHTML += img_bala_falsa
    //        c++
    //    }
    //}
}
