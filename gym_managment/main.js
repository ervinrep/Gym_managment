// js/main.js

import { loginUser, registerUser, bookAppointment } from './api.js';

/* ================================
   1. Λογική για τη Σύνδεση (Login)
=================================== */
// js/main.js
import { loginUser } from './api.js';

// Ελέγχουμε αν υπάρχει φόρμα σύνδεσης στη σελίδα
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Αποφυγή default υποβολής φόρμας

    // Ανάγνωση δεδομένων από τη φόρμα
    const formData = new FormData(loginForm);
    const credentials = {
      email: formData.get('email'),
      password: formData.get('password')
    };

    try {
      // Κλήση στο backend για login
      const result = await loginUser(credentials);

      // Έλεγχος αν λήφθηκε token και role
      if (result.token && result.role) {
        // Αποθήκευση του token στο localStorage (για μελλοντικές κλήσεις)
        localStorage.setItem('token', result.token);

        // Ανακατεύθυνση βάσει του ρόλου
        if (result.role.toLowerCase() === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else {
          window.location.href = 'user-dashboard.html';
        }
      } else {
        alert("Λάθος στοιχεία σύνδεσης. Παρακαλώ δοκιμάστε ξανά.");
      }
    } catch (error) {
      console.error('Login error:', error);
      alert("Παρουσιάστηκε σφάλμα κατά τη σύνδεση.");
    }
  });
}


/* ======================================
   2. Λογική για την Εγγραφή (Register)
======================================= */
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const userData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      country: formData.get('country'),
      city: formData.get('city'),
      address: formData.get('address'),
      email: formData.get('email'),
      username: formData.get('username'),
      password: formData.get('password')
    };

    try {
      const result = await registerUser(userData);
      if (result.token) {
        // Αν η εγγραφή ήταν επιτυχής, εμφανίζεται μήνυμα και ο χρήστης ανακατευθύνεται στην αρχική σελίδα για να πραγματοποιήσει σύνδεση.
        alert('Εγγραφή επιτυχής! Παρακαλώ συνδεθείτε.');
        window.location.href = 'index.html';
      } else {
        alert('Παρουσιάστηκε σφάλμα κατά την εγγραφή.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Παρουσιάστηκε σφάλμα κατά την εγγραφή.');
    }
  });
}

/* ======================================
   3. Λογική για την Κράτηση Ραντεβού (Booking)
======================================= */
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
  bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(bookingForm);
    const bookingData = {
      scheduleId: formData.get('scheduleId')
    };

    try {
      const result = await bookAppointment(bookingData);
      alert('Η κράτηση ολοκληρώθηκε με επιτυχία!');
      console.log('Booking result:', result);
    } catch (error) {
      console.error('Booking error:', error);
      alert('Παρουσιάστηκε σφάλμα κατά την κράτηση.');
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
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    const payloadObj = JSON.parse(decodedPayload);
    return payloadObj.role;
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
}
