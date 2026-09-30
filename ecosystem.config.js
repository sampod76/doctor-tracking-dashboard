// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "holiday_dashboard",
      script: "server.js",
      exec_mode: "cluster",
      instances: "1",
      watch: false,
      autorestart: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3005,
      },
    },
  ],
};

/* 
 module.exports = {
    apps: [
      {
        name: 'Education',
        script: 'node_modules/next/dist/bin/next',
        args: 'start -p 3000',
        instances: '1',
        exec_mode: 'cluster',
        watch: false,  // Disable watching for production
        env: {
          NODE_ENV: 'development', //pm2 start ecosystem.config.js --env development
        },
        env_production: {
          NODE_ENV: 'production', //pm2 start ecosystem.config.js --env production
        },
      },
    ],
  };
  
  */
