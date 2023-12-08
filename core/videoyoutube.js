import fs from 'fs';
import ytdl from 'ytdl-core';
import chalk from 'chalk';
import emojiStrip from 'emoji-strip';
import { exec } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import clipboardy from 'clipboardy';

clipboardy.writeSync('')

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

    const videoFilePath = `./Downloaded Videos/${sanitizedTitle}_video.mp4`;
    const audioFilePath = `./Downloaded Videos/${sanitizedTitle}_audio.m4a`;
    const outputFilePath = `./Downloaded Videos/${sanitizedTitle}.mp4`;

    if (fs.existsSync(outputFilePath)) {
      console.error(chalk.red(`Arquivo "${outputFilePath}" já existe. Pulando.`));
      return;
    }

    const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestvideo' });
    const videoStream = ytdl.downloadFromInfo(videoInfo, { format: videoFormat });
    videoStream.pipe(fs.createWriteStream(videoFilePath));
    await new Promise((resolve) => videoStream.on('end', resolve));

    const audioFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });
    const audioStream = ytdl.downloadFromInfo(videoInfo, { format: audioFormat });
    audioStream.pipe(fs.createWriteStream(audioFilePath));
    await new Promise((resolve) => audioStream.on('end', resolve));

    const mergeCommand = `"${ffmpeg}" -i "${videoFilePath}" -i "${audioFilePath}" -c:v copy -c:a aac "${outputFilePath}"`;
    exec(mergeCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`Erro ao mesclar: ${error}`));
      } else {
        console.log(chalk.green(`Vídeo baixado e mesclado: ${videoTitle}`));
        fs.unlinkSync(videoFilePath);
        fs.unlinkSync(audioFilePath);
      }
    });
  } catch (error) {
    console.error(chalk.red(`Erro ao processar o vídeo: ${error}`));
  }
};

const DownloadVideo = async () => {
  createDirectoryIfNotExists('./Downloaded Videos');
  let lastURL = '';

  setInterval(async () => {
    const currentClipboard = clipboardy.readSync();
    if (currentClipboard !== lastURL && ytdl.validateURL(currentClipboard)) {
      lastURL = currentClipboard;
      await downloadYouTubeVideo(currentClipboard);
    }
  }, 1000);
};

export default DownloadVideo