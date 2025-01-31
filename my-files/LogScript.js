document.addEventListener("DOMContentLoaded", function() {
  const PASSWORD = "1020";
  const isLoggedIn = localStorage.getItem("loggedIn");

  if (isLoggedIn) {
    return; // Agar pehle se logged in hai toh page ka content dikhao
  }

  showLoginPage();

  function showLoginPage() {
    document.body.innerHTML = ""; // Purane content ko hatao

    // Login container
    let loginContainer = document.createElement("div");
    loginContainer.style.position = "fixed";
    loginContainer.style.top = "0";
    loginContainer.style.left = "0";
    loginContainer.style.width = "100vw";
    loginContainer.style.height = "100vh";
    loginContainer.style.display = "flex";
    loginContainer.style.alignItems = "center";
    loginContainer.style.justifyContent = "center";
    loginContainer.style.backgroundColor = "#f4f4f4";

    // Login box
    let loginBox = document.createElement("div");
    loginBox.style.padding = "20px";
    loginBox.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
    loginBox.style.borderRadius = "8px";
    loginBox.style.backgroundColor = "#fff";
    loginBox.style.textAlign = "center";
    loginBox.style.width = "250px"; // Chhoti width set ki
    loginBox.style.boxSizing = "border-box";

    // Login heading
    let loginHeading = document.createElement("h2");
    loginHeading.textContent = "Login";
    loginHeading.style.marginBottom = "15px";
    loginHeading.style.color = "#333";
    loginHeading.style.fontSize = "22px";

    // Password input
    let passwordInput = document.createElement("input");
    passwordInput.type = "number"; // Sirf numbers input honge
    passwordInput.placeholder = "Enter 4-digit password";
    passwordInput.maxLength = 4;
    passwordInput.style.padding = "8px"; // Chhoti padding
    passwordInput.style.fontSize = "16px";
    passwordInput.style.marginBottom = "10px";
    passwordInput.style.border = "1px solid #ccc";
    passwordInput.style.borderRadius = "4px";
    passwordInput.style.width = "80%"; // Width chhoti ki
    passwordInput.style.textAlign = "center";
    passwordInput.style.outline = "none";
    passwordInput.addEventListener("input", function() {
      if (passwordInput.value.length > 4) {
        passwordInput.value = passwordInput.value.slice(0, 4); // Sirf 4 digit allow karega
      }
    });

    // Login button
    let loginButton = document.createElement("button");
    loginButton.textContent = "Login";
    loginButton.style.padding = "8px"; // Button padding bhi chhoti ki
    loginButton.style.fontSize = "16px";
    loginButton.style.border = "none";
    loginButton.style.backgroundColor = "#007bff";
    loginButton.style.color = "#fff";
    loginButton.style.borderRadius = "4px";
    loginButton.style.cursor = "pointer";
    loginButton.style.width = "85%"; // Button bhi chhota
    loginButton.style.marginTop = "5px";

    loginButton.addEventListener("click", function() {
      if (passwordInput.value === PASSWORD) {
        localStorage.setItem("loggedIn", "true");
        loginContainer.remove(); // Login screen hatao
        document.body.style.overflow = "auto"; // Content access allow karo
      } else {
        alert("Incorrect Password!");
        passwordInput.value = "";
      }
    });

    // Append elements
    loginBox.appendChild(loginHeading);
    loginBox.appendChild(passwordInput);
    loginBox.appendChild(loginButton);
    loginContainer.appendChild(loginBox);
    document.body.appendChild(loginContainer);
  }
});
