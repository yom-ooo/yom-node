require('dotenv').config();
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { exec } = require('child_process');
const AWS = require('aws-sdk');
const util = require('util');
const execAsync = util.promisify(exec);
const axios = require('axios').default;
const fs = require('fs-extra');
const path = require('path');
const hardwareInfo = require('./hardware_info');

const argv = yargs(hideBin(process.argv))
  .option('walletKey', {
    alias: 'k',
    type: 'string',
    default: '',
    describe: 'Your wallet key',
  })
  .option('storageLocation', {
    alias: 'p',
    type: 'string',
    default: 'Downloads',
    describe: 'The storage path for files',
  })
  .option('url', {
    alias: 'u',
    type: 'string',
    demandOption: true,
    describe: 'The URL to the space',
  })
  .parse();

const s3 = new AWS.S3();

const downloadImageFromS3 = async (bucket, imageName, downloadFolder) => {
  const params = {
    Bucket: bucket,
    Key: imageName,
  };

  try {
    const data = await s3.getObject(params).promise();
    const filePath = path.join(downloadFolder, imageName);
    await fs.writeFile(filePath, data.Body);
    console.log(`Successfully downloaded image from S3: ${imageName}`);
    return filePath;
  } catch (error) {
    console.error(`Error downloading from S3: ${error.message}`);
    throw error;
  }
};

const getPublicIp = async () => {
  try {
    const response = await axios.get('https://checkip.amazonaws.com/');
    let publicIp = response.data.trim();
    return publicIp;
  } catch (error) {
    throw error;
  }
};

const sendHeartbeat = async (status, hardwareInfo) => {
  try {
    const response = await axios.post('https://your-azure-function-url.com/api/heartbeat', {
      status,
      hardwareInfo,
    });
    return response.data;
  } catch (error) {
    console.error(`Error sending heartbeat: ${error.message}`);
    throw error;
  }
};

let hardwareInfo = {};

const instructionHandlers = {
  async downloadGame(instruction, status, downloadFolder) {
    const { gameBucketName, gameImageName } = instruction;
    status.downloading.push(gameImageName);
    await downloadImageFromS3(gameBucketName, gameImageName, downloadFolder);
    status.installed.push(gameImageName);
    status.downloading = status.downloading.filter((name) => name !== gameImageName);
  },

  async removeGame(instruction, status) {
    const { gameImageName } = instruction;
    status.installed = status.installed.filter((name) => name !== gameImageName);
    // Remove the game image and related files from the local storage
    // ...
  },

  async bootGame(instruction, status, downloadFolder, spaceUrl, numOfThreads) {
    const { gameImageName } = instruction;
    const projectName = path.parse(gameImageName).name;
    const streamContainerPrefix = `session-${projectName}`;
    const savedDir = path.join(downloadFolder, projectName, 'Saved');
    const configDir = path.join(savedDir, 'metaspaceConfig');
    const configPath = path.join(configDir, 'unreal_runtime_config.json');
    const configJson = {
      YomCore: {
        AllowGuests: true,
        MetaspaceID: '{{MetaspaceID}}',
        ServerIP: spaceUrl,
      },
    };

    await fs.ensureDir(savedDir);
    await fs.ensureDir(configDir);
    await fs.writeFile(configPath, JSON.stringify(configJson, null, 2));

    try {
      await execAsync(`docker load < ${gameImageName}`);

      const baseHttpPort = 80;
      const baseHttpsPort = 443;
      const baseStreamerPort = 8888;

      for (let i = 0; i < numOfThreads; i++) {
        const httpPort = baseHttpPort + i;
        let httpsPort = baseHttpsPort + i;
        const streamerPort = baseStreamerPort + i;

        // Shift ports to skip 445 which is reserved
        if (httpsPort >= 445) {
          httpsPort++;
        }

        // add wallet to container name
        const containerName = `${streamContainerPrefix}-${i}`;
        await execAsync(`docker run --name ${containerName} -d -p ${httpPort}:80 -p ${httpsPort}:443 -p ${streamerPort}:8888 -v ${configDir}:/app/Saved/metaspaceConfig your-game-image-name -AudioMixer -RenderOffScreen -PixelStreamingURL=ws://localhost:${streamerPort} -PixelStreamingEncoderMinQP=23 -PixelStreamingEncoderTargetBitrate=15000000 -e HTTP_PORT=80 -e HTTPS_PORT=443 -e STREAMER_PORT=8888 -e PUBLIC_IP=${publicIp} -e SPACE_NAME=${spaceName} your-ss-image-name`);
        console.log(`Signaling server ${containerName} started successfully`);
      }

      status.running.push(gameImageName);
    } catch (error) {
      console.error(`Error running game: ${error.message}`);
      throw error;
    }
  },

  async stopGame(instruction, status) {
    const { gameImageName } = instruction;
    // Stop the game containers associated with the given game image
    // ...
    status.running = status.running.filter((name) => name !== gameImageName);
  },
};

const cacheFilePath = './cache.json';

const readCacheFile = async () => {
  try {
    const cacheData = await fs.readFile(cacheFilePath, 'utf8');
    return JSON.parse(cacheData);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Cache file doesn't exist, return default values
      return {
        status: {
          downloading: [],
          installed: [],
          running: [],
        },
        hardwareInfo: {},
      };
    }
    throw error;
  }
};

const writeCacheFile = async (status, hardwareInfo) => {
  try {
    const cacheData = JSON.stringify({ status, hardwareInfo });
    await fs.writeFile(cacheFilePath, cacheData, 'utf8');
  } catch (error) {
    console.error(`Error writing cache file: ${error.message}`);
  }
};

(async () => {
  const VERSION = process.env.npm_package_version || '1.0.0';
  console.log(`YOM Node v${VERSION}`);

  const spaceUrl = argv.url;
  const downloadFolder = path.resolve(argv.storageLocation);
  const walletId = argv.walletKey;

  // Ensure the download folder exists
  if (!fs.existsSync(downloadFolder)) {
    await fs.mkdirp(downloadFolder);
  }

  try {
    // Hardware information
    hardwareInfo = await hardwareInfo.getHardwareInfo();
    console.log(`Using wallet id: ${walletId}`);
    console.log(`CPU: ${hwInfo.cpuName || 'N/A'}`);
    console.log(`GPU: ${(hwInfo.gpuNames && hwInfo.gpuNames[0]) || 'N/A'}`);
    console.log(`Metaspace url: ${spaceUrl}`);

    // Discovering WAN IP
    console.log('Discovering WAN IP ... ');
    const publicIp = await getPublicIp();
    console.log(`done: ${publicIp}`);

    // Read status and hardware info from cache file
    const { status, hardwareInfo: cachedHwInfo } = await readCacheFile();
    Object.assign(hwInfo, cachedHwInfo);

   // Heartbeat loop
   setInterval(async () => {
    try {
      const instructions = await sendHeartbeat(status, hardwareInfo);

      // Process instructions from Azure
      for (const instruction of instructions) {
        const handler = instructionHandlers[instruction.action];
        if (handler) {
          await handler(instruction, status, downloadFolder, spaceUrl, status.running.length);
        } else {
          console.warn(`Unknown instruction: ${instruction.action}`);
        }
      }

      // Write updated status to cache file
      await writeCacheFile(status);
    } catch (error) {
      console.error(`Error in heartbeat loop: ${error.message}`);
    }
  }, 5000); // 5-second heartbeat interval
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1); // Exit on error
}


// install docker + npm + drivers