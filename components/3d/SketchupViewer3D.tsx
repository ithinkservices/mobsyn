'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  SketchUp3DSceneData, 
  SketchUp3DComponent 
} from '@/types/database';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Camera, 
  Eye, 
  Layers, 
  Box, 
  Grid, 
  Sparkles,
  Info,
  Maximize,
  Minimize
} from 'lucide-react';

interface SketchupViewer3DProps {
  sceneData?: SketchUp3DSceneData;
  selectedComponentId?: string | null;
  highlightedCodigo?: string | null;
  onSelectComponent?: (id: string | null, codigo?: string | null) => void;
  className?: string;
  altura?: number | string;
}

export const SketchupViewer3D: React.FC<SketchupViewer3DProps> = ({
  sceneData,
  selectedComponentId,
  highlightedCodigo,
  onSelectComponent,
  className = '',
  altura = 460
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js instances refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshesMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const edgesMapRef = useRef<Map<string, THREE.LineSegments>>(new Map());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Orbit state
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 500, 0));
  const sphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 3500,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
  });

  // UI state
  const [hoveredComponent, setHoveredComponent] = useState<SketchUp3DComponent | null>(null);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [hideDoors, setHideDoors] = useState(false);
  const [explodedFactor, setExplodedFactor] = useState(0); // 0 a 1

  // Update camera position from spherical coordinates
  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const target = cameraTargetRef.current;

    cameraRef.current.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = target.y + radius * Math.cos(phi);
    cameraRef.current.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(target);
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = typeof altura === 'number' ? altura : 460;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // dark slate 900
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 10, 50000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight1.position.set(2500, 4500, 3000);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.45); // soft cyan rim light
    dirLight2.position.set(-2500, 2500, -2500);
    scene.add(dirLight2);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(0, -2000, 3000);
    scene.add(fillLight);

    // 5. Floor Grid and Ground Plane
    const gridHelper = new THREE.GridHelper(6000, 60, 0x0284c7, 0x1e293b);
    gridHelper.position.y = 0;
    gridHelper.name = 'floorGrid';
    scene.add(gridHelper);

    // 5.1 SketchUp Characteristic Coordinate Axes (Blue = Y vertical, Red = X horizontal, Green = Z depth)
    const axesGroup = new THREE.Group();
    axesGroup.name = 'sketchupAxes';

    // Blue Axis (Y - Vertical)
    const blueSolidGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 4000, 0)]);
    const blueSolidMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 2 });
    axesGroup.add(new THREE.Line(blueSolidGeo, blueSolidMat));

    const blueDashedGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -2000, 0)]);
    const blueDashedMat = new THREE.LineDashedMaterial({ color: 0x3b82f6, dashSize: 40, gapSize: 30, opacity: 0.5, transparent: true });
    const blueDashedLine = new THREE.Line(blueDashedGeo, blueDashedMat);
    blueDashedLine.computeLineDistances();
    axesGroup.add(blueDashedLine);

    // Red Axis (X - Horizontal)
    const redSolidGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(4000, 0, 0)]);
    const redSolidMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 });
    axesGroup.add(new THREE.Line(redSolidGeo, redSolidMat));

    const redDashedGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-2000, 0, 0)]);
    const redDashedMat = new THREE.LineDashedMaterial({ color: 0xef4444, dashSize: 40, gapSize: 30, opacity: 0.5, transparent: true });
    const redDashedLine = new THREE.Line(redDashedGeo, redDashedMat);
    redDashedLine.computeLineDistances();
    axesGroup.add(redDashedLine);

    // Green Axis (Z - Depth)
    const greenSolidGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 4000)]);
    const greenSolidMat = new THREE.LineBasicMaterial({ color: 0x22c55e, linewidth: 2 });
    axesGroup.add(new THREE.Line(greenSolidGeo, greenSolidMat));

    const greenDashedGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -2000)]);
    const greenDashedMat = new THREE.LineDashedMaterial({ color: 0x22c55e, dashSize: 40, gapSize: 30, opacity: 0.5, transparent: true });
    const greenDashedLine = new THREE.Line(greenDashedGeo, greenDashedMat);
    greenDashedLine.computeLineDistances();
    axesGroup.add(greenDashedLine);

    scene.add(axesGroup);

    const groundGeo = new THREE.PlaneGeometry(8000, 8000);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 6. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // 7. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = typeof altura === 'number' ? altura : entry.contentRect.height || 460;
        if (cameraRef.current && rendererRef.current && newWidth > 0 && newHeight > 0) {
          cameraRef.current.aspect = newWidth / newHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [altura, updateCameraPosition]);

  // Build Scene Meshes when sceneData changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear previous component meshes
    meshesMapRef.current.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => m.dispose());
      } else {
        mesh.material.dispose();
      }
    });
    meshesMapRef.current.clear();

    edgesMapRef.current.forEach((lines) => {
      scene.remove(lines);
      lines.geometry.dispose();
      if (Array.isArray(lines.material)) {
        lines.material.forEach((m) => m.dispose());
      } else {
        lines.material.dispose();
      }
    });
    edgesMapRef.current.clear();

    const components = sceneData?.components || [];
    if (components.length === 0) return;

    // Calculate center bounding box of all components to focus camera
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    components.forEach((comp) => {
      const w = Math.max(comp.dimensoes.larguraMm || 10, 4);
      const h = Math.max(comp.dimensoes.alturaMm || 10, 4);
      const d = Math.max(comp.dimensoes.profundidadeMm || 10, 4);
      let { x, y, z } = comp.posicao;

      // Se for modo explodido
      if (explodedFactor > 0) {
        x += (x / 400) * explodedFactor * 300;
        y += ((y - 350) / 350) * explodedFactor * 250;
        z += (z / 300) * explodedFactor * 300;
      }

      minX = Math.min(minX, x - w / 2);
      maxX = Math.max(maxX, x + w / 2);
      minY = Math.min(minY, y - h / 2);
      maxY = Math.max(maxY, y + h / 2);
      minZ = Math.min(minZ, z - d / 2);
      maxZ = Math.max(maxZ, z + d / 2);

      // Checa se deve ocultar portas e gavetas dianteiras
      const nomeLower = comp.nome.toLowerCase();
      const isPortaOuFrente = nomeLower.includes('porta') || nomeLower.includes('frente_gaveta') || nomeLower.includes('frente gaveta') || (nomeLower.includes('puxador') && z > 250);
      
      // Create Box Geometry for component
      const geometry = new THREE.BoxGeometry(w, h, d);
      
      const compColor = comp.cor ? parseInt(comp.cor.replace('#', '0x'), 16) : 0x0284c7;
      const isMetal = nomeLower.includes('puxador') || nomeLower.includes('dobradica') || nomeLower.includes('calco') || nomeLower.includes('corredica') || nomeLower.includes('travessa');

      const material = new THREE.MeshStandardMaterial({
        color: compColor,
        roughness: isMetal ? 0.25 : 0.45,
        metalness: isMetal ? 0.85 : 0.08,
        wireframe: wireframeMode,
        transparent: isPortaOuFrente && hideDoors,
        opacity: isPortaOuFrente && hideDoors ? 0.08 : 1.0,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { component: comp, originalPos: { ...comp.posicao }, isPortaOuFrente };

      // Edges for crisp architectural look
      const edges = new THREE.EdgesGeometry(geometry);
      const isFrenteNude = comp.cor === '#d7cbbe';
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: isFrenteNude ? 0x64748b : 0x38bdf8, 
        linewidth: 1, 
        transparent: true, 
        opacity: isPortaOuFrente && hideDoors ? 0.15 : 0.45 
      });
      const lineSegments = new THREE.LineSegments(edges, lineMaterial);
      lineSegments.position.copy(mesh.position);

      scene.add(mesh);
      scene.add(lineSegments);

      meshesMapRef.current.set(comp.id, mesh);
      edgesMapRef.current.set(comp.id, lineSegments);
    });

    if (minX !== Infinity) {
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const centerZ = (minZ + maxZ) / 2;
      cameraTargetRef.current.set(centerX, Math.max(centerY, 340), centerZ);

      const maxDim = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
      sphericalRef.current.radius = Math.max(maxDim * 2.1, 2300);
      sphericalRef.current.theta = Math.PI / 3.8;
      sphericalRef.current.phi = Math.PI / 3.2;
      updateCameraPosition();
    }
  }, [sceneData, updateCameraPosition, wireframeMode, hideDoors, explodedFactor]);

  // Sync Highlight / Selection from props to 3D Scene
  useEffect(() => {
    const components = sceneData?.components || [];
    
    components.forEach((comp) => {
      const mesh = meshesMapRef.current.get(comp.id);
      const edges = edgesMapRef.current.get(comp.id);
      if (!mesh) return;

      const isSelected = selectedComponentId === comp.id || (highlightedCodigo && comp.codigo === highlightedCodigo);

      const mat = mesh.material as THREE.MeshStandardMaterial;
      const baseColor = comp.cor ? parseInt(comp.cor.replace('#', '0x'), 16) : 0x0284c7;

      if (isSelected) {
        mat.color.setHex(0x06b6d4); // Vibrant Cyan Highlight
        mat.emissive.setHex(0x0891b2);
        mat.emissiveIntensity = 0.4;
        if (edges) {
          (edges.material as THREE.LineBasicMaterial).color.setHex(0x22d3ee);
          (edges.material as THREE.LineBasicMaterial).opacity = 1.0;
        }
      } else {
        mat.color.setHex(baseColor);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
        if (edges) {
          (edges.material as THREE.LineBasicMaterial).color.setHex(0x38bdf8);
          (edges.material as THREE.LineBasicMaterial).opacity = 0.35;
        }
      }
    });
  }, [selectedComponentId, highlightedCodigo, sceneData]);

  // Sync wireframe mode toggle
  useEffect(() => {
    meshesMapRef.current.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.wireframe = wireframeMode;
    });
  }, [wireframeMode]);

  // Sync Grid visibility
  useEffect(() => {
    const grid = sceneRef.current?.getObjectByName('floorGrid');
    if (grid) grid.visible = showGrid;
  }, [showGrid]);

  // Sync SketchUp Axes visibility
  useEffect(() => {
    const axes = sceneRef.current?.getObjectByName('sketchupAxes');
    if (axes) axes.visible = showAxes;
  }, [showAxes]);

  // Mouse & Touch Controls Handling
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      isDraggingRef.current = true;
    } else if (e.button === 2) {
      isPanningRef.current = true;
    }
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    if (isDraggingRef.current) {
      sphericalRef.current.theta -= deltaX * 0.005;
      sphericalRef.current.phi = Math.max(
        0.05,
        Math.min(Math.PI / 2 - 0.05, sphericalRef.current.phi + deltaY * 0.005)
      );
      updateCameraPosition();
    } else if (isPanningRef.current && cameraRef.current) {
      const panSpeed = sphericalRef.current.radius * 0.0008;
      const forward = new THREE.Vector3();
      cameraRef.current.getWorldDirection(forward);
      const right = new THREE.Vector3().crossVectors(forward, cameraRef.current.up).normalize();

      cameraTargetRef.current.addScaledVector(right, -deltaX * panSpeed);
      cameraTargetRef.current.y += deltaY * panSpeed;
      updateCameraPosition();
    }

    // Raycast for Hover identification
    if (canvasRef.current && cameraRef.current && sceneRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const meshes = Array.from(meshesMapRef.current.values());
      const intersects = raycasterRef.current.intersectObjects(meshes);

      if (intersects.length > 0) {
        const comp = intersects[0].object.userData.component as SketchUp3DComponent;
        setHoveredComponent(comp || null);
        if (canvasRef.current) canvasRef.current.style.cursor = 'pointer';
      } else {
        setHoveredComponent(null);
        if (canvasRef.current) canvasRef.current.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
      }
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isPanningRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    sphericalRef.current.radius = Math.max(
      300,
      Math.min(12000, sphericalRef.current.radius + e.deltaY * 2.5)
    );
    updateCameraPosition();
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const meshes = Array.from(meshesMapRef.current.values());
    const intersects = raycasterRef.current.intersectObjects(meshes);

    if (intersects.length > 0) {
      const comp = intersects[0].object.userData.component as SketchUp3DComponent;
      if (comp && onSelectComponent) {
        onSelectComponent(comp.id, comp.codigo);
      }
    } else {
      if (onSelectComponent) {
        onSelectComponent(null, null);
      }
    }
  };

  // Preset Camera Angles
  const setViewAngle = (type: 'iso' | 'front' | 'top' | 'side' | 'reset') => {
    if (type === 'iso') {
      sphericalRef.current.theta = Math.PI / 3.8;
      sphericalRef.current.phi = Math.PI / 3.2;
    } else if (type === 'front') {
      sphericalRef.current.theta = 0;
      sphericalRef.current.phi = Math.PI / 2.05;
    } else if (type === 'top') {
      sphericalRef.current.theta = 0;
      sphericalRef.current.phi = 0.08;
    } else if (type === 'side') {
      sphericalRef.current.theta = Math.PI / 2;
      sphericalRef.current.phi = Math.PI / 2.05;
    } else if (type === 'reset') {
      sphericalRef.current.theta = Math.PI / 3.8;
      sphericalRef.current.phi = Math.PI / 3.2;
      cameraTargetRef.current.set(0, 340, 0);
    }
    updateCameraPosition();
  };

  // Capture Screenshot of 3D Scene
  const handleCaptureScreenshot = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `render-3d-sketchup-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Empty state: no components to render
  if (!sceneData?.components?.length) {
    return (
      <div 
        className={`relative w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-slate-950 shadow-inner select-none flex items-center justify-center ${className}`}
        style={{ height: typeof altura === 'number' ? `${altura}px` : altura }}
      >
        <div className="text-center space-y-3 px-6 max-w-md">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
            <Box className="w-7 h-7 text-slate-500" />
          </div>
          <p className="text-sm font-semibold text-slate-300">Nenhum componente 3D carregado</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Para visualizar o modelo 3D, exporte seu projeto do SketchUp usando a 
            <span className="text-cyan-400 font-semibold"> Extensão Ruby </span> 
            (Plugins → Exportar JSON Marcenaria) ou o plugin 
            <span className="text-cyan-400 font-semibold"> OpenCutList </span> 
            (Exportar CSV).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-slate-950 shadow-inner select-none ${className}`}
      style={{ height: typeof altura === 'number' ? `${altura}px` : altura }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Top Floating Bar: Environment Title & Status */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 shadow-md">
          <Box className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-100">
            {sceneData?.ambienteNome || 'Visualizador 3D SketchUp'}
          </span>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            {sceneData?.components?.length || 0} PEÇAS
          </span>
        </div>

        {/* View Preset Buttons */}
        <div className="flex items-center gap-1 pointer-events-auto bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md">
          <button
            type="button"
            onClick={() => setViewAngle('iso')}
            className="px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Vista Isométrica (Padrão SketchUp)"
          >
            Iso
          </button>
          <button
            type="button"
            onClick={() => setViewAngle('front')}
            className="px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Vista Frontal"
          >
            Frente
          </button>
          <button
            type="button"
            onClick={() => setViewAngle('top')}
            className="px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Vista Superior / Planta"
          >
            Topo
          </button>
          <button
            type="button"
            onClick={() => setViewAngle('side')}
            className="px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Vista Lateral"
          >
            Lado
          </button>
          <button
            type="button"
            onClick={() => setViewAngle('reset')}
            className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Centralizar Câmera"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Bar: Tool Controls & Mode Toggles */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        {/* Hovered Component Info Card */}
        <div className="pointer-events-auto max-w-sm">
          {hoveredComponent ? (
            <div className="bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-cyan-500/40 shadow-lg text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-bold text-white truncate">{hoveredComponent.nome}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-300 font-mono mt-0.5">
                <span className="text-cyan-400 font-bold">{hoveredComponent.codigo}</span>
                <span>•</span>
                <span>{hoveredComponent.dimensoes.larguraMm}×{hoveredComponent.dimensoes.alturaMm}×{hoveredComponent.dimensoes.profundidadeMm} mm</span>
                <span>•</span>
                <span className="truncate text-slate-400">{hoveredComponent.material || 'MDF'}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/70 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-1.5">
              <Info className="w-3 h-3 text-cyan-400/70" />
              <span>Clique ou passe o mouse em uma peça para inspecionar</span>
            </div>
          )}
        </div>

        {/* Viewport Action Buttons */}
        <div className="flex items-center gap-1 pointer-events-auto bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md">
          {/* Toggle Ocultar Portas / Frentes */}
          <button
            type="button"
            onClick={() => setHideDoors(!hideDoors)}
            className={`px-2 py-1 flex items-center gap-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
              hideDoors ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Ocultar/Transparência em Portas e Frentes para ver o interior"
          >
            {hideDoors ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
            <span>{hideDoors ? 'Interior' : 'Portas'}</span>
          </button>

          {/* Toggle Vista Explodida */}
          <button
            type="button"
            onClick={() => setExplodedFactor(explodedFactor > 0 ? 0 : 0.75)}
            className={`px-2 py-1 flex items-center gap-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
              explodedFactor > 0 ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Alternar Vista Explodida de Montagem"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Explodir</span>
          </button>

          {/* Toggle Eixos SketchUp */}
          <button
            type="button"
            onClick={() => setShowAxes(!showAxes)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              showAxes ? 'text-blue-400 bg-slate-800' : 'text-slate-500 hover:text-white hover:bg-slate-800'
            }`}
            title="Alternar Eixos de Coordenadas SketchUp (Azul / Vermelho / Verde)"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Aramado */}
          <button
            type="button"
            onClick={() => setWireframeMode(!wireframeMode)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              wireframeMode ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Alternar Modo Aramado (Wireframe)"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Captura de Foto */}
          <button
            type="button"
            onClick={handleCaptureScreenshot}
            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Capturar Foto / Render 3D HD"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
