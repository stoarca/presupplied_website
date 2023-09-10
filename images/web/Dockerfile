FROM ghost:latest

USER root
RUN apt-get update && apt-get install -yq supervisor moreutils
USER node

COPY ./themes /var/lib/ghost/content/themes
COPY ./supervisord.conf /etc/supervisor/supervisord.conf

CMD ["/usr/bin/supervisord"]
