const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const request = require("supertest");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (process.env.NODE_ENV === "production") {
  throw new Error(
    "Les tests d'intégration sont interdits avec NODE_ENV=production.",
  );
}

const createApp = require("../src/app");
const connectDB = require("../src/config/db");
const Admin = require("../src/models/Admin");
const ContactMessage = require("../src/models/ContactMessage");

const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const adminEmail = `codex-test-${runId}@example.test`;
const contactEmail = `contact-test-${runId}@example.test`;
const password = "TestAGA-2026!";

let app;
let admin;
let token;
let contactMessageId;

before(async () => {
  await connectDB(process.env.MONGO_URI);

  admin = await Admin.create({
    nom: "TEST_API",
    prenom: "Codex",
    email: adminEmail,
    mot_de_passe: password,
    fonction: "Compte de test automatique",
    role: "super_admin",
    actif: true,
  });

  app = createApp({
    trustProxy: "",
    isProduction: false,
    nodeEnv: "test",
    clientUrls: ["http://localhost:5174"],
  });
});

after(async () => {
  if (contactMessageId) {
    await ContactMessage.deleteOne({ _id: contactMessageId });
  }
  await ContactMessage.deleteMany({ email: contactEmail });
  await Admin.deleteMany({ email: adminEmail });
  await mongoose.connection.close();
});

test("GET /api/health confirme la connexion MongoDB", async () => {
  const response = await request(app).get("/api/health").expect(200);

  assert.equal(response.body.status, "ok");
  assert.equal(response.body.database, "connected");
});

test("les routes administrateur refusent une requête sans JWT", async () => {
  const response = await request(app).get("/api/admin/profile").expect(401);

  assert.match(response.body.message, /token/i);
});

test("un administrateur peut se connecter et lire son profil", async () => {
  const loginResponse = await request(app)
    .post("/api/admin/login")
    .send({ email: adminEmail, mot_de_passe: password })
    .expect(200);

  token = loginResponse.body.token;
  assert.ok(token);
  assert.equal(loginResponse.body.admin.email, adminEmail);

  const profileResponse = await request(app)
    .get("/api/admin/profile")
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  assert.equal(profileResponse.body.admin.email, adminEmail);
  assert.equal(profileResponse.body.admin.role, "super_admin");
});

test("le parcours d'un message de contact fonctionne de bout en bout", async () => {
  const createResponse = await request(app)
    .post("/api/contact-messages")
    .send({
      nom: "TEST_API",
      prenom: "Visiteur",
      email: contactEmail,
      telephone: "0600000000",
      sujet: "Test automatique",
      message: "Ce message est créé puis supprimé par la suite de tests.",
    })
    .expect(201);

  contactMessageId = createResponse.body.contactMessage._id;
  assert.ok(contactMessageId);

  const listResponse = await request(app)
    .get("/api/contact-messages")
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  assert.ok(
    listResponse.body.messages.some(
      (message) => message._id === contactMessageId,
    ),
  );

  const updateResponse = await request(app)
    .patch(`/api/contact-messages/${contactMessageId}/status`)
    .set("Authorization", `Bearer ${token}`)
    .send({ statut: "processed" })
    .expect(200);

  assert.equal(updateResponse.body.contactMessage.statut, "processed");

  await request(app)
    .delete(`/api/contact-messages/${contactMessageId}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  contactMessageId = null;
});
