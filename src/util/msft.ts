import chalk from "chalk";

export default function getLogo() {
  const OPT1 = `
           __  __ _                           __ _        _
 ${chalk.bgRed("    ")}${chalk.bgGreen(
    "    "
  )} |  \\/  (_) ___ _ __ ___  ___  ___  / _| |_     / \\    _____   _ _ __ ___
 ${chalk.bgRed("    ")}${chalk.bgGreen(
    "    "
  )} | |\\/| | |/ __| '__/ _ \\/ __|/ _ \\| |_| __|   / _ \\  |_  / | | | '__/ _ \\
 ${chalk.bgBlue("    ")}${chalk.bgYellow(
    "    "
  )} | |  | | | (__| | | (_) \\__ \\ (_) |  _| |_   / ___ \\  / /| |_| | | |  __/
 ${chalk.bgBlue("    ")}${chalk.bgYellow(
    "    "
  )} |_|  |_|_|\\___|_|  \\___/|___/\\___/|_|  \\__| /_/   \\_\\/___|\\__,_|_|  \\___|`;

  return OPT1;
}
