module.exports = {
  apps: [
    {
      name: "nextsuit-api",
      cwd: "/var/www/nextsuit",
      script: "pnpm",
      args: "--filter @nextsuit/api start",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "nextsuit-admin",
      cwd: "/var/www/nextsuit",
      script: "pnpm",
      args: "--filter @nextsuit/admin-web preview",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "nextsuit-marketing",
      cwd: "/var/www/nextsuit",
      script: "pnpm",
      args: "--filter @nextsuit/marketing-web start",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "nextsuit-blog",
      cwd: "/var/www/nextsuit",
      script: "pnpm",
      args: "--filter @nextsuit/blog-web start",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
