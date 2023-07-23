const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { createTmpFileName } = require('./Utils');

async function getBackground(query, outputDir) {
    const res = await axios.get(`https://g.tenor.com/v1/search?q=${query}&key=LIVDSRZULELA&limit=25&ContentFilter=medium`);
    const url = res.data.results[Math.floor(Math.random() * res.data.results.length)]?.media[0]?.mp4.url

    const localFilePath = path.join(outputDir, createTmpFileName({
        name: 'background',
        format: 'mp4'
    }));

    const file = await axios.get(url, {
        responseType: 'stream'
    });

    const writer = fs.createWriteStream(localFilePath);
    file.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve(localFilePath.split('/').slice(-2).join('/')));
        writer.on('error', reject);
    });
}

module.exports = getBackground;