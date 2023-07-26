/********************************************************************************* 
* WEB700 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
* of this assignment has been copied manually or electronically from any other source 
* (including 3rd party web sites) or distributed to other students. 
* 
* Name: Dhanenjeyan Rajadurai Varatharajan Student ID: 112847223 Date: 06-07-2023
*
* Online (cylic) link: https://fancy-blue-tam.cyclic.app
********************************************************************************/

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const collegeData = require("./modules/collegeData");

const app = express();
const HTTP_PORT = 8080;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

collegeData.initialize().then(() => {
  app.listen(HTTP_PORT, () => {
    console.log("Server listening on port: " + HTTP_PORT);
  });
}).catch(err => {
  console.error(err);
});

const handlebarsHelpers = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {
    activateNavLink: function(url, options) {
      const isActive = (url === app.locals.activeRoute) ? ' active' : '';
      return `<li class="nav-item${isActive}"><a class="nav-link" href="${url}">${options.fn(this)}</a></li>`;
    },
    ifEqual: function (arg1, arg2, options) {
      return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    }
  }
});


app.engine('.hbs', handlebarsHelpers.engine);
app.set('view engine', '.hbs');

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  next();
});

app.get("/students", (req, res) => {
  const { course } = req.query;
  collegeData.getAllStudents().then(students => {
    if (course) {
      let filStudents = students.filter(val => val.course === Number(course));
      if (filStudents.length > 0) {
        res.render("students", { students: filStudents });
      } else {
        res.render("students", { message: "no results" });
      }
    } else {
      if (students.length > 0) {
        res.render("students", { students: students });
      } else {
        res.render("students", { message: "no results" });
      }
    }
  }).catch(err => {
    res.status(500).render("students", { message: "no results" });
  });
});

app.get("/tas", (req, res) => {
  collegeData.getTAs().then(tas => {
    res.status(200).json(tas);
  }).catch(err => {
    res.status(500).send({ message: "no results" });
  });
});

app.get("/", (req, res) => {
  res.render('home');
});

app.get("/about", (req, res) => {
  res.render('about');
});

app.get("/htmlDemo", (req, res) => {
  res.render('htmlDemo');
});

app.get("/courses", (req, res) => {
  collegeData.getCourses()
    .then(courses => {
      if (courses.length > 0) {
        res.render("courses", { courses });
      } else {
        res.render("courses", { message: "no results" });
      }
    })
    .catch(err => {
      res.render("courses", { message: "no results" });
    });
});

app.get("/course/:id", (req, res) => {
  const courseId = parseInt(req.params.id);
  collegeData
    .getCourseById(courseId)
    .then((data) => {
      res.render("course", { course: data });
    })
    .catch((err) => {
      res.status(404).send({ message: "Course not found" });
    });
});

app.get("/student/:studentNum", (req, res) => {
  const studentNum = parseInt(req.params.studentNum);
  collegeData
    .getStudentByNum(studentNum)
    .then((student) => {
      res.render("student", { student: student });
    })
    .catch((err) => {
      res.status(404).send({ message: "Student not found" });
    });
});


app.post("/student/update", (req, res) => {
  const studentData = req.body; // Make sure you have the correct data from the form
  collegeData.updateStudent(studentData)
    .then(() => {
      res.redirect("/students");
    })
    .catch((error) => {
      console.error(error);
      res.redirect("/error"); // Handle errors appropriately
    });
});




app.get("/students/add", (req, res) => {
  res.render('addStudent');
});

app.post("/students/add", (req, res) => {
  collegeData.addStudent(req.body).then(() => {
    res.redirect('/students');
  }).catch(err => {
    res.status(500).send({ message: "no results" });
  });
});

app.use((req, res, next) => {
  const filePath = path.join(__dirname, 'views', '404.html');
  res.status(404).sendFile(filePath);
});
