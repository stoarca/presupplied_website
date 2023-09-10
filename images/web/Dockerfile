FROM ghost:latest

USER root
RUN apt-get update && apt-get install -yq supervisor moreutils
USER node

COPY ./presupplied_theme /var/lib/ghost/content/themes/presupplied_theme
COPY ./supervisord.conf /etc/supervisor/supervisord.conf

CMD ["/usr/bin/supervisord"]
