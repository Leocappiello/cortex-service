import { createClient } from 'redis';

let client;

const setClient = (REDIS_URI) => {
  client = createClient({
    url: REDIS_URI,
  });
};

const start = async () => {
  try {
    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();
    console.log('Connecting Redis');
  } catch (error) {
    console.log('Error connecting redis');
  }
};

const createKey = async (key, value) => {
  const stringValue = String(value);
  //const name = uuidv4();
  const data = {
    //key,
    stringValue,
  };

  const jsonString = JSON.stringify(data);

  try {
    await client.set(key, jsonString);
  } catch (error) {
    console.log(error);
    console.log('Error creating Redis key');
  }
};

const getKey = async (key) => {
  return await client.get(key);
};

const getAllKeys = async () => {
  return await client.get();
};

export { createKey, getAllKeys, getKey, setClient, start };
