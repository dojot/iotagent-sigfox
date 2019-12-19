export var sigfox = {
  network_server: process.env.SIGFOX_BACKEND_SERVER || "localhost:8008"
};

export var cache = {
  redis: process.env.IOTAGENT_SIGFOX_CACHE_HOST || "iotagent-sigfox-redis"
}

export var agent ={
  port: Number(process.env.IOTAGENT_SIGFOX_PORT) || 80
}