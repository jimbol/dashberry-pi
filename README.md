# Dashberry Pi
Simple dashboard for Raspberry Pi based on [ozua's raspberry pi dash](http://www.instructables.com/id/Raspberry-Pi-Wall-Mounted-Calender-and-Notificatio/?ALLSTEPS).  The major difference being the Chore widget.

It uses [Vue.js](http://vuejs.org) for the client, [Express.js](http://expressjs.com/) for the server, and [Socket.io](http://socket.io/) for live updates.

There will eventually be a companion iPhone app.

## SAMPLE ACTIONS
Chores
- get chores
  - fields
    - title
    - description
    - users
    - asignee
  - filters
    - user
    - get all
- update chore
- create chore
- delete chore

TODO - Users

## SETUP
Clone and npm install
Install mongod and mongodb
Start `mongod` and `mongodb`
Run `use chores`
