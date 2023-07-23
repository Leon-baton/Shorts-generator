const readline = require('node:readline');
const {
    stdin: input,
    stdout: output,
} = require('node:process');
const fs = require('fs');
const path = require('path');
const createVideo = require('./video/Video');
const ChatGPT = require('./video/internal/ChatGPT');
const generateTags = require('./video/Tags');
const generateFact = require('./video/util/Facts');

const dialog = new ChatGPT();

async function generateShort() {
    const fact = await generateFact(dialog);
    const parts = fact.content.split('|').map(el => el.trim());

    try {
        if((parts[0].length < 20) || !parts[1] || (parts[1].length < 15)) {
            throw new Error('Факт получился слишком коротким...');
        } else {
            process.stdout.write('\rГенерация факта прошла успешно.\n');
        }
        
        await createVideo(fact.title, parts);
        await generateTags(fact.title).then(arr => {
            const result = '#' + arr.join(', #');

            fs.writeFileSync(path.join(path.resolve(__dirname, "../output"), 'tags.txt'), result)
        })
    } catch (err) {
        process.stdout.write(`\rПроизошла ошибка: ${err.message}\n`);
        const rl = readline.createInterface({ input, output });
        
        const question = () => {
            rl.question('Пересоздать видео? [Y/N]\n>> ', function(answer) {
                if (answer.toLowerCase() == 'y') {
                    console.log(dialog)
                    dialog.cache.clearMessages();
                    return generateShort();
                }
                process.exit(1);
            });
        }
        
        question();
    }
}

generateShort();