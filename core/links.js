import fs from 'fs'
import clipboardy from 'clipboardy'

const arquivoDeLinks = 'Links.txt';

let linksAcumulados = [];

clipboardy.writeSync('');

// Função para verificar se um texto é um link do YouTube
function isYouTubeLink(text) {
  return text.includes('youtube.com');
}

// Função para salvar os links em um arquivo
function salvarLinks(links) {
  const linksFormatados = links.map(link => `'${link}'`);
  const scriptParaSalvar = `const youtubeLinks = [\n  ${linksFormatados.join(',\n  ')}\n];`;

  fs.writeFileSync(arquivoDeLinks, scriptParaSalvar);
  console.log(`Link salvo em ${arquivoDeLinks}`);
}

// Função para verificar a área de transferência em intervalos regulares
function verificarAreaDeTransferencia() {
  const linksCopiados = clipboardy.readSync().split('\n');
  const linksDoYouTube = linksCopiados.filter(isYouTubeLink);

  if (linksDoYouTube.length > 0) {
    // Verifique se há novos links para evitar a duplicação
    const novosLinks = linksDoYouTube.filter(link => !linksAcumulados.includes(link));
    
    if (novosLinks.length > 0) {
      // Adicione os novos links à matriz acumulativa
      linksAcumulados = linksAcumulados.concat(novosLinks);
      salvarLinks(linksAcumulados);
    }
  }
}

// Verificar a área de transferência a cada segundo
setInterval(verificarAreaDeTransferencia, 1000);

console.log('Aguardando a detecção de novos links do YouTube...');
