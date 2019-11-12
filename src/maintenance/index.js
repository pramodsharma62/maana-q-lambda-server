const fs = require('fs').promises;
const os = require('os');
const path = require('path');

const { maintenanceServer } = require('./graphql');
const { tokenValidator } = require('./authentication');
const { uploader, downloader } = require('./storage');

// WARNING: Global mutable state
let maintenanceStatus = false;
let currentOperation = null;

const maintenanceResponse = JSON.stringify({
  errors: [{ message: 'Lambda Server is in maintenance mode, try again later' }]
});

const maintenanceModeMiddleware = (req, res, next) => {
  if (maintenanceStatus) {
    res.status(503).send(maintenanceResponse);
  } else {
    next();
  }
};

const getMaintenanceStatus = () => {
  return maintenanceStatus;
};

const setMaintenanceStatus = newStatus => {
  if (newStatus !== maintenanceStatus) {
    console.warn(`Maintenance Mode: ${maintenanceStatus} -> ${newStatus}`);
    maintenanceStatus = newStatus;
  }
  return maintenanceStatus;
};

const createSetMaintenanceStatus = validator => {
  return (newStatus, token) => {
    validator(token);
    return setMaintenanceStatus(newStatus);
  };
};

const getCurrentOperation = () => {
  return currentOperation;
};

const setCurrentOperation = operation => {
  if (currentOperation !== null && operation !== null) {
    throw new Error(`Attempt to set operation "${operation}" while another operation "${operation}" is in progress`);
  }
  currentOperation = operation;
  return currentOperation;
};

const createTempDir = () => {
  return require('fs').mkdtempSync(path.join(os.tmpdir(), 'q-backup'));
};

/**
 * Takes original backup function that is only aware of folder on disk where backups should be placed
 * and validator for token and wraps it to handle additional properties, such as remote backup location,
 * authentication etc.
 */
const wrapBackupFunction = (originalBackupFunction, validator) => {
  return async (backupLocation, token) => {
    setMaintenanceStatus(true);
    setCurrentOperation('backup');
    try {
      validator(token);
      const uploadFiles = await uploader(backupLocation);
      const tmpDir = createTempDir();
      const backupResult = await originalBackupFunction(tmpDir);
      const uploadResult = await uploadFiles(tmpDir);
      return uploadResult;
    } catch (error) {
      console.error('Error performing backup', error);
      throw error;
    } finally {
      setCurrentOperation(null);
      // If backup failed, return to normal state
      setMaintenanceStatus(false);
    }
  };
};

/**
 * Takes original restore function that is only aware of folder on disk where backups should be placed
 * and validator for token and wraps it to handle additional properties, such as remote backup location,
 * authentication etc.
 */
const wrapRestoreFunction = (originalRestoreFunction, validator) => {
  return async (restoreLocation, token) => {
    setMaintenanceStatus(true);
    setCurrentOperation('restore');
    try {
      validator(token);
      const downloadFiles = await downloader(restoreLocation);
      const tmpDir = createTempDir();
      const downloadResult = await downloadFiles(tmpDir);
      const result = await originalRestoreFunction(tmpDir);
      setMaintenanceStatus(false);
      return result;
    } catch (error) {
      // If restore fails there's high chance that service is corrupted, so stay in maintenance mode.
      console.error('Error performing backup', error);
      throw error;
    } finally {
      setCurrentOperation(null);
    }
  };
};

const startMaintenanceServer = options => {
  const { express, maintenancePath, mainPath, backup, restore, authOptions } = options;
  if (maintenancePath === mainPath) throw new Error('Maintenance path and Main service path cannot be the same');
  if (!express) throw new Error('Express server instance is not provided');
  if (!maintenancePath) throw new Error('maintenancePath is not set');
  if (!mainPath) throw new Error('mainPath is not set');

  const validator = tokenValidator(authOptions);

  console.log(`Starting mainteinance server at ${maintenancePath}`);

  express.use(mainPath, maintenanceModeMiddleware);

  const server = maintenanceServer({
    backup: wrapBackupFunction(backup, validator),
    restore: wrapRestoreFunction(restore, validator),
    getMaintenanceStatus,
    setMaintenanceStatus: createSetMaintenanceStatus(validator),
    getCurrentOperation,
    authOptions
  });

  server.applyMiddleware({ app: express, path: maintenancePath });
};

module.exports = {
  startMaintenanceServer
};
