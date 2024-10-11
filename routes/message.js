const express = require('express');
const router = express.Router();
const { saveMessage, getMessageHistory } = require('../database.js')

// https://knule.duckdns.org/messages/conversationId
router.get('/:conversationId', async (req, res) => {
    const conversationId = req.params.conversationId
    if (!conversationId) return res.status(400).json({ error: 'conversationId is required' })
    
    try {
        const messages = await getMessageHistory(conversationId);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching messages' })
    }
})

module.exports = router;