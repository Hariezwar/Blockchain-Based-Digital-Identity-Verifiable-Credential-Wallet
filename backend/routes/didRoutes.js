const express = require("express");
const router = express.Router();

// Mock DID routes
router.post("/create", (req, res) => {
  const { userId } = req.body;
  // In a real implementation, generate DID and save to DB
  res.status(201).json({ did: "did:key:z6MkhaXg1NDNV...demo", userId });
});

router.get("/:did", (req, res) => {
  res.status(200).json({ did: req.params.did, status: "ACTIVE" });
});

module.exports = router;
