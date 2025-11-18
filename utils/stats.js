import os from "os";
import osu from "os-utils";

export function getStats() {
  return new Promise(resolve => {
    osu.cpuUsage(cpu => {
      const total = os.totalmem() / 1024 / 1024 / 1024;
      const free = os.freemem() / 1024 / 1024 / 1024;
      const used = total - free;
      const percent = (used / total) * 100;

      resolve({
        aero: `${used.toFixed(2)}/${total.toFixed(0)}GB`,
        node: process.version,
        cpuModel: os.cpus()[0].model,
        cores: os.cpus().length,
        ram: `${total.toFixed(0)}GB (${percent.toFixed(2)}%)`
      });
    });
  });
}