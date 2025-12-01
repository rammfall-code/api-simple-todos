# template-simple-fastify-node-ts

## Access to mongo db

1. Should have installed [docker desktop](https://www.docker.com/products/docker-desktop/)
2. Need to check in terminal the next command(If you try after install, relaunch terminal)
```bash
docker-compose
```
or
```bash
docker compose
```
3. If command works, run ```docker-compose up``` or ```docker compose up```
4. After that you can use mongo db with next credentials

Host - localhost

Port - 27019

Username - root

Password - example

Or just use this connection string
```mongodb://root:example@localhost:27019/```

For stopping container with mongo you can use ```CTRL + C``` in an active terminal window where you run command above

Or just click on the stop button in the GUI interface of docker desktop
