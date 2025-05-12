let studentRegistry; // 全域合約變數
let cur_account;


async function init() {
  if (typeof window.ethereum === 'undefined') {
    alert("請先安裝 MetaMask！");
    return;
  }

  // 使用 MetaMask 提供的 provider
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = await provider.getSigner();

  //const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  studentRegistry = new ethers.Contract(contractAddress, contractABI, signer);

  console.log("studentRegistry 是：", studentRegistry);
}

async function connectBlockchain() {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    document.getElementById("output").innerText = `連接成功：${accounts[0]}`;
    cur_account = accounts[0];
  } catch (error) {
    console.error("連接失敗：", error);
    document.getElementById("output").innerText = "連接錢包失敗";
  }
} 

async function accregister() {
  const username = document.getElementById('regUser').value;
  const password = document.getElementById('regPass').value;

  const res = await fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  document.getElementById('msg').innerText = data.message;
}

async function bcregister(name, studentId) {
  if (!studentRegistry) {
    alert("尚未初始化合約，請稍後再試");
    return;
  }
  if (!cur_account) {
    alert("請先連接錢包！");
    return;
  }

  try {
    const tx = await studentRegistry.register(name, studentId);
    await tx.wait();
    const res = await fetch('http://localhost:3000/bcregister', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, cur_account }),
    });
  
    const data = await res.json();
    alert("註冊成功！");
    
  }
  catch (err) {
    const message = err.message || "";
    console.error("註冊失敗:", err);
    if (message.includes("Already registered")) {
      alert("⚠️ 此錢包已經註冊過，請勿重複註冊！");
    }
  }
}

async function acclogin() {
  const studentid = document.getElementById('loginUser').value;
  const password = document.getElementById('loginPass').value;

  const res = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentid, password }),
  });

  const data = await res.json();
  document.getElementById('msg').innerText = data.message;

  if (res.ok) {
    localStorage.setItem('studentid', studentid);
    window.location.href = 'user.html';
  }
}

async function loginStudent() {
   
    if (!window.ethereum) {
      alert("請先安裝 MetaMask");
      return;
    }
  
    try {
      
      // 1. 連結錢包
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const currentAccount = accounts[0];
      //document.getElementById("output").innerText = `觸發！`
      // 2. 檢查是否註冊過
      const isRegistered = await studentRegistry.isRegistered(currentAccount);
      
      if (!isRegistered) {
        
        alert("尚未註冊，請先註冊！");
        return;
      }
      
      // 3. 讀取使用者資料
      const [name, studentId, wallet] = await studentRegistry.getMyInfo();

      localStorage.removeItem('studentid');  // 清除帳密登入的學號資料
      localStorage.setItem('studentid', studentId);  // 儲存區塊鏈學號  

      localStorage.setItem('studentid', studentId);
      window.location.href = 'user.html';
  
      // 4. 顯示在頁面上
      //document.getElementById("output").innerText = `登入成功！ 姓名：${name} 學號：${studentId}錢包地址：${wallet}`;
    } catch (err) {
        console.error("登入失敗：", err);
        alert("登入過程中發生錯誤");
    }
}
  

// 初始化合約連線
init();
