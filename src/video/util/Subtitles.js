const fs = require('fs');
const path = require('path');
const { 
    formatTime,
    createTmpFileName 
} = require('./Utils');

function createSubtitles(textArr, outputDir) {
    return new Promise((resolve, reject) => {
        const localFilePath = path.join(outputDir, createTmpFileName({
            name: 'subtitle',
            format: 'srt'
        }));
        
        let subtitles = "";
        let currentTime = 0;

        textArr.forEach((subtitle, index) => {
            const subtitleTime = subtitle.replace(/ /g, '').length * 0.2;
            
            subtitles += `${index + 1}\n${formatTime(currentTime)} --> ${formatTime(currentTime + subtitleTime)}\n${subtitle}\n\n`;
            currentTime += subtitleTime;
        });
        
        fs.writeFile(localFilePath, subtitles, (err) => {
            if (err) return reject(err);
            resolve(localFilePath.split('/').slice(-2).join('/'));
        })
    })
}

module.exports = createSubtitles;