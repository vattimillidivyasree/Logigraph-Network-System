
const Graph = require('../models/Graph');


class DSU {
    constructor(nodes) {
        this.parent = {};
        this.rank = {};
        nodes.forEach(node => {
            this.parent[node] = node;
            this.rank[node] = 0;
        });
    }

    find(node) {
        if (this.parent[node] !== node) {
            this.parent[node] = this.find(this.parent[node]);
        }
        return this.parent[node];
    }

    union(nodeA, nodeB) {
        const rootA = this.find(nodeA);
        const rootB = this.find(nodeB);

        if (rootA !== rootB) {
            if (this.rank[rootA] > this.rank[rootB]) {
                this.parent[rootB] = rootA;
            } else if (this.rank[rootA] < this.rank[rootB]) {
                this.parent[rootA] = rootB;
            } else {
                this.parent[rootB] = rootA;
                this.rank[rootA]++;
            }
            return true;
        }
        return false; 
    }
}

exports.saveGraph = async (req, res) => {
    try {
        const { name, nodes, edges } = req.body;
  
        const newGraph = new Graph({
            userId: req.user.id, 
            name,
            nodes,
            edges
        });
        const saved = await newGraph.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserGraphs = async (req, res) => {
    try {
        const graphs = await Graph.find({ userId: req.user.id });
        res.json(graphs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.optimizeNetwork = async (req, res) => {
    try {
        const { nodes, edges } = req.body;

        const sortedEdges = [...edges].sort((a, b) => a.cost - b.cost);

        const dsu = new DSU(nodes);
        const mst = [];
        let totalCost = 0;

        for (const edge of sortedEdges) {
            if (dsu.union(edge.source, edge.target)) {
                mst.push(edge);
                totalCost += edge.cost;
            }
        }

        res.json({
            algorithm: "Kruskal's Minimum Spanning Tree",
            totalCost,
            originalEdgesCount: edges.length,
            optimizedEdgesCount: mst.length,
            optimizedEdges: mst
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};