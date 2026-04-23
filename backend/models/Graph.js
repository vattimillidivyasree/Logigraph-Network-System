
const mongoose = require('mongoose');

const EdgeSchema = new mongoose.Schema({
    source: { type: String, required: true }, 
    target: { type: String, required: true }, 
    cost: { type: Number, required: true }    
});

const GraphSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    name: { type: String, default: "My Network" },
    nodes: [{ type: String }], 
    edges: [EdgeSchema],       
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Graph', GraphSchema);