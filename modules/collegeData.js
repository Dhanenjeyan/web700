const Sequelize = require('sequelize');
const sequelize = new Sequelize('mxvanmvc', 'mxvanmvc', 'KKch8n2qSV87mWPa6hOiinx5BH1VSBCY', {
  host: 'batyr.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

const Student = sequelize.define('student', {
  studentNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressProvince: Sequelize.STRING,
  TA: Sequelize.BOOLEAN,
  status: Sequelize.STRING
});

const Course = sequelize.define('course', {
  courseId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courseCode: Sequelize.STRING,
  courseDescription: Sequelize.STRING
});

Course.hasMany(Student, { foreignKey: 'course' });
class Data {
  constructor(students, courses) {
    this.students = students;
    this.courses = courses;
  }
}

module.exports.addStudent = function (studentData) {
  studentData.TA = studentData.TA ? true : false;
  for (const prop in studentData) {
    if (studentData[prop] === '') {
      studentData[prop] = null;
    }
  }
  return Student.create(studentData)
    .then(() => {
      // Student created successfully
    })
    .catch(() => {
      throw new Error('Unable to create student');
    });
};

module.exports.initialize = function () {
  return sequelize.sync()
    .then(() => {
      console.log('Database synchronized');
    })
    .catch(error => {
      throw new Error('Unable to sync the database');
    });
};

module.exports.getAllStudents = function () {
  return Student.findAll()
    .then(students => students)
    .catch(() => {
      throw new Error('No results returned');
    });
};

module.exports.getTAs = function () {
  return Student.findAll({ where: { TA: true } })
    .then(tas => tas)
    .catch(() => {
      throw new Error('No TAs found');
    });
};

module.exports.getCourses = function () {
  return Course.findAll()
    .then(courses => courses)
    .catch(() => {
      throw new Error('No courses found');
    });
};

module.exports.getStudentByNum = function (studentNum) {
  return Student.findOne({ where: { studentNum: studentNum } })
    .then(student => student)
    .catch(() => {
      throw new Error('No results returned');
    });
};

module.exports.updateStudent = function (studentData) {
  studentData.TA = studentData.TA ? true : false;
  for (const prop in studentData) {
    if (studentData[prop] === '') {
      studentData[prop] = null;
    }
  }
  return Student.update(studentData, { where: { studentNum: studentData.studentNum } })
    .then(() => {
      // Student updated successfully
    })
    .catch(() => {
      throw new Error('Unable to update student');
    });
};

module.exports.getCourseById = function (id) {
  return Course.findOne({ where: { courseId: id } })
    .then(course => course)
    .catch(() => {
      throw new Error('No results returned');
    });
};

module.exports.addCourse = function (courseData) {
  return new Promise(function (resolve, reject) {
    // Set blank values to null
    // ...

    Course.create(courseData)
      .then(() => resolve())
      .catch(() => reject(new Error("Unable to create course")));
  });
};

module.exports.updateCourse = function (courseData) {
  return new Promise(function (resolve, reject) {
    

    Course.update(courseData, {
      where: { courseId: courseData.courseId }
    })
      .then(() => resolve())
      .catch(() => reject(new Error("Unable to update course")));
  });
};

module.exports.deleteCourseById = function (id) {
  return new Promise(function (resolve, reject) {
    Course.destroy({
      where: { courseId: id }
    })
      .then((deletedRows) => {
        if (deletedRows > 0) {
          resolve();
        } else {
          reject(new Error("Course not found"));
        }
      })
      .catch(() => reject(new Error("Unable to delete course")));
  });
};

module.exports.getStudentsByCourse=function(course) {
  return new Promise((resolve, reject) => {
    Student.findAll({
      where: {
        course: course
      }
    })
      .then(students => {
        if (students.length > 0) {
          resolve(students);
        } else {
          reject('No results returned');
        }
      })
      .catch(error => {
        console.error('Error fetching students by course:', error);
        reject('No results returned');
      });
  });
}

module.exports.deleteStudentByNum = function (studentNum) {
  return Student.destroy({
    where: { studentNum: studentNum }
  });
};

module.exports.Data = Data;
