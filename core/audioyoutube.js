import fs from 'fs';
import ytdl from 'ytdl-core';
import chalk from 'chalk';
import emojiStrip from 'emoji-strip';
import { exec } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import clipboardy from 'clipboardy';

const removeSpecialCharacters = (str) => {
  return str.replace(/[<>:"/\\|?*]+/g, '');
};

const createDirectoryIfNotExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
};

const downloadYouTubeAudio = async (url) => {
  try {
    const videoInfo = await ytdl.getInfo(url);
    const videoTitle = videoInfo.videoDetails.title;
    const sanitizedTitle = removeSpecialCharacters(emojiStrip(videoTitle));
    console.log(chalk.yellow(`Baixando áudio: ${videoTitle}`));

    const mp3FilePath = `./Downloaded Audios/${sanitizedTitle}.mp3`;
    if (fs.existsSync(mp3FilePath)) {
      console.error(chalk.red(`Arquivo "${mp3FilePath}" já existe. Pulando.`));
      return;
    }

    const audioFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });
    const audioStream = ytdl.downloadFromInfo(videoInfo, { format: audioFormat });

    const audioFilePath = `./Downloaded Audios/${sanitizedTitle}_audio.webm`;
    audioStream.pipe(fs.createWriteStream(audioFilePath));

    await new Promise((resolve) => audioStream.on('end', resolve));

    const convertCommand = `"${ffmpeg}" -i "${audioFilePath}" "${mp3FilePath}"`;
    exec(convertCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`Erro ao converter: ${error}`));
      } else {
        console.log(chalk.green(`Áudio convertido: ${videoTitle}`));
        fs.unlinkSync(audioFilePath);
      }
    });
  } catch (error) {
    console.error(chalk.red(`Erro ao processar áudio: ${error}`));
  }
};

const DownloadAudio = async () => {
  createDirectoryIfNotExists('./Downloaded Audios');
  let lastURL = '';

  setInterval(async () => {
    const currentClipboard = clipboardy.readSync();
    if (currentClipboard !== lastURL && ytdl.validateURL(currentClipboard)) {
      lastURL = currentClipboard;
      await downloadYouTubeAudio(currentClipboard);
    }
  }, 1000);
};

export default DownloadAudio