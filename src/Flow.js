import React, { useCallback, useState, memo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';

const Block = memo(({ data }) => {
  const handle = (e) => {
    e.preventDefault();
    alert('Hello World');
  };

  return (
    <div
      onContextMenu={handle}
      className="p-2 bg-white rounded shadow border"
    >
      {data.label}
    </div>
  );
});

const nodeTypes = {
  blockA: Block,
  blockB: Block,
};

let id = 0;
const getId = () => `${id++}`;

const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlow, setReactFlow] = useState(null);
  const [droppedBlocks, setDroppedBlocks] = useState([]);

  const onConnect = useCallback(
    (params) => setEdges((e) => addEdge(params, e)),
    [setEdges]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlow) return;

      const bounds = event.target.getBoundingClientRect();
      const position = reactFlow.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const label = type === 'blockA' ? 'Block A' : 'Block B';
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label },
      };

      setNodes((nds) => [...nds, newNode]);
      setDroppedBlocks((prev) => [...prev, label]); 
    },
    [reactFlow]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
    
      <div style={{ width: '20%', padding: 16, borderRight: '1px solid #ccc' }}>
        <div
          style={{ background: '#9ae6b4', padding: 8, marginBottom: 8, borderRadius: 4, cursor: 'move' }}
          draggable
          onDragStart={(e) =>
            e.dataTransfer.setData('application/reactflow', 'blockA')
          }
        >
          Block A
        </div>
        <div
          style={{ background: '#faf089', padding: 8, borderRadius: 4, cursor: 'move' }}
          draggable
          onDragStart={(e) =>
            e.dataTransfer.setData('application/reactflow', 'blockB')
          }
        >
          Block B
        </div>

        <div style={{ marginTop: 20 }}>
          <h4 style={{ fontWeight: 'bold' }}>Dropped Blocks:</h4>
          <ul style={{ listStyle: 'disc', paddingLeft: 20 }}>
            {droppedBlocks.map((label, index) => (
              <li key={index}>{label}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ flexGrow: 1 }}>
        <ReactFlowProvider>
          <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onInit={setReactFlow}
              nodeTypes={nodeTypes}
              fitView
            >
              <MiniMap />
              <Controls />
              <Background />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default Flow;
