import { Command, flags } from "@oclif/command";
import { StorageManagementClient } from "@azure/arm-storage";
import { ServiceURL, SharedKeyCredential } from "@azure/storage-blob";
import chalk from "chalk";
import { getCreds } from "../../util/auth";
import {
  getAccount,
  getResourceGroup,
  createAccount,
  getAccountKey,
  createWebContainer,
  setStaticSiteToPublic,
  uploadFilesToAzure
} from "../../util/storage-helpers";
import getLogo from "../../util/msft";
import { localConfig } from "../../util/conf";
import { cli } from "cli-ux";

export default class StaticDeploy extends Command {
  static description = "deploy a static site to Azure Static Sites";

  static examples = ["$ azez static ."];

  static flags = {
    help: flags.help({ char: "h" })
    // account: flags.string({ char: "a", description: "name of the storage account to deploy to" }),
    // choose: flags.boolean({ char: "c", description: "ignore cached credentials" })
  };

  static args = [{ name: "filepath" }];

  async run() {
    // const {args, flags} = this.parse(StaticDeploy)

    this.log(getLogo());
    this.log();

    const [credentials, subscription] = await getCreds(this.log.bind(this));
    const client = new StorageManagementClient(credentials, subscription);

    let { needToCreateAccount, account } = await getAccount();

    let resourceGroup = await getResourceGroup();

    if (needToCreateAccount) {
      await createAccount(account, client, resourceGroup);
    } else {
      cli.action.start(`redeploying to ${account}`);
      cli.action.stop(chalk.green("✓"));
    }

    const accountKey = await getAccountKey(account, client, resourceGroup);

    if (needToCreateAccount) {
      await createWebContainer(client, resourceGroup, account);
    }

    const pipeline = ServiceURL.newPipeline(
      new SharedKeyCredential(account, accountKey)
    );
    const serviceURL = new ServiceURL(
      `https://${account}.blob.core.windows.net`,
      pipeline
    );

    await uploadFilesToAzure(serviceURL);

    if (needToCreateAccount) {
      await setStaticSiteToPublic(serviceURL);
    }

    this.log(
      `see your deployed site at ${chalk.green(
        `https://${account}.z22.web.core.windows.net`
      )}`
    );

    if (needToCreateAccount) {
      cli.action.start("saving config to .azez.json");
      await localConfig.set("account", account);
      cli.action.stop(chalk.green("✓"));
    }
  }
}
