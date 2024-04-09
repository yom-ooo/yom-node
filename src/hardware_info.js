const os = require('os');
const { execSync } = require('child_process');
const si = require('systeminformation');

class DiskInfo {
  constructor(diskName, mountPoint, availableSpace, diskType) {
    this.diskName = diskName;
    this.mountPoint = mountPoint;
    this.availableSpace = availableSpace;
    this.diskType = diskType;
  }

  toString() {
    return `Disk(${this.diskName}) {mount_point: ${this.mountPoint}, available_space: ${this.availableSpace}, disk_type: ${this.diskType}}`;
  }
}

class HardwareInfo {
  constructor(osName, cpuName, gpuNames, disks, totalRam) {
    this.osName = osName;
    this.cpuName = cpuName;
    this.gpuNames = gpuNames;
    this.disks = disks;
    this.totalRam = totalRam;
  }

  toString() {
    return `(os_name: ${this.osName}, cpu_name: ${this.cpuName}, gpu_names: ${JSON.stringify(this.gpuNames)}, total_ram: ${this.totalRam}, disks: ${JSON.stringify(this.disks)})`;
  }
}

class HardwareReport {
  constructor(cpuUsage, gpuUsage, ramUsage) {
    this.cpuUsage = cpuUsage;
    this.gpuUsage = gpuUsage;
    this.ramUsage = ramUsage;
  }

  toString() {
    return `(cpu_usage: ${JSON.stringify(this.cpuUsage)}, gpu_usage: ${this.gpuUsage}, ram_usage: ${this.ramUsage})`;
  }
}

async function getGpuNames() {
  try {
    const graphics = await si.graphics();
    const gpuNames = graphics.controllers.map(controller => controller.model);
    return gpuNames;
  } catch (error) {
    console.error('Failed to retrieve GPU names:', error);
    return [];
  }
}

async function getHardwareInfo() {
  try {
    const disks = await si.diskLayout();
    const filteredDisks = disks.filter(disk => !disk.removable);

    const diskInfos = filteredDisks.map(disk => new DiskInfo(
      disk.name,
      disk.mountpoint,
      disk.available,
      disk.type
    ));

    let cpuName = 'N/A';
    try {
      const cpuData = await si.cpu();
      cpuName = cpuData.brand;
    } catch (error) {
      console.error('Failed to retrieve CPU information:', error);
    }

    let gpuNames = [];
    try {
      const graphics = await si.graphics();
      gpuNames = graphics.controllers.map(controller => controller.model);
    } catch (error) {
      console.error('Failed to retrieve GPU names:', error);
    }

    const totalRam = os.totalmem();

    return new HardwareInfo(
      os.type(),
      cpuName,
      gpuNames,
      diskInfos,
      totalRam
    );
  } catch (error) {
    console.error('Failed to retrieve hardware information:', error);
    return null;
  }
}

async function getCurrentHardwareReport() {
  try {
    const cpuUsage = await si.currentLoad();
    const ramUsage = await si.mem();

    return new HardwareReport(
      cpuUsage.cpus.map(cpu => cpu.load),
      0.0, // Currently unable to get GPU usage
      (ramUsage.used / ramUsage.total) * 100
    );
  } catch (error) {
    console.error('Failed to retrieve current hardware report:', error);
    return null;
  }
}

module.exports = {
  DiskInfo,
  HardwareInfo,
  HardwareReport,
  getHardwareInfo,
  getCurrentHardwareReport,
};