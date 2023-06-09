// const multer = require('multer');

// console.log("hai");
// const productStorage=multer.diskStorage({
//     destination:(req,file,cb)=>{
//         cb(null,'uploads');
//     },

//     filename:(req,file,cb)=>{
//         cb(null,Date.now()+"-"+file.originalname);
//     }
    
// });


// const productupload=multer({
//     storage:productStorage
// }).single("img")

// console.log("hello");
// module.exports={
//     productupload
// }