import { Request as _Request } from "express";

declare module "express" {
  // @ts-ignore
  // tslint:disable-next-line interface-name
  interface Request extends _Request {
    caller?: any;
    user?: any;
    device: any;
  }
}
