import verificarAreaDeTransferencia from "./core/links.js";
import downloadAllAudios from "./core/audioyoutube.js";
import downloadAllVideos from "./core/videoyoutube.js";

class YoutubeDownloader {

    static Collector() {
        // Verificar a área de transferência a cada segundo
        setInterval(verificarAreaDeTransferencia, 1000);
        console.log('Aguardando a detecção de novos links do YouTube...');
    }

    static Audio(){
        downloadAllAudios()        
    }

    static Video(){
        downloadAllVideos()
    }
}

export default YoutubeDownloader