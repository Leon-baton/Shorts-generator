const axios = require('axios');

async function generateTags(query) {
    const res = await axios.get(`https://rapidtags.io/api/generator?query=${query}&type=YouTube`);
    return res.data.tags;
}

module.exports = generateTags;