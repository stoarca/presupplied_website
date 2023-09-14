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
    web: {
      build: {
        dockerfile: path.join(__dirname, 'images/web/Dockerfile'),
        context: path.join(__dirname, 'images/web'),
      },
      labels: [
        'traefik.enable=true',
        `traefik.http.routers.webrouter.rule=Host("${host}")`,
        'traefik.http.services.webservice.loadbalancer.server.port=2368'
      ].concat(DEV ? [
        'traefik.http.routers.webrouter.entrypoints=web',
      ] : [
        'traefik.http.routers.webrouter.entrypoints=websecure',
        'traefik.http.routers.webrouter.tls.certresolver=myresolver',
      ]),
      restart: 'always',
      volumes: [
        '/data/presupplied_website/web/ghost/content:/var/lib/ghost/content',
      ].concat(DEV ? [
        `${path.join(__dirname, './images/web/themes')}:/themes`,
      ] : []),
      environment: {
        // see https://ghost.org/docs/config/#configuration-options
        database__client: 'mysql',
        database__connection__host: 'mysql',
        database__connection__user: 'ghostusr',
        database__connection__password: secrets.MYSQL_GHOST_USER_PASSWORD,
        database__connection__database: 'ghost',
        url: webUrl,
        NODE_ENV: DEV ? 'development' : 'production',
      }
    },
    mysql: {
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
    traefik: {
      image: 'traefik:2.10',
      restart: 'always',
      ports: [
        '80:80',
        '443:443',
        '8080:8080',
      ],
      volumes: [
        '/var/run/docker.sock:/var/run/docker.sock:ro',
        '/data/presupplied_website/traefik/letsencrypt:/letsencrypt',
      ],
      command: [
        '--providers.docker=true',
        '--providers.docker.exposedbydefault=false',
      ].concat(DEV ? [
        '--log.level=DEBUG',
        '--api.insecure=true',
        '--entrypoints.web.address=:80',
      ] : [
        '--entrypoints.websecure.address=:443',
        '--certificateresolvers.myresolver.acme.tlschallenge=true',
        '--certificateresolvers.myresolver.acme.email=t.sergiu@gmail.com',
        '--certificateresolvers.myresolver.acme.storage=/letsencrypt/acme.json',
      ]),
    },
  }
};

console.log(JSON.stringify(config, undefined, 2));
