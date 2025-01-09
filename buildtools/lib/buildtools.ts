export function series(...tasks: Function[]) {
  return async () => {
    for (let task of tasks) {
      await task();
    }
  };
}

export function parallel(...tasks: Function[]) {
  return async () => {
    const promises: Promise<any>[] = [];
    for (let task of tasks) {
      promises.push(task());
    }
    for (let promise of promises) {
      await promise;
    }
  };
}
