exports.mainRouter = function (router, common) {
    router.get('/distination',function (req,res,next){
        var data = req.session.destination
        res.render("distination",{data:data})
    });
}
