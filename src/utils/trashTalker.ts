const SMACK = ["Get got!", "That's cute.", "Only spooky thing around here is your algo."]

const getTrashTalk = (): string => {
    return SMACK[Math.floor(Math.random() * SMACK.length)];
}

export{ getTrashTalk };
