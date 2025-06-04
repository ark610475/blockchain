// server.js：後端 API 主程式
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');


const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'datas',
});

app.post('/register', async (req, res) => {
  const { username, password , studentid} = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM user WHERE student_ID = ?', [studentid]);
    if (rows.length > 0) {
      return res.status(400).json({ message: '使用者名稱已存在' });
    }

    //await db.query('SELECT * FROM user WHERE username = ?', [username]);

    const hash = await bcrypt.hash(password, 10);

    await db.query('INSERT INTO user (username, password_hash, student_ID) VALUES (?, ?, ?)', [username, hash, studentid]);
  
    res.json({ message: '註冊成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.post('/login', async (req, res) => {
  const { studentid, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM user WHERE student_ID = ?', [studentid]);
    if (rows.length === 0) {
      return res.status(400).json({ message: '帳號不存在' });
    }
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ message: '密碼錯誤' });
    }
    const locked = rows[0].password_locked;
    if(locked){
      return res.status(401).json({ message: '登入方式已鎖定，請嘗試區塊鏈身份登入' });
    }
    res.json({ message: '登入成功', studentid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.get('/getdata/:studentid', async (req, res) => {
  const { studentid } = req.params; // 從 URL 中取得 name 參數
  try {
    // 查詢資料庫中符合 name 的所有資料
    const [rows] = await db.query('SELECT * FROM user WHERE student_ID = ?', [studentid]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: '找不到該使用者資料' });
    }
    
    // 回傳符合條件的資料
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.post('/bcregister', async (req, res) => {
  const {studentId,cur_account} = req.body;
  try {
    await db.query('UPDATE user SET wallet_address = ? WHERE student_ID = ?',[cur_account, studentId]);
    res.json({ message: '註冊成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

app.post('/switchlock', async (req, res) => {
  const {studentid,lockstate} = req.body;
  try {
    await db.query('UPDATE user SET password_locked = ? WHERE student_ID = ?',[lockstate,studentid]);
    res.json({ message: '變更成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});



// 模擬留言資料（你可以改用資料庫）
let messages = [];

app.post("/comment", async(req, res) => {
  const { studentId, address, message } = req.body;
  if (!studentId || !message) {
    return res.status(400).json({ message: "缺少資料" });
  }
  try {const[rows] = await db.query('INSERT INTO posts (studentid,address,message,created_at) VALUES(?,?,?,NOW())',[studentId,address,message]);
    console.log("INSERT 結果:", rows);
    res.json({ message: "留言成功" });
  }catch(err){
  //messages.push({ studentId, message });
    console.error("資料庫讀取錯誤：", err);
    res.status(500).json({ error: "資料庫錯誤" });
  }
  
});

app.get("/messages", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM posts ORDER BY created_at DESC");
    res.json(rows); // 將查到的資料回傳給前端
  } catch (err) {
    console.error("資料庫讀取錯誤：", err);
    res.status(500).json({ error: "資料庫錯誤" });
  }
});


const { ethers } = require("ethers");

app.post('/bclogin', async (req, res) => {
  const { message, signature } = req.body;

  try {
    // 還原出錢包地址
    const recoveredAddress = ethers.verifyMessage(message, signature);
    const address = recoveredAddress.toLowerCase()
    console.log("address:", address);
    const user = await db.query("SELECT * FROM user WHERE wallet_address = ?", [address]);

    if (user.length > 0) {
      res.json({ success: true});
    } else {
      res.status(401).json({ success: false, error: "Wallet not registered" });
    }
  } catch (err) { 
    res.status(400).json({ success: false, error: "Invalid signature" });
  }
});



app.listen(3000, () => {
  console.log('伺服器已啟動：http://localhost:3000');
});
