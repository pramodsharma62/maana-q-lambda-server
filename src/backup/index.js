const fs = require('fs').promises;
const path = require('path');
const { models } = require('../db');

const backup = async backupPath => {
  const totalDocuments = await models.Lambda.countDocuments();
  const chunkSize = process.env.BACKUP_CHUNK_SIZE || 1000;
  const numChunks = Math.ceil(totalDocuments / chunkSize);

  for (let chunkNo = 0; chunkNo < numChunks; chunkNo++) {
    console.log(`Saving chunk #${chunkNo + 1}/${numChunks}`);
    const chunk = await models.Lambda.find({}, null, { limit: chunkSize, skip: chunkNo });
    await fs.writeFile(path.join(backupPath, `chunk${chunkNo}.json`), JSON.stringify(chunk), 'utf8');
  }

  return true;
};

const restore = async backupPath => {
  const backupDir = await fs.readdir(backupPath);
  console.log('Deleting existing lambdas');
  await models.Lambda.deleteMany({});

  backupDir.forEach(async file => {
    console.log(`Processing chunk: ${file}`);
    const chunkPath = path.join(backupPath, file);
    const chunkContents = await fs.readFile(chunkPath, 'utf8');
    const instances = JSON.parse(chunkContents);
    await models.Lambda.insertMany(instances);
  });
  return true;
};

module.exports = {
  backup,
  restore
};
