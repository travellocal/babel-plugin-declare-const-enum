const IsGoodRating = (val: RatingEnum) => {
  return val !== RatingEnum.NotGood;
};
