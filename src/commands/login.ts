import { Command, flags } from "@oclif/command";
import { interactiveLogin } from "@azure/ms-rest-nodeauth";
import conf from "../util/conf";

export default class Login extends Command {
  static description = "deploy a new static site";

  static examples = ["$ azez static ."];

  static flags = {
    help: flags.help({ char: "h" }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: "n", description: "name to print" }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: "f" })
  };

  static args = [{ name: "filepath" }];

  async run() {
    // const {args, flags} = this.parse(Login)

    this.log("login");

    const creds = await interactiveLogin();
    const token = await creds.getToken();
    conf.set("token", token);
    this.log(JSON.stringify(token, null, 4));
  }
}
