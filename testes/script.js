document.getElementById('gun').addEventListener('click', () => {
    const players = document.querySelectorAll('.player');
    const optionsDiv = document.getElementById('target-options');
    optionsDiv.innerHTML = ''; // Limpar opções anteriores
    document.getElementById('options').style.display = 'block';
  
    players.forEach(player => {
        const playerId = player.dataset.player;
        const life = player.querySelector('.life').textContent;
  
        const option = document.createElement('div');
        option.textContent = `Jogador ${playerId} (Vida: ${life})`;
        option.classList.add('div-options')
        option.addEventListener('click', () => shootPlayer(playerId));
        
  
        optionsDiv.appendChild(option);
    });
});
  
function shootPlayer(playerId) {
    const player = document.querySelector(`.player[data-player="${playerId}"]`);
    let life = player.querySelector('.life');
    life.textContent = Math.max(0, life.textContent - 1); // Reduz vida
    alert(`Você atirou no Jogador ${playerId}!`);
    document.getElementById('options').style.display = 'none';
}
