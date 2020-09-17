
const object = {
  greetings: [
    {
      type: HelloEnum.Hello,
      image: "https://placekitten.com/300/300"
    },
    {
      type: HelloEnum.Hola,
      image: "https://placekitten.com/300/300"
    }
  ]
}

console.log(object.greetings[0].type === HelloEnum.Hello);
