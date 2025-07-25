document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const formMessage = document.getElementById("formMessage");
  const usernameError = document.getElementById("usernameError");
  const passwordError = document.getElementById("passwordError");
  const submitBtn = document.getElementById("submitBtn");

  togglePasswordBtn.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePasswordBtn.textContent = type === "password" ? "Show" : "Hide";
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    usernameError.textContent = "";
    passwordError.textContent = "";
    formMessage.textContent = "";
    formMessage.classList.remove("error");
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");

    const user_id = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!user_id || !password) {
      if (!user_id) usernameError.textContent = "Username is required.";
      if (!password) passwordError.textContent = "Password is required.";
      submitBtn.disabled = false;
      submitBtn.classList.remove("loading");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        formMessage.textContent = data.message || "Login failed. Try again.";
        formMessage.classList.add("error");
        submitBtn.disabled = false;
        submitBtn.classList.remove("loading");
        return;
      }

      localStorage.setItem("token", data.token);

      const role_id = data.user?.role_id;

      switch (role_id) {
        case 1:
          window.location.href = "../ems-frontend/html/admin/dashboard.html";
          break;
        case 2:
          window.location.href = "../ems-frontend/html/hr/hr_dashboard.html";
          break;
        case 3:
          window.location.href = "../ems-frontend/html/manager/dashboard.html";
          break;
        case 4:
          window.location.href = "../ems-frontend/html/employee/employee_dashboard.html";
          break;
        default:
          formMessage.textContent = "Unknown role. Access denied.";
          formMessage.classList.add("error");
          submitBtn.disabled = false;
          submitBtn.classList.remove("loading");
      }
    } catch (error) {
      console.error("Login Error:", error);
      formMessage.textContent = "Server error. Please try again later.";
      formMessage.classList.add("error");
      submitBtn.disabled = false;
      submitBtn.classList.remove("loading");
    }
  });
});
