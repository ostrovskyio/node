
let interval = setInterval(() => {
  console.log('(5)');
  clearInterval(interval);
}); //тепер виконуються основні черги. Оскільки setInterval і setTimeout не мають визначеного часу на виконання, отже виконуються по порядку розташування в коді

setImmediate(() => console.log('(9)')); //не залишилось більше невиконаних функцій setInterval,setTimeout чи позачергових функцій. Отже тепер виконується ця функція

setTimeout(() => console.log('(6)'));//виконується одразу після setInterval

process.nextTick(() => console.log('(3)')); // тики та мікрозавдання в Node.js виконуються в першу чергу, перд основними чергами. В першу чергу nextTick

console.log('(1)'); //виконується першим, оскільки одразу ж попадає в Call stack, поки попередні функції чекають своєї черги

let myPromise = () =>
  new Promise((resolve) =>
    setTimeout(() => {
      console.log('(7)');
      resolve();
    })
  );//через функцію setTimeout виконується не одразу після console.log

let myPromise2 = () =>
  new Promise((resolve) => {
    console.log('(2)');
    resolve();
  }); //одразу ж попадає в Call stack, тому виконується зразу ж після console.log

myPromise().then(() => console.log('(8)'));//мікрозавдання яке виконується одразу після let myPromise2

myPromise2().then(() => console.log('(4)'));//мікрозавдання виконуються одразу ж після того, як були оброблені усі nextTick


