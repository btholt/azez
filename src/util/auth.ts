import {
  interactiveLoginWithAuthResponse,
  DeviceTokenCredentials,
  LinkedSubscription,
  interactiveLogin
} from "@azure/ms-rest-nodeauth";
import { MemoryCache } from "adal-node";
import { Environment } from "@azure/ms-rest-azure-env";
import { prompt } from "inquirer";
import { globalConfig } from "./conf";

async function chooseSubscription(
  subs: LinkedSubscription[] | undefined
): Promise<string> {
  if (Array.isArray(subs)) {
    if (subs.length === 0) {
      throw new Error(
        "You don't have any active subscriptions. Head to https://portal.azure.com and sign in. From there you can create a new subscription and then you can come back and try again."
      );
    } else if (subs.length === 1) {
      return subs[0].id;
    } else {
      const { sub } = await prompt([
        {
          type: "list",
          name: "sub",
          choices: subs.map(sub => ({
            name: `${sub.name} – ${sub.id}`,
            value: sub.id
          })),
          message:
            "Under which subscription should we put this static site? (azez will default to this in the future)"
        }
      ]);
      return sub;
    }
  }

  throw new Error(
    "API returned no subscription IDs. It should. Log in to https://portal.azure.com and see if there's something wrong with your account."
  );
}

export async function getCreds(
  log: (msg: string) => void
): Promise<[DeviceTokenCredentials, string]> {
  let credentials: DeviceTokenCredentials;
  let confToken = globalConfig.get("token") as DeviceTokenCredentials | null;
  let subscription = globalConfig.get("subscription") as string | null;
  if (confToken && subscription) {
    // user has previously logged on and selected a valid subscription
    const cache = new MemoryCache();
    cache.add(confToken.tokenCache._entries, () => {});
    credentials = new DeviceTokenCredentials(
      confToken.clientId,
      confToken.domain,
      confToken.username,
      confToken.tokenAudience,
      new Environment(confToken.environment),
      cache
    );

    const token = await credentials.getToken();
    if (new Date(token.expiresOn).getTime() < Date.now()) {
      log(`Your stored credentials have expired; you'll have to log in again`);
      const loginRes = await interactiveLogin();
      credentials = loginRes as DeviceTokenCredentials;
      globalConfig.set("token", credentials);
    }
  } else {
    // user has never logged in before
    const loginRes = await interactiveLoginWithAuthResponse();
    credentials = loginRes.credentials as DeviceTokenCredentials;

    if (!subscription) {
      subscription = await chooseSubscription(loginRes.subscriptions);
    }

    globalConfig.set("token", credentials);
    globalConfig.set("subscription", subscription);
  }

  return [credentials, subscription];
}

export async function clearCreds() {}
