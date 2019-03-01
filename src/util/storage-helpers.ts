import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";
import { StorageManagementClient } from "@azure/arm-storage";
import { cli } from "cli-ux";
import { lookup, charset } from "mime-types";
import {
  uploadStreamToBlockBlob,
  Aborter,
  BlobURL,
  BlockBlobURL,
  ContainerURL,
  ServiceURL
} from "@azure/storage-blob";
import * as promiseLimit from "promise-limit";
import * as ProgressBar from "ascii-progress";
import { promisify } from "util";
import { DONE_STRING } from "./consts";

export async function createWebContainer(
  client: StorageManagementClient,
  resourceGroup: any,
  account: any
) {
  cli.action.start("creating web container");
  // const containerRes = await client.blobContainers.create(
  await client.blobContainers.create(resourceGroup, account, "$web", {
    publicAccess: "Container",
    metadata: {
      cli: "azez"
    }
  });
  cli.action.stop(DONE_STRING);
}

export async function setStaticSiteToPublic(serviceURL: ServiceURL) {
  cli.action.start("setting container to be publicly available static site");
  await serviceURL.setProperties(Aborter.timeout(30 * 60 * 60 * 1000), {
    staticWebsite: {
      enabled: true,
      indexDocument: "index.html",
      errorDocument404Path: "index.html"
    }
  });
  cli.action.stop(DONE_STRING);
}

export async function createAccount(
  account: any,
  client: StorageManagementClient,
  resourceGroup: any
) {
  cli.action.start(`creating ${account}`);
  const poller = await client.storageAccounts.beginCreate(
    resourceGroup,
    account,
    {
      kind: "StorageV2",
      location: "West US",
      sku: { name: "Standard_LRS" }
    }
  );
  // const accountRes = await poller.pollUntilFinished();
  await poller.pollUntilFinished();
  cli.action.stop(DONE_STRING);
}

export async function getAccountKey(
  account: any,
  client: StorageManagementClient,
  resourceGroup: any
) {
  cli.action.start("retrieving account keys");
  const accountKeysRes = await client.storageAccounts.listKeys(
    resourceGroup,
    account
  );
  const accountKey = (accountKeysRes.keys || []).filter(
    key => (key.permissions || "").toUpperCase() === "FULL"
  )[0];
  if (!accountKey || !accountKey.value) {
    cli.error("no keys retrieved for storage account");
    process.exit(1);
    return "";
  }
  cli.action.stop(DONE_STRING);
  return accountKey.value;
}

export async function uploadFilesToAzure(
  serviceURL: ServiceURL
): Promise<void> {
  cli.action.start("preparing static deploy");
  const containerURL = ContainerURL.fromServiceURL(serviceURL, "$web");

  const files = await promisify(glob)(`**`, {
    ignore: [".git", ".azez.json"],
    nodir: true
  });

  cli.action.stop(DONE_STRING);

  const bar = new ProgressBar({
    schema:
      "[:filled.brightGreen:blank] :current/:total files uploaded | :percent done | :elapseds | eta: :etas",
    total: files.length
  });

  bar.tick(0);

  await promiseLimit(5).map(files, async function(file: any) {
    const blobURL = BlobURL.fromContainerURL(containerURL, file);
    const blockBlobURL = BlockBlobURL.fromBlobURL(blobURL);

    const blobContentType = lookup(file) || "";
    const blobContentEncoding = charset(blobContentType) || "";

    await uploadStreamToBlockBlob(
      Aborter.timeout(30 * 60 * 60 * 1000),
      fs.createReadStream(path.join(process.cwd(), file)),
      blockBlobURL,
      4 * 1024 * 1024,
      20,
      {
        blobHTTPHeaders: {
          blobContentType,
          blobContentEncoding
        }
      }
    );

    bar.tick(1);
  });

  bar.clear();
  cli.action.start("deploying static site");
  cli.action.stop(DONE_STRING);
}
