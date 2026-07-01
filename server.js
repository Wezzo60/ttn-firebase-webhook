const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://student-bus-tracker-e03fc-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.database();

app.get("/", (req, res) => {
  res.send("TTN Firebase Webhook is running");
});

app.post("/", async (req, res) => {
  try {
    const location = req.body.uplink_message?.locations?.["frm-payload"];

    if (!location) {
      console.log("No location found");
      return res.sendStatus(200);
    }

    await db.ref("ROUTE-3B").update({
      latitude: location.latitude,
      longitude: location.longitude,
      lastUpdated: new Date().toLocaleTimeString("en-MY", {
        timeZone: "Asia/Kuala_Lumpur",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
      status: "Moving",
      active: true
    });

    console.log("ROUTE-1 GPS Updated:", location);
    res.sendStatus(200);

  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Webhook running");
});
