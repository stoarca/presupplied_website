let fs = require('fs');
let path = require('path');

if (process.argv.length < 3) {
  console.error('Must provide argument of either "dev" or "prod"');
  process.exit(1);
}
let MODE = process.argv[2];
if (!['dev', 'prod'].includes(MODE)) {
  console.error('Must provide argument of either "dev" or "prod"');
  process.exit(1);
}

let DEV = MODE === 'dev';
let PROD = MODE === 'prod';

let secrets;
if (DEV) {
  secrets = require('./secrets.dev.json');
} else {
  secrets = require('./secrets.prod.json');
}
secrets = new Proxy(secrets, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    } else {
      throw new Error(`Environment variable '${prop}' not found`);
    }
  }
});

let host = DEV ? 'wwwlocal.presupplied.com' : 'presupplied.com';
let scheme = DEV ? 'http://' : 'https://';
let webUrl = scheme + host;

let config = {
  version: '3.1',
  services: {
    pswghost_website: {
      build: {
        context: path.join(__dirname, 'images/ghost_website'),
      },
      labels: [
        'traefik.enable=true',
        `traefik.http.routers.ghostwebsiterouter.rule=Host("${host}")`,
        'traefik.http.routers.ghostwebsiterouter.entrypoints=web',
        'traefik.http.services.ghostwebsiteservice.loadbalancer.server.port=2368',
      ].concat(DEV ? [
      ] : [
        `traefik.http.routers.ghostwebsiterouter-secure.rule=Host("${host}")`,
        'traefik.http.routers.ghostwebsiterouter-secure.entrypoints=websecure',
        'traefik.http.routers.ghostwebsiterouter-secure.tls=true',
        'traefik.http.routers.ghostwebsiterouter-secure.tls.certresolver=myresolver',
        'traefik.http.middlewares.ghostwebsite-redirect.redirectscheme.scheme=https',
        'traefik.http.routers.ghostwebsiterouter.middlewares=ghostwebsite-redirect',
      ]),
      restart: 'always',
      volumes: [
        '/data/presupplied_website/ghost_website/content:/var/lib/ghost/content',
      ].concat(DEV ? [
        `${path.join(__dirname, './images/ghost_website/themes')}:/themes`,
      ] : []),
      environment: {
        // see https://ghost.org/docs/config/#configuration-options
        database__client: 'mysql',
        database__connection__host: 'pswmysql',
        database__connection__user: 'ghostusr',
        database__connection__password: secrets.MYSQL_GHOST_USER_PASSWORD,
        database__connection__database: 'ghost',
        url: webUrl,
        NODE_ENV: DEV ? 'development' : 'production',
      }
    },
    pswmysql: {
      image: 'mysql:8.0',
      restart: 'always',
      volumes: [
       '/data/presupplied_website/mysql:/var/lib/mysql',
      ],
      environment: {
        MYSQL_ROOT_PASSWORD: secrets.MYSQL_ROOT_PASSWORD,
        MYSQL_DATABASE: 'ghost',
        MYSQL_USER: 'ghostusr',
        MYSQL_PASSWORD: secrets.MYSQL_GHOST_USER_PASSWORD,
      },
    },
  },
  networks: {
    default: {
      // HACK: to get it working with the traefik instance from the presupplied
      // repo
      name: 'presupplied',
    },
  },
};

console.log(JSON.stringify(config, undefined, 2));
