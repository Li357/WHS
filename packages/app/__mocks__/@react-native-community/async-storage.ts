const storage: { [key: string]: string } = {};

function getItem(key: string) {
  return Promise.resolve(storage[key] || null);
}

function setItem(key: string, item: any) {
  storage[key] = JSON.stringify(item);
  return Promise.resolve();
}

function removeItem(key: string) {
  delete storage[key];
  return Promise.resolve();
}

export default {
  getItem,
  setItem,
  removeItem,
};
