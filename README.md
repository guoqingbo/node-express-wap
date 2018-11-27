# 一机游安图wap项目

##技术栈
```
express
jade
es6

```

##运行
```
进入项目根目录执行(第一次执行，安装依赖包)
npm install

以测试配置运行项目
    启动
    pm2 start apps.json --env test
    重启
    pm2 restart apps.json --env test
    
以生产配置运行项目
    启动
    pm2 start apps.json 或 pm2 start apps.json --env production
    重启
    pm2 restart apps.json 或 pm2 restart apps.json --env production
    
本地调试运行
    debug 运行 bin/wwww 文件 
    可是设置 NODE_ENV 变量指定不同的配置文件
    
本地简单启动
    npm start
```
