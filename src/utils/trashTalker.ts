const SMACK = [
  "Get got!",
  "That's cute.",
  "Only spooky thing around here is your algo.",
  "Your tree's only 3 inches long heheh.",
  "Your jokes are pretty sappy",
  "Time for you to leaf",
];

const getTrashTalk = (): string => {
  return SMACK[Math.floor(Math.random() * SMACK.length)];
};

export { getTrashTalk };
