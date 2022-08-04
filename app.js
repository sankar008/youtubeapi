const express = require('express');
const app = express();
const server = require('http').createServer(app);
const multer = require('multer');
const mongodb = require('./db');
const userRouter = require('./v1/users/user.router');
const youtubeRouter = require('./v1/youtube/youtube.router');

const cors = require('cors')
const https = require('https');
const fs = require('fs');

// const httpsServer = https.createServer({
// 	key: fs.readFileSync('/etc/letsencrypt/live/pdf.webdevelopments.in/privkey.pem'),
// 	cert: fs.readFileSync('/etc/letsencrypt/live/pdf.webdevelopments.in/fullchain.pem'),
//   }, app);

const upload = multer();
app.use(upload.none());
app.use(cors());

const bodyParser = require('body-parser')
app.use(bodyParser.json({ limit: '50000mb' }));
app.use(bodyParser.urlencoded({ limit: '50000mb', extended: true }));

app.use('/v1/user', userRouter);
app.use('/v1/url', youtubeRouter);

server.listen(3001, '192.168.1.182', () => {
	console.log("Server is running:", 3001);
})
