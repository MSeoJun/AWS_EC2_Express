const { default: Axios } = require('axios');
var express = require('express');
var router = express.Router();

require('date-utils');
var newDate = new Date();
var time = newDate.toFormat('YYYYMMDD');

/* GET home page. */
router.get('/', function(req, res, next) {
  let a = [];
  Axios.get(`https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=e01aaa6932e5403ea3645b35e1c0a12d&Type=json&ATPT_OFCDC_SC_CODE=J10&SD_SCHUL_CODE=7530336&MLSV_YMD=${time}`)
  .then(res => {
    const test = res.data.mealServiceDietInfo[1].row[0].DDISH_NM;
    for(let i=0; i<test.split("<br/>").length; i++) {
      a[i] = test.split("<br/>")[i].match(/[^(삼일)]/g).join('').match(/[가-힣]/g).join("");
      console.log(a[i]);
    }
  })
  .then(() => {
    res.render('index', { title: 'Express' ,  data:a });
  })
});

module.exports = router;
