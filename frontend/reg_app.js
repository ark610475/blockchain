async function registerStudent(name, studentId) {
  if (!studentRegistry) {
    alert("尚未初始化合約，請稍後再試");
    return;
  }

  try {
    const tx = await studentRegistry.register(name, studentId);
    await tx.wait();
    alert("註冊成功！");
  } catch (err) {
    console.error("註冊失敗:", err);
    alert("註冊失敗，請查看控制台");
  }
}