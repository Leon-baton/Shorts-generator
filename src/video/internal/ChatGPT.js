const axios = require('axios');
const apiEndpoint = 'https://api.openai.com';

class Cache {
    constructor() {
        this.messages = [];
    }

    addMessage(options) {
        this.messages.push(options);
    }

    clearMessages() {
        this.messages = [];
    }
}

class ChatGPT {
    constructor() {
        if (process.env.OPENAI_API_KEY) {
            this.apiKey = process.env.OPENAI_API_KEY;
        }
        
        this.cache = new Cache();
    }

    async doApiRequest(options) {
        if (options.body !== undefined && options.method === undefined) {
            options.method = 'POST'
        }
        
        return await axios({
            baseURL: apiEndpoint,
            url: options.path || null,
            method: options.method,
            responseType: 'stream',
            timeout: 60000,
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json"
            },
            data: JSON.stringify(options.body),
            withCredentials: true
        }).then((rsp) => {
            if (rsp.status !== 200) {
                console.error(`${rsp.status} ${rsp.statusText}`);
            }

            return rsp.data;
        }).catch((err) => {
            console.error(err.message)
        });
    }

    async sendMessage(content) {
        this.cache.addMessage({
            role: 'user',
            content: content
        });
        
        const messages = this.cache.messages.reduceRight((accumulator, currentValue, i, array) => {
            if((accumulator.join('') + currentValue).length > 800) array.length = 0;
            accumulator.push({ role: currentValue.role, content: currentValue.content });
            
            return accumulator;
        }, []).reverse();
        
        const stream = await this.doApiRequest({
            path: '/v1/chat/completions',
            body: {
                model: 'gpt-3.5-turbo',
                messages: messages,
                stream: true
            }
        });

        let result = "";
        let previous = "";
        
        stream.on("data", (raw) => {
            let cache = raw.toString();
            cache = cache.replace(/\r\n/giu, "\n");

            let sp = (previous + cache).split("\n\n");
        
            for(let i = 0; i < sp.length; i++){
                if(sp[i] == 'data: [DONE]') break;
                
                try {
                    let parsed = JSON.parse(sp[i].slice("data: ".length));
                    if(typeof parsed == 'object') {
                        if(parsed.choices[0].delta.content != null) result += parsed.choices[0].delta.content;
                    }
                } catch { }
            }
            
            previous = sp[sp.length-1];
            stream.emit("update", result);
        });
        
        stream.on('close', async () => {
            this.cache.addMessage({
                role: 'assistant',
                content: result
            });
        });

        return stream;
    }
}

module.exports = ChatGPT;