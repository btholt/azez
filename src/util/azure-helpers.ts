import { localConfig } from "./conf";
import generateName from "./generate-name";
import {
  DEFAULT_RESOURCE_GROUP,
  DEFAULT_LOCATION,
  DONE_STRING
} from "./consts";
import { ResourceManagementClient } from "@azure/arm-resources";
import { DeviceTokenCredentials } from "@azure/ms-rest-nodeauth";
import { cli } from "cli-ux";

export async function getConfig(flags: any) {
  const [
    location,
    resourceGroup,
    { needToCreateAccount, account },
    subscription
  ] = await Promise.all([
    getConfigItem("location", "AZURE_LOCATION", flags, DEFAULT_LOCATION),
    getConfigItem(
      "resourceGroup",
      "AZURE_RESOURCE_GROUP",
      flags,
      DEFAULT_RESOURCE_GROUP
    ),
    getAccountName(flags),
    getConfigItem("subscription", "AZURE_SUBSCRIPTION", flags, "")
  ]);

  return {
    location,
    resourceGroup,
    needToCreateAccount,
    account,
    subscription
  };
}

export async function getConfigItem(
  name: string,
  envName: string,
  flags: any,
  defaultValue: string
) {
  let item: string;
  if (flags[name]) {
    item = flags[name];
  } else if (process.env[envName]) {
    item = process.env[envName] || "";
  } else {
    item = await localConfig.get(name);
    if (!item) {
      item = defaultValue;
    }
  }

  return item;
}

export async function createResourceGroup(
  name: string,
  subscription: string,
  creds: DeviceTokenCredentials,
  location: string
): Promise<void> {
  cli.action.start(`creating resource group ${name}`);
  const client = new ResourceManagementClient(creds, subscription);

  await client.resourceGroups.createOrUpdate(name, {
    location
  });
  cli.action.stop(DONE_STRING);
}

export async function getAccountName(flags: any) {
  const configAccount = await localConfig.get("account");
  let needToCreateAccount: boolean;
  let account;
  if (flags.account) {
    account = configAccount;
    needToCreateAccount = account === configAccount;
  } else if (process.env.AZURE_ACCOUNT_NAME) {
    account = process.env.AZURE_ACCOUNT_NAME;
    needToCreateAccount = process.env.AZURE_ACCOUNT_NAME === configAccount;
  } else if (configAccount) {
    account = configAccount;
    needToCreateAccount = false;
  } else {
    account = generateName();
    needToCreateAccount = true;
  }
  return { needToCreateAccount, account };
}
