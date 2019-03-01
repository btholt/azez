import { Command, flags } from "@oclif/command";
import { clearCreds } from "../util/auth";
import { cli } from "cli-ux";
import chalk from "chalk";
import { DONE_STRING } from "../util/consts";

export default class Login extends Command {
  static description = "logout and clear global config";

  static examples = ["$ azez logout"];

  static flags = {
    help: flags.help({ char: "h" })
  };

  static args = [{ name: "filepath" }];

  async run() {
    // const {args, flags} = this.parse(Login)

    cli.action.start("logging out");
    await clearCreds();
    cli.action.stop(DONE_STRING);
  }
}
