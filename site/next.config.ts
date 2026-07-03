import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: { externalDir: true },
  // lib/data.ts uses a NodeNext-style ".js" import so the root tsc/vitest
  // toolchain can compile it; teach webpack to resolve it to the .ts source.
  webpack: (cfg) => {
    cfg.resolve.extensionAlias = { ".js": [".ts", ".js"] };
    return cfg;
  },
};

export default config;
