FROM ghost:latest

RUN apt-get update && apt-get install -yq supervisor moreutils

COPY ./themes /themes
RUN ln -s /themes/presupplied_theme /var/lib/ghost/content.orig/themes/presupplied_theme
COPY ./supervisord.conf /etc/supervisor/supervisord.conf

CMD ["/usr/bin/supervisord"]
