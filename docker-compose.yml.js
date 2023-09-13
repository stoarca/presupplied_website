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

let env = {
  MYSQL_GHOST_USER_PASSWORD: 'example',
  MYSQL_ROOT_PASSWORD: 'example',
};
env = new Proxy(env, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    } else {
      throw new Error(`Environment variable '${prop}' not found`);
    }
  }
});

let config = {
  version: '3.1',
  services: {
    ghost: {
      build: {
        dockerfile: path.join(__dirname, 'images/web/Dockerfile'),
        context: path.join(__dirname, 'images/web'),
      },
      restart: 'always',
      volumes: [
        '/data/presupplied_website/ghost/content:/var/lib/ghost/content',
      ].concat(DEV ? [
        `${path.join(__dirname, './images/web/themes')}:/themes`,
      ] : []),
      ports: [
        '2368:2368',
      ],
      environment: {
        // see https://ghost.org/docs/config/#configuration-options
        database__client: 'mysql',
        database__connection__host: 'mysql',
        database__connection__user: 'ghostusr',
        database__connection__password: env.MYSQL_GHOST_USER_PASSWORD,
        database__connection__database: 'ghost',
        url: DEV ? 'http://wwwlocal.presupplied.com' : 'https://presupplied.com',
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
        MYSQL_ROOT_PASSWORD: env.MYSQL_ROOT_PASSWORD,
        MYSQL_DATABASE: 'ghost',
        MYSQL_USER: 'ghostusr',
        MYSQL_PASSWORD: env.MYSQL_GHOST_USER_PASSWORD,
      },
    },
    nginx: {
      build: {
        dockerfile: path.join(__dirname, 'images/nginx/Dockerfile'),
        context: path.join(__dirname, 'images/nginx'),
      },
      restart: 'always',
      ports: [
        '80:80',
        '443:443',
      ],
      volumes: DEV ? [
        `${path.join(__dirname, './images/nginx/nginx.dev.conf')}:/etc/nginx/conf.d/nginx.conf`,
      ] : [
        '/etc/letsencrypt:/etc/letsencrypt:ro',
        '/tmp/letsencrypt/www:/tmp/letsencrypt/www',
      ]
    },
  }
};

console.log(JSON.stringify(config, undefined, 2));
