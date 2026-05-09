require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const Studdata = require('./src/dataSchema');
const session = require('express-session');
const { exec } = require('child_process');
const { Parser } = require('json2csv');
const multer = require("multer");
const file = require('fs');
const puppeteer = require("puppeteer");


const MongoStore = require("connect-mongo");
console.log("DB URI Check:", process.env.MONGODB_URI); // Should NOT be undefined
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,   // must be set in Render/your env
    ttl: 14 * 24 * 60 * 60               // session lifetime (14 days)
  })
}));

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');  // send back to login
  }
  next();
}
const upload = multer({ dest: "uploads/" });

const publicPath = path.join(__dirname, './public');
const viewsPath = path.join(__dirname, './views');

let email = "";

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(publicPath));
app.set('views', viewsPath)
app.set('view engine', 'ejs');

const dataBase = 'Student';
const collection = 'studs';



app.get('/login',(req,res)=>{
    res.render('login');
})

app.get('/signup',(req,res)=>{
    res.render('signUp');
})
app.get('/image-view',requireLogin, async (req, res) => {
    try {
        const data = await Studdata.findOne({ 'email': email });

        req.session.object = data['data'];
    } catch (e) {
        console.log(e);
    }
    res.render('imageView');
})

app.get("/pdf",requireLogin, async (req, res) => {
    // Example student data
    const data = await Studdata.findOne({ 'email': email });
    
    
    // Build HTML manually
    let html = `
  <!DOCTYPE html>
    <html>

    <head>
    <meta charset="UTF-8">
    <title>Bus Pass</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari&display=swap" rel="stylesheet">
    <link href="/output.css" rel="stylesheet">
    <style>
        *{
            padding: 0;
            margin: 0;
        }
        .main {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
            width: 210mm;
            
            /* full A4 width */
        }

        .box1 {
            border: 2px solid black;
            width: 100mm;
            /* instead of 40vw */
            height: 70mm;
            /* instead of 45vh */
            /* margin: 5mm; */
            /* instead of mx-[5vw] mt-5 */
            /* padding: 5mm; */
        }
        .h1{
            font-size:medium;
            font-weight: bold;
            text-align: center;
            margin-top: 2mm;
            margin-bottom: 2mm;
        }
        .box2 {
            display: flex;
            justify-content: space-between;
            width: 80mm;
            /* instead of 30vw */
        }
        p{
            font-size: small;
            margin:0 2mm 0 2mm;
        }
        .box3 {
            
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 2mm;
        }
        .date{
            margin-right: 15mm;
        }
        img {
            width: 18mm;
            height: 20mm;
        }

        .img {
            border: 2px solid black;
            width: 18mm;
            height: 20mm;
            object-fit: cover;
        }
        .sign{
            margin-top: 4mm;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="main">`;

data['data'].forEach((ele)=>{
    const src = `data:${ele['img']['contentType']};base64,${ele['img']['data']}`
        html += `<div class="box1">
            <p class="h1">${ele['Institute']}</p>
            <div class="box3">
                <div class="box2 ">
                    <div class="img"><img src="${src}" a
                             /></div>
                    <p class="date">दिनांक-</p>
                </div>
            </div>

            <p >प्रमाणित किया जाता है कि <span >${ele['name']}</span>
                पुत्र/पुत्री <span >${ele['parent']}</span> कक्षा- <span
                    >${ele['class']}</span> ने हरियाणा रोड़वेज के
                बस पास के लिए रूपये <span >${ele['fee']}</span>/- जमा
                करवा दिये हैं जो कि <span >${ele['to']}</span> से <span
                    >${ele['from']}</span>
                तक दिनांक <span >${ele['fromDate']}</span> से
                <span >${ele['toDate']}</span> मान्य है।</p>
            <p class="sign" >प्रभारी बस पास</p>
        </div>`
})
html += `</div>
</body>

</html>`;

// Puppeteer
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle0" });
const pdfBuffer = await page.pdf({ format: "A4" });
await browser.close();

res.setHeader("Content-Type", "application/pdf");
res.setHeader("Content-Disposition", "attachment; filename=bus_pass.pdf");
res.send(pdfBuffer);
});


app.get('/tabular',requireLogin, async (req, res) => {

    res.render('tableView');
})
app.get('/table-view',requireLogin, async (req, res) => {
    let data = await Studdata.findOne({ "email": email });
    res.json({ 'data': data['data'] });
})

app.get('/csv',requireLogin, async (req, res) => {
    try {
        let data = await Studdata.find({'email':email}).lean();
        data = await data[0]["data"];
        console.log(data);
        const fields = ["name", "parent", "class", "from", "to", "fee"];
        const parser = new Parser({ fields });
        const csv = parser.parse(data);
        const filePath = 'output.csv';
        file.writeFileSync(filePath, csv);
        res.download('output.csv');
    }
    catch (e) {
        console.log(e);
    }

})

app.get('/',requireLogin, (req, res) => {
    // Studdata.insertMany({"email":email,"password":pass});
    res.render('insertion');
})

app.get('/delete',requireLogin, (req, res) => {
    res.render('deletion');
})
app.get('/session-storage-image',requireLogin, (req, res) => {
    // let ob = {};
    // for(let i in req.session.object){
    //     obj
    // }
    res.json(req.session.object);
})


app.get('/session-storage',requireLogin, (req, res) => {
    res.json({ "par": req.session.object });
})

app.get('/update',requireLogin, (req, res) => {
    res.render('updation');
})
app.get('/default',(req,res)=>{
    res.render('default');
})

app.post('/delete-item',requireLogin, async (req, res) => {
    console.log(req.body);
    for (let i of req.body.array) {
        await Studdata.updateOne(
            { "email": email },
            { $pull: { "data": { "id": parseInt(i) } } }
        )
    }
})
app.post('/update-item',requireLogin, async (req, res) => {

    try {
        console.log(req.body);
        const id = req.body['id'];
        const change = req.body;
        delete req.body['id'];
        for (let i of id) {
            console.log(i);
            await Studdata.updateOne(
                { 'email':email,'data.id': parseInt(i) },
                {
                    $set: Object.fromEntries(
                        Object.entries(change).map(([key, val]) => [`data.$.${key}`, val])
                    )
                }
            )
        }
    } catch (e) {
        console.log(e);
    }
    res.redirect('/update');

})
app.post('/signup', async (req, res) => {
    const data = {
        'email': req.body.email,
        'password': req.body.password,
        'fee': req.body.fee,
        'Institute': req.body.Institute,
        'toDate': req.body.fromDate,
        'fromDate': req.body.toDate,
        'to': req.body.to

    }

    try {
        const checking = await Studdata.findOne({ 'email': req.body.email });
        if (checking) {
            // user exists
            if (checking.password === data.password) {
                return res.send("User already exists");
            } else {
                return res.send("Email already registered with a different password");
            }
        }

        // if no user found, create new one
        await Studdata.insertOne(data);
        return res.status(201).redirect('/login');

    } catch (e) {
        console.log(e);
        return res.send("Check the details");
    }

})

app.post('/login', async (req,res)=>{
    try {

        const data = await Studdata.findOne({ 'email': req.body.email });
        if (data) {
            if (data.password == req.body.password) {
                req.session.user = data.email;
                email = data.email;
                return res.redirect('/');
            } else {
                return res.send("Check the password ");
            }
        }else{
            
            return res.send("wrong email"); 
        }

    } catch (e) {
        console.log(e);
        return res.send("Wrong details"); 
    }
})
app.post('/default',requireLogin,async (req,res)=>{
    
    let obj={};
    for(let i in req.body){
        if(req.body[i]!=''){
            obj[i] = req.body[i]
        }
    }
    await Studdata.updateOne(
        { "email": email },
        {
            $set: obj
        }
    )
    res.redirect('/default');
})
app.post('/update',requireLogin, async (req, res) => {
    req.session.object = {};
    let parameter = "";
    for (let i in req.body) {
        console.log(req.body[i]);
        if (req.body[i] != "") {
            parameter = i;
        }
    }
    let argu = `data.${parameter}`;
    let val = req.body[parameter];

    try {



        if (parameter != "") {
            let data = await Studdata.aggregate([
                { $match: { "email": email } },
                {
                    $project: {
                        "data": {
                            $filter: {
                                input: "$data",
                                as: "d",
                                cond: { $eq: [`$$d.${parameter}`, val] }
                            }
                        }
                    } 
                }

            ]);
            req.session.object = data;
        }else{
            req.session.object = {};
        }
    } catch (e) {
        console.log(e);
    }


    res.redirect('/update');
})


app.post('/delete',requireLogin, async (req, res) => {
    req.session.object = {};
    let parameter = "";
    for (let i in req.body) {

        if (req.body[i] != "") {
            parameter = i;
        }
    }
    let argu = `data.${parameter}`;
    let val = req.body[parameter];
    try {



        if (parameter != "") {
            let data = await Studdata.aggregate([
                { $match: { "email": email } },
                {
                    $project: {
                        "data": {
                            $filter: {
                                input: "$data",
                                as: "d",
                                cond: { $eq: [`$$d.${parameter}`, val] }
                            }
                        }
                    }
                }

            ]);
            req.session.object = data;
        }else{
            req.session.object = {};
        }
    } catch (e) {
        console.log(e);
    }


    res.redirect('/delete');
})

app.post('/insert',requireLogin, upload.single("photo"), async (req, res) => {

    if (!req.file) {
        return res.status(400).send("No file uploaded");
    }
    console.log(req.file.path); // safe now

    const result = await Studdata.findOne({ "email": email });
    const to = result["to"];
    const fee = result["fee"];
    const fromDate = result["fromDate"];
    const toDate = result["toDate"];
    const Institute = result['Institute'];
    const size = result.data.length;
    let id1;
    try {
        const lastRecord = result.data[size - 1];
        if (lastRecord && lastRecord.id !== undefined) {
            id1 = lastRecord.id + 1;
        } else {
            id1 = 0;
        }
    } catch {
        id1 = 0;
    }
    const buffer = file.readFileSync(req.file.path); // returns Buffer
    const base64 = buffer.toString("base64");        // convert Buffer → Base64

    const dataInsert = {
        "id": id1,
        "name": req.body.name,
        "parent": req.body.parent,
        "class": req.body.class,
        "from": req.body.from,
        "img": {
            data: base64,
            contentType: req.file.mimetype
        },
        "to": to,
        "fee" : fee,
        "fromDate" : fromDate,
        "toDate" : toDate,
        "Institute" : Institute
    }
    await Studdata.updateOne(
        { "email": email },
        {
            $push: {
                "data": dataInsert
            }
        }
    )
    file.unlinkSync(req.file.path);
    res.redirect('/');
})
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});
// Remove app.listen and add this:
module.exports = app;