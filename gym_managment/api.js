// api.js
const API_BASE_URL = "http://localhost:3000";
// Συνάρτηση για εγγραφή χρήστη
export async function registerUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error in registerUser:", error);
    throw error;
  }
}
// Συνάρτηση για είσοδο χρήστη
export async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    return await response.json();
  } catch (error) {
    console.error("Error in loginUser:", error);
    throw error;
  }
}
// Συνάρτηση για κράτηση ραντεβού (προστατευμένη διαδρομή)
export async function bookAppointment(bookingData) {
  try {
    // Ανάκτηση του token από το localStorage
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/book-appointment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Προσθήκη του token στο header για αυθεντικοποίηση
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error in bookAppointment:", error);
    throw error;
  }
}
// Συνάρτηση για ανάκτηση προστατευμένων δεδομένων
export async function getProtectedData() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/protected`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error in getProtectedData:", error);
    throw error;
  }
}