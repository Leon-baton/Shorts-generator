const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs-extra');

const getBackground = require('./util/Background');
const createSubtitles = require('./util/Subtitles');

const mainDir = path.resolve(__dirname, "../../");
const tmpDir = path.join(mainDir, "/tmp");
const outputDir = path.join(mainDir, "/output");

fs.ensureDirSync(outputDir);
ffmpeg.setFfmpegPath(ffmpegPath);

async function createVideo(title, subtitles) {
    const videoPath = await getBackground("oddly satisfying slicing", tmpDir);

    const subtitlePath = await createSubtitles(subtitles, tmpDir);
    const totalDuration = subtitles.reduce((total, text) => {
        const textDuration = text.replace(/ /g, '').length * 0.2;
        return total + textDuration;
    }, 0);

    return new Promise((resolve, reject) => {
        const command = ffmpeg()
            .addInput(`./${videoPath}`)
            .addInputOption("-stream_loop -1")
            .addInput("https://ec3.yesstreaming.net:3755/stream")
            .setDuration(totalDuration)
            .audioFilters([
                {
                    filter: 'afade',
                    options: 't=in:ss=50:d=1'
                },
                {
                    filter: 'afade',
                    options: 't=out:st=59.5:d=1'
                }
            ])
            .videoFilters([
                {
                    filter: 'drawtext',
                    options: {
                        fontfile: './assets/montserrat.ttf',
                        text: title,
                        fontsize: 40,
                        fontcolor: "000000",
                        box: 1,
                        boxcolor: "white",
                        x: '(w-tw)/2',
                        y: '((h-text_h)/2)-(text_h-(th/4))-100'
                    }
                },
                `subtitles=./${subtitlePath}:force_style='FontSize=16,Fontname=Ubuntu,Alignment=10'`
            ])
            .videoCodec('libx264')
            .audioCodec('aac')
            .format('mp4')
        
        const P = ['\\', '|', '/', '-'];
        let x = 0;
        
        const loader = setInterval(() => {
            process.stdout.write(`\rГенерация видео [ ${P[x++]} ]`);
            x %= P.length;
        }, 250);

        command.on('error', (err, stdout, stderr) => {
            console.error(err);
            console.error("-".repeat(20) + "stderr:");
            console.error(stderr);
            console.error("-".repeat(20) + "stderr end.");
            reject(err);
        })
        
        command.on('end', function () {
            clearInterval(loader);
            process.stdout.write(`\rГенерация видео завершена.\n`);
            resolve()
        })

        command.save(outputDir + '/video.mp4');
    })
}

module.exports = createVideo;