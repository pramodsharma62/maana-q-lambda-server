const { ShareServiceClient, AnonymousCredential } = require("@azure/storage-file-share");
const fs = require('fs').promises;
const path = require('path');
/*
BlobEndpoint=https://maanaqastorageaccount.blob.core.windows.net/;QueueEndpoint=https://maanaqastorageaccount.queue.core.windows.net/;FileEndpoint=https://maanaqastorageaccount.file.core.windows.net/;TableEndpoint=https://maanaqastorageaccount.table.core.windows.net/;SharedAccessSignature=sv=2019-02-02&ss=bft&srt=sco&sp=rwdlacu&se=2019-11-18T06:50:18Z&st=2019-11-11T22:50:18Z&spr=https&sig=Shb6kCMIxAltZsxOehBl96XPHYSjt%2BDVR%2B2%2Fq4KoPqQ%3D
?sv=2019-02-02&ss=bft&srt=sco&sp=rwdlacu&se=2019-11-18T06:50:18Z&st=2019-11-11T22:50:18Z&spr=https&sig=Shb6kCMIxAltZsxOehBl96XPHYSjt%2BDVR%2B2%2Fq4KoPqQ%3D
FS SAS URL:
https://maanaqastorageaccount.file.core.windows.net/?sv=2019-02-02&ss=bft&srt=sco&sp=rwdlacu&se=2019-11-18T06:50:18Z&st=2019-11-11T22:50:18Z&spr=https&sig=Shb6kCMIxAltZsxOehBl96XPHYSjt%2BDVR%2B2%2Fq4KoPqQ%3D
*/

const anonymousCredential = new AnonymousCredential();

const ensureDirectoryDoesntExistOrEmpty = async directoryClient => {
  let directoryProperties
  try {
    directoryProperties = await directoryClient.getProperties();
  } catch (error) {
    if (error.statusCode === 404) {
      // Everything is fine, directory doesn't exist
    } else {
      // Some other error - rethrow
      throw error;
    }
  }

  if (!directoryProperties) {
    // Directory doesn't exist, create it and return
    await directoryClient.create();
    return;
  }

  // Now, if directory exists, list files in it.
  const iterator = directoryClient.listFilesAndDirectories().byPage({ maxPageSize: 1 });
  const response = (await iterator.next()).value;

  if (response.segment.fileItems.length !== 0 || response.segment.directoryItems.length !== 0) {
    throw new Error('Backup directory must be empty');
  }
};

const ensureDirectoryExistsAndNotEmpty = async directoryClient => {
  // This will throw if directory doesn't exist
  await directoryClient.getProperties();

  // Now, if directory exists, list files in it.
  const iterator = directoryClient.listFilesAndDirectories().byPage({ maxPageSize: 1 });
  const response = (await iterator.next()).value;

  if (response.segment.fileItems.length === 0 && response.segment.directoryItems.length === 0) {
    throw new Error('Restore directory must not be empty');
  }
};

const validateLocationCommon = async azureLocation => {
  const serviceClient = new ShareServiceClient(
    // When using AnonymousCredential, following url should include a valid SAS
    azureLocation.storeUrl,
    anonymousCredential
  );

  // This will throw an error if provided SAS key is invalid
  await serviceClient.getProperties();

  const backupShareClient = serviceClient.getShareClient(azureLocation.share);

  // This will throw if share doesn't exist or is inaccessible
  await backupShareClient.getProperties();

  // At this point, we know that credentials are valid and share exists, so
  // there's no more common validation code that is needed. Return share client

  return backupShareClient;
};

const uploader = async location => {
  const azureLocation = location.azureFileStore;
  if (!azureLocation)
    throw new Error(`Azure File Store location must be provided when locationType is set to 'AZURE_FILE_STORE'`);

  const backupShareClient = await validateLocationCommon(azureLocation);

  // First, check if directory exists - it should fail if it does.
  const backupDirectoryClient = backupShareClient.getDirectoryClient(azureLocation.folder);
  await ensureDirectoryDoesntExistOrEmpty(backupDirectoryClient);

  return async localPath => {
    const backupDir = await fs.readdir(localPath);
    await Promise.all(
      backupDir.map(async file => {
        console.log(`Uploading file: ${file}`);
        const localFilePath = path.join(localPath, file);
        const fileClient = backupDirectoryClient.getFileClient(file);
        // const fileSize = (await fs.stat(localFilePath)).size;
        // Parallel uploading of a file
        return fileClient.uploadFile(localFilePath, {
          rangeSize: 4 * 1024 * 1024, // 4MB range size
          parallelism: 20, // 20 concurrency
          onProgress: ev => console.log(ev)
        });
      })
    );
    return true;
  };
};

const downloader = async location => {
  const azureLocation = location.azureFileStore;
  if (!azureLocation)
    throw new Error(`Azure File Store location must be provided when locationType is set to 'AZURE_FILE_STORE'`);

  const backupShareClient = await validateLocationCommon(azureLocation);
  // First, check if directory exists - it should fail if it does.
  const backupDirectoryClient = backupShareClient.getDirectoryClient(azureLocation.folder);
  await ensureDirectoryExistsAndNotEmpty(backupDirectoryClient);

  return async localPath => {
    // Now, if directory exists, list files in it - process 8 files in a row
    const iterator = backupDirectoryClient.listFilesAndDirectories().byPage({ maxPageSize: 8 });
    let response = (await iterator.next()).value;

    while (
      response &&
      response.segment &&
      (response.segment.fileItems.length !== 0 || response.segment.directoryItems.length !== 0)
    ) {
      if (response.segment.fileItems.length !== 0) {
        await Promise.all(
          response.segment.fileItems.map(async remoteFile => {
            const fileClient = backupDirectoryClient.getFileClient(remoteFile.name);
            return fileClient.downloadToFile(path.join(localPath, remoteFile.name));
          })
        );
        response = (await iterator.next()).value;
      } else {
        // TODO handle directories
      }
    }
  };
};

module.exports = {
  uploader,
  downloader
};
