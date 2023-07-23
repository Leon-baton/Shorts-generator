function createTmpFileName(options) {
    return `${options.name}_${(new Date().toJSON()).replace(/:/g, '-').slice(0, -5).split('T').join('_')}.${options.format}`
}

function addZero(number, isMilliseconds = false) { 
    const digitCount = isMilliseconds ? 3 : 2; 
    let formattedNumber = number.toString();
    while (formattedNumber.length < digitCount) {
        formattedNumber = `0${formattedNumber}`;
    }
    return formattedNumber;
}

function formatTime(time) { 
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time - (hours * 3600)) / 60);
    const seconds = Math.floor(time - (hours * 3600) - (minutes * 60));
    const milliseconds = Math.floor((time % 1) * 1000);
    return `${addZero(hours)}:${addZero(minutes)}:${addZero(seconds)},${addZero(milliseconds, true)}`;
}

module.exports = {
    createTmpFileName: createTmpFileName,
    formatTime: formatTime
}

