import DownloadAudio from "./core/audioyoutube.js";
import DownloadVideo from "./core/videoyoutube.js";
import DownloadLowerQualityVideo from "./core/lowerqualityvideoyoutube.js";

class YoutubeDownloader {

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