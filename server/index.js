const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "",
  database: "SA_TestDB",
});

app.post("/create", function (req, res) {
  const StudentID = req.body.StudentID;
  const Email = req.body.Email;
  const Password = req.body.Password;
  const f_name = req.body.f_name;
  const l_name = req.body.l_name;
  const Marjor = req.body.Marjor;
  const Faculty = req.body.Faculty;

  db.query(
    "INSERT INTO student (StudentID, Email, Password, f_name, l_name, Marjor, Faculty) VALUES (?,?,?,?,?,?,?)",
    [StudentID, Email, Password, f_name, l_name, Marjor, Faculty],
    (err, result) => {
      if (err) {
      } else {
        res.send("Values Inserted");
      }
    }
  );
});

app.post("/login", function (req, res) {
  const { email, password } = req.body;

  db.query("SELECT * FROM student WHERE email = ?", [email], (err, result) => {
    if (err) {
      res.status(500).json({ error: "An internal server error occurred" });
    } else {
      if (result.length > 0) {
        const user = result[0];
        // console.log(user.Password);
        if (password === user.Password) {
          res.status(200).json({ message: "Login successful", result: result });
        } else {
          res.status(401).json({ error: "Invalid email or password" });
        }
      } else {
        res.status(401).json({ error: "Invalid email or password" });
      }
    }
  });
});

app.post("/courses", function (req, res) {
  const categoryID = req.body.categoryID; // รับค่า categoryID จาก dropdown

  // ค้นหาชื่อหมวดหมู่ (CategoryName) จากตาราง categories
  db.query(
    "SELECT courses.*, categories.CategoryName FROM courses JOIN categories ON courses.categoryID = categories.categoryID WHERE courses.categoryID = ?",
    [categoryID],
    function (err, result) {
      if (err) {
        res.status(500).json({ error: "An internal server error occurred" });
      } else {
        if (result.length > 0) {
          res.status(200).json(result); // ส่งข้อมูลทั้งหมดที่เจอกลับไป
        } else {
          res
            .status(404)
            .json({ error: "Courses not found for this category" });
        }
      }
    }
  );
});

app.post("/add_sub", function (req, res) {
  const StudentID = req.body.stu_id; // รับค่า categoryID จาก dropdown
  const CourseID = req.body.c_id; // รับค่า categoryID จาก dropdown
  const Semester = req.body.seme; // รับค่า categoryID จาก dropdown

  db.query(
    "INSERT INTO subjectregistrations (StudentID, CourseID, Semester) VALUES (?,?,?)",
    [StudentID, CourseID, Semester],
    (err, result) => {
      if (err) {
        res.send("ERROR: " + err.message);
      } else {
        res.send("Values Inserted");
      }
    }
  );
});

app.post("/sub_student", function (req, res) {
  const StudentID = req.body.StudentID; // รับค่า StudentID จาก dropdown

  db.query(
    "SELECT sr.*, c.CourseName, c.CreditHours , c.CategoryID FROM subjectregistrations sr INNER JOIN courses c ON sr.CourseID = c.CourseID WHERE sr.StudentID = ?",
    [StudentID],
    function (err, result) {
      if (err) {
        res.status(500).json({ error: "An internal server error occurred" });
      } else {
        if (result.length > 0) {
          res.status(200).json(result); // ส่งข้อมูลทั้งหมดที่เจอกลับไป
        } else {
          res.status(404).json({ error: "Courses not found for this student" });
        }
      }
    }
  );
});

app.get("/student", function (req, res) {
  const { email } = req.query;
  db.query(
    "SELECT * FROM student WHERE email = ?",
    [email],
    function (err, result) {
      if (err) {
        res.status(500).json({ error: "An internal server error occurred" });
      } else {
        if (result.length > 0) {
          res.status(200).json(result[0]); // Return only the first matching student
        } else {
          res.status(404).json({ error: "Student not found" });
        }
      }
    }
  );
});

app.delete("/del_sub_from", function (req, res) {
  const StudentID = req.body.stu_id; // รับค่า StudentID จาก dropdown
  const CourseID = req.body.c_id; // รับค่า CourseID จาก dropdown
  db.query(
    "DELETE FROM subjectregistrations WHERE StudentID = ? AND CourseID = ?",
    [StudentID, CourseID],
    function (err, result) {
      if (err) {
        res.status(500).json({ error: "An internal server error occurred" });
      } else {
        if (result.affectedRows > 0) {
          res
            .status(200)
            .json({ message: "Subject registration deleted successfully" });
        } else {
          res.status(404).json({ error: "Subject registration not found" });
        }
      }
    }
  );
});

app.put("/update_student/:StudentID", function (req, res) {
  const UpdatedData = req.body; // รับข้อมูลที่ต้องการอัปเดตมาจากคำขอ
  const StudentID = req.params.StudentID; // รับ StudentID จาก URL

  db.query(
    "UPDATE student SET ? WHERE StudentID = ?",
    [UpdatedData, StudentID],
    function (err, result) {
      if (err) {
        res.status(500).json({ error: "An internal server error occurred" });
      } else {
        if (result.affectedRows > 0) {
          res
            .status(200)
            .json({ message: "Student data updated successfully" });
        } else {
          res.status(404).json({ error: "Student not found" });
        }
      }
    }
  );
});

app.listen(3301, () => {
  console.log("Server is running on port 3301");
});
