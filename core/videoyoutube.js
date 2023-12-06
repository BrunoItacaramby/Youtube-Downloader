import fs from 'fs'
import ytdl from 'ytdl-core'
import chalk from 'chalk'
import emojiStrip from 'emoji-strip'
import { exec } from 'child_process'
import ffmpeg from 'ffmpeg-static'

const removeSpecialCharacters = (str) => {
  return str.replace(/[<>:"/\\|?*]+/g, ''); // Remover caracteres inválidos para nomes de arquivo
};

const createDirectoryIfNotExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
};

const downloadYouTubeVideo = async (url, index) => {
  try {
    const videoInfo = await ytdl.getInfo(url);
    const videoTitle = videoInfo.videoDetails.title;
    const sanitizedTitle = removeSpecialCharacters(emojiStrip(videoTitle)); // Remover caracteres especiais e emojis do título
    console.log(chalk.yellow(`Baixando vídeo ${index + 1}: ${videoTitle}`));

    const videoFilePath = `./Downloaded Videos/${sanitizedTitle}_video.mp4`;
    const audioFilePath = `./Downloaded Videos/${sanitizedTitle}_audio.m4a`;
    const outputFilePath = `./Downloaded Videos/${sanitizedTitle}.mp4`;

    // Verificar se o arquivo de saída já existe
    if (fs.existsSync(outputFilePath)) {
      console.error(chalk.red(`Arquivo "${outputFilePath}" já existe. Pulando o vídeo ${index + 1}.`));
      console.log('');
      return;
    }

    // Baixar vídeo em qualidade máxima diretamente para a pasta "Downloaded Videos"
    const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestvideo' });
    const videoStream = ytdl.downloadFromInfo(videoInfo, { format: videoFormat });
    videoStream.pipe(fs.createWriteStream(videoFilePath));
    await new Promise((resolve) => videoStream.on('end', resolve));

    // Baixar áudio em qualidade máxima diretamente para a pasta "Downloaded Videos"
    const audioFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });
    const audioStream = ytdl.downloadFromInfo(videoInfo, { format: audioFormat });
    audioStream.pipe(fs.createWriteStream(audioFilePath));
    await new Promise((resolve) => audioStream.on('end', resolve));

    // Mesclar vídeo e áudio na pasta "Downloaded Videos"
    const mergeCommand = `"${ffmpeg}" -i "${videoFilePath}" -i "${audioFilePath}" -c:v copy -c:a aac "${outputFilePath}"`;
    await new Promise((resolve, reject) => {
      exec(mergeCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(chalk.red(`Erro ao mesclar vídeo e áudio: ${error}`));
          reject(error);
        } else {
          console.log(chalk.green(`Vídeo e áudio do vídeo ${index + 1} (${videoTitle}) mesclados com sucesso.`));
          resolve();
        }
      });
    });

    // Excluir arquivos de vídeo e áudio intermediários
    fs.unlinkSync(videoFilePath);
    fs.unlinkSync(audioFilePath);

    console.log(chalk.green(`Arquivos intermediários excluídos.`));
    console.log(''); // Pular uma linha após a mensagem
  } catch (error) {
    console.error(chalk.red(`Erro ao baixar e mesclar o vídeo ${index + 1}: ${url}`), error);
  }
};

const downloadAllVideos = async () => {
  const filePath = './Links.txt';

  // Lê o conteúdo do arquivo de forma síncrona (pode bloquear o thread principal)
  const linksWithQuotes = fs.readFileSync(filePath, 'utf8');

  // Remove as aspas das URLs
  const links = linksWithQuotes.replace(/'/g, '').split('\n'); // Divida o conteúdo em linhas se necessário
  if (links.length > 1) {
    links.pop();
  }

  createDirectoryIfNotExists('./Downloaded Videos');

  for (let i = 0; i < links.length; i++) {
    await downloadYouTubeVideo(links[i], i);
  }
};

export default downloadAllVideos;