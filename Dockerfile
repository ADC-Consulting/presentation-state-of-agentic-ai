FROM nginx:1.27-alpine

# Static presentation assets
COPY index.html /usr/share/nginx/html/
COPY *.css /usr/share/nginx/html/
COPY *.js /usr/share/nginx/html/
COPY logo.png edward.jpg /usr/share/nginx/html/
COPY RegBot.mov /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
