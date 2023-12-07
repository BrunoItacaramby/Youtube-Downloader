import verificarAreaDeTransferencia from "./core/links.js";
import DownloadAudio from "./core/audioyoutube.js";
import DownloadVideo from "./core/videoyoutube.js";
import DownloadLowerQualityVideo from "./core/lowerqualityvideoyoutube.js";

class YoutubeDownloader {

    static Collector() {
        // Verificar a área de transferência a cada segundo
        setInterval(verificarAreaDeTransferencia, 1000);
        console.log('Aguardando a detecção de novos links do YouTube...');
    }

    static Audio(){
        DownloadAudio()        
    }

    static Video(){
        DownloadVideo()
    }

    static LowerQualityVideo(){
        DownloadLowerQualityVideo()
    }
}

export default YoutubeDownloader