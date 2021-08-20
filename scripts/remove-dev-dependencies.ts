import { exec } from "child_process";

// tslint:disable:no-var-requires
const devDependencies = Object.keys(
  require('../package.json').devDependencies
).join(" ");
const command = `yarn remove ${devDependencies}`;

exec(command, (err, stdout, stderr) => {
  if (err) {
    throw err;
  }
  process.stdout.write(`stdout: \n${stdout}\n`);
  process.stdout.write(`stderr: \n${stderr}\n`);
});
