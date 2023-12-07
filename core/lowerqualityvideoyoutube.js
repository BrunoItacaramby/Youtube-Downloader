import fs from 'fs';
import ytdl from 'ytdl-core';
import chalk from 'chalk';
import emojiStrip from 'emoji-strip';
import clipboardy from 'clipboardy';

const removeSpecialCharacters = (str) => {
  return str.replace(/[<>:"/\\|?*]+/g, '');
};

const createDirectoryIfNotExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
};

const downloadYouTubeVideo = async (url) => {
  try {
    const videoInfo = await ytdl.getInfo(url);
    const videoTitle = videoInfo.videoDetails.title;
    const sanitizedTitle = removeSpecialCharacters(emojiStrip(videoTitle));
    console.log(chalk.yellow(`Baixando vídeo: ${videoTitle}`));

    const outputFilePath = `./Downloaded Lower Quality Videos/${sanitizedTitle}.mp4`;

    if (fs.existsSync(outputFilePath)) {
      console.error(chalk.red(`Arquivo "${outputFilePath}" já existe. Pulando.`));
      return;
    }

    // Escolhendo formato de vídeo com qualidade menor, mas que inclui áudio
    const format = ytdl.chooseFormat(videoInfo.formats, { filter: 'audioandvideo' });
    if (!format) {
      console.error(chalk.red('Não foi possível encontrar um formato adequado para download.'));
      return;
    }

    const videoStream = ytdl.downloadFromInfo(videoInfo, { format: format });
    videoStream.pipe(fs.createWriteStream(outputFilePath));

    await new Promise((resolve) => videoStream.on('end', resolve));
    console.log(chalk.green(`Vídeo baixado: ${videoTitle}`));

  } catch (error) {
    console.error(chalk.red(`Erro ao processar o vídeo: ${error}`));
  }
};

const DownloadLowerQualityVideo = async () => {
  createDirectoryIfNotExists('./Downloaded Lower Quality Videos');
  let lastURL = '';

  setInterval(async () => {
    const currentClipboard = clipboardy.readSync();
    if (currentClipboard !== lastURL && ytdl.validateURL(currentClipboard)) {
      lastURL = currentClipboard;
      await downloadYouTubeVideo(currentClipboard);
    }
  }, 1000);
};

export default DownloadLowerQualityVideo;
