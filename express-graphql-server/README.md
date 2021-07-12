# Express GraphQL Server

## Set up the database

This demo project uses MongoDB as the backend database. So you need to change some database variables before running the server.

Under server folder, open `nodemon.json` file, and update the following variables for your own database.

```
"MONGO_USER": "user",
"MONGO_PASSWORD": "password",
"MONGO_DB": "database",
```

## Run the server

Under server folder, you can run:

```
yarn && yarn start
```

Runs the app in the development mode.

Open [http://localhost:8000/playground](http://localhost:8000/playground) to view the GraphQL playground.
