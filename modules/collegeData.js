const fs = require('fs');

class Data {
  constructor(students, courses) {
    this.students = students;
    this.courses = courses;
  }
}

let dataCollection = null;

function addStudent(studentData) {
  return new Promise((resolve, reject) => {
    if (dataCollection && dataCollection.students) {
      dataCollection.students = [
        ...dataCollection.students,
        {
          ...studentData,
          studentNum: dataCollection.students.length + 1,
          TA: studentData.TA ? true : false,
          course: Number(studentData.course),
        },
      ];
      resolve();
    } else {
      reject("No data available.");
    }
  });
}

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
    if (dataCollection && dataCollection.students && dataCollection.students.length > 0) {
      resolve(dataCollection.students);
    } else {
      reject("No students found.");
    }
  });
}

function getTAs() {
  return new Promise((resolve, reject) => {
    const tas = dataCollection.students.filter((student) => student.TA === true);
    if (tas.length > 0) {
      resolve(tas);
    } else {
      reject("No TAs found.");
    }
  });
}

function getCourses() {
  return new Promise((resolve, reject) => {
    if (dataCollection && dataCollection.courses && dataCollection.courses.length > 0) {
      resolve(dataCollection.courses);
    } else {
      reject("No courses found.");
    }
  });
}

function getStudentByNum(studentNum) {
  return new Promise((resolve, reject) => {
    const hasData = dataCollection && dataCollection.students && dataCollection.students.length > 0;

    if (hasData) {
      const student = dataCollection.students.find(student => student.studentNum === studentNum);

      if (student) {
        resolve(student);
      } else {
        reject("No results returned for the specified student number.");
      }
    } else {
      reject("No student data available.");
    }
  });
}



function updateStudent(studentData) {
  return new Promise((resolve, reject) => {
    if (
      dataCollection &&
      dataCollection.students &&
      dataCollection.students.length > 0
    ) {
      try {
        let sIndex = dataCollection.students.findIndex(
          (student) => student.studentNum === Number(studentData.studentNum)
        );
        let updatedStudent = {
          ...studentData,
          studentNum: Number(studentData.studentNum),
          TA: studentData.TA ? true: false,
          course:  Number(studentData.course)
        };
        dataCollection.students[sIndex] = updatedStudent;
        resolve();
      } catch(err) {
        reject("student not found");
      }
    } else {
      reject("No students returned");
    }
  });
}



const getCourseById = (id) => {
  return new Promise((resolve, reject) => {
    const course = dataCollection.courses.find((course) => course.courseId === id);
    if (course) {
      resolve(course);
    } else {
      reject(new Error("Query returned 0 results"));
    }
  });
};

module.exports = {
  initialize,
  getAllStudents,
  getTAs,
  getCourses,
  addStudent,
  getCourseById,
  getStudentByNum,
  updateStudent,
};
