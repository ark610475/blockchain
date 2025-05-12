// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudentRegistry {
    // 定義學生的資料結構
    struct Student {
        string name;
        string studentId;
        address wallet; // 該學生的區塊鏈地址
    }

    mapping(string => bool) public studentidused;

    // mapping: 將學生的錢包地址 → 學生資料
    mapping(address => Student) public students;

    // 檢查是否註冊過（避免重複註冊）
    mapping(address => bool) public isRegistered;

    // 註冊事件（前端可以監聽）
    event StudentRegistered(address wallet, string name, string studentId);

    // 註冊功能
    function register(string memory _name, string memory _studentId) public {
        require(!isRegistered[msg.sender], "Already registered!");
        require(!studentidused[_studentId], "Student ID already used!");
        
        students[msg.sender] = Student({
            name: _name,
            studentId: _studentId,
            wallet: msg.sender
        });

        isRegistered[msg.sender] = true;
        studentidused[_studentId] = true;

        emit StudentRegistered(msg.sender, _name, _studentId);
    }

    // 取得自己的資料
    function getMyInfo() public view returns (string memory, string memory, address) {
        require(isRegistered[msg.sender], "Not registered yet.");
        Student memory s = students[msg.sender];
        return (s.name, s.studentId, s.wallet);
    }
}
