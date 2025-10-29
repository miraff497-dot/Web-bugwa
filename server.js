const express = require("express");
const fs = require("fs");
const crypto = require("crypto");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const loadUsers = () => JSON.parse(fs.readFileSync("./users.json", "utf8"));
const saveUsers = (data) => fs.writeFileSync("./users.json", JSON.stringify(data, null, 2));

// --- START: TAMBAHAN FUNGSI UNTUK PENGELOLAAN SENDER ---
// Load senders data
const loadSenders = () => {
    try {
        return JSON.parse(fs.readFileSync("./senders.json", "utf8"));
    } catch (err) {
        // Jika file tidak ada, return array kosong
        return [];
    }
};

const saveSenders = (data) => fs.writeFileSync("./senders.json", JSON.stringify(data, null, 2));
// --- END: TAMBAHAN FUNGSI UNTUK PENGELOLAAN SENDER ---


app.post("/api/add-user", (req, res) => {
  const { phone, role } = req.body;
  const users = loadUsers();
  users.push({ phone, role });
  saveUsers(users);
  res.json({ success: true, message: "User added." });
});

app.post("/api/add-admin", (req, res) => {
  const { phone } = req.body;
  const users = loadUsers();
  users.push({ phone, role: "admin" });
  saveUsers(users);
  res.json({ success: true, message: "Admin added." });
});

app.post("/api/change-role", (req, res) => {
  const { phone, newRole } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.phone === phone);
  if (user) {
    user.role = newRole;
    saveUsers(users);
    res.json({ success: true, message: "Role updated." });
  } else {
    res.status(404).json({ success: false, message: "User not found." });
  }
});

// --- START: TAMBAHAN API ENDPOINT UNTUK SENDER ---
// API endpoint to add a new sender
app.post("/api/add-sender", (req, res) => {
    const { phone, pairingCode } = req.body;
    
    if (!phone || !pairingCode) {
        return res.status(400).json({ success: false, message: "Phone number and pairing code are required." });
    }
    
    const senders = loadSenders();
    
    // Check if sender already exists
    if (senders.find(s => s.phone === phone)) {
        return res.status(400).json({ success: false, message: "Sender with this phone number already exists." });
    }
    
    // Add new sender
    const newSender = {
        id: senders.length > 0 ? Math.max(...senders.map(s => s.id)) + 1 : 1,
        phone,
        pairingCode,
        status: "active",
        createdAt: new Date().toISOString()
    };
    
    senders.push(newSender);
    saveSenders(senders);
    
    res.json({ success: true, message: "Sender added successfully.", sender: newSender });
});

// API endpoint to remove a sender
app.post("/api/remove-sender", (req, res) => {
    const { id } = req.body;
    
    if (!id) {
        return res.status(400).json({ success: false, message: "Sender ID is required." });
    }
    
    const senders = loadSenders();
    const index = senders.findIndex(s => s.id === parseInt(id));
    
    if (index === -1) {
        return res.status(404).json({ success: false, message: "Sender not found." });
    }
    
    // Remove sender
    const removedSender = senders.splice(index, 1)[0];
    saveSenders(senders);
    
    res.json({ success: true, message: "Sender removed successfully.", sender: removedSender });
});

// API endpoint to get all senders
app.get("/api/senders", (req, res) => {
    const senders = loadSenders();
    res.json({ success: true, senders });
});

// API endpoint to update sender status
app.post("/api/update-sender-status", (req, res) => {
    const { id, status } = req.body;
    
    if (!id || !status) {
        return res.status(400).json({ success: false, message: "Sender ID and status are required." });
    }
    
    const senders = loadSenders();
    const sender = senders.find(s => s.id === parseInt(id));
    
    if (!sender) {
        return res.status(404).json({ success: false, message: "Sender not found." });
    }
    
    // Update sender status
    sender.status = status;
    saveSenders(senders);
    
    res.json({ success: true, message: "Sender status updated successfully.", sender });
});
// --- END: TAMBAHAN API ENDPOINT UNTUK SENDER ---


// TARO FUNCTIONMY

//BATES FUNCTION 

app.post("/api/crash", async (req, res) => {
  const { target } = req.body;
  if (!target) {
    return res.status(400).json({ success: false, message: "Target number is required." });
  }

  try {
    await InvisibleHome(target, {}); // Dummy sock untuk testing lokal //InvisibleHome ubah ke nama asyn functionnya
    res.json({ success: true, message: `Bug terkirim ke ${target}` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal kirim bug", error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));