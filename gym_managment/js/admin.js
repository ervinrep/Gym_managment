// js/admin.js

const BASE_URL = "http://localhost:3000";

// Βοηθητική συνάρτηση: Λήψη του token από το localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Βοηθητική συνάρτηση: Κλήση fetch
// Αν υπάρχει token, προσθέτει το header Authorization, αλλιώς προσθέτει μόνο το Content-Type.
async function fetchWithToken(endpoint, options = {}) {
  const token = getToken();
  options.headers = {
    ...options.headers,
    "Content-Type": "application/json",
  };

  // Αν υπάρχει token, προσθέτουμε το header Authorization
  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  return response.json();
}

/* =====================================
   1. Διαχείριση Αιτημάτων Εγγραφής
===================================== */
async function loadRegistrationRequests() {
  try {
    const requests = await fetchWithToken("/users/registration-requests", {
      method: "GET",
    });
    const requestsList = document.getElementById("requests-list");
    requestsList.innerHTML = "";
    requests.forEach((request) => {
      const div = document.createElement("div");
      div.classList.add("item");
      div.innerHTML = `
        <p>${request.firstName} ${request.lastName} - ${request.email}</p>
        <button data-id="${request._id}" class="approve-btn">Έγκριση</button>
        <button data-id="${request._id}" class="reject-btn">Απόρριψη</button>
      `;
      requestsList.appendChild(div);
    });
    document
      .querySelectorAll(".approve-btn")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          handleRegistrationRequest(btn.dataset.id, "approved")
        )
      );
    document
      .querySelectorAll(".reject-btn")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          handleRegistrationRequest(btn.dataset.id, "rejected")
        )
      );
  } catch (error) {
    console.error("Error loading registration requests:", error);
  }
}

async function handleRegistrationRequest(requestId, status) {
  try {
    const result = await fetchWithToken(
      `/users/registration-requests/${requestId}`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      }
    );
    alert(result.message);
    loadRegistrationRequests();
    loadUsers();
  } catch (error) {
    console.error("Error handling registration request:", error);
  }
}

/* =====================================
      2. Διαχείριση Χρηστών
===================================== */
async function loadUsers() {
  try {
    const users = await fetchWithToken("/users", { method: "GET" });
    const usersList = document.getElementById("users-list");
    usersList.innerHTML = "";
    users.forEach((user) => {
      const div = document.createElement("div");
      div.classList.add("item");
      div.innerHTML = `
        <p>ID: ${user._id} - Username: ${user.username} - Role: ${user.role}</p>
        <button data-id="${user._id}" class="edit-user-btn">Update</button>
        <button data-id="${user._id}" class="delete-user-btn">Delete</button>
      `;
      usersList.appendChild(div);
    });
    document
      .querySelectorAll(".edit-user-btn")
      .forEach((btn) =>
        btn.addEventListener("click", () => populateUserForm(btn.dataset.id))
      );
    document
      .querySelectorAll(".delete-user-btn")
      .forEach((btn) =>
        btn.addEventListener("click", () => deleteUser(btn.dataset.id))
      );
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

async function deleteUser(userId) {
  const isConfirmed = window.confirm(
    "Are you sure you want to delete this user?"
  );

  if (!isConfirmed) {
    return; // Cancel deletion if user clicks "Cancel"
  }

  try {
    const response = await fetchWithToken(`/users/user/${userId}`, {
      method: "DELETE",
    });

    alert(`${response.message}`);
    loadUsers();
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("An error occurred while deleting the user.");
  }
}

async function populateUserForm(userId) {
  try {
    const user = await fetchWithToken(`/users/user/${userId}`, {
      method: "GET",
    });
    document.getElementById("user-id").value = user._id;
    document.getElementById("user-firstName").value = user.firstName;
    document.getElementById("user-lastName").value = user.lastName;
    document.getElementById("user-country").value = user.country;
    document.getElementById("user-city").value = user.city;
    document.getElementById("user-address").value = user.address;
    document.getElementById("user-email").value = user.email;
    document.getElementById("user-username").value = user.username;
    document.getElementById("user-role").value = user.role;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

const updateUserForm = document.getElementById("update-user-form");
if (updateUserForm) {
  updateUserForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const userId = document.getElementById("user-id").value;
    const firstName = document.getElementById("user-firstName").value;
    const lastName = document.getElementById("user-lastName").value;
    const country = document.getElementById("user-country").value;
    const city = document.getElementById("user-city").value;
    const address = document.getElementById("user-address").value;
    const email = document.getElementById("user-email").value;
    const username = document.getElementById("user-username").value;
    const role = document.getElementById("user-role").value;
    try {
      const result = await fetchWithToken(`/users/user/${userId}`, {
        method: "PUT",
        body: JSON.stringify({
          firstName,
          lastName,
          country,
          city,
          address,
          email,
          username,
        }),
      });
      alert(result.message);
      // Αν ο ρόλος έχει αλλάξει, καλείται και το endpoint assign-role
      if (role !== result.user.role) {
        const roleResult = await fetchWithToken(
          `/users/assign-role/${userId}`,
          {
            method: "PUT",
            body: JSON.stringify({ role }),
          }
        );
        alert(roleResult.message);
      }
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  });
}

/* =====================================
      3. Διαχείριση Γυμναστών
===================================== */
async function loadTrainers() {
  try {
    const trainers = await fetchWithToken("/trainers", { method: "GET" });
    const trainersList = document.getElementById("trainers-list");
    trainersList.innerHTML = "";
    trainers.forEach((trainer) => {
      const div = document.createElement("div");
      div.classList.add("item");
      div.innerHTML = `
        <p>ID: ${trainer._id} - Name: ${trainer.firstName} ${trainer.lastName} - Specialty: ${trainer.specialty}</p>
        <button data-id="${trainer._id}" class="edit-trainer-btn">Update</button>
        <button data-id="${trainer._id}" class="delete-trainer-btn">Delete</button>
      `;
      trainersList.appendChild(div);
    });
    document
      .querySelectorAll(".edit-trainer-btn")
      .forEach((btn) =>
        btn.addEventListener("click", () => populateTrainerForm(btn.dataset.id))
      );
    document
      .querySelectorAll(".delete-trainer-btn")
      .forEach((btn) =>
        btn.addEventListener("click", () => deleteTrainer(btn.dataset.id))
      );
  } catch (error) {
    console.error("Error loading trainers:", error);
  }
}

async function deleteTrainer(trainerId) {
  const isConfirmed = window.confirm(
    "Are you sure you want to delete this trainer?"
  );

  if (!isConfirmed) {
    return; // Cancel deletion if user clicks "Cancel"
  }

  try {
    const response = await fetchWithToken(`/trainers/${trainerId}`, {
      method: "DELETE",
    });

    alert(`${response.message}`);
    loadTrainers();
  } catch (error) {
    console.error("Error deleting trainer:", error);
    alert("An error occurred while deleting the trainer.");
  }
}

async function populateTrainerForm(trainerId) {
  try {
    const trainer = await fetchWithToken(`/trainers/${trainerId}`, {
      method: "GET",
    });
    document.getElementById("trainer-id").value = trainer._id;
    document.getElementById("trainer-firstName").value = trainer.firstName;
    document.getElementById("trainer-lastName").value = trainer.lastName;
    document.getElementById("trainer-specialty").value = trainer.specialty;
    document.getElementById("trainer-bio").value = trainer.bio;
  } catch (error) {
    console.error("Error fetching trainer data:", error);
  }
}

const trainerForm = document.getElementById("trainer-form");
const clearTrainerForm = document.getElementById("clear-trainer-form");
// Clear Button Handler
if (clearTrainerForm) {
  clearTrainerForm.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent form submission
    trainerForm.reset(); // Reset all form fields
    document.getElementById("trainer-id").value = ""; // Ensure trainer ID is cleared
  });
}

if (trainerForm) {
  trainerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const trainerId = document.getElementById("trainer-id").value;
    const firstName = document.getElementById("trainer-firstName").value;
    const lastName = document.getElementById("trainer-lastName").value;
    const specialty = document.getElementById("trainer-specialty").value;
    const bio = document.getElementById("trainer-bio").value;
    const method = trainerId ? "PUT" : "POST";
    const endpoint = trainerId ? `/trainers/${trainerId}` : "/trainers/create";
    try {
      const result = await fetchWithToken(endpoint, {
        method,
        body: JSON.stringify({ firstName, lastName, specialty, bio }),
      });
      alert(result.message);
      trainerForm.reset();
      loadTrainers();
    } catch (error) {
      console.error("Error saving trainer:", error);
    }
  });
}

/* =====================================
      4. Διαχείριση Προγραμμάτων
===================================== */
async function loadPrograms() {
  try {
    // Το endpoint για τα προγράμματα είναι δημόσιο, οπότε χρησιμοποιούμε fetch χωρίς token
    const response = await fetch(`${BASE_URL}/programs`, { method: "GET" });
    const programs = await response.json();
    const programsList = document.getElementById("programs-list");
    programsList.innerHTML = "";
    programs.forEach((program) => {
      const div = document.createElement("div");
      div.classList.add("item");
      div.innerHTML = `
        <p>ID: ${program._id} - Name: ${program.name} (${program.programType}, ${program.category})</p>
        <button data-id="${program._id}" class="edit-program-btn">Update</button>
        <button data-id="${program._id}" class="delete-program-btn">Delete</button>
      `;
      programsList.appendChild(div);
    });
    document
      .querySelectorAll(".edit-program-btn")
      .forEach((btn) =>
        btn.addEventListener("click", () => populateProgramForm(btn.dataset.id))
      );
    document
      .querySelectorAll(".delete-program-btn")
      .forEach((btn) =>
        btn.addEventListener("click", () => deleteProgram(btn.dataset.id))
      );
  } catch (error) {
    console.error("Error loading programs:", error);
  }
}

async function deleteProgram(programId) {
  const isConfirmed = window.confirm(
    "Are you sure you want to delete this program?"
  );

  if (!isConfirmed) return;

  try {
    const response = await fetchWithToken(`/programs/${programId}`, {
      method: "DELETE",
    });

    alert(`${response.message}`);
    loadPrograms();
  } catch (error) {
    console.error("Error deleting program:", error);
    alert("An error occurred while deleting the program.");
  }
}

async function populateProgramForm(programId) {
  try {
    const response = await fetch(`${BASE_URL}/programs/${programId}`, {
      method: "GET",
    });
    const program = await response.json();
    document.getElementById("program-id").value = program._id;
    document.getElementById("program-name").value = program.name;
    document.getElementById("program-type").value = program.programType;
    document.getElementById("program-category").value = program.category;
    document.getElementById("program-maxCapacity").value = program.maxCapacity;
    document.getElementById("program-description").value = program.description;
  } catch (error) {
    console.error("Error fetching program data:", error);
  }
}

const programForm = document.getElementById("program-form");
const clearProgramForm = document.getElementById("clear-program-form");
// Clear Button Handler
if (clearProgramForm) {
  clearProgramForm.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent form submission
    programForm.reset(); // Reset all form fields
    document.getElementById("program-id").value = ""; // Ensure trainer ID is cleared
  });
}
if (programForm) {
  programForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const programId = document.getElementById("program-id").value;
    const name = document.getElementById("program-name").value;
    const programType = document.getElementById("program-type").value;
    const category = document.getElementById("program-category").value;
    const description = document.getElementById("program-description").value;
    const maxCapacity = document.getElementById("program-maxCapacity").value;

    const method = programId ? "PUT" : "POST";
    const endpoint = programId ? `/programs/${programId}` : "/programs/create";
    try {
      const result = await fetchWithToken(endpoint, {
        method,
        body: JSON.stringify({
          name,
          programType,
          category,
          description,
          maxCapacity: Number(maxCapacity),
        }),
      });
      alert(`${result.message}`);
      programForm.reset();
      loadPrograms();
    } catch (error) {
      console.error("Error saving program:", error);
    }
  });
}

/* =====================================
   5. Διαχείριση Ομαδικών Προγραμμάτων
===================================== */
async function loadSchedules() {
  try {
    const groupPrograms = await fetchWithToken("/schedules", { method: "GET" });
    const groupProgramsList = document.getElementById("group-programs-list");
    groupProgramsList.innerHTML = "";
    groupPrograms.forEach(async (gp) => {
      const div = document.createElement("div");
      div.classList.add("item");
      const formattedDate = new Date(gp.dateTime).toLocaleDateString("en", {
        weekday: "long", // Full day name (e.g., "Δευτέρα")
        year: "numeric",
        month: "long", // Full month name (e.g., "Ιανουάριος")
        day: "numeric",
      });
      const formattedTime = new Date(gp.dateTime).toLocaleTimeString("en", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const trainer = await fetchWithToken(`/trainers/${gp.trainerId}`, {
        method: "GET",
      });
      const program = await fetchWithToken(`/programs/${gp.programId}`, {
        method: "GET",
      });

      div.innerHTML = `
        <p>Trainer Name: ${trainer.firstName} ${trainer.lastName}, Program Name: ${program.name}, Date: ${formattedDate}, Time: ${formattedTime}, Capacity: ${gp.maxCapacity}</p>
        <button data-id="${gp._id}" class="edit-group-program-btn">Επεξεργασία</button>
      `;
      groupProgramsList.appendChild(div);
    });
    document
      .querySelectorAll(".edit-group-program-btn")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          populateGroupProgramForm(btn.dataset.id)
        )
      );
    document
      .querySelectorAll(".delete-group-program-btn")
      .forEach((btn) =>
        btn.addEventListener("click", () => deleteGroupProgram(btn.dataset.id))
      );
  } catch (error) {
    console.error("Error loading group programs:", error);
  }
}

async function deleteGroupProgram(programId) {
  const isConfirmed = window.confirm(
    "Are you sure you want to delete this schedule?"
  );

  if (!isConfirmed) return;

  try {
    const response = await fetchWithToken(`/programs/${programId}`, {
      method: "DELETE",
    });

    alert(`${response.message}`);
    loadPrograms();
  } catch (error) {
    console.error("Error deleting program:", error);
    alert("An error occurred while deleting the program.");
  }
}

async function populateGroupProgramForm(groupProgramId) {
  try {
    const gp = await fetchWithToken(`/schedules/${groupProgramId}`, {
      method: "GET",
    });
    document.getElementById("group-program-id").value = gp.id;
    document.getElementById("group-day").value = gp.day;
    document.getElementById("group-time").value = gp.time;
    document.getElementById("group-capacity").value = gp.maxCapacity;
    loadTrainersForGroupProgram(gp.trainerId);
  } catch (error) {
    console.error("Error fetching group program data:", error);
  }
}

async function loadTrainersForGroupProgram(selectedTrainerId = null) {
  try {
    const trainers = await fetchWithToken("/trainers", { method: "GET" });
    const select = document.getElementById("group-trainer");
    select.innerHTML = "";
    trainers.forEach((trainer) => {
      const option = document.createElement("option");
      option.value = trainer.id;
      option.textContent = `${trainer.firstName} ${trainer.lastName}`;
      if (selectedTrainerId && trainer.id == selectedTrainerId) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading trainers for group program:", error);
  }
}

const groupProgramForm = document.getElementById("group-program-form");
if (groupProgramForm) {
  groupProgramForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const groupProgramId = document.getElementById("group-program-id").value;
    const day = document.getElementById("group-day").value;
    const time = document.getElementById("group-time").value;
    const trainerId = document.getElementById("group-trainer").value;
    const capacity = document.getElementById("group-capacity").value;
    const method = groupProgramId ? "PUT" : "POST";
    const endpoint = groupProgramId
      ? `/schedules/${groupProgramId}`
      : "/schedules/create";
    try {
      const result = await fetchWithToken(endpoint, {
        method,
        body: JSON.stringify({ day, time, trainerId, maxCapacity: capacity }),
      });
      console.log("Group program saved:", result);
      groupProgramForm.reset();
      loadSchedules();
    } catch (error) {
      console.error("Error saving group program:", error);
    }
  });
}

/* =====================================
      6. Διαχείριση Ανακοινώσεων/Προσφορών
===================================== */
async function loadAnnouncements() {
  try {
    const announcements = await fetchWithToken("/announcements", {
      method: "GET",
    });
    const announcementsList = document.getElementById("announcements-list");
    announcementsList.innerHTML = "";
    announcements.forEach((announcement) => {
      const div = document.createElement("div");
      div.classList.add("item");
      div.innerHTML = `
        <p>ID: ${announcement.id} - ${announcement.title}</p>
        <button data-id="${announcement.id}" class="edit-announcement-btn">Επεξεργασία</button>
      `;
      announcementsList.appendChild(div);
    });
    document
      .querySelectorAll(".edit-announcement-btn")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          populateAnnouncementForm(btn.dataset.id)
        )
      );
  } catch (error) {
    console.error("Error loading announcements:", error);
  }
}

async function populateAnnouncementForm(announcementId) {
  try {
    const announcement = await fetchWithToken(
      `/announcements/${announcementId}`,
      { method: "GET" }
    );
    document.getElementById("announcement-id").value = announcement.id;
    document.getElementById("announcement-title").value = announcement.title;
    document.getElementById("announcement-description").value =
      announcement.description;
    if (announcement.expiresAt) {
      document.getElementById("announcement-expiresAt").value =
        announcement.expiresAt.substring(0, 16);
    }
    document.getElementById("announcement-isOffer").value = announcement.isOffer
      ? "true"
      : "false";
  } catch (error) {
    console.error("Error fetching announcement data:", error);
  }
}

const announcementForm = document.getElementById("announcement-form");
if (announcementForm) {
  announcementForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const announcementId = document.getElementById("announcement-id").value;
    const title = document.getElementById("announcement-title").value;
    const description = document.getElementById(
      "announcement-description"
    ).value;
    const expiresAt = document.getElementById("announcement-expiresAt").value;
    const isOffer =
      document.getElementById("announcement-isOffer").value === "true";
    const method = announcementId ? "PUT" : "POST";
    const endpoint = announcementId
      ? `/announcements/${announcementId}`
      : "/announcements/create";
    try {
      const result = await fetchWithToken(endpoint, {
        method,
        body: JSON.stringify({ title, description, expiresAt, isOffer }),
      });
      console.log("Announcement saved:", result);
      announcementForm.reset();
      loadAnnouncements();
    } catch (error) {
      console.error("Error saving announcement:", error);
    }
  });
}

/* =====================================
           Αρχικοποίηση Dashboard
===================================== */
function initDashboard() {
  loadRegistrationRequests();
  loadUsers();
  loadTrainers();
  loadPrograms();
  loadSchedules();
  loadAnnouncements();
}

window.addEventListener("load", initDashboard);
