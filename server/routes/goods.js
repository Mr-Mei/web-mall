var express = require('express')
var router = express.Router();
var mongoose = require('mongoose')  // 要加载mongodb数据库，必须要获取mongoose
var Goods = require('../models/goods')

// 链接数据库,默认地址：'mongodb://127.0.0.1:27017 数据库名：GoodsData

mongoose.connect('mongodb://127.0.0.1:27017/GoodsData')

// 监听MongoDB数据库是否链接成功
mongoose.connection.on("connected",function(){
  console.log("MongoDB connected success!")
});

// 监听链接失败信息
mongoose.connection.on("error",function(){
  console.log("MongoDB connected fail!")
})

// 监听链接断开信息
mongoose.connection.on("disconnected",function(){
  console.log("MongoDB connected disconnected!")
})

// 查询商品列表数据
router.get("/list",function(req,res,next){
  // res.send('hello goods list')
  let page = parseInt(req.param("page"))     // 获取当前页面的页数，以便分页
  let pageSize = parseInt(req.param("pageSize"))   // 获取当前一页多少条数据
  let priceLevel = req.param("priceLevel")
  var priceGt = '',priceLte = '';
  let sort = req.param("sort");   // 获取前端传过来的参数
  let skip = (page-1)*pageSize;
  let params = {};
  if (priceLevel!=='all') {
    switch (priceLevel) {
      case '0':priceGt=0;priceLte=100; break;
      case '1':priceGt=100;priceLte=500; break;
      case '2':priceGt=500;priceLte=1000; break;
      case '3':priceGt=1000;priceLte=5000; break;
    }
    params = {
      salePrice:{
        $gt:priceGt,
        $lte:priceLte              // mongodb中$gt：大于，$lt：小于，$gte：大于等于，$lte：小于等于
      }
    }
  }
  // find()查找所有数据，skip(skip)默认跳过skip条数据,limit(pageSize)指的是一页多少条数据
  let goodsModel = Goods.find(params).skip(skip).limit(pageSize);  // find()可以返回一个模型
  // sort起到排序作用（mongoose提供的api）
  goodsModel.sort({'salePrice':sort})  // 注意mongodb数据都以object对象字段存在

  goodsModel.exec(function(err,doc){  // 普通查询用find()，经过系列条件查询用exec()
    if(err){
      res.json({
        status:'1',
        msg:err.message
      })
    }else{
      res.json({
        status:'0',
        msg:'',
        result:{
          count:doc.length,
          list:doc
        }
      })
    }
  })
})

//加入到购物车，（向服务器提交数据，一般用post较好）
router.post("/addCart",function (req,res,next) {
  var userId = '100000077',productId = req.body.productId   // 获取用户Id,商品Id
  var User = require('../models/user');  //  引入user模型


  // findOne()获取当前第一个用户,第一个参数是查询条件，第二个是回调函数，用find()方法可获取所有用户
  User.findOne({userId:userId},function (err,userDoc) {   // userDoc 获取到的用户信息文档
    if (err){
      res.json({
        status:"1",
        msg:err.message
      })
    }else {
      console.log("userDoc:"+userDoc);    // 打印用户信息，测试是否拿到数据
      if (userDoc){
        let goodsItem = '';
        // 遍历查看购物车列表中是否已经存在同一商品信息
        userDoc.cartList.forEach(function (item) {              // item是一个索引，可省略
          if (item.productId == productId){          // 判断如果已经存在同名商品
            goodsItem = item;    // 把商品信息保存起来
            item.productNum ++;     // 让商品数量累加
          }
        });
        if(goodsItem){
          // 判断商品已经存在，直接重新保存userDoc信息到数据库即可
          userDoc.save(function (err2,doc2) {
            if (err2){
              res.json({
                status:"1",
                msg:err2.message
              })
            }else {
              res.json({
                status:"0",
                msg:"",
                result:"suc"
              })
            }
          })
        }else {
          // 查询其中一件商品的productId,商品信息不存在，直接添加进去
          Goods.findOne({productId:productId},function (err1,doc) {
            if (err1){
              res.json({
                status:"1",
                msg:err1.message
              })
            }else {
              if (doc){
                doc.productNum = 1;      // 商品数量增加1
                doc.checked = 1;            // 为选中状态
                // 把商品更新信息加到用户名下，即把更新的文档添加到购物车中，形成完整的数据文档
                userDoc.cartList.push(doc);
                // 把商品信息添加(保存)到数据库中
                userDoc.save(function (err2,doc2) {
                  if (err2){
                    res.json({
                      status:"1",
                      msg:err2.message
                    })
                  }else {
                    res.json({
                      status:"0",
                      msg:"",
                      result:"suc"
                    })
                  }
                })
              }
            }
          })
        }

      }
    }
  })
})

module.exports = router;
