FROM owasp/modsecurity-crs:4-nginx-202502051002

USER root

WORKDIR /etc/nginx/

RUN apt-get update && apt-get upgrade -y

RUN apt-get install -y openssl nano

#RUN mkdir -p /etc/nginx/ssl

#RUN openssl req -x509 -nodes -out /etc/nginx/ssl/transcendence.crt -keyout /etc/nginx/ssl/transcendence.key -subj "/CN=localhost"
#RUN chmod 777 /etc/nginx/ssl/transcendence.crt /etc/nginx/ssl/transcendence.key 
COPY default.conf /etc/nginx/templates/conf.d/default.conf.template
COPY modsecurity.conf /etc/nginx/templates/conf.d/modsecurity.conf

USER nginx

CMD ["nginx", "-g", "daemon off;"]