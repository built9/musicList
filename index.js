#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const util = require('util')
const readPromise = util.promisify(fs.readFile)
// 判断目标路径的文件存在与否
const exists = filePath => fs.existsSync(filePath)
const jsonPath = process.argv[2]
const DB = require('./db/db.js');

const load = require('audio-loader')

if (!jsonPath) {
	console.log('没有传目录参数哦！')
	process.exit(1)
}

const rootPath = path.join(process.cwd(), jsonPath)
let num = 0
const walk =async (rootPath) => {
	var myData = fs.readdirSync(rootPath)
  
  //测试异步流程控制
    // let myData = ['a','b','c','d','e'];
    //异步处理方法，返回Promise对象
    let f1 = function(i){
      return new Promise(async function (resolve, reject) {
        let dir = path.join(rootPath, myData[i])
        let duration = await getDuration(dir)
        let obj = {
          id: i + 1,
          name: path.basename(dir, '.mp3'),
          url: 'https://i.2fei2.com/' + encodeURIComponent(myData[i]),
          intro: '',
          duration: formatGetMinute(duration)
        }
        try{
          let data = await DB.insert("music", obj)
          num++
          console.log(num, obj)
          resolve();
        }catch{
          console.log('err',i + 1)
          resolve();
        }
      });
    };
    let loopNum = 0;//循环标识
    //定义流程控制函数，递归实现依次调用f1
    let asyncControl = function(){
      if (loopNum < myData.length){//
        f1(loopNum).then(function () {
          loopNum++;
          asyncControl();
        });
      }else{
        console.log('数据全部处理完了');
      }
    }
    //执行流程控制函数
    asyncControl()
}

function formatGetMinute(time) {
	let minute = parseInt(time / 60)
	let second = Math.ceil(time - minute * 60)
	return [minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
	n = n.toString()
	return n[1] ? n : '0' + n
}

function getDuration(value) {
	return new Promise((resolve, reject) => {
		load(value).then(function(res) {
			//获取音频时长
			var duration = res.duration
			resolve(res.duration)
		});
	})
}

// 合并文件内容
const mergeFileData = async () => {
	const files = walk(rootPath)
	return
}

mergeFileData()
