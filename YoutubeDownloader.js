import verificarAreaDeTransferencia from "./core/links.js";
import downloadAllAudios from "./core/audioyoutube.js";

class YoutubeDownloader {

    static Collector() {
        // Verificar a área de transferência a cada segundo
        setInterval(verificarAreaDeTransferencia, 1000);
        console.log('Aguardando a detecção de novos links do YouTube...');
    }

    static Audio(){
        downloadAllAudios(youtubeLinks)
    }
}

const youtubeLinks = ['https://www.youtube.com/watch?v=GqR5jLQt4w'];

export default YoutubeDownloader