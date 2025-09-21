FROM denoland/deno:alpine


RUN apk add --no-cache git


WORKDIR /app


COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh


EXPOSE 3742


ENTRYPOINT ["/entrypoint.sh"]
