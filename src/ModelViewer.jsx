import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function CatModel({ url, isActive, onInteractStart, onInteractEnd }) {
  const group = useRef();
  const { gl } = useThree();
  const gltf = useGLTF(url);
  const drag = useRef({ active: false, x: 0, y: 0, velX: 0, velY: 0 });
  const idleYaw = useRef(0);
  const settle = useRef({ active: false });

  const cloned = useMemo(() => {
    const c = gltf.scene.clone(true);
    c.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material) {
          obj.material.envMapIntensity = 0.9;
        }
      }
    });
    return c;
  }, [gltf]);

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e) => {
      drag.current.active = true;
      drag.current.x = e.clientX;
      drag.current.y = e.clientY;
      drag.current.velX = 0;
      drag.current.velY = 0;
      settle.current.active = false;
      onInteractStart();
    };

    const onPointerMove = (e) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      drag.current.velX = dx * 0.008;
      drag.current.velY = dy * 0.008;
      if (group.current) {
        group.current.rotation.y += drag.current.velX;
        group.current.rotation.x = THREE.MathUtils.clamp(
          group.current.rotation.x + drag.current.velY,
          -Math.PI / 2.2,
          Math.PI / 2.2
        );
      }
      drag.current.x = e.clientX;
      drag.current.y = e.clientY;
    };

    const onPointerUp = () => {
      if (!drag.current.active) return;
      drag.current.active = false;
      settle.current.active = true;
      onInteractEnd();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [gl, onInteractStart, onInteractEnd]);

  useFrame((_, delta) => {
    if (!group.current) return;
    if (drag.current.active) return;

    if (settle.current.active) {
      drag.current.velX *= 0.92;
      drag.current.velY *= 0.92;
      group.current.rotation.y += drag.current.velX;
      group.current.rotation.x = THREE.MathUtils.clamp(
        group.current.rotation.x + drag.current.velY,
        -Math.PI / 2.2,
        Math.PI / 2.2
      );
      if (Math.abs(drag.current.velX) < 0.0005 && Math.abs(drag.current.velY) < 0.0005) {
        settle.current.active = false;
        drag.current.velX = 0;
        drag.current.velY = 0;
      }
    } else if (isActive) {
      idleYaw.current += delta * 0.35;
      group.current.rotation.y += delta * 0.35;
    }
  });

  return <primitive ref={group} object={cloned} />;
}

function Scene({ url, isActive, onInteractStart, onInteractEnd }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={[0xffffff, 0xe8e8e8, 0.7]} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.35} />
      <CatModel
        url={url}
        isActive={isActive}
        onInteractStart={onInteractStart}
        onInteractEnd={onInteractEnd}
      />
      <ContactShadows
        position={[0, -1.15, 0]}
        opacity={0.45}
        scale={8}
        blur={2.4}
        far={4}
        resolution={512}
        color="#3a2a1a"
      />
      <Environment preset="studio" background={false} />
    </>
  );
}

export default function ModelViewer({ url, isActive, onInteractStart, onInteractEnd }) {
  const [resolvedUrl, setResolvedUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    fetch(url, { method: 'GET' })
      .then((r) => {
        if (!r.ok) throw new Error('network');
        return r.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const objUrl = URL.createObjectURL(blob);
        setResolvedUrl(objUrl);
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    return () => {
      if (resolvedUrl) URL.revokeObjectURL(resolvedUrl);
    };
  }, [resolvedUrl]);

  if (failed) {
    return (
      <div className="viewer-fallback">
        <span>Model unavailable</span>
      </div>
    );
  }

  if (!resolvedUrl) {
    return (
      <div className="viewer-loading">
        <div className="loader-ring" />
        <span>Loading model…</span>
      </div>
    );
  }

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.6, 4.6], fov: 38 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      style={{ background: 'transparent' }}
    >
      <Scene
        url={resolvedUrl}
        isActive={isActive}
        onInteractStart={onInteractStart}
        onInteractEnd={onInteractEnd}
      />
    </Canvas>
  );
}
