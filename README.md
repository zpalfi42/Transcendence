# my_42_cc06_ft_transcendence

How to use the Docker version of the app.

## 1. Install Docker

If you are in the campus remember you have to change the place where Docker stores many 'shits'.
`Docker > Preferences > Resources > Disk image location`
to `/goinfre/<42user>/DockerDesktop`

## 2. Clone repo

`git clone --branch dockerTranscendence https://github.com/lumaro77/my_42_cc06_ft_transcendence.git `

All the good stuff is inside dockerTranscendence folder. Go inside. 

## 3. Launch the app

Go to the `docker-compose.yml` file and change `/Users/lmartin2/` with your user and home.

`make` :=> this will compile and launch the app

`make re` :=> this will remove intermediate files compile and launch (DELETES database files).

`make stop` :=> will freeze the execution

`make down` :=> will stop the app and remove the containers

`make clean` :=> stops and cleans docker items (no database files).

`make fclean` :=> stops and cleans docker items and database files.

## 4. Install the database-files

Skip this step to make a fresh new install. Do not skip if you want to recover the app with its records.

You need step 3 done to performe the step 4!

`make sql_install`

This will copy in '~/data' some files from a sql file

## 5. Store current database status

You need step 3 done to performe the step 5!

`make sql_backup` :=> will extract database content into a sql file (you can recover db status with a fresh install an `make sql_backup` ).

## 6. Enjoy 

`pong` `pong` `pong` 

# Some aditional infos

Web-Front: https://vuejs.org/guide/typescript/overview.html#note-on-vue-cli-and-ts-loader


# TODO

- [ ] Usar sesion stroage para no pedir login en caso de recarga de pagina.
- [ ] Hacer matchmaker del juego.
- [ ] Conexion de dos usuarios a partir del matchmaker.
- [x] Oline/Offline bien agarrados en el profileModal.
- [x] Abrir pagina login una vez el usuario se ha pasado del tiempo de idle.
- [ ] Al recargar la pagina del juego no crear uno nuevo, mirar si ya existe uno.
- [ ] Agregar el 2FA.
- [ ] Agregar mensajes cuando algo del perfil esta vacio (amigos, achivements, etc...).
- [ ] Guradar estadisticas al acabar una partida.
- [ ] Hacer el modo espectador, que solo escuche.
- [ ] Revisar que todo este en ts.
- [x] Revisar foto en ProfileModal y subifda de fotos en general.
