const calculateScoreForCompleteAction = (
  nutrients: number,
  richness: number
): number => nutrients + (richness - 1) * 2;

export default calculateScoreForCompleteAction;
