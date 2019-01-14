import * as fs from "fs";
import { promisify } from "util";
import * as path from "path";
import * as Conf from "conf";
import { DeviceTokenCredentials } from "@azure/ms-rest-nodeauth";

const CONFIG_PATH = path.join(`${process.cwd()}/.azez.json`);

interface ILocalConfig {
  _cache: any;
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<any>;
  getCache(): Promise<any>;
}

export const localConfig: ILocalConfig = {
  _cache: null,
  async set(key: string, value: any): Promise<any> {
    const cache = await this.getCache();

    cache[key] = value;

    return promisify(fs.writeFile)(CONFIG_PATH, JSON.stringify(cache, null, 2));
  },
  async get(key: string): Promise<any> {
    const cache = await this.getCache();
    return cache[key];
  },
  async getCache(): Promise<any> {
    let cache = this._cache;
    if (!cache) {
      try {
        const buffer = await promisify(fs.readFile)(CONFIG_PATH);
        const string = buffer.toString();
        cache = JSON.parse(string);
        this._cache = cache;
      } catch (e) {
        this._cache = cache = {};
      }
    }

    return cache;
  }
};

export const globalConfig = new Conf<string | DeviceTokenCredentials | null>({
  defaults: {
    token: null,
    subscription: null
  },
  configName: "azez"
});
