console.time('Creating a data structure');

const dataStructure = [];
for (let i = 0; i < 1000; i++) {
  dataStructure.push({ name: `Product ${i}`, price: Math.random() * 100 });
}

console.timeEnd('Creating a data structure');

console.time('50-th element');

const element50 = dataStructure[49];
console.log('Product name:', element50.name);
console.log('Price:', element50.price);

console.timeEnd('50-th element');
