const config = {
    promt: 'Напиши один факт от 60-ти символов. Факт должен быть по любой из данных тем: грустный факт про отношения, факт про девушек, факт про любовь, факт про космос, расслабляющий факт. Раздели полученное предложение на две РАВНЫЕ части разделительным символом "|". Придумай заголовок этому факту например "Забавный факт", заголовок должен быть не больше 2-х слов. Раздели факт и заголовок таким символом "/". Обрати внимание вот такой порядок у тебя должнен получится: Заголовок / первая часть факта (не больше 40 символов) | вторая часть факта (не больше 40 символов).'
}

function generateFact(dialog) {
    let result;
    
    return new Promise(async(resolve, reject) => {
        const P = ['\\', '|', '/', '-'];
        let x = 0;
        
        const stream = await dialog.sendMessage(config.promt);
        
        stream.on("update", async (content) => {
            result = content;
            
            process.stdout.write(`\rГенерация факта [ ${P[x++]} ]`);
            x %= P.length;    
        });
        
        stream.on("end", async () => {
            result = result.split('/').sort((a, b) => a.length - b.length);

            if(!result[1]) return console.error('\nПроизошла ошибка при генерации факта!');

            const title = result[0].trim();
            const fact = result[1].trim();
            
            resolve({
                title: title,
                content: fact
            });
        });
    });
}

module.exports = generateFact;