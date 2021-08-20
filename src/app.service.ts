import { Injectable } from "@nestjs/common";
import { getPackageInfo, IPackageInfo } from "@selinarnd/node-utils";

@Injectable()
export class AppService {
  private readonly packageInfo: IPackageInfo = getPackageInfo();

  getVersion(): string {
    return this.packageInfo.version;
  }
}
