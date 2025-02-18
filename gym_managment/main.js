// js/main.js
import { bookAppointment, loginUser, registerUser } from "./api.js";
/* ================================
   1. Λογική για τη Σύνδεση (Login)
=================================== */
// Ελέγχουμε αν υπάρχει φόρμα σύνδεσης στη σελίδα
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Αποφυγή default υποβολής φόρμας
    // Ανάγνωση δεδομένων από τη φόρμα
    const formData = new FormData(loginForm);
    const credentials = {
      username: formData.get("username"),
      password: formData.get("password"),
    };
    try {
      // Κλήση στο backend για login
      const result = await loginUser(credentials);
      // Έλεγχος αν λήφθηκε token και role
      if (result.token && result.user.role) {
        // Αποθήκευση του token στο localStorage (για μελλοντικές κλήσεις)
        localStorage.setItem("token", result.token);
        // Ανακατεύθυνση βάσει του ρόλου
        if (result.user.role === "admin") {
          window.location.href = "admin-dashboard.html";
        } else {
          if (result.user.status === "approved") {
            window.location.href = "user-dashboard.html";
          } else {
            alert(
              "Your account is not approved yet. Please wait for an admin to approve it."
            );
          }
        }
      } else {
        alert(`${result.message}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong while logging in.");
    }
  });
}
/* ======================================
   2. Λογική για την Εγγραφή (Register)
======================================= */
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const userData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      country: formData.get("country"),
      city: formData.get("city"),
      address: formData.get("address"),
      email: formData.get("email"),
      username: formData.get("username"),
      password: formData.get("password"),
    };
    try {
      const result = await registerUser(userData);
      if (result) {
        alert("Successfull Registration! Wait for admin to approve you.");
        window.location.href = "index.html";
      } else {
        alert("Something went wrong while registering.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong while registering.");
    }
  });
}
/* ======================================
   3. Λογική για την Κράτηση Ραντεβού (Booking)
======================================= */
const bookingForm = document.getElementById("booking-form");
if (bookingForm) {
  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(bookingForm);
    const bookingData = {
      scheduleId: formData.get("scheduleId"),
    };
    try {
      const result = await bookAppointment(bookingData);
      alert("Η κράτηση ολοκληρώθηκε με επιτυχία!");
      console.log("Booking result:", result);
    } catch (error) {
      console.error("Booking error:", error);
      alert("Παρουσιάστηκε σφάλμα κατά την κράτηση.");
    }
  });
}
/* ======================================
   4. Συνάρτηση για αποκωδικοποίηση του ρόλου από το JWT Token
======================================= */
// Σε περίπτωση που το backend δεν επιστρέφει ξεχωριστά το πεδίο "role"
// μπορούμε να αποκωδικοποιήσουμε το token (π.χ. χρησιμοποιώντας τη συνάρτηση atob)
// Αυτή η υλοποίηση είναι απλή και κατάλληλη για demo purposes.
function decodeRoleFromToken(token) {
  try {
    const payload = token.split(".")[1];
    const decodedPayload = atob(payload);
    const payloadObj = JSON.parse(decodedPayload);
    return payloadObj.role;
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
});
function logout() {
  localStorage.removeItem("token"); // Remove token from storage
  sessionStorage.removeItem("token"); // If using session storage
  window.location.href = "login.html"; // Redirect to login page
}