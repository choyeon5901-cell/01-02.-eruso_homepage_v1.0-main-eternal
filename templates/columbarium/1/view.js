import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, MeshReflectorMaterial, Text, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const DRACO_DECODER = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';
const URN_URL = 'templates/columbarium/1/models/urn.glb?v=ceramic2';
const h = React.createElement;

const CELL_W = 0.76;
const CELL_H = 0.64;
const GAP = 0.045;
const PRESETS = {
    all: { pos: [0, 1.52, 3.05], target: [0, 1.32, -0.15] },
    left: { pos: [0.35, 1.48, 0.35], target: [-1.55, 1.45, 0.2] },
    right: { pos: [-0.35, 1.48, 0.35], target: [1.55, 1.45, 0.2] },
    garden: { pos: [0, 1.35, -0.4], target: [0, 1.05, -3.4] },
};

const CONCEPTS = [
    { name: '화이트 마블', floor: '#f7f4ef', wall: '#fbf9f6', frame: '#d4af37', metal: 0.9, rough: 0.24, light: '#fff6ee', amb: 0.62, spot: 0.18, urn: '#fbf9f6', urnMetal: 0.06, urnRough: 0.28, trim: '#d4af37', prop: 'none', marble: true },
    { name: '월넛 · 수첩', floor: '#d9c3a5', wall: '#4a3428', frame: '#3a261c', metal: 0.08, rough: 0.62, light: '#ffd2a1', amb: 0.38, spot: 1.35, urn: '#f4efe6', urnMetal: 0.2, urnRough: 0.4, trim: '#c9a36a', prop: 'book' },
    { name: '웜그레이 · 액자', floor: '#cfc8c0', wall: '#b7aea4', frame: '#a3988e', metal: 0.05, rough: 0.84, light: '#fffaf4', amb: 1.05, spot: 0.45, urn: '#f7f3ee', urnMetal: 0.12, urnRough: 0.5, trim: '#8d8378', prop: 'frame' },
    { name: '블랙 펄 · 안개꽃', floor: '#1c1c1e', wall: '#2a2a2c', frame: '#3a3532', metal: 0.55, rough: 0.22, light: '#fff1d6', amb: 0.28, spot: 1.6, urn: '#f6f1e8', urnMetal: 0.18, urnRough: 0.36, trim: '#e8e0d4', prop: 'flower' },
    { name: '화이트 오크', floor: '#e7d7c3', wall: '#f3e6d4', frame: '#e8d3b8', metal: 0.04, rough: 0.72, light: '#fff7ee', amb: 0.95, spot: 0.15, urn: '#c5c8cc', urnMetal: 0.82, urnRough: 0.42, trim: '#9aa0a6', prop: 'none' },
    { name: '로즈골드 · 성경', floor: '#f0e4d8', wall: '#f6eee6', frame: '#e7b899', metal: 0.62, rough: 0.28, light: '#fff6e4', amb: 0.78, spot: 0.4, urn: '#f8f4ee', urnMetal: 0.16, urnRough: 0.4, trim: '#d4a574', prop: 'book' },
    { name: '실크 블루 · 크리스털', floor: '#d5dde6', wall: '#c5d4e4', frame: '#b7c6d6', metal: 0.12, rough: 0.35, light: '#f4f7ff', amb: 0.7, spot: 0.85, urn: '#e7f6ff', urnMetal: 0.08, urnRough: 0.08, trim: '#d0e8f8', prop: 'none' },
    { name: '콘크리트 · 다육', floor: '#b7b7b4', wall: '#9a9a96', frame: '#8d8d89', metal: 0.06, rough: 0.9, light: '#fff3df', amb: 0.45, spot: 0.7, urn: '#ece7e0', urnMetal: 0.15, urnRough: 0.45, trim: '#6e6e6a', prop: 'plant' },
    { name: '옻칠 흑목 · 향로', floor: '#2a1c18', wall: '#3a1816', frame: '#2c1214', metal: 0.2, rough: 0.48, light: '#ffc89a', amb: 0.22, spot: 0.55, urn: '#c4a36a', urnMetal: 0.7, urnRough: 0.32, trim: '#8a5a32', prop: 'bowl' },
    { name: '흑경 · 브론즈', floor: '#141414', wall: '#0e0e10', frame: '#1a1a1c', metal: 0.85, rough: 0.12, light: '#ffe8c8', amb: 0.3, spot: 0.45, urn: '#8d6239', urnMetal: 0.78, urnRough: 0.28, trim: '#6b4423', prop: 'none' },
    { name: '트래버틴 · 편지', floor: '#e6d5c3', wall: '#f3e7da', frame: '#e4d2bc', metal: 0.1, rough: 0.48, light: '#fff6ec', amb: 0.88, spot: 0.3, urn: '#f7f2ea', urnMetal: 0.14, urnRough: 0.42, trim: '#d8c4a8', prop: 'book' },
    { name: '블랙 철재 · 원통', floor: '#d8d2c8', wall: '#ece7e0', frame: '#1a1a1a', metal: 0.4, rough: 0.55, light: '#fffaf2', amb: 0.6, spot: 1.1, urn: '#8b5a2b', urnMetal: 0.15, urnRough: 0.68, trim: '#f2e2b8', prop: 'none' },
    { name: '베이지 패브릭', floor: '#e7d8c6', wall: '#f0e2d2', frame: '#e6d5c4', metal: 0.02, rough: 0.92, light: '#ffe6c2', amb: 0.8, spot: 0.35, urn: '#f6f0e8', urnMetal: 0.1, urnRough: 0.5, trim: '#f3d7b0', prop: 'angel' },
    { name: '빈티지 고재', floor: '#c4aa8a', wall: '#b08968', frame: '#8d6b4a', metal: 0.05, rough: 0.88, light: '#fff1dc', amb: 0.66, spot: 0.9, urn: '#f3ece3', urnMetal: 0.12, urnRough: 0.48, trim: '#a98467', prop: 'frame' },
    { name: '아크릴 · LED', floor: '#e8eef2', wall: '#f7fbff', frame: '#d5e4ee', metal: 0.05, rough: 0.12, light: '#e7fbff', amb: 0.55, spot: 0.2, urn: '#d5f3ff', urnMetal: 0.06, urnRough: 0.18, trim: '#7fd3e8', prop: 'none' },
    { name: '샴페인 골드', floor: '#e8d7c4', wall: '#f6ecdf', frame: '#e0c39a', metal: 0.7, rough: 0.24, light: '#ffe0b0', amb: 0.34, spot: 1.5, urn: '#f4efe4', urnMetal: 0.2, urnRough: 0.36, trim: '#e7c27a', prop: 'candle' },
    { name: '아이보리 · 반구', floor: '#f6f1e8', wall: '#fbf7f1', frame: '#f3ece3', metal: 0.04, rough: 0.78, light: '#fff8f0', amb: 0.92, spot: 0.28, urn: '#f4f0ea', urnMetal: 0.12, urnRough: 0.34, trim: '#e6d5c3', prop: 'none' },
    { name: '슬레이트 · 만년필', floor: '#6d7270', wall: '#5c6360', frame: '#4e5552', metal: 0.08, rough: 0.9, light: '#d9e4ff', amb: 0.42, spot: 0.75, urn: '#eceae6', urnMetal: 0.16, urnRough: 0.46, trim: '#8ea0b8', prop: 'pen' },
    { name: '대나무 · 연꽃', floor: '#d7c4a3', wall: '#e6d3b0', frame: '#c6b48a', metal: 0.04, rough: 0.7, light: '#fff0d8', amb: 0.7, spot: 0.22, urn: '#f7f3ea', urnMetal: 0.1, urnRough: 0.48, trim: '#d7c4a2', prop: 'flower' },
    { name: '하이글로시 화이트', floor: '#f7f7f5', wall: '#ffffff', frame: '#f4f4f2', metal: 0.08, rough: 0.08, light: '#fffdf8', amb: 0.75, spot: 1.7, urn: '#fbfbfb', urnMetal: 0.2, urnRough: 0.12, trim: '#ffffff', prop: 'frame' },
];

const bus = {
    api: null,
    snap: null,
    render: null,
    controls: null,
    preset: 'all',
    slots: [],
    focusIndex: -1,
    focusTo: null,
    clearFocus: null,
    pressed: false,
    suppressClick: false,
    nicheScale: 1,
    nicheVel: 0,
};

useGLTF.preload(URN_URL, DRACO_DECODER);

function roomLabel(cell, r, c) {
    const row = String((cell && cell.row) || r + 1).padStart(2, '0');
    const col = String((cell && cell.col) || c + 1).padStart(2, '0');
    const zone = (cell && cell.zone) || '';
    const floor = (cell && cell.floor) || '';
    return (zone ? zone + '동 ' : '') + (floor ? floor + '층 ' : '') + row + col + '호';
}

function personName(cell) {
    const raw = (cell && (cell.deceased_name || cell.name || cell.title)) || '';
    if (!raw) return '분양 가능 호실';
    return String(raw).indexOf('故') === 0 ? String(raw) : ('故 ' + raw);
}

function cellId(cell, r, c, zone, floor) {
    if (cell && cell.id) return String(cell.id);
    return String(zone || 'A') + String(floor || '1') + '-'
        + String(r + 1).padStart(2, '0') + String(c + 1).padStart(2, '0');
}

function nicheFrame(r, c, cols) {
    const per = Math.ceil(cols / 2);
    const left = c < per;
    const localC = left ? c : c - per;
    const rows = 6;
    const totalW = per * CELL_W + (per + 1) * GAP;
    const lx = -totalW / 2 + GAP + CELL_W / 2 + localC * (CELL_W + GAP);
    const ly = 0.42 + (rows - 1 - r) * (CELL_H + GAP);
    const lz = 0.2;
    const yaw = left ? Math.PI / 2 : -Math.PI / 2;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0));
    const origin = new THREE.Vector3(left ? -2.35 : 2.35, 0, 1.35);
    const position = new THREE.Vector3(lx, ly, lz).applyQuaternion(q).add(origin);
    return { position, quaternion: q };
}

function buildSlots(snap) {
    const cells = (snap && snap.cells) || {};
    const zone = (snap && snap.zone) || 'A';
    const floor = (snap && snap.floor) || '1';
    const rows = (snap && snap.rows) || 6;
    const cols = (snap && snap.cols) || 10;
    const dummy = new THREE.Object3D();
    const list = [];
    for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
            const cell = cells[r + '-' + c] || null;
            const frame = nicheFrame(r, c, cols);
            dummy.position.copy(frame.position);
            dummy.quaternion.copy(frame.quaternion);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            list.push({
                r,
                c,
                id: cellId(cell, r, c, zone, floor),
                cell,
                occupied: !!(cell && cell.occupied),
                isPublic: !!(cell && cell.is_public),
                position: frame.position.clone(),
                quaternion: frame.quaternion.clone(),
                matrix: dummy.matrix.clone(),
            });
        }
    }
    return list;
}

function writeInstances(mesh, slots, hover, selectedId, colorFor, scaleFor) {
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    slots.forEach((slot, i) => {
        dummy.position.copy(slot.position);
        dummy.quaternion.copy(slot.quaternion);
        const on = i === hover || slot.id === selectedId;
        dummy.scale.setScalar(scaleFor ? scaleFor(i, on) : (on ? 1.045 : 1));
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, colorFor(slot, on, i));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

function appendBox(target, size, position) {
    const box = new THREE.BoxGeometry(size[0], size[1], size[2]);
    box.translate(position[0], position[1], position[2]);
    const pos = box.attributes.position;
    const nor = box.attributes.normal;
    const base = target.positions.length / 3;
    for (let i = 0; i < pos.count; i += 1) {
        target.positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
        target.normals.push(nor.getX(i), nor.getY(i), nor.getZ(i));
    }
    const idx = box.index;
    for (let i = 0; i < idx.count; i += 1) target.indices.push(base + idx.getX(i));
    box.dispose();
}

function geometryFromParts(parts) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(parts.positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(parts.normals, 3));
    geo.setIndex(parts.indices);
    return geo;
}

function makeFrameGeometry() {
    const w = CELL_W * 0.98;
    const hh = CELL_H * 0.96;
    const d = 0.05;
    const t = 0.03;
    const z = 0.18;
    const parts = { positions: [], normals: [], indices: [] };
    appendBox(parts, [w, t, d], [0, hh / 2 - t / 2, z]);
    appendBox(parts, [w, t, d], [0, -hh / 2 + t / 2, z]);
    appendBox(parts, [t, hh - t * 2, d], [-w / 2 + t / 2, 0, z]);
    appendBox(parts, [t, hh - t * 2, d], [w / 2 - t / 2, 0, z]);
    return geometryFromParts(parts);
}

function makeCavityGeometry() {
    const w = CELL_W * 0.9;
    const hh = CELL_H * 0.88;
    const d = 0.34;
    const t = 0.02;
    const zc = -0.02;
    const parts = { positions: [], normals: [], indices: [] };
    appendBox(parts, [w, hh, t], [0, 0, zc - d / 2]);
    appendBox(parts, [w, t, d], [0, hh / 2 - t / 2, zc]);
    appendBox(parts, [w, t, d], [0, -hh / 2 + t / 2, zc]);
    appendBox(parts, [t, hh, d], [-w / 2 + t / 2, 0, zc]);
    appendBox(parts, [t, hh, d], [w / 2 - t / 2, 0, zc]);
    return geometryFromParts(parts);
}

function makeTabletTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#121820';
    ctx.fillRect(0, 0, 160, 100);
    const photo = ctx.createLinearGradient(0, 8, 0, 92);
    photo.addColorStop(0, '#d9c4aa');
    photo.addColorStop(0.45, '#c4a88c');
    photo.addColorStop(1, '#6e5846');
    ctx.fillStyle = photo;
    ctx.fillRect(8, 8, 86, 84);
    ctx.fillStyle = '#f0e2d2';
    ctx.beginPath();
    ctx.arc(50, 36, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e4d0bc';
    ctx.beginPath();
    ctx.ellipse(50, 78, 22, 16, 0, Math.PI, 0, true);
    ctx.fill();
    ctx.fillStyle = '#f6f1ea';
    ctx.font = '11px sans-serif';
    ctx.fillText('PHOTO', 104, 46);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
}

function roundRectPath(ctx, x, y, w, hh, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + hh, r);
    ctx.arcTo(x + w, y + hh, x, y + hh, r);
    ctx.arcTo(x, y + hh, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function makeKioskTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 820;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a2330';
    ctx.fillRect(0, 0, 480, 820);
    ctx.fillStyle = '#f4efe6';
    ctx.textAlign = 'center';
    ctx.font = '600 26px "Malgun Gothic", "Noto Sans KR", sans-serif';
    ctx.fillText('세종 이루소 봉안당', 240, 78);
    ctx.font = '700 34px "Malgun Gothic", "Noto Sans KR", sans-serif';
    ctx.fillText('봉안당 안내', 240, 168);
    ['봉안당 안내 시스템', '호실 찾기', '상담 안내'].forEach((label, i) => {
        const y = 250 + i * 150;
        ctx.fillStyle = '#f7f4ee';
        roundRectPath(ctx, 54, y, 372, 96, 14);
        ctx.fill();
        ctx.fillStyle = '#1c2430';
        ctx.font = '600 30px "Malgun Gothic", "Noto Sans KR", sans-serif';
        ctx.fillText(label, 240, y + 60);
    });
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
}

function placeLocal(dummy, slot, local, scale) {
    dummy.position.copy(slot.position);
    dummy.quaternion.copy(slot.quaternion);
    const shift = new THREE.Vector3(local[0], local[1], local[2]).applyQuaternion(slot.quaternion);
    dummy.position.add(shift);
    dummy.scale.setScalar(scale == null ? 1 : scale);
    dummy.updateMatrix();
}

function NicheGrid({ slots, hover, selectedId, focusIndex, onHover, onSelect, concept, ghost, shiftZ }) {
    const frame = useRef(null);
    const glass = useRef(null);
    const glow = useRef(null);
    const led = useRef(null);
    const tablet = useRef(null);
    const count = Math.max(slots.length, 1);
    const frameGeo = useMemo(() => makeFrameGeometry(), []);
    const glassGeo = useMemo(() => new THREE.BoxGeometry(CELL_W * 0.9, CELL_H * 0.86, 0.008), []);
    const glowGeo = useMemo(() => makeCavityGeometry(), []);
    const ledGeo = useMemo(() => new THREE.BoxGeometry(0.1, 0.018, 0.06), []);
    const tabletGeo = useMemo(() => new THREE.BoxGeometry(0.2, 0.128, 0.012), []);
    const tabletTex = useMemo(() => makeTabletTexture(), []);
    const frameMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#f7f6f3', roughness: 0.42, metalness: 0.04, envMapIntensity: 0.55,
    }), []);
    const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#ffffff', roughness: 0.04, metalness: 0, transmission: 0.12,
        thickness: 0.01, transparent: true, opacity: 0.03, depthWrite: false,
    }), []);
    const glowMat = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const wash = ctx.createRadialGradient(128, 70, 10, 128, 140, 180);
        wash.addColorStop(0, '#fff1d2');
        wash.addColorStop(0.45, '#f3d2a4');
        wash.addColorStop(1, '#e4c49a');
        ctx.fillStyle = wash;
        ctx.fillRect(0, 0, 256, 256);
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        return new THREE.MeshStandardMaterial({
            color: '#fff6ea', map: tex, emissive: '#e8b56e', emissiveIntensity: 0.45, roughness: 0.72, metalness: 0,
        });
    }, []);
    const ledMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#fff4dc' }), []);
    const tabletMat = useMemo(() => new THREE.MeshBasicMaterial({ map: tabletTex }), [tabletTex]);

    useLayoutEffect(() => {
        const look = concept || CONCEPTS[0];
        frameMat.color.set(look.marble ? '#fbfaf7' : look.frame);
        frameMat.emissive.set(look.marble ? '#fffaf4' : '#000000');
        frameMat.emissiveIntensity = look.marble ? 0.12 : 0;
        frameMat.metalness = look.marble ? 0.04 : Math.max(look.metal, 0.35);
        frameMat.roughness = look.marble ? 0.38 : look.rough;
        frameMat.envMapIntensity = look.marble ? 0.55 : 0.8;
        glowMat.color.set(look.marble ? '#f8e6cc' : look.wall);
        glowMat.emissive.set(look.marble ? '#e8c49a' : '#000000');
        glowMat.emissiveIntensity = look.marble ? 0.32 : 0.15;
        ledMat.color.set(look.marble ? '#fff6e2' : look.light);
        syncNicheFrames();
    }, [slots, hover, selectedId, focusIndex, concept, frameMat, glowMat, ledMat]);

    const syncNicheFrames = () => {
        const dim = new THREE.Color('#e4ddd4');
        const base = new THREE.Color('#ffffff');
        const hot = new THREE.Color('#fff4cc');
        const focused = focusIndex >= 0;
        writeInstances(frame.current, slots, hover, selectedId, (slot, on, i) => {
            if (i === focusIndex) return hot;
            if (focused) return dim;
            return on ? hot : base;
        }, (i) => (i === focusIndex ? bus.nicheScale : 1));
        const dummy = new THREE.Object3D();
        const paint = (mesh, local) => {
            if (!mesh) return;
            slots.forEach((slot, i) => {
                const scale = i === focusIndex ? bus.nicheScale : 1;
                placeLocal(dummy, slot, local, scale);
                mesh.setMatrixAt(i, dummy.matrix);
            });
            mesh.instanceMatrix.needsUpdate = true;
        };
        paint(glass.current, [0, 0, 0.2]);
        paint(glow.current, [0, 0, 0]);
        paint(led.current, [0, CELL_H * 0.28, 0.02]);
        if (tablet.current) {
            slots.forEach((slot, i) => {
                const scale = i === focusIndex ? bus.nicheScale : 1;
                const side = slot.c % 2 === 0 ? -0.2 : 0.2;
                placeLocal(dummy, slot, [side, -0.16, 0.175], scale);
                tablet.current.setMatrixAt(i, dummy.matrix);
            });
            tablet.current.instanceMatrix.needsUpdate = true;
        }
    };

    useFrame(() => {
        syncNicheFrames();
    });

    const pick = (event, fire) => {
        event.stopPropagation();
        const index = event.instanceId;
        if (index == null || !slots[index]) return;
        if (fire) {
            if (bus.suppressClick) return;
            onSelect(slots[index]);
        } else onHover(index);
    };

    const glassHandlers = ghost ? { raycast: () => null } : {
        onPointerDown: () => { bus.pressed = true; },
        onPointerUp: () => { bus.pressed = false; },
        onPointerMove: (event) => pick(event, false),
        onPointerOut: () => { onHover(-1); bus.pressed = false; },
        onClick: (event) => pick(event, true),
    };
    return h('group', { position: [0, 0, shiftZ || 0] },
        h('instancedMesh', {
            ref: frame,
            args: [frameGeo, frameMat, count],
            castShadow: true,
            receiveShadow: true,
            raycast: () => null,
        }),
        h('instancedMesh', {
            ref: glow,
            args: [glowGeo, glowMat, count],
            raycast: () => null,
        }),
        h('instancedMesh', {
            ref: led,
            args: [ledGeo, ledMat, count],
            raycast: () => null,
        }),
        h('instancedMesh', {
            ref: tablet,
            args: [tabletGeo, tabletMat, count],
            raycast: () => null,
        }),
        h('instancedMesh', {
            ref: glass,
            args: [glassGeo, glassMat, count],
            ...glassHandlers,
        })
    );
}

function makeCeramicTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const wash = ctx.createLinearGradient(0, 0, 512, 0);
    wash.addColorStop(0, '#efe6d8');
    wash.addColorStop(0.45, '#fffaf3');
    wash.addColorStop(1, '#e6dccb');
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(42, 36, 30, 0.78)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let col = 0; col < 4; col += 1) {
        const x = 86 + col * 96;
        let y = 150;
        ctx.lineWidth = 3.2;
        for (let stroke = 0; stroke < 6; stroke += 1) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x + 14, y + 18, x - 6, y + 34);
            ctx.stroke();
            y += 42;
        }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 8;
    return tex;
}

function UrnGrid({ slots, concept, shiftZ }) {
    const gltf = useGLTF(URN_URL, DRACO_DECODER);
    const parts = useMemo(() => {
        const list = [];
        gltf.scene.traverse((obj) => {
            if (!obj.isMesh || !obj.geometry) return;
            const label = (obj.name || '') + ' ' + ((obj.material && obj.material.name) || '');
            list.push({ geometry: obj.geometry, gold: /trim|gold/i.test(label) });
        });
        return list;
    }, [gltf]);
    const ceramicMap = useMemo(() => makeCeramicTexture(), []);
    const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#fffaf4', map: ceramicMap, roughness: 0.38, metalness: 0.02, clearcoat: 0.28, clearcoatRoughness: 0.35, envMapIntensity: 0.7,
    }), [ceramicMap]);
    const goldMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#e6c36a', roughness: 0.18, metalness: 0.94, clearcoat: 0.35, envMapIntensity: 1.5,
    }), []);
    const refs = useRef([]);

    useLayoutEffect(() => {
        const look = concept || CONCEPTS[0];
        bodyMat.color.set(look.marble ? '#fffaf4' : look.urn);
        bodyMat.emissive.set(look.marble ? '#fff3e0' : '#fffaf6');
        bodyMat.emissiveIntensity = look.marble ? 0.06 : 0.04;
        bodyMat.metalness = look.marble ? 0.02 : look.urnMetal;
        bodyMat.roughness = look.marble ? 0.48 : look.urnRough;
        bodyMat.clearcoat = look.marble ? 0.12 : 0.45;
        goldMat.color.set(look.marble ? '#cbb89a' : look.trim);
        goldMat.metalness = look.marble ? 0.12 : 0.75;
        goldMat.roughness = look.marble ? 0.55 : 0.22;
        const creams = ['#f7f1e4', '#efe2ce', '#f4ead8', '#e6d7c2', '#fbf6ee', '#e9dcc8'];
        const dummy = new THREE.Object3D();
        parts.forEach((part, index) => {
            const mesh = refs.current[index];
            if (!mesh) return;
            slots.forEach((slot, i) => {
                const scale = 0.5 + ((i * 5) % 4) * 0.02;
                const nudge = ((i % 3) - 1) * 0.03;
                placeLocal(dummy, slot, [nudge, -0.2, 0.02], scale);
                mesh.setMatrixAt(i, dummy.matrix);
                if (!part.gold) mesh.setColorAt(i, new THREE.Color(look.marble ? creams[i % creams.length] : look.urn));
            });
            mesh.instanceMatrix.needsUpdate = true;
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        });
    }, [slots, parts, concept, bodyMat, goldMat]);

    if (!parts.length) return null;
    return h('group', { position: [0, 0, shiftZ || 0] }, parts.map((part, index) => h('instancedMesh', {
        key: part.gold ? 'trim' : 'body',
        ref: (node) => { refs.current[index] = node; },
        args: [part.geometry, part.gold ? goldMat : bodyMat, Math.max(slots.length, 1)],
        castShadow: true,
        receiveShadow: true,
        raycast: () => null,
    })));
}

function Nameplate({ slot }) {
    if (!slot) return null;
    const label = slot.occupied ? personName(slot.cell) : '분양 가능';
    const status = slot.occupied ? (slot.isPublic ? '공개 추모관' : '안치 중') : '즉시 분양 가능';
    const pos = slot.position.clone();
    pos.y += 0.48;
    return h(Html, { position: pos, center: true, distanceFactor: 6, zIndexRange: [20, 0] },
        h('div', { className: 's1-nameplate' },
            h('em', null, status + ' · ' + slot.id),
            h('strong', null, label)
        )
    );
}

function CorridorMarks() {
    return h('group', null,
        h(Text, {
            position: [-1.15, 0.02, 1.4],
            rotation: [-Math.PI / 2, 0, 0],
            fontSize: 0.28,
            color: '#b08968',
            anchorX: 'center',
            anchorY: 'middle',
        }, 'A'),
        h(Text, {
            position: [1.15, 0.02, 1.4],
            rotation: [-Math.PI / 2, 0, 0],
            fontSize: 0.28,
            color: '#b08968',
            anchorX: 'center',
            anchorY: 'middle',
        }, 'B')
    );
}

function propGeometry(kind) {
    if (kind === 'flower' || kind === 'angel') return new THREE.SphereGeometry(0.055, 10, 10);
    if (kind === 'plant') return new THREE.ConeGeometry(0.05, 0.16, 6);
    if (kind === 'candle' || kind === 'pen' || kind === 'bowl') return new THREE.CylinderGeometry(0.03, 0.035, 0.09, 10);
    return new THREE.BoxGeometry(0.09, 0.045, 0.11);
}

function ConceptProps({ slots, concept }) {
    const geo = useMemo(() => propGeometry(concept && concept.prop), [concept]);
    const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f4efe6', roughness: 0.45 }), []);
    const ref = useRef(null);
    useLayoutEffect(() => {
        const mesh = ref.current;
        if (!mesh || !concept || concept.prop === 'none') return;
        mat.color.set(concept.trim);
        const dummy = new THREE.Object3D();
        slots.forEach((slot, i) => {
            dummy.position.copy(slot.position);
            dummy.quaternion.copy(slot.quaternion);
            const shift = new THREE.Vector3(0.16, -CELL_H * 0.2, 0.04).applyQuaternion(slot.quaternion);
            dummy.position.add(shift);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
    }, [slots, concept, mat]);
    if (!concept || concept.prop === 'none') return null;
    return h('instancedMesh', {
        ref,
        args: [geo, mat, Math.max(slots.length, 1)],
        castShadow: true,
        receiveShadow: true,
    });
}

function makeMarbleTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f4f1eb';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 70; i += 1) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = 70 + Math.random() * 180;
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, 'rgba(214, 206, 196, 0.28)');
        g.addColorStop(1, 'rgba(244, 241, 235, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let v = 0; v < 9; v += 1) {
        ctx.strokeStyle = 'rgba(176, 168, 156, ' + (0.18 + Math.random() * 0.16) + ')';
        ctx.lineWidth = 0.8 + Math.random() * 1.4;
        ctx.beginPath();
        let x = Math.random() * size;
        let y = -20;
        ctx.moveTo(x, y);
        while (y < size + 40) {
            const nx = x + (Math.random() - 0.5) * 90;
            const ny = y + 70 + Math.random() * 80;
            ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 40, y + 30, nx, ny);
            x = nx;
            y = ny;
        }
        ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
}

function Room({ concept }) {
    const look = concept || CONCEPTS[0];
    const floorTex = useMemo(() => {
        const tex = makeMarbleTexture();
        tex.repeat.set(2.2, 2.8);
        return tex;
    }, []);
    const wallTex = useMemo(() => {
        const tex = floorTex.clone();
        tex.repeat.set(1.4, 1.1);
        tex.needsUpdate = true;
        return tex;
    }, [floorTex]);
    const floorMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#ffffff', roughness: 0.16, metalness: 0.04, clearcoat: 0.92, clearcoatRoughness: 0.16, envMapIntensity: 1.15,
    }), []);
    const wallMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#ffffff', roughness: 0.34, metalness: 0.02, clearcoat: 0.28, clearcoatRoughness: 0.3, envMapIntensity: 0.55,
    }), []);
    useLayoutEffect(() => {
        floorMat.color.set(look.marble ? '#f6f6f4' : look.floor);
        floorMat.map = look.marble ? null : null;
        floorMat.roughness = look.marble ? 0.07 : Math.max(0.22, look.rough);
        floorMat.metalness = look.marble ? 0.02 : look.metal * 0.25;
        floorMat.clearcoat = look.marble ? 1 : 0.05;
        floorMat.clearcoatRoughness = look.marble ? 0.08 : 0.4;
        floorMat.needsUpdate = true;
        wallMat.color.set(look.marble ? '#fbfaf8' : look.wall);
        wallMat.map = null;
        wallMat.emissive = wallMat.emissive || new THREE.Color();
        wallMat.emissive.set(look.marble ? '#fffdf8' : '#000000');
        wallMat.emissiveIntensity = look.marble ? 0.55 : 0;
        wallMat.roughness = look.marble ? 0.72 : Math.min(0.92, look.rough + 0.08);
        wallMat.clearcoat = 0;
        wallMat.needsUpdate = true;
    }, [look, floorMat, wallMat, floorTex, wallTex]);

    return h('group', null,
        look.marble
            ? h('mesh', { rotation: [-Math.PI / 2, 0, 0], position: [0, 0.002, -4.6], receiveShadow: true },
                h('planeGeometry', { args: [7.2, 22] }),
                h(MeshReflectorMaterial, {
                    blur: [280, 80],
                    resolution: 1024,
                    mixBlur: 0.85,
                    mixStrength: 1.6,
                    roughness: 0.22,
                    depthScale: 1.05,
                    minDepthThreshold: 0.25,
                    maxDepthThreshold: 1.3,
                    color: '#f4f4f2',
                    metalness: 0.55,
                    mirror: 0.85,
                })
            )
            : h('mesh', { rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0.15], receiveShadow: true, material: floorMat },
                h('planeGeometry', { args: [6.2, 7.2, 12, 12] })
            ),
        h('mesh', { position: [0, 4.15, look.marble ? -4.6 : -2.2], rotation: [Math.PI / 2, 0, 0], material: wallMat },
            h('planeGeometry', { args: [7.2, look.marble ? 22 : 16, 8, 8] })
        ),
        h('mesh', { position: [-2.72, 2.05, look.marble ? -4.6 : -2.2], material: wallMat },
            h('boxGeometry', { args: [0.12, 4.15, look.marble ? 22 : 16] })
        ),
        h('mesh', { position: [2.72, 2.05, look.marble ? -4.6 : -2.2], material: wallMat },
            h('boxGeometry', { args: [0.12, 4.15, look.marble ? 22 : 16] })
        ),
        h('mesh', { position: [0, 2.05, look.marble ? -13.2 : -9.2], material: wallMat },
            h('boxGeometry', { args: [5.6, 4.15, 0.12] })
        ),
        ...(look.marble ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => h('mesh', {
            key: 'spot-' + i,
            position: [0, 4.135, 2.8 - i * 1.25],
            rotation: [Math.PI / 2, 0, 0],
        },
            h('circleGeometry', { args: [0.07, 24] }),
            h('meshBasicMaterial', { color: '#fffdf8' })
        )) : [
            h('mesh', { key: 'sky', position: [0, 4.08, -2.2] },
                h('boxGeometry', { args: [1.15, 0.04, 12] }),
                h('meshStandardMaterial', { color: '#f7f6f3', emissive: '#fffaf4', emissiveIntensity: 0.15, roughness: 0.6 })
            ),
        ])
    );
}

function springToward(value, velocity, goal, dt, stiffness, damping) {
    const forceX = (goal.x - value.x) * stiffness;
    const forceY = (goal.y - value.y) * stiffness;
    const forceZ = (goal.z - value.z) * stiffness;
    velocity.x += (forceX - velocity.x * damping) * dt;
    velocity.y += (forceY - velocity.y * damping) * dt;
    velocity.z += (forceZ - velocity.z * damping) * dt;
    value.x += velocity.x * dt;
    value.y += velocity.y * dt;
    value.z += velocity.z * dt;
}

function poseFor(index, slots) {
    if (index < 0 || !slots[index]) {
        return {
            pos: new THREE.Vector3(0, 1.52, 4.35),
            target: new THREE.Vector3(0, 1.05, -6.5),
        };
    }
    const slot = slots[index];
    const side = slot.position.x > 0 ? 1 : -1;
    const eye = Math.min(Math.max(slot.position.y, 1.2), 1.85);
    const pos = new THREE.Vector3(side * 0.28, eye, slot.position.z + 2.45);
    return { pos, target: slot.position.clone() };
}

function GuidedCamera({ focusIndex }) {
    const { camera, gl } = useThree();
    const pos = useRef(new THREE.Vector3(0, 1.52, 4.35));
    const target = useRef(new THREE.Vector3(0, 1.05, -6.5));
    const velP = useRef(new THREE.Vector3());
    const velT = useRef(new THREE.Vector3());

    useEffect(() => {
        const el = gl.domElement;
        let startX = 0;
        let startY = 0;
        let tracking = false;
        const down = (event) => {
            if (event.button != null && event.button !== 0) return;
            tracking = true;
            startX = event.clientX;
            startY = event.clientY;
        };
        const up = (event) => {
            if (!tracking) return;
            tracking = false;
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;
            if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
            bus.suppressClick = true;
            const count = bus.slots.length;
            if (!count || !bus.focusTo) return;
            const dir = dx < 0 ? 1 : -1;
            const current = bus.focusIndex;
            const next = current < 0 ? (dir > 0 ? 0 : count - 1) : (current + dir + count) % count;
            bus.focusTo(next);
            window.setTimeout(() => { bus.suppressClick = false; }, 320);
        };
        el.addEventListener('pointerdown', down);
        el.addEventListener('pointerup', up, true);
        return () => {
            el.removeEventListener('pointerdown', down);
            el.removeEventListener('pointerup', up, true);
        };
    }, [gl]);

    useFrame((_, rawDt) => {
        const dt = Math.min(rawDt || 0.016, 0.033);
        const pose = poseFor(focusIndex, bus.slots);
        springToward(pos.current, velP.current, pose.pos, dt, 78, 16);
        springToward(target.current, velT.current, pose.target, dt, 78, 16);
        camera.position.copy(pos.current);
        camera.lookAt(target.current);
        const goal = bus.pressed ? 0.9 : (focusIndex >= 0 ? 1.06 : 1);
        const force = (goal - bus.nicheScale) * 280;
        bus.nicheVel += (force - bus.nicheVel * 24) * dt;
        bus.nicheScale += bus.nicheVel * dt;
        gl.toneMappingExposure = focusIndex >= 0 ? 1.02 : 1.18;
    });
    return null;
}

class ModelBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { failed: false };
    }
    static getDerivedStateFromError() {
        return { failed: true };
    }
    render() {
        if (this.state.failed) return null;
        return this.props.children;
    }
}

function HeroCase() {
    const gltf = useGLTF(URN_URL, DRACO_DECODER);
    const screen = useMemo(() => makeKioskTexture(), []);
    const label = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 96;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fbfaf7';
        ctx.fillRect(0, 0, 512, 96);
        ctx.fillStyle = '#2a2e33';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '600 40px "Malgun Gothic", "Noto Sans KR", sans-serif';
        ctx.fillText('세종 이루소 봉안당', 256, 48);
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }, []);
    const urn = useMemo(() => {
        const copy = gltf.scene.clone(true);
        copy.traverse((obj) => {
            if (obj.isMesh) obj.raycast = () => null;
        });
        return copy;
    }, [gltf]);
    return h('group', { position: [0, 0, -1.15] },
        h('mesh', { position: [0, 1.12, 0], castShadow: true, receiveShadow: true },
            h('boxGeometry', { args: [0.62, 2.24, 0.36] }),
            h('meshStandardMaterial', { color: '#fbfaf7', roughness: 0.46, metalness: 0.03 })
        ),
        h('mesh', { position: [0, 1.28, 0.168] },
            h('boxGeometry', { args: [0.46, 0.78, 0.02] }),
            h('meshBasicMaterial', { color: '#121820' })
        ),
        h('mesh', { position: [0, 1.28, 0.182] },
            h('planeGeometry', { args: [0.42, 0.72] }),
            h('meshBasicMaterial', { map: screen })
        ),
        h('mesh', { position: [0, 2.08, 0.185] },
            h('planeGeometry', { args: [0.5, 0.09] }),
            h('meshBasicMaterial', { map: label })
        ),
        h('primitive', { object: urn, position: [0, -2, 0], scale: 0.001 })
    );
}

function HallEnv() {
    const { gl, scene } = useThree();
    useEffect(() => {
        const pmrem = new THREE.PMREMGenerator(gl);
        const env = new THREE.Scene();
        env.add(new THREE.HemisphereLight('#fffdf8', '#f0e6d6', 1.6));
        const fill = new THREE.DirectionalLight('#fffaf2', 3.4);
        fill.position.set(0, 8, 1);
        env.add(fill);
        const sky = new THREE.Mesh(
            new THREE.PlaneGeometry(8, 6),
            new THREE.MeshBasicMaterial({ color: '#fffaf4' })
        );
        sky.position.set(0, 4.2, 0);
        sky.rotation.x = Math.PI / 2;
        env.add(sky);
        const target = pmrem.fromScene(env, 0.04);
        scene.environment = target.texture;
        return () => {
            target.dispose();
            pmrem.dispose();
        };
    }, [gl, scene]);
    return null;
}

function showSheet(slot) {
    const root = document.getElementById('columbarium-template-root');
    if (!root) return;
    const sheet = root.querySelector('[data-sheet]');
    const start = root.querySelector('[data-tour-start]');
    const stage = root.querySelector('.s1-stage');
    if (!sheet) return;
    if (!slot) {
        sheet.hidden = true;
        if (start) start.hidden = false;
        if (stage) stage.classList.remove('is-focused');
        return;
    }
    sheet.hidden = false;
    if (start) start.hidden = true;
    if (stage) stage.classList.add('is-focused');
    const kicker = sheet.querySelector('[data-sheet-kicker]');
    const title = sheet.querySelector('[data-sheet-title]');
    const body = sheet.querySelector('[data-sheet-body]');
    if (kicker) kicker.textContent = roomLabel(slot.cell, slot.r, slot.c);
    if (title) title.textContent = slot.occupied ? personName(slot.cell) : '분양 가능';
    if (body) {
        body.textContent = slot.occupied
            ? (slot.isPublic ? '공개 추모관입니다. 좌우로 넘기면 옆 호실입니다.' : '안치된 호실입니다. 좌우로 넘기면 옆 호실입니다.')
            : '이 호실은 분양 상담으로 이어갈 수 있습니다. 좌우로 넘기면 옆 호실입니다.';
    }
}

function Scene({ snap, onSelect, concept }) {
    const [hover, setHover] = useState(-1);
    const [focusIndex, setFocusIndex] = useState(-1);
    const slots = useMemo(() => buildSlots(snap), [snap]);
    const selected = snap && snap.selected;
    const selectedId = selected ? cellId(
        snap.cells && snap.cells[selected.r + '-' + selected.c],
        selected.r,
        selected.c,
        snap.zone,
        snap.floor
    ) : '';

    useEffect(() => {
        bus.slots = slots;
        bus.focusTo = (index) => {
            if (!slots.length) return;
            const wrapped = ((index % slots.length) + slots.length) % slots.length;
            bus.focusIndex = wrapped;
            setFocusIndex(wrapped);
            const slot = slots[wrapped];
            showSheet(slot);
            if (onSelect) onSelect(slot);
            const panel = document.getElementById('columbInfoPanel');
            if (panel) panel.style.display = 'none';
        };
        bus.clearFocus = () => {
            bus.focusIndex = -1;
            setFocusIndex(-1);
            showSheet(null);
        };
    }, [slots, onSelect]);

    return h(React.Fragment, null,
        h('color', { attach: 'background', args: [(concept || CONCEPTS[0]).marble ? '#f7f6f3' : (concept || CONCEPTS[0]).wall] }),
        h(HallEnv),
        (concept || CONCEPTS[0]).marble ? null : h('fog', { attach: 'fog', args: [(concept || CONCEPTS[0]).wall, 14, 28] }),
        h('hemisphereLight', { args: ['#fffefb', '#f3ece3', (concept || CONCEPTS[0]).marble ? 0.72 : 0.4] }),
        h('ambientLight', { color: '#fffaf4', intensity: (concept || CONCEPTS[0]).marble ? 0.38 : (concept || CONCEPTS[0]).amb }),
        h('directionalLight', {
            position: [0.2, 7.2, 3.4],
            intensity: (concept || CONCEPTS[0]).marble ? 0.85 : 0.45,
            color: (concept || CONCEPTS[0]).light,
            castShadow: false,
            'shadow-mapSize-width': 2048,
            'shadow-mapSize-height': 2048,
            'shadow-camera-near': 0.5,
            'shadow-camera-far': 24,
            'shadow-camera-left': -6,
            'shadow-camera-right': 6,
            'shadow-camera-top': 6,
            'shadow-camera-bottom': -6,
            'shadow-bias': -0.0008,
            'shadow-normalBias': 0.04,
        }),
        (concept || CONCEPTS[0]).marble
            ? h(React.Fragment, null,
                h('pointLight', { position: [-1.15, 2.35, 1.2], color: '#fff1dc', intensity: 0.7, distance: 5.5, decay: 2 }),
                h('pointLight', { position: [1.15, 2.35, 0.2], color: '#fff1dc', intensity: 0.7, distance: 5.5, decay: 2 }),
                h('pointLight', { position: [-1.15, 2.35, -2.4], color: '#ffe6c4', intensity: 0.55, distance: 5.5, decay: 2 }),
                h('pointLight', { position: [1.15, 2.35, -4.6], color: '#ffe6c4', intensity: 0.55, distance: 5.5, decay: 2 })
            )
            : h('pointLight', { position: [0, 3.4, 0.2], color: '#ffe3bf', intensity: (concept || CONCEPTS[0]).spot, distance: 12 }),
        h(Room, { concept }),
        h(ModelBoundary, null, h(React.Suspense, { fallback: null }, h(HeroCase))),
        (concept || CONCEPTS[0]).marble ? null : h(CorridorMarks),
        h(NicheGrid, {
            slots,
            hover,
            selectedId,
            focusIndex,
            onHover: setHover,
            onSelect: (slot) => {
                const index = slots.findIndex((item) => item.r === slot.r && item.c === slot.c);
                if (bus.focusTo) bus.focusTo(index);
            },
            concept,
        }),
        h(NicheGrid, { slots, hover: -1, selectedId: '', focusIndex: -1, onHover: () => {}, onSelect: () => {}, concept, ghost: true, shiftZ: -4.2 }),
        h(NicheGrid, { slots, hover: -1, selectedId: '', focusIndex: -1, onHover: () => {}, onSelect: () => {}, concept, ghost: true, shiftZ: -8.4 }),
        h(ModelBoundary, null, h(React.Suspense, { fallback: null }, h(UrnGrid, { slots, concept }))),
        h(ModelBoundary, null, h(React.Suspense, { fallback: null }, h(UrnGrid, { slots, concept, shiftZ: -4.2 }))),
        h(ModelBoundary, null, h(React.Suspense, { fallback: null }, h(UrnGrid, { slots, concept, shiftZ: -8.4 }))),
        h(ConceptProps, { slots, concept }),
        h(GuidedCamera, { focusIndex })
    );
}

function App() {
    const [snap, setSnap] = useState(bus.snap);
    const [conceptIndex, setConceptIndex] = useState(0);
    const concept = CONCEPTS[conceptIndex] || CONCEPTS[0];
    useEffect(() => {
        bus.render = (next) => setSnap(next);
        bus.setConcept = setConceptIndex;
        if (bus.snap) setSnap(bus.snap);
        return () => { bus.render = null; };
    }, []);
    const onSelect = (slot) => {
        if (!slot || !bus.api) return;
        bus.api.openCell(slot.r, slot.c);
        const root = document.getElementById('columbarium-template-root');
        if (root) {
            root.dispatchEvent(new CustomEvent('columbarium-cell', {
                bubbles: true,
                detail: { id: slot.id, row: slot.r, col: slot.c },
            }));
        }
    };
    return h(Canvas, {
        shadows: true,
        dpr: [1, 2],
        camera: { position: [0, 1.52, 4.35], fov: 42, near: 0.08, far: 80 },
        gl: { antialias: true, toneMapping: THREE.ACESFilmicToneMapping },
        onCreated: ({ gl }) => {
            gl.toneMappingExposure = 1.18;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
        },
    }, h(Scene, { snap, onSelect, concept }));
}

function paintDom(snap) {
    const root = document.getElementById('columbarium-template-root');
    if (!root || !snap) return;
    const facility = snap.facility || {};
    const nameEl = root.querySelector('[data-facility-name]');
    const addrEl = root.querySelector('[data-facility-address]');
    const phoneEl = root.querySelector('[data-facility-phone]');
    const vip = root.querySelector('[data-vip-label]');
    const seats = root.querySelector('[data-seat-count]');
    if (nameEl) nameEl.textContent = facility.name || '세종봉안당';
    if (addrEl) addrEl.textContent = facility.address || '';
    if (phoneEl) phoneEl.textContent = facility.phone || '';
    if (vip) vip.textContent = (facility.name || '봉안당') + ' 3D 복도';

    const cells = snap.cells || {};
    let occupied = 0;
    let total = 0;
    Object.keys(cells).forEach((key) => {
        const cell = cells[key];
        if (!cell || typeof cell.row !== 'number') return;
        total += 1;
        if (cell.occupied) occupied += 1;
    });
    if (!total) total = (snap.rows || 6) * (snap.cols || 10);
    if (seats) seats.textContent = '총 ' + total + '석 중 분양 가능 ' + Math.max(0, total - occupied) + '석';

    const grid = root.querySelector('[data-grid]');
    if (!grid) return;
    grid.innerHTML = '';
    const rows = snap.rows || 6;
    const cols = snap.cols || 10;
    for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
            const cell = cells[r + '-' + c] || { occupied: false };
            const btn = document.createElement('button');
            btn.type = 'button';
            const no = String(r + 1).padStart(2, '0') + String(c + 1).padStart(2, '0');
            if (cell.occupied) {
                btn.className = 's1-cell is-used';
                btn.textContent = String(cell.deceased_name || cell.name || no).slice(0, 6);
            } else {
                btn.className = 's1-cell is-open';
                btn.textContent = no;
            }
            if (snap.selected && snap.selected.r === r && snap.selected.c === c) btn.classList.add('is-selected');
            btn.addEventListener('click', () => {
                if (bus.api) bus.api.openCell(r, c);
            });
            grid.appendChild(btn);
        }
    }
}

function mount(api) {
    bus.api = api;
    const root = document.getElementById('columbarium-template-root');
    if (!root) return;
    const tour = root.querySelector('[data-tour]');
    const gridWrap = root.querySelector('[data-grid-wrap]');
    const conceptSelect = root.querySelector('[data-concept]');
    if (conceptSelect && !conceptSelect.options.length) {
        CONCEPTS.forEach((item, index) => {
            const opt = document.createElement('option');
            opt.value = String(index);
            opt.textContent = '컨셉 ' + (index + 1) + ' · ' + item.name;
            conceptSelect.appendChild(opt);
        });
        conceptSelect.addEventListener('change', () => {
            const index = Number(conceptSelect.value) || 0;
            if (bus.setConcept) bus.setConcept(index);
        });
    }
    root.querySelectorAll('[data-mode]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const mode = btn.getAttribute('data-mode');
            root.querySelectorAll('[data-mode]').forEach((el) => el.classList.toggle('is-on', el === btn));
            if (tour) tour.classList.toggle('is-hidden', mode !== '3d');
            if (gridWrap) gridWrap.classList.toggle('is-hidden', mode !== '2d');
        });
    });
    const startTour = root.querySelector('[data-tour-start]');
    if (startTour) {
        startTour.addEventListener('click', () => {
            if (bus.focusTo) bus.focusTo(Math.min(32, bus.slots.length - 1));
        });
    }
    const closeSheet = root.querySelector('[data-sheet-close]');
    if (closeSheet) {
        closeSheet.addEventListener('click', () => {
            if (bus.clearFocus) bus.clearFocus();
        });
    }
    root.querySelectorAll('[data-step]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const dir = Number(btn.getAttribute('data-step')) || 1;
            const count = bus.slots.length;
            if (!count || !bus.focusTo) return;
            const current = bus.focusIndex < 0 ? 0 : bus.focusIndex;
            bus.focusTo((current + dir + count) % count);
        });
    });
    const sheetConsult = root.querySelector('[data-sheet-consult]');
    if (sheetConsult) {
        sheetConsult.addEventListener('click', () => {
            const slot = bus.slots[bus.focusIndex];
            if (!slot || !bus.api) return;
            bus.api.openCell(slot.r, slot.c);
            const consult = document.querySelector('#columbInfoContent [data-columb-consult]');
            if (consult) consult.click();
        });
    }
    root.querySelectorAll('[data-view]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            root.querySelectorAll('[data-view]').forEach((el) => {
                el.classList.toggle('is-on', el.getAttribute('data-view') === view);
            });
            bus.preset = view;
            bus._jump = true;
        });
    });
    root.querySelectorAll('[data-zoom]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const controls = bus.controls;
            if (!controls) return;
            const mode = btn.getAttribute('data-zoom');
            if (mode === 'reset') {
                bus.preset = 'all';
                bus._jump = true;
                return;
            }
            const offset = new THREE.Vector3().subVectors(controls.object.position, controls.target);
            const dist = THREE.MathUtils.clamp(
                offset.length() + (Number(mode) > 0 ? -0.7 : 0.7),
                controls.minDistance,
                controls.maxDistance
            );
            offset.setLength(dist);
            controls.object.position.copy(controls.target).add(offset);
            controls.update();
        });
    });
    const audioBtn = root.querySelector('[data-audio]');
    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            const on = audioBtn.getAttribute('data-on') === '1';
            audioBtn.setAttribute('data-on', on ? '0' : '1');
            const icon = audioBtn.querySelector('[data-audio-icon]');
            const label = audioBtn.querySelector('[data-audio-label]');
            if (icon) icon.textContent = on ? 'volume_off' : 'volume_up';
            if (label) label.textContent = on ? '앰비언스 OFF' : '앰비언스 ON';
        });
    }
    const full = root.querySelector('[data-full]');
    if (full && tour) {
        full.addEventListener('click', () => {
            if (!document.fullscreenElement && tour.requestFullscreen) tour.requestFullscreen();
            else if (document.exitFullscreen) document.exitFullscreen();
        });
    }
    const consult = root.querySelector('[data-consult]');
    if (consult) {
        consult.addEventListener('click', () => {
            const cells = (bus.snap && bus.snap.cells) || {};
            const key = Object.keys(cells).find((name) => cells[name] && cells[name].occupied === false && typeof cells[name].row === 'number');
            if (key && bus.api) {
                const [r, c] = key.split('-').map(Number);
                bus.api.openCell(r, c);
            } else {
                document.getElementById('cyber-apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
}

function update(snap) {
    bus.snap = snap;
    paintDom(snap);
    if (bus.render) bus.render(snap);
}

const host = document.querySelector('#columbarium-template-root [data-webgl]');
if (host) createRoot(host).render(h(App));

window.ErusoColumbariumTemplate = {
    id: 1,
    usesCanvas: false,
    mount,
    update,
};
