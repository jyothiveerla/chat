const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();

const dbPath = path.join(__dirname, "dbfile");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.post("/register/", async (request, response) => {
  const {
    userId,
    deviceId,
    name,
    phone,
    availCoins,
    roomId,
    password,
  } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const selectUserQuery = `SELECT * FROM chatroom WHERE userId = '${userId}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
        INSERT INTO
            chatroom (userId,deviceId,name,phone,availCoins,roomId,password)
        VALUES
            (
                '${userId}',
                '${deviceId}',
                '${name}',
                '${phone}',
                '${availCoins}',
                '${roomId}',
                '${hashedPassword}'
            )`;
    const dbResponse = await db.run(createUserQuery);
    response.send(`Created new user`);
  } else {
    response.status = 400;
    response.send("user already exists.");
  }
});

app.post("POST/api/chatrooms", async (request, response) => {
  const { roomId, password } = request.body;
  const selectUserQuery = `SELECT * FROM chatroom WHERE roomId= '${roomId}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      const payload = {
        roomId: roomId,
      };
      const jwtToken = jwt.sign(payloa, "MY_SECRET_TOKEN");
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
});
