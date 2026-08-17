// ============================================================
// Auth Client Logic — Login / Signup / Token Management
// ============================================================

const API_BASE = "";

// Check if already logged in on page load
(function checkAuth() {
  const token = localStorage.getItem("dsa_token");
  if (token) {
    // Verify token is still valid
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          if (!data.user.onboardingComplete) {
            if (window.location.pathname !== "/onboarding.html") {
              window.location.href = "/onboarding.html";
            }
          } else {
            if (window.location.pathname !== "/dashboard.html") {
              window.location.href = "/dashboard.html";
            }
          }
        }
      })
      .catch(() => {
        localStorage.removeItem("dsa_token");
      });
  }
})();

// Tab switching
function switchTab(tab) {
  const loginTab = document.getElementById("loginTab");
  const signupTab = document.getElementById("signupTab");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (tab === "login") {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    loginForm.style.display = "block";
    signupForm.style.display = "none";
  } else {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    signupForm.style.display = "block";
    loginForm.style.display = "none";
  }

  // Clear errors
  document.getElementById("loginError").classList.remove("show");
  document.getElementById("signupError").classList.remove("show");
}

// Handle Login
async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById("loginBtn");
  const errorEl = document.getElementById("loginError");
  errorEl.classList.remove("show");

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showError(errorEl, "Please fill in all fields.");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Logging in...';

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(errorEl, data.error || "Login failed.");
      return;
    }

    localStorage.setItem("dsa_token", data.token);
    showToast("Welcome back! 🎯", "success");

    setTimeout(() => {
      if (!data.user.onboardingComplete) {
        window.location.href = "/onboarding.html";
      } else {
        window.location.href = "/dashboard.html";
      }
    }, 500);
  } catch (err) {
    showError(errorEl, "Network error. Please try again.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Log In";
  }
}

// Handle Signup
async function handleSignup(e) {
  e.preventDefault();
  const btn = document.getElementById("signupBtn");
  const errorEl = document.getElementById("signupError");
  errorEl.classList.remove("show");

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirm").value;

  if (!name || !email || !password || !confirm) {
    showError(errorEl, "Please fill in all fields.");
    return;
  }

  if (password.length < 6) {
    showError(errorEl, "Password must be at least 6 characters.");
    return;
  }

  if (password !== confirm) {
    showError(errorEl, "Passwords do not match.");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Creating account...';

  try {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(errorEl, data.error || "Signup failed.");
      return;
    }

    localStorage.setItem("dsa_token", data.token);
    showToast("Account created! Let's set up your tracker 🚀", "success");

    setTimeout(() => {
      window.location.href = "/onboarding.html";
    }, 800);
  } catch (err) {
    showError(errorEl, "Network error. Please try again.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Create Account";
  }
}

// Helper: Show form error
function showError(el, message) {
  el.textContent = message;
  el.classList.add("show");
}

// Helper: Show toast notification
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// Helper: Logout
function logout() {
  localStorage.removeItem("dsa_token");
  window.location.href = "/index.html";
}

// Helper: Get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem("dsa_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Helper: Auth guard
function requireAuth() {
  const token = localStorage.getItem("dsa_token");
  if (!token) {
    window.location.href = "/index.html";
    return false;
  }
  return true;
}
