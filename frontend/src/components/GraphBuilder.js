// frontend/src/components/GraphBuilder.js
import React, { useState } from 'react';
import axios from 'axios';

const GraphBuilder = ({ token, logout }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [mode, setMode] = useState('POINTER'); // POINTER, NODE, EDGE
    const [selectedNode, setSelectedNode] = useState(null);
    const [optimizedEdges, setOptimizedEdges] = useState([]);
    const [stats, setStats] = useState(null);

    // --- ACTIONS ---

    const handleCanvasClick = (e) => {
        if (mode !== 'NODE') return;
        if (e.target.tagName !== 'svg') return;

        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Auto-generate a name, but allow override
        const defaultName = `Warehouse ${String.fromCharCode(65 + nodes.length)}`; // A, B, C...
        setNodes([...nodes, { id: `n-${Date.now()}`, x, y, name: defaultName }]);
    };

    const handleNodeClick = (nodeId) => {
        if (mode === 'EDGE') {
            if (!selectedNode) {
                setSelectedNode(nodeId); // Start point
            } else {
                if (selectedNode !== nodeId) {
                    // Unique Feature: Ask for cost instantly upon connection
                    const costStr = prompt("Enter Shipping Cost ($):", "100");
                    if (costStr !== null) {
                        const cost = parseInt(costStr) || 100;
                        setEdges([...edges, { 
                            source: selectedNode, 
                            target: nodeId, 
                            cost, 
                            id: `e-${Date.now()}` 
                        }]);
                    }
                }
                setSelectedNode(null); // Reset
            }
        } else if (mode === 'POINTER') {
             // Future: Allow clicking to edit/delete
             const newName = prompt("Rename Warehouse:", nodes.find(n => n.id === nodeId).name);
             if(newName) {
                 setNodes(nodes.map(n => n.id === nodeId ? {...n, name: newName} : n));
             }
        }
    };

    const optimize = async () => {
        try {
            const res = await axios.post('https://dsa-graph-logistics.onrender.com/api/graphs/optimize', 
                { nodes: nodes.map(n => n.id), edges },
                { headers: { 'x-auth-token': token } }
            );
            setOptimizedEdges(res.data.optimizedEdges);
            setStats({
                total: res.data.totalCost,
                saved: res.data.originalEdgesCount - res.data.optimizedEdgesCount
            });
        } catch (err) { alert("Server Error"); }
    };

    const isOptimized = (src, tgt) => {
        return optimizedEdges.some(e => 
            (e.source === src && e.target === tgt) || (e.source === tgt && e.target === src)
        );
    };

    return (
        <div className="dashboard-container">
            {/* TOP BAR: Controls (More intuitive than sidebar) */}
            <div className="toolbar">
                <div className="brand">📦 Logistics AI</div>
                
                <div className="tools">
                    <button 
                        className={`tool-btn ${mode === 'POINTER' ? 'active' : ''}`}
                        onClick={() => setMode('POINTER')}
                    >
                        👆 Select/Edit
                    </button>
                    <button 
                        className={`tool-btn ${mode === 'NODE' ? 'active' : ''}`}
                        onClick={() => setMode('NODE')}
                    >
                        🏭 Add Warehouse
                    </button>
                    <button 
                        className={`tool-btn ${mode === 'EDGE' ? 'active' : ''}`}
                        onClick={() => setMode('EDGE')}
                    >
                        🚚 Add Route
                    </button>
                </div>

                <div className="actions">
                    <button className="action-btn" onClick={optimize}>⚡ Optimize Network</button>
                    <button className="logout-btn" onClick={logout}>Exit</button>
                </div>
            </div>

            {/* MAIN AREA */}
            <div className="canvas-wrapper">
                {stats && (
                    <div className="stats-overlay">
                        <h3>Optimization Complete</h3>
                        <div>Total Network Cost: <strong>${stats.total}</strong></div>
                        <div>Redundant Routes Removed: <strong>{stats.saved}</strong></div>
                    </div>
                )}

                <div className="instruction-toast">
                    {mode === 'NODE' && "Click empty space to build a Warehouse"}
                    {mode === 'EDGE' && (selectedNode ? "Select Destination Warehouse" : "Select Starting Warehouse")}
                    {mode === 'POINTER' && "Click a Warehouse to Rename"}
                </div>

                <svg width="100%" height="100%" onClick={handleCanvasClick}>
                    <defs>
                        <marker id="arrow" markerWidth="10" markerHeight="10" refX="20" refY="3" orient="auto" markerUnits="strokeWidth">
                            <path d="M0,0 L0,6 L9,3 z" fill="#444" />
                        </marker>
                    </defs>

                    {/* ROUTES */}
                    {edges.map(edge => {
                        const s = nodes.find(n => n.id === edge.source);
                        const t = nodes.find(n => n.id === edge.target);
                        if (!s || !t) return null;
                        const isOpt = isOptimized(edge.source, edge.target);

                        return (
                            <g key={edge.id}>
                                <line 
                                    x1={s.x} y1={s.y} x2={t.x} y2={t.y} 
                                    stroke={isOpt ? "#00ff9d" : "#555"} 
                                    strokeWidth={isOpt ? 4 : 2}
                                    strokeDasharray={isOpt ? "0" : "5,5"} // Dashed for non-optimal
                                />
                                <rect 
                                    x={(s.x+t.x)/2 - 15} y={(s.y+t.y)/2 - 10} width="30" height="20" 
                                    fill="#222" rx="4"
                                />
                                <text 
                                    x={(s.x+t.x)/2} y={(s.y+t.y)/2} dy="5" 
                                    fill={isOpt ? "#00ff9d" : "#aaa"} 
                                    textAnchor="middle" fontSize="11" fontWeight="bold"
                                >
                                    ${edge.cost}
                                </text>
                            </g>
                        );
                    })}

                    {/* WAREHOUSES */}
                    {nodes.map(node => (
                        <g 
                            key={node.id} 
                            onClick={(e) => { e.stopPropagation(); handleNodeClick(node.id); }}
                            style={{ cursor: 'pointer' }}
                        >
                            <circle 
                                cx={node.x} cy={node.y} r="25" 
                                fill={selectedNode === node.id ? "#ff0055" : "#2a2a40"} 
                                stroke={selectedNode === node.id ? "#fff" : "#00d4ff"} 
                                strokeWidth="3"
                            />
                            {/* Icon inside circle */}
                            <text x={node.x} y={node.y} dy="5" textAnchor="middle" fontSize="16">🏭</text>
                            
                            {/* Name Label */}
                            <text 
                                x={node.x} y={node.y + 40} textAnchor="middle" 
                                fill="white" fontSize="12" fontWeight="bold"
                                style={{ textShadow: '0 1px 3px black' }}
                            >
                                {node.name}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
};

export default GraphBuilder;