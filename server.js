/********************************************************************************* 
* WEB700 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
* of this assignment has been copied manually or electronically from any other source 
* (including 3rd party web sites) or distributed to other students. 
* 
* Name: Dhanenjeyan Rajadurai Varatharajan Student ID: 112847223 Date: 09-08-2023
*
* Online render link: https://fancy-blue-tam.cyclic.app/
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
  collegeData
    .getAllStudents()
    .then((students) => {
      if (req.query.course) {
        collegeData
          .getStudentsByCourse(parseInt(req.query.course))
          .then((filteredStudents) => {
            if (filteredStudents.length > 0) {
              res.render("students", { students: filteredStudents });
            } else {
              res.render("students", { message: "No results" });
            }
          })
          .catch(() => {
            res.render("students", { message: "No results" });
          });
      } else {
        if (students.length > 0) {
          res.render("students", { students });
        } else {
          res.render("students", { message: "No results" });
        }
      }
    })
    .catch(() => {
      res.render("students", { message: "No results" });
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

app.get("/courses", function (req, res) {
  collegeData.getCourses()
    .then((data) => {
      if (data.length > 0) {
        res.render("courses", { courses: data });
      } else {
        res.render("courses", { message: "no results" });
      }
    })
    .catch((error) => {
      res.render("courses", { message: error.message });
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
  let viewData = {}; // initialize an empty object to store the values

  collegeData.getStudentByNum(req.params.studentNum)
    .then((studentData) => {
      if (studentData) {
        viewData.student = studentData; // store student data in the "viewData" object as "student"
      } else {
        viewData.student = null; // set student to null if none were returned
      }
    })
    .catch(() => {
      viewData.student = null; // set student to null if there was an error
    })
    .then(collegeData.getCourses)
    .then((courseData) => {
      viewData.courses = courseData; // store course data in the "viewData" object as "courses"
      
      // loop through viewData.courses and add a "selected" property to the matching course
      viewData.courses.forEach((course) => {
        if (course.courseId == viewData.student.course) {
          course.selected = true;
        }
      });
    })
    .catch(() => {
      viewData.courses = []; // set courses to empty if there was an error
    })
    .then(() => {
      if (!viewData.student) {
        res.status(404).send("Student Not Found"); // if no student, return an error
      } else {
        res.render("student", { viewData: viewData }); // render the "student" view
      }
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




app.get('/students/add', function(req, res) {
  collegeData.getCourses().then((courses) => {
    res.render('addStudent', { courses: courses });
  }).catch(() => {
    res.render('addStudent', { courses: [] });
  });
});


app.post("/students/add", (req, res) => {
  collegeData.addStudent(req.body).then(() => {
    res.redirect('/students');
  }).catch(err => {
    res.status(500).send({ message: "no results" });
  });
});

app.get("/student/delete/:studentNum", (req, res) => {
  collegeData.deleteStudentByNum(req.params.studentNum)
    .then(() => {
      res.redirect("/students");
    })
    .catch(() => {
      res.status(500).send("Unable to Remove Student / Student not found");
    });
});


// Route to render the "Add Course" form
app.get('/courses/add', function (req, res) {
  res.render('addCourse', { title: 'Add Course' });
});

// Route to handle the submission of the "Add Course" form
app.post('/courses/add', function (req, res) {
  const courseData = {
    courseCode: req.body.courseCode,
    courseDescription: req.body.courseDescription
   
  };

  collegeData.addCourse(courseData)
    .then(() => res.redirect('/courses'))
    .catch(error => res.status(500).send("Unable to Add Course"));
});

// Route to handle the submission of the "Update Course" form
app.post('/course/update', function (req, res) {
  const courseData = {
    courseId: req.body.courseId,
    courseCode: req.body.courseCode,
    courseDescription: req.body.courseDescription
    
  };

  collegeData.updateCourse(courseData)
    .then(() => res.redirect('/courses'))
    .catch(error => res.status(500).send("Unable to Update Course"));
});

// Route to render the "Edit Course" form for a specific course
app.get('/course/:id', function (req, res) {
  const courseId = req.params.id;

  collegeData.getCourseById(courseId)
    .then(course => {
      if (!course) {
        res.status(404).send("Course Not Found");
      } else {
        res.render('course', { course: course });
      }
    })
    .catch(error => res.status(500).send("Error fetching course details"));
});

// Route to handle the deletion of a course
app.get('/course/delete/:id', function (req, res) {
  const courseId = req.params.id;

  collegeData.deleteCourseById(courseId)
    .then(() => res.redirect('/courses'))
    .catch(error => res.status(500).send("Unable to Remove Course / Course not found"));
});


app.use((req, res, next) => {
  const filePath = path.join(__dirname, 'views', '404.html');
  res.status(404).sendFile(filePath);
});
