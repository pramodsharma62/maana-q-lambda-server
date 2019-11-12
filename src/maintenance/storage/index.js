const uploader = async location => {
  switch (location.locationType) {
    case 'AZURE_FILE_STORE':
      console.log('Using Azure File Store');
      return require('./azurefs').uploader(location);
    default:
      throw new Error(`Unsupported backup/restore location type: ${location.locationType}`);
  }
};

const downloader = async location => {
  switch (location.locationType) {
    case 'AZURE_FILE_STORE':
      console.log('Using Azure File Store');
      return require('./azurefs').downloader(location);
    default:
      throw new Error(`Unsupported backup/restore location type: ${location.locationType}`);
  }
};

module.exports = {
  uploader,
  downloader
};
