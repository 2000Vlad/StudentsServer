let express = require('express');
let parser = require('body-parser');
let ejs = require('ejs')
let engines = require('consolidate')
let app = express();
let files = require('fs');
let crypto = require('crypto');
let session = require('express-session');
let port = 8080;
let confidential = require('./confidential');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("AcScess-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, access-control-allow-origin")
    next();
});

app.use(session({
    secret: 'Yamaha',//folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
}
));


app.set('view engine', 'ejs');

//app.use(express.static(__dirname));
//app.set('views' , __dirname + '/Views');

app.use(parser.json()); // support json encoded bodies
app.use(parser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static(__dirname + '/Views'))

app.get('/', function (req, res) {

    res.sendFile('login.html', { root: __dirname + '/Views' })
})

app.post('/addstudent', function (req, res) {
    let parsedStudents = JSON.parse(files.readFileSync('Data/students.json'))
    parsedStudents.push({
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Id: req.body.Id
    })
    let newStudents = JSON.stringify(parsedStudents);
    files.writeFileSync('Data/students.json', newStudents)
    res.sendStatus(200);
})

app.get('/courses', function (req, res) {
    let parsedCourses = JSON.parse(files.readFileSync('Data/courses.json'))

    res.render('courses.ejs', { courses: parsedCourses })
})

app.get('/enrollments', function (req, res) {
    let parsedEnrollments = JSON.parse(files.readFileSync('Data/enrollments.json'))
    let studentEnrollments = []
    parsedEnrollments.forEach(function (val, index) {
        if (val.StudentId == req.query.studentId)
            studentEnrollments.push(val)
    })
    res.render('enrollments.ejs', { enrollments: studentEnrollments })
})

app.post('/enroll', function (req, res) {
    let parsedCourses = JSON.parse(files.readFileSync('Data/courses.json'))
    let parsedStudents = JSON.parse(files.readFileSync('Data/students.json'))
    let studentId = req.body.studentId
    let courseId = req.body.courseId
    let firstName = ''
    let lastName = ''
    let courseName = ''
    let profName = ''
    parsedStudents.forEach(function (val, index) {
        if (val.Id == studentId) {
            firstName = val.FirstName
            lastName = val.LastName
        }
    })
    parsedCourses.forEach(function (val, index) {
        if (val.Id == courseId) {
            courseName = val.Name
            profName = val.Professor
        }
    })
    let enrollment = {
        StudentId: studentId,
        CourseId: courseId,
        StudentFirstName: firstName,
        StudentLastName: lastName,
        CourseName: courseName,
        ProfessorName: profName
    }
    let parsedEnrollments = JSON.parse(files.readFileSync('Data/enrollments.json'))
    parsedEnrollments.push(enrollment)
    files.writeFileSync('Data/enrollments.json', JSON.stringify(parsedEnrollments))

    let studentEnrollments = []
    parsedEnrollments.forEach(function (val, index) {
        if(val.StudentId == studentId)
        studentEnrollments.push(val)
    })
    res.render('enrollments.ejs', {enrollments: studentEnrollments})

})

app.post('/signup', function (req, res) {
    let users = JSON.parse(files.readFileSync('Data/users.json'))
    users.push({
        Username: req.body.username,
        Password: req.body.password
    })
    let newUsers = JSON.stringify(users);
    files.writeFileSync('Data/users.json', newUsers)
})

app.post('/login', function (req, res) {
    //let connObj = stringParser(confidential.connString);
    //let pool = new sql.ConnectionPool(connObj);
    //pool.connect()
    //.then(pool => {
    //    pool.query('Insert into users values'+'('+req.username+','+req.password+')')
    //    .then(function ()  {
    //        res.render('home.ejs')
    //    })
    //})
    let users = JSON.parse(files.readFileSync('Data/users.json'))
    var found = false;
    users.forEach(element => {
        if (element.Username == req.body.username && element.Password == req.body.password) {
            let parsedStudents = JSON.parse(files.readFileSync('Data/students.json'))
            res.render('home.ejs', { students: parsedStudents })
            found = true
        }

    });

    if (!found) return "Username or password are incorrect, please retry"

})




app.post('/signin', function (req, res) {
    let username = req.username;
    let password = req.password;

    //if credentials are valid sign in
    let students = [
        { Id: 10, FirstName: 'Vlad', LastName: 'Iancu' },
        { Id: 11, FirstName: 'John', LastName: 'Doe' }
    ];

    res.render('home.ejs', { students: students });
})

app.listen(port, () => {
    console.log(`Express.JS Server is running on http://localhost:${port}`)
});
