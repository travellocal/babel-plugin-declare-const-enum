const object = {
  greetings: [{
    type: 1,
    image: "https://placekitten.com/300/300"
  }, {
    type: 4,
    image: "https://placekitten.com/300/300"
  }]
};
console.log(object.greetings[0].type === 1);