function delay() {
    return new Promise(resolve => setTimeout(resolve, 3000));
}

async function delayedLog(item) {
    // notice that we can await a function
    // that returns a promise
    await delay();
    console.log(item);
  }
  async function processArray(array) {
    for (const item of array) {
      await delayedLog(item);
    }
    console.log('Done!');
  }
  
  processArray([1, 2, 3, 4]);