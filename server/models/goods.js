var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var produtSchema = new Schema({
  "productId":String,
  "productName":String,
  "salePrice":Number,
  "productImage":String,
  "productUrl":String,
  // 在列表页点击“加入购物车时”，会获取对应goods商品数据，然后给该商品添加checked和productNum属性，再将该商品添加到购物车列表中，Schema中不定义属性的话是添加不了的。
  "checked":String,
  "productNum":Number
})

module.exports = mongoose.model('Good',produtSchema)
/**
 * 注意数据库名加个s，但是定义model模型不要加s，因为链接时会默认加个s，
 * 再去链接查找数据库
 */
