var _, fs, mechantAlipayRequest, querystring, request, signUtil, otherUtil;

_ = require('lodash');

request = require('request');

signUtil = require('../lib/sign.server.utils');

querystring = require('querystring');

fs = require('fs');

otherUtil = require('../lib/tool.server.utils')

mechantAlipayRequest = function(config) {
  var self;
  self = this;
  self.mechant_api_url = 'https://mapi.alipay.com/gateway.do';
  self.alipay_config = {
    app_id: '*',
    partner: '*',
    seller_id: '*',
    seller_email: '*',
    format: 'JSON',
    sign_type: 'RSA',
    version: '1.0',
    charset: 'utf-8',
    _input_charset: 'utf-8',
    direct_notify_url: '****',
    direct_return_url: '***',
    show_url: '***',
    rsa_private_key: '****',
    ali_public_key: '****',
    text_file_path: '***'
  };
  self.alipay_config = _.extend(self.alipay_config, config);
  self.request = function(data, callback) {
    var options, sign;
    sign = void 0;
    data = signUtil.sortObject(data);
    data = signUtil.objectFilter(data);
    sign = signUtil.stringify(data);
    sign = signUtil.sign(sign, self.alipay_config.rsa_private_key);
    data.sign = sign;
    if (data.biz_content) {
      data.biz_content = JSON.stringify(data.biz_content);
    }
    data.sign_type = self.alipay_config.sign_type;
    options = {
      method: 'POST',
      url: self.mechant_api_url,
      form: data
    };
    return request(options, callback);
  };
  self.verify = function(data, sign) {
    var prestr;
    prestr = void 0;
    data = signUtil.sortObject(data);
    delete data.sign_type;
    delete data.sign;
    data = signUtil.objectFilter(data);
    prestr = signUtil.stringify(data);
    return signUtil.verify(prestr, sign, self.alipay_config.ali_public_key);
  };
  self.alipay_wap_direct_pay_by_user = function(param, callback) {
    param = {
      'app_id': '*',
      'format': 'JSON',
      'charset': self.alipay_config.charset,
      'sign_type': self.alipay_config.sign_type,
      'version': '1.0',
      "service": 'alipay.wap.create.direct.pay.by.user',
      "partner": '*',
      "seller_id": '*',
      "payment_type": '1',
      "notify_url": '***',
      "return_url": '****',
      "_input_charset": self.alipay_config._input_charset,
      "out_trade_no": new Date().getTime(),
      "subject": 'test',
      "total_fee": 0.01,
      "show_url": '****'
    };
    return self.request(param, callback);
  };
  self.create_direct_pay_by_user = function(data, callback) {
    data = {
      _input_charset: self.alipay_config._input_charset,
      charset: self.alipay_config._input_charset,
      body: '***',
      notify_url: self.alipay_config.direct_notify_url,
      partner: self.alipay_config.partner,
      payment_type: '1',
      return_url: self.alipay_config.direct_return_url,
      seller_id: self.alipay_config.seller_id,
      service: 'create_direct_pay_by_user',
      subject: data.subject,
      total_fee: data.total_fee,
      out_trade_no: new Date().getTime(),
      extra_common_param: data.extra_common_param,
      goods_type: '0'
    };
    return self.request(data, callback);
  };

  self.get_direct_pay_url = function(data, callback){
    self.create_direct_pay_by_user(data, function(error, result) {
      if (result.statusCode === 200 || result.statusCode === 302) {
        if (result.body && otherUtil.isRunError(result.body)) {
          console.log('支付宝接口调用失败(权限不足或者参数有误)');
          if(callback){
            callback({error: '支付宝接口调用失败(权限不足或者参数有误)'});
          }
        } else {
          if(callback){
            callback(null, {url: "https://" + result.request.host + result.request.path + "?" + result.request.body});
          }
        }
      } else {
        console.log('支付宝接口出错');
        if(callback){
          callback({error: '支付宝接口出错'});
        }
      }
    })
  }
  return self;
};

module.exports = mechantAlipayRequest;

