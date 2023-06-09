const authentication =async(req,res,next)=>{
    try{
        if(req.session.user){
            next()
        } else {
              
            res.status(200).redirect('/')
        }
    }
    catch{
        res.status(500).send({message: "Inernal error occured"})
    }
}

const  userauthentication=async(req,res,next)=>{
    try{
        console.log("a");
        if(req.session.user){
            console.log("ab");
            res.status(200).redirect('/home')
        } else {
            next()
            
        }
    }
    catch{
        res.status(500).send({message: "Inernal error occured"})
    }
}
const adminauthentication =async(req,res,next)=>{
    try{
        console.log(req.session.admin);
        console.log("sss");
        if(req.session.admin){
            console.log("aa");
            res.status(200).redirect('/admin/adminpanel')
            // res.render('admin/adminpanal')
            
        } else {
            next()
        }
    }
    catch{
        res.status(500).send({message: "Inernal error occured"})
    }
}

const admincheck =async(req,res,next)=>{
    try{
        console.log(req.session.admin);
        console.log("sss");
        if(req.session.admin){
            next()
            
        } else {
             res.status(200).redirect('/admin')
        }
    }
    catch{
        res.status(500).send({message: "Inernal error occured"})
    }
}

module.exports = {
    userauthentication,
    authentication,
    adminauthentication,
    admincheck

}