import fs from 'fs'
import ytdl from 'ytdl-core'
import chalk from 'chalk'
import emojiStrip from 'emoji-strip'
import { exec } from 'child_process'
import ffmpeg from 'ffmpeg-static'

const removeSpecialCharacters = (str) => {
  return str.replace(/[<>:"/\\|?*]+/g, ''); // Remover caracteres inválidos para nomes de arquivo
};

const downloadYouTubeAudio = async (url, index) => {
  try {
    const videoInfo = await ytdl.getInfo(url);
    const videoTitle = videoInfo.videoDetails.title;
    const sanitizedTitle = removeSpecialCharacters(emojiStrip(videoTitle)); // Remover caracteres especiais e emojis do título
    console.log(chalk.yellow(`Baixando áudio do vídeo ${index + 1}: ${videoTitle}`));

    // Verificar se o arquivo de áudio já existe
    const mp3FilePath = `${sanitizedTitle}_audio.mp3`;
    if (fs.existsSync(mp3FilePath)) {
      console.error(chalk.red(`Arquivo de áudio "${mp3FilePath}" já existe. Pulando o vídeo ${index + 1}.`));
      console.log('');
      return;
    }

    // Baixar áudio em qualidade máxima
    const audioFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });
    const audioStream = ytdl.downloadFromInfo(videoInfo, { format: audioFormat });

    const audioFilePath = `${sanitizedTitle}_audio.webm`; // Usaremos o formato WebM temporariamente
    audioStream.pipe(fs.createWriteStream(audioFilePath));

    await new Promise((resolve) => {
      audioStream.on('end', resolve);
    });

    // Converter o arquivo de áudio para MP3 usando FFmpeg
    const convertCommand = `${ffmpeg} -i "${audioFilePath}" "${mp3FilePath}"`;

    await new Promise((resolve, reject) => {
      exec(convertCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(chalk.red(`Erro ao converter o áudio para MP3: ${error}`));
          reject(error);
        } else {
          console.log(chalk.green(`Áudio do vídeo ${index + 1} (${videoTitle}) convertido para MP3 com sucesso.`));
          resolve();
        }
      });
    });

    // Excluir o arquivo de áudio temporário em formato WebM
    fs.unlinkSync(audioFilePath);

    console.log(chalk.green(`Arquivo de áudio temporário excluído.`));
    console.log(''); // Pular uma linha após a mensagem
  } catch (error) {
    console.error(chalk.red(`Erro ao baixar e converter o áudio do vídeo ${index + 1}: ${url}`), error);
  }
};

const downloadAllAudios = async (urls) => {
  for (let i = 0; i < urls.length; i++) {
    await downloadYouTubeAudio(urls[i], i);
  }
};

export default downloadAllAudios