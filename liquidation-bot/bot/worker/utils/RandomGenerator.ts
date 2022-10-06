const generateRandom = (maxLimit = 100) => {
    let rand = Math.random() * maxLimit;
    rand = Math.floor(rand); // 99
    return rand;
}

export default generateRandom;