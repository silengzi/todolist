declare module '@prisma/nextjs-monorepo-workaround-plugin' {
  import { Configuration, WebpackPluginInstance } from 'webpack';

  export class PrismaPlugin implements WebpackPluginInstance {
    constructor();
    apply(compiler: Configuration): void;
  }
}

