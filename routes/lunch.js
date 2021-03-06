const { default: Axios } = require('axios');
var express = require('express');
var router = express.Router();
var {Expo} = require("expo-server-sdk")
const expo = new Expo();

const Redis = require('ioredis');
const redis = new Redis({
  host: 'redis-18251.c98.us-east-1-4.ec2.cloud.redislabs.com',
  port: '18251',
  password: 'UMdzCnl5zpdzbA9LB6JtiIFaPegrAcYc',
  db: 0
});

const savedPushTokens = [];

const saveToken = async(token) => {
  if (savedPushTokens.indexOf(token === -1)) {
    savedPushTokens.push(token);
  } 
  await redis.set('savedPushTokens', JSON.stringify(savedPushTokens));
};

const handlePushTokens = async(message) => {
  let notification = [];
  let mytokens = JSON.parse(await redis.get('savedPushTokens'))
  for (let pushToken of mytokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.log("ERROR");
      continue;
    }

    notification.push({
      to: pushToken,
      sound: "default",
      title: "오늘의 급식~",
      body: message,
      data: { message },
    });
  }
  let chunks = expo.chunkPushNotifications(notification);
  (async () => {
    for (let chunk of chunks) {
      try {
        let receipts = await expo.sendPushNotificationsAsync(chunk);
        console.log(receipts);
      } catch (error) {
        console.error(error);
      }
    }
  })();
};

router.post("/token", (req, res) => {
  saveToken(req.body.token.value);
  console.log(`토큰 저장함 ${req.body.token.value}`);
  console.log(`토큰이 저장되었습니다. ${req.body.token.value}`);
});

router.post("/message", (req, res) => {
  console.log(req.body.message);
  handlePushTokens(req.body.message);
  console.log("메세지 전송");
  res.send(`메세지를 전송합니다. ${req.body.message}`);
});

require('date-utils');
var newDate = new Date();
var time = newDate.toFormat('YYYYMMDD');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(time);
  let a = [];
  Axios.get(`https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=e01aaa6932e5403ea3645b35e1c0a12d&Type=json&ATPT_OFCDC_SC_CODE=J10&SD_SCHUL_CODE=7530336&MLSV_YMD=${time}`)
  .then(res => {
    const test = res.data.mealServiceDietInfo[1].row[0].DDISH_NM;
    for(let i=0; i<test.split("<br/>").length; i++) {
      a[i] = test.split("<br/>")[i].match(/[^(삼일)]/g).join('').match(/[가-힣]/g).join("");
    }
  })
  .then(() => {
    res.render('index', { title: 'Express' ,  data:a });
  })
});

module.exports = router;
