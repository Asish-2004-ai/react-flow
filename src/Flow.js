import React, { useCallback, useState, useMemo, memo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';

// Block component with connection handles and right-click alert
const Block = memo(({ data }) => {
  const handleRightClick = (e) => {
    e.preventDefault();
    alert('Hello World');
  };

  return (
    <div
      onContextMenu={handleRightClick}
      className="p-2 bg-white rounded shadow border relative"
    >
      <Handle type="target" position={Position.Top} />
      {data.label}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

// Memoized nodeTypes (important to avoid React Flow warning)
const nodeTypes = {
  blockA: Block,
  blockB: Block,
};

let id = 0;
const getId = () => `node_${id++}`;

const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlow, setReactFlow] = useState(null);
  const [droppedBlocks, setDroppedBlocks] = useState([]);

 const onConnect = useCallback(
  (params) =>
    setEdges((eds) =>
      addEdge(
        {
          ...params,
          type: 'straight', // 👈 straight line
          markerEnd: {
            type: 'arrowclosed', // 👈 arrow at the end
          },
        },
        eds
      )
    ),
  [setEdges]
);


  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlow) return;

      const position = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
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
      {/* Sidebar */}
      <div style={{ width: '20%', padding: 16, borderRight: '1px solid #ccc' }}>
        <div
          style={{
            background: '#9ae6b4',
            padding: 8,
            marginBottom: 8,
            borderRadius: 4,
            cursor: 'move',
          }}
          draggable
          onDragStart={(e) =>
            e.dataTransfer.setData('application/reactflow', 'blockA')
          }
        >
          Block A
        </div>
        <div
          style={{
            background: '#faf089',
            padding: 8,
            borderRadius: 4,
            cursor: 'move',
          }}
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

      {/* React Flow Canvas */}
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
