const GetLength = (val: HelloEnum) => {
  switch (val) {
    case HelloEnum.Hej:
    case HelloEnum.Hey:
      return "Three";
    default:
      return "Not Three";
  }
};