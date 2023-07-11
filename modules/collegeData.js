const fs = require('fs');

class Data {
  constructor(students, courses) {
    this.students = students;
    this.courses = courses;
  }
}
dataCollection = null;

function readFilePromise(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, dataFromFile) => {
      if (err) {
        reject(err);
        return;
      }
      const data = JSON.parse(dataFromFile);
      resolve(data);
    });
  });
}

function initialize() {
  return new Promise((resolve, reject) => {
    let studentDataFromFile;
    let courseDataFromFile;

    readFilePromise('./data/students.json')
      .then((dataFromStudentsFile) => {
        studentDataFromFile = dataFromStudentsFile;
        return readFilePromise('./data/courses.json');
      })
      .then((dataFromCoursesFile) => {
        courseDataFromFile = dataFromCoursesFile;
        dataCollection = new Data(studentDataFromFile, courseDataFromFile);
        resolve(dataCollection);
      })
      .catch((error) => {
        reject(`Unable to read files: ${error}`);
      });
  });
}

function getAllStudents() {
  return new Promise((resolve, reject) => {
    if (dataCollection.students.length === 0) {
      reject("No students found.");
    } else {
      resolve(dataCollection.students);
    }
  });
}

function getTAs() {
  return new Promise((resolve, reject) => {
    const tas = dataCollection.students.filter((student) => student.TA === true);
    if (tas.length === 0) {
      reject("No TAs found.");
    } else {
      resolve(tas);
    }
  });
}

function getCourses() {
  return new Promise((resolve, reject) => {
    if (dataCollection.courses.length === 0) {
      reject("No courses found.");
    } else {
      resolve(dataCollection.courses);
    }
  });
}

module.exports = {
    initialize, getAllStudents, getTAs, getCourses
}