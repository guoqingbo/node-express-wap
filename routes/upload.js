var multer = require('multer');
var fs = require('fs');
var path = require('path');
var configEnv = require('config-lite')({filename: process.env.NODE_ENV,config_basedir: __dirname,config_dir: 'config'});
//存储在public下的uploads目录
var uploadDir = configEnv.uploadDir;
//磁盘存储引擎（说白了就是指定上传的文件存储到哪，当然你也可以对文件重命名等等）
var storage=multer.diskStorage({
    destination: function (req, file, cb) {
        //我这里是存储在public下的uploads目录
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now()+"_" + file.originalname)
    }
});

var upload = multer({ storage: storage });
// 递归创建目录 同步方法
function mkdirsSync(uploadDir) {
    if (fs.existsSync(uploadDir)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(uploadDir))) {
            fs.mkdirSync(uploadDir);
            return true;
        }
    }
}
mkdirsSync(uploadDir)
exports.mainRouter = function(router,common){
    //如果图片上传成功会返回图片的存储路径
    router.post('/upload/file', upload.single('files'), function(req, res) {
        if (!req.file) {
            return res.send({
                status: 0,
                filePath:''
            });
        } else {
            res.send({
                status:1,
                filePath: uploadDir+ req.file.filename
            });
        }
    });
    // 如果图片上传成功会返回图片的存储路径（数组）
    router.post('/upload/filesList', upload.array('files',9), function(req, res) {
        if (req.files==undefined) {
            return res.send({
                status: 0,
                filePath:''
            });
        } else {
            var filesPathArr=[];
            for(var i=0;i<req.files.length;i++){
                filesPathArr.push(uploadDir + req.files[i].filename);
            }
            res.send({
                status:1,
                filesPath: filesPathArr
            });
        }
    });
    //删除文件
    router.post('/upload/delete',function (req,res) {
        var fileNeame = uploadDir+req.body.fileName;

        fs.unlink(fileNeame, function (err) {
            if (err) return console.log(err);
                 console.log('文件删除成功');
            })
        })
}

