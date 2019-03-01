import { Command, flags } from "@oclif/command";
import { StorageManagementClient } from "@azure/arm-storage";
import { ServiceURL, SharedKeyCredential } from "@azure/storage-blob";
import chalk from "chalk";
import { cli } from "cli-ux";
import { getCreds } from "../../util/auth";
import {
  createAccount,
  getAccountKey,
  createWebContainer,
  setStaticSiteToPublic,
  uploadFilesToAzure
} from "../../util/storage-helpers";
import getLogo from "../../util/msft";
import { localConfig } from "../../util/conf";
import { getConfig, createResourceGroup } from "../../util/azure-helpers";
import { DONE_STRING } from "../../util/consts";

export default class StaticDeploy extends Command {
  static description = "deploy a static site to Azure Static Sites";

  static examples = ["$ azez static ."];

  static flags = {
    help: flags.help({ char: "h" }),
    account: flags.string({
      char: "a",
      description: "name of the storage account to deploy to"
    }),
    location: flags.string({
      char: "l",
      description: 'location where to create storage account e.g. "West US"'
    }),
    subscription: flags.string({
      char: "s",
      description: "subscription ID under which to create new resources"
    }),
    resourceGroup: flags.string({
      char: "r",
      description: "name of the resource group to deploy to"
    }),
    noSave: flags.boolean({
      char: "N",
      description: "don't save the configuration"
    })
    // choose: flags.boolean({ char: "c", description: "ignore cached credentials" })
  };

  static args = [{ name: "filepath" }];

  async run() {
    // const {args, flags} = this.parse(StaticDeploy)
    const { flags } = this.parse(StaticDeploy);

    this.log(getLogo());
    this.log();

    let {
      location,
      resourceGroup,
      needToCreateAccount,
      account,
      subscription
    } = await getConfig(flags);

    const [credentials, retrievedSubscription] = await getCreds(
      this.log.bind(this),
      !subscription
    );
    if (retrievedSubscription) {
      subscription = retrievedSubscription;
    }
    const client = new StorageManagementClient(credentials, subscription);

    await createResourceGroup(
      resourceGroup,
      subscription,
      credentials,
      location
    );

    if (needToCreateAccount) {
      await createAccount(account, client, resourceGroup);
    } else {
      cli.action.start(`redeploying to ${account}`);
      cli.action.stop(DONE_STRING);
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

    if (!flags.noSave) {
      cli.action.start("saving config to .azez.json");
      await localConfig.setObject({
        location,
        resourceGroup,
        subscription,
        account
      });
      cli.action.stop(DONE_STRING);
    }
  }
}
