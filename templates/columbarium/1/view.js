import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, MeshReflectorMaterial, Text, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const DRACO_DECODER = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';
const URN_URL = 'templates/columbarium/1/models/urn.glb?v=ceramic2';
const KIOSK_FONT = 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@5.2.8/korean-700-normal.ttf';
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
    ceilingOn: true,
    setCeilingOn: null,
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

function resolveApiBase() {
    const host = (location.hostname || '').toLowerCase();
    const isLocal = !host
        || host === 'localhost'
        || host === '127.0.0.1'
        || host === '[::1]'
        || host.endsWith('.local')
        || /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
    const qs = new URLSearchParams(location.search).get('api');
    if (qs === 'prod') return 'https://api.erum2026.co.kr';
    if (qs === 'local' || isLocal) return 'http://localhost:1210';
    const meta = document.querySelector('meta[name="eruso-api-base"]');
    return ((meta && meta.getAttribute('content')) || 'https://api.erum2026.co.kr').replace(/\/$/, '');
}

function slotsFromPayload(payload, zone, floor) {
    const cells = {};
    (payload.cells || []).forEach((cell) => {
        const r = (Number(cell.row) || 1) - 1;
        const c = (Number(cell.col) || 1) - 1;
        cells[r + '-' + c] = {
            id: cell.cell_code || null,
            row: Number(cell.row) || (r + 1),
            col: Number(cell.col) || (c + 1),
            zone,
            floor,
            occupied: !!cell.occupied,
            name: cell.name || cell.memorial_name || null,
            deceased_name: cell.deceased_name || cell.name || cell.memorial_name || null,
            title: cell.title || null,
            is_public: cell.is_public === true,
            image_url: cell.image_url || null,
            birth: cell.birth || null,
            death: cell.death || null,
            href: cell.href || null,
            view_path: cell.view_path || null,
            login_path: cell.login_path || null,
            columbarium_name: cell.columbarium_name || null,
            columbarium_kind: cell.columbarium_kind || null,
            price: cell.price || null,
            memorial_room_id: cell.memorial_room_id || null,
        };
    });
    return buildSlots({ cells, zone, floor, rows: 6, cols: 10 });
}

function useHallFloors(snap) {
    const zone = (snap && snap.zone) || 'A';
    const floor = String((snap && snap.floor) || '1');
    const [packs, setPacks] = useState(() => ({
        1: buildSlots(snap && String(snap.floor) === '1' ? snap : null),
        2: buildSlots(snap && String(snap.floor) === '2' ? snap : null),
        3: buildSlots(snap && String(snap.floor) === '3' ? snap : null),
    }));
    useEffect(() => {
        let cancel = false;
        const base = resolveApiBase();
        const facilityKey = (snap && snap.facility && snap.facility.id) || 'sejong-columbarium';
        const filterName = facilityKey === 'sejong-columbarium'
            ? '세종봉안당'
            : ((snap && snap.facility && snap.facility.name) || '세종봉안당');
        Promise.all(['1', '2', '3'].map((level) => fetch(
            base + '/api/memorial-rooms/columbarium-layout?zone='
            + encodeURIComponent(zone) + '&floor=' + level + '&cols=10&rows=6&facility_key='
            + encodeURIComponent(facilityKey) + '&facility_name=' + encodeURIComponent(filterName)
        ).then((res) => {
            if (!res.ok) throw new Error(String(res.status));
            return res.json();
        }).then((payload) => [level, slotsFromPayload(payload, zone, level)]))).then((pairs) => {
            if (cancel) return;
            const next = { 1: [], 2: [], 3: [] };
            pairs.forEach(([level, slots]) => { next[level] = slots; });
            setPacks(next);
            const shown = next[floor] || [];
            const occupied = shown.filter((slot) => slot.occupied).length;
            const seats = document.querySelector('#columbarium-template-root [data-seat-count]');
            if (seats && shown.length) {
                seats.textContent = '총 ' + shown.length + '석 중 안치 ' + occupied + '석 · 분양 가능 ' + (shown.length - occupied) + '석';
            }
        }).catch(() => {});
        return () => { cancel = true; };
    }, [zone, floor]);
    return packs;
}

function hasPhoto(slot) {
    return !!(slot && slot.cell && slot.cell.image_url);
}

function mediaUrl(cell) {
    const raw = (cell && cell.image_url) || '';
    if (!raw) return '';
    if (/^https?:/i.test(raw)) return raw;
    return resolveApiBase() + (raw.charAt(0) === '/' ? raw : '/' + raw);
}

function makeNameTexture(label, image) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#141820';
    ctx.fillRect(0, 0, 256, 320);
    if (image && image.width) {
        const dw = 256;
        const dh = 248;
        const scale = Math.max(dw / image.width, dh / image.height);
        const w = image.width * scale;
        const hh = image.height * scale;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, dw, dh);
        ctx.clip();
        ctx.drawImage(image, (dw - w) / 2, (dh - hh) / 2, w, hh);
        ctx.restore();
    }
    ctx.fillStyle = '#141820';
    ctx.fillRect(0, 248, 256, 72);
    ctx.fillStyle = '#f7f3ec';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 36px "Malgun Gothic", "Noto Sans KR", sans-serif';
    ctx.fillText(String(label || '').replace(/^故\s*/, '').slice(0, 6), 128, 284);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
}

function PortraitPlate({ slot }) {
    const mesh = useRef(null);
    const label = personName(slot.cell);
    const [map, setMap] = useState(() => makeNameTexture(label, null));
    useEffect(() => {
        let dead = false;
        const url = mediaUrl(slot.cell);
        if (!url) return undefined;
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');
        loader.load(url, (photo) => {
            if (dead) {
                photo.dispose();
                return;
            }
            const next = makeNameTexture(label, photo.image);
            photo.dispose();
            setMap((prev) => {
                if (prev) prev.dispose();
                return next;
            });
        });
        return () => { dead = true; };
    }, [slot, label]);
    useLayoutEffect(() => {
        if (!mesh.current) return;
        const dummy = new THREE.Object3D();
        placeLocal(dummy, slot, [0.1, 0.02, 0.16], 1);
        mesh.current.position.copy(dummy.position);
        mesh.current.quaternion.copy(dummy.quaternion);
    }, [slot]);
    return h('mesh', { ref: mesh },
        h('planeGeometry', { args: [0.14, 0.18] }),
        h('meshBasicMaterial', { map, toneMapped: false })
    );
}

function PortraitPlates({ slots, shiftZ }) {
    const list = (slots || []).filter((slot) => hasPhoto(slot));
    if (!list.length) return null;
    return h('group', { position: [0, 0, shiftZ || 0] },
        list.map((slot) => h(PortraitPlate, {
            key: slot.id + '-' + slot.r + '-' + slot.c,
            slot,
        }))
    );
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
    const frameMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#f4f1ec', roughness: 0.34, metalness: 0.04, clearcoat: 0.35, clearcoatRoughness: 0.28, envMapIntensity: 0.85,
    }), []);
    const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#f4f8fb', roughness: 0.02, metalness: 0.08, transparent: true, opacity: 0.22,
        envMapIntensity: 1.35, depthWrite: false,
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
        frameMat.color.set(look.marble ? '#f4f1ec' : look.frame);
        frameMat.emissive.set('#000000');
        frameMat.emissiveIntensity = 0;
        frameMat.metalness = look.marble ? 0.04 : Math.max(look.metal, 0.35);
        frameMat.roughness = look.marble ? 0.32 : look.rough;
        frameMat.clearcoat = look.marble ? 0.4 : 0.08;
        frameMat.clearcoatRoughness = look.marble ? 0.22 : 0.4;
        frameMat.envMapIntensity = look.marble ? 0.9 : 0.8;
        glassMat.color.set(look.marble ? '#eef4f8' : '#ffffff');
        glassMat.opacity = look.marble ? 0.24 : 0.08;
        glassMat.metalness = look.marble ? 0.08 : 0;
        glassMat.roughness = 0.02;
        glassMat.envMapIntensity = look.marble ? 1.45 : 0.45;
        glowMat.color.set(look.marble ? '#fff1dc' : look.wall);
        glowMat.emissive.set(look.marble ? '#ffc98a' : '#000000');
        glowMat.emissiveIntensity = look.marble ? 0.55 : 0.15;
        glowMat.roughness = look.marble ? 0.9 : 0.72;
        ledMat.color.set(look.marble ? '#fff6e2' : look.light);
        syncNicheFrames();
    }, [slots, hover, selectedId, focusIndex, concept, frameMat, glassMat, glowMat, ledMat]);

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
                dummy.position.set(0, -30, 0);
                dummy.scale.set(0, 0, 0);
                dummy.updateMatrix();
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
    ctx.strokeStyle = 'rgba(70, 54, 40, 0.28)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let col = 0; col < 4; col += 1) {
        const x = 86 + col * 96;
        let y = 150;
        ctx.lineWidth = 2.2;
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

function UrnModel({ slot, source, bodyMat, goldMat }) {
    const root = useMemo(() => {
        const obj = source.clone(true);
        obj.traverse((child) => {
            if (!child.isMesh) return;
            const label = (child.name || '') + ' ' + ((child.material && child.material.name) || '');
            child.material = /trim|gold/i.test(label) ? goldMat : bodyMat;
            child.castShadow = true;
            child.frustumCulled = false;
        });
        return obj;
    }, [source, bodyMat, goldMat]);
    useLayoutEffect(() => {
        const dummy = new THREE.Object3D();
        placeLocal(dummy, slot, [-0.08, -0.17, 0.05], 1);
        root.position.copy(dummy.position);
        root.quaternion.copy(dummy.quaternion);
        root.scale.setScalar(0.45);
        root.visible = true;
    }, [slot, root]);
    return h('primitive', { object: root });
}

function UrnGrid({ slots, concept, shiftZ }) {
    const gltf = useGLTF(URN_URL, DRACO_DECODER);
    const ceramicMap = useMemo(() => makeCeramicTexture(), []);
    const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#f4ead8', map: ceramicMap, roughness: 0.08, metalness: 0.02, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.8, sheen: 0.35, sheenRoughness: 0.25, sheenColor: new THREE.Color('#fff4e4'),
    }), [ceramicMap]);
    const goldMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#c9b48a', roughness: 0.22, metalness: 0.82, clearcoat: 0.4, clearcoatRoughness: 0.18, envMapIntensity: 1.7,
    }), []);
    useLayoutEffect(() => {
        const look = concept || CONCEPTS[0];
        bodyMat.color.set(look.marble ? '#f4ead8' : look.urn);
        bodyMat.emissive.set(look.marble ? '#fff3e0' : '#fffaf6');
        bodyMat.emissiveIntensity = look.marble ? 0.04 : 0.04;
        bodyMat.metalness = look.marble ? 0.02 : look.urnMetal;
        bodyMat.roughness = look.marble ? 0.08 : look.urnRough;
        bodyMat.clearcoat = look.marble ? 1 : 0.45;
        bodyMat.clearcoatRoughness = look.marble ? 0.05 : 0.35;
        bodyMat.envMapIntensity = look.marble ? 1.8 : 0.7;
        goldMat.color.set(look.marble ? '#c9b48a' : look.trim);
        goldMat.metalness = look.marble ? 0.82 : 0.75;
        goldMat.roughness = 0.22;
        goldMat.envMapIntensity = look.marble ? 1.7 : 1.5;
    }, [concept, bodyMat, goldMat]);
    const list = (slots || []).filter((slot) => hasPhoto(slot));
    if (!list.length) return null;
    return h('group', { position: [0, 0, shiftZ || 0] }, list.map((slot) => h(UrnModel, {
        key: slot.id + '-' + slot.r + '-' + slot.c,
        slot,
        source: gltf.scene,
        bodyMat,
        goldMat,
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
            if (!slot.occupied) {
                dummy.position.set(0, -30, 0);
                dummy.scale.set(0, 0, 0);
                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
                return;
            }
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

function makePlasterRoughness() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
        const n = 150 + Math.random() * 70;
        img.data[i] = n;
        img.data[i + 1] = n;
        img.data[i + 2] = n;
        img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(5, 8);
    return tex;
}

function Room({ concept, ceilingOn }) {
    const look = concept || CONCEPTS[0];
    const ledOn = ceilingOn !== false;
    const plaster = useMemo(() => makePlasterRoughness(), []);
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
        floorMat.color.set(look.marble ? '#f7f4ee' : look.floor);
        floorMat.map = look.marble ? floorTex : null;
        floorMat.roughness = look.marble ? 0.28 : Math.max(0.22, look.rough);
        floorMat.metalness = look.marble ? 0.04 : look.metal * 0.25;
        floorMat.clearcoat = look.marble ? 0.65 : 0.05;
        floorMat.clearcoatRoughness = look.marble ? 0.18 : 0.4;
        floorMat.needsUpdate = true;
        wallMat.color.set(look.marble ? '#fbf7f1' : look.wall);
        wallMat.map = look.marble ? wallTex : null;
        wallMat.emissive = wallMat.emissive || new THREE.Color();
        wallMat.emissive.set(look.marble ? '#fffaf4' : '#000000');
        wallMat.emissiveIntensity = look.marble ? 0.02 : 0;
        wallMat.roughnessMap = look.marble ? plaster : null;
        wallMat.roughness = look.marble ? 0.72 : Math.min(0.92, look.rough + 0.08);
        wallMat.clearcoat = look.marble ? 0.08 : 0;
        wallMat.needsUpdate = true;
    }, [look, floorMat, wallMat, floorTex, wallTex, plaster]);

    return h('group', null,
        look.marble
            ? h('mesh', { rotation: [-Math.PI / 2, 0, 0], position: [0, 0.002, -4.6], receiveShadow: true },
                h('planeGeometry', { args: [7.2, 22] }),
                h(MeshReflectorMaterial, {
                    blur: [80, 20],
                    resolution: 512,
                    mixBlur: 0.06,
                    mixStrength: 1.7,
                    roughness: 0.035,
                    depthScale: 1.15,
                    minDepthThreshold: 0.15,
                    maxDepthThreshold: 1.3,
                    color: '#f3f1ee',
                    metalness: 0.04,
                    mirror: 0.96,
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
        ...(look.marble ? [
            h('mesh', { key: 'skylight', position: [0, 4.11, -4.6], rotation: [Math.PI / 2, 0, 0] },
                h('planeGeometry', { args: [0.78, 12] }),
                h('meshBasicMaterial', { color: ledOn ? '#c5e4ff' : '#1c1b19', toneMapped: false })
            ),
            h('mesh', { key: 'gold-left', position: [-2.55, 0.05, -4.6] },
                h('boxGeometry', { args: [0.04, 0.06, 18] }),
                h('meshStandardMaterial', { color: '#f7f4ef', roughness: 0.7, metalness: 0.02 })
            ),
            h('mesh', { key: 'gold-right', position: [2.55, 0.05, -4.6] },
                h('boxGeometry', { args: [0.04, 0.06, 18] }),
                h('meshStandardMaterial', { color: '#f7f4ef', roughness: 0.7, metalness: 0.02 })
            ),
        ].concat([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => h('mesh', {
            key: 'spot-' + i,
            position: [0, 4.135, 2.8 - i * 1.25],
            rotation: [Math.PI / 2, 0, 0],
        },
            h('circleGeometry', { args: [0.07, 24] }),
            h('meshBasicMaterial', { color: ledOn ? '#eef7ff' : '#1c1b19', toneMapped: false })
        ))) : [
            h('mesh', { key: 'sky', position: [0, 4.08, -2.2] },
                h('boxGeometry', { args: [1.15, 0.04, 12] }),
                h('meshStandardMaterial', {
                    color: ledOn ? '#c5e4ff' : '#6e6a64',
                    emissive: ledOn ? '#9fd4ff' : '#000000',
                    emissiveIntensity: ledOn ? 0.85 : 0,
                    roughness: 0.6,
                })
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
    const world = slot.position.clone();
    world.z += bus.focusDepth || 0;
    const side = world.x > 0 ? 1 : -1;
    const eye = Math.min(Math.max(world.y, 1.2), 1.85);
    const pos = new THREE.Vector3(side * 0.28, eye, world.z + 2.45);
    return { pos, target: world };
}

function clampNum(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function GuidedCamera({ focusIndex }) {
    const { camera, gl } = useThree();
    const pos = useRef(new THREE.Vector3(0, 1.52, 4.35));
    const target = useRef(new THREE.Vector3(0, 1.05, -6.5));
    const velP = useRef(new THREE.Vector3());
    const velT = useRef(new THREE.Vector3());
    const look = useRef({
        yaw: 0, pitch: 0, dolly: 0,
        aimYaw: 0, aimPitch: 0, aimDolly: 0,
    });
    const drag = useRef({ on: false, lx: 0, ly: 0, moved: 0 });
    const seenFocus = useRef(focusIndex);
    const tmp = useRef({
        dir: new THREE.Vector3(),
        right: new THREE.Vector3(),
        eye: new THREE.Vector3(),
        aim: new THREE.Vector3(),
        up: new THREE.Vector3(0, 1, 0),
        qYaw: new THREE.Quaternion(),
        qPitch: new THREE.Quaternion(),
    });

    useEffect(() => {
        const el = gl.domElement;
        el.style.cursor = 'grab';
        el.style.touchAction = 'none';
        const L = look.current;
        const D = drag.current;
        const down = (event) => {
            if (event.button != null && event.button !== 0) return;
            D.on = true;
            D.lx = event.clientX;
            D.ly = event.clientY;
            D.moved = 0;
            el.style.cursor = 'grabbing';
            if (el.setPointerCapture) el.setPointerCapture(event.pointerId);
        };
        const move = (event) => {
            if (!D.on) return;
            const rawX = event.clientX - D.lx;
            const rawY = event.clientY - D.ly;
            D.lx = event.clientX;
            D.ly = event.clientY;
            const dx = clampNum(rawX, -12, 12);
            const dy = clampNum(rawY, -12, 12);
            D.moved += Math.hypot(dx, dy);
            const lead = 0.16;
            L.aimYaw = clampNum(L.aimYaw + dx * 0.0017, L.yaw - lead, L.yaw + lead);
            L.aimPitch = clampNum(L.aimPitch + dy * 0.0011, L.pitch - lead * 0.65, L.pitch + lead * 0.65);
            L.aimYaw = clampNum(L.aimYaw, -0.48, 0.48);
            L.aimPitch = clampNum(L.aimPitch, -0.2, 0.16);
            if (D.moved > 10) bus.suppressClick = true;
        };
        const up = () => {
            if (!D.on) return;
            D.on = false;
            el.style.cursor = 'grab';
            window.setTimeout(() => { bus.suppressClick = false; }, 90);
        };
        const wheel = (event) => {
            event.preventDefault();
            const step = clampNum(event.deltaY, -70, 70) * 0.0007;
            L.aimDolly = clampNum(L.aimDolly + step, L.dolly - 0.24, L.dolly + 0.24);
            L.aimDolly = clampNum(L.aimDolly, -1.2, 1.4);
        };
        const leave = () => {};
        el.addEventListener('pointerdown', down);
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerup', up);
        el.addEventListener('pointercancel', up);
        el.addEventListener('pointerleave', leave);
        el.addEventListener('wheel', wheel, { passive: false });
        return () => {
            el.removeEventListener('pointerdown', down);
            el.removeEventListener('pointermove', move);
            el.removeEventListener('pointerup', up);
            el.removeEventListener('pointercancel', up);
            el.removeEventListener('pointerleave', leave);
            el.removeEventListener('wheel', wheel);
        };
    }, [gl]);

    useFrame((_, rawDt) => {
        const dt = Math.min(rawDt || 0.016, 0.033);
        const L = look.current;
        if (seenFocus.current !== focusIndex) {
            seenFocus.current = focusIndex;
            L.yaw = 0;
            L.pitch = 0;
            L.dolly = 0;
            L.aimYaw = 0;
            L.aimPitch = 0;
            L.aimDolly = 0;
        }
        const ease = (shown, aim, maxStep) => {
            const gap = aim - shown;
            return shown + clampNum(gap * 0.08, -maxStep, maxStep);
        };
        L.yaw = ease(L.yaw, L.aimYaw, 0.0096);
        L.pitch = ease(L.pitch, L.aimPitch, 0.0064);
        L.dolly = ease(L.dolly, L.aimDolly, 0.02);

        const pose = poseFor(focusIndex, bus.slots);
        springToward(pos.current, velP.current, pose.pos, dt, 78, 16);
        springToward(target.current, velT.current, pose.target, dt, 78, 16);

        const t = tmp.current;
        t.dir.copy(target.current).sub(pos.current);
        const dist = Math.max(t.dir.length(), 0.4);
        t.dir.multiplyScalar(1 / dist);
        const yaw = L.yaw;
        const pitch = L.pitch;
        t.qYaw.setFromAxisAngle(t.up, yaw);
        t.dir.applyQuaternion(t.qYaw);
        t.right.crossVectors(t.dir, t.up);
        if (t.right.lengthSq() < 1e-6) t.right.set(1, 0, 0);
        t.right.normalize();
        t.qPitch.setFromAxisAngle(t.right, pitch);
        t.dir.applyQuaternion(t.qPitch);
        t.eye.copy(pos.current).addScaledVector(t.dir, L.dolly);
        t.eye.x = clampNum(t.eye.x, -1.45, 1.45);
        t.eye.y = clampNum(t.eye.y, 0.95, 2.25);
        t.eye.z = clampNum(t.eye.z, -12, 5.4);
        t.aim.copy(t.eye).addScaledVector(t.dir, dist);
        camera.position.copy(t.eye);
        camera.lookAt(t.aim);

        const goal = bus.pressed ? 0.9 : (focusIndex >= 0 ? 1.06 : 1);
        const force = (goal - bus.nicheScale) * 280;
        bus.nicheVel += (force - bus.nicheVel * 24) * dt;
        bus.nicheScale += bus.nicheVel * dt;
        gl.toneMappingExposure = focusIndex >= 0 ? 1.02 : 1.12;
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

function makePedestalPlaque() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const label = '세종 이루소 봉안당';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 2048, 512);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 16;
    ctx.strokeRect(12, 12, 2024, 488);
    ctx.fillStyle = '#111111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let size = 210;
    ctx.font = '700 ' + size + 'px "Malgun Gothic", "Noto Sans KR", sans-serif';
    while (size > 96 && ctx.measureText(label).width > 1840) {
        size -= 8;
        ctx.font = '700 ' + size + 'px "Malgun Gothic", "Noto Sans KR", sans-serif';
    }
    ctx.fillText(label, 1024, 268);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
}

function FlowerBunch() {
    const blooms = ['#fffaf4', '#f3e2c4', '#e8d7a8', '#f7f1e6', '#fffdf8', '#ead8b0'];
    return h('group', { position: [0, 0.86, 0.34] },
        h('mesh', { position: [0, -0.08, 0] },
            h('cylinderGeometry', { args: [0.012, 0.016, 0.16, 6] }),
            h('meshStandardMaterial', { color: '#6d7a52', roughness: 0.7 })
        ),
        blooms.map((color, i) => {
            const angle = (i / blooms.length) * Math.PI * 2;
            return h('mesh', {
                key: 'bloom-' + i,
                position: [Math.cos(angle) * 0.09, 0.02 + (i % 2) * 0.03, Math.sin(angle) * 0.05],
            },
                h('sphereGeometry', { args: [0.045, 10, 8] }),
                h('meshStandardMaterial', { color, roughness: 0.55 })
            );
        })
    );
}

function makeKioskScreen() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1832;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a2330';
    ctx.fillRect(0, 0, 1024, 1832);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = '700 72px "Malgun Gothic", "Noto Sans KR", sans-serif';
    ctx.fillText('세종 이루소 봉안당', 512, 200);
    ['봉안함 찾기', '상담 안내', '시설 안내'].forEach((label, i) => {
        const y = 420 + i * 360;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(96, y, 832, 220);
        ctx.fillStyle = '#111111';
        ctx.font = '700 72px "Malgun Gothic", "Noto Sans KR", sans-serif';
        ctx.fillText(label, 512, y + 140);
    });
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
}

function makeKioskSign() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 2048, 384);
    ctx.fillStyle = '#111111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 150px "Malgun Gothic", "Noto Sans KR", sans-serif';
    ctx.fillText('추모 안내 키오스크', 1024, 200);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
}

function kioskText(label, position, fontSize, color) {
    return h(Text, {
        position,
        fontSize,
        color,
        anchorX: 'center',
        anchorY: 'middle',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        font: KIOSK_FONT,
        maxWidth: 0.4,
        characters: '세종이루소봉안당추모안내키오스크찾기상담시설 ',
    }, label);
}

function HeroCase() {
    const body = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#f7f5f2', roughness: 0.42, metalness: 0.02, clearcoat: 0.22, clearcoatRoughness: 0.32, envMapIntensity: 0.55,
    }), []);
    const shade = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const wash = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
        wash.addColorStop(0, 'rgba(28, 24, 20, 0.42)');
        wash.addColorStop(1, 'rgba(28, 24, 20, 0)');
        ctx.fillStyle = wash;
        ctx.fillRect(0, 0, 128, 128);
        const tex = new THREE.CanvasTexture(canvas);
        return tex;
    }, []);
    return h('group', { position: [0, 0, -1.15] },
        h('mesh', { rotation: [-Math.PI / 2, 0, 0], position: [0, 0.012, 0] },
            h('planeGeometry', { args: [1.15, 0.7] }),
            h('meshBasicMaterial', { map: shade, transparent: true, depthWrite: false, toneMapped: false })
        ),
        h('mesh', { position: [0, 1.08, 0], castShadow: true, receiveShadow: true, material: body },
            h('boxGeometry', { args: [0.48, 2.16, 0.26] })
        ),
        h('mesh', { position: [0, 1.14, 0.132] },
            h('planeGeometry', { args: [0.4, 0.78] }),
            h('meshBasicMaterial', { color: '#1a2330' })
        ),
        kioskText('세종 이루소 봉안당', [0, 1.44, 0.14], 0.032, '#ffffff'),
        ['봉안함 찾기', '상담 안내', '시설 안내'].map((label, i) => h('group', { key: label },
            h('mesh', { position: [0, 1.24 - i * 0.16, 0.134] },
                h('planeGeometry', { args: [0.32, 0.11] }),
                h('meshBasicMaterial', { color: '#ffffff' })
            ),
            kioskText(label, [0, 1.24 - i * 0.16, 0.142], 0.03, '#111111')
        )),
        h('mesh', { position: [0, 1.84, 0.132] },
            h('planeGeometry', { args: [0.44, 0.1] }),
            h('meshBasicMaterial', { color: '#ffffff' })
        ),
        kioskText('추모 안내 키오스크', [0, 1.84, 0.14], 0.034, '#111111')
    );
}

function HallEnv() {
    const { gl, scene } = useThree();
    useEffect(() => {
        const pmrem = new THREE.PMREMGenerator(gl);
        const env = new THREE.Scene();
        env.add(new THREE.HemisphereLight('#fff8ee', '#b7aea4', 0.55));
        const key = new THREE.DirectionalLight('#fffaf2', 2.4);
        key.position.set(1.5, 8, 3);
        env.add(key);
        const ceil = new THREE.Mesh(
            new THREE.PlaneGeometry(16, 16),
            new THREE.MeshBasicMaterial({ color: '#fffdf8' })
        );
        ceil.position.set(0, 6.2, 0);
        ceil.rotation.x = Math.PI / 2;
        env.add(ceil);
        const lamp = new THREE.Mesh(
            new THREE.PlaneGeometry(1.1, 9),
            new THREE.MeshBasicMaterial({ color: '#ffffff' })
        );
        lamp.position.set(0, 5.7, 0);
        lamp.rotation.x = Math.PI / 2;
        env.add(lamp);
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(16, 16),
            new THREE.MeshBasicMaterial({ color: '#7d756c' })
        );
        ground.position.set(0, -1.5, 0);
        ground.rotation.x = -Math.PI / 2;
        env.add(ground);
        const sideMat = new THREE.MeshBasicMaterial({ color: '#f4ebe3' });
        const left = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), sideMat);
        left.position.set(-7, 2, 0);
        left.rotation.y = Math.PI / 2;
        env.add(left);
        const right = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), sideMat);
        right.position.set(7, 2, 0);
        right.rotation.y = -Math.PI / 2;
        env.add(right);
        const target = pmrem.fromScene(env, 0.02);
        scene.environment = target.texture;
        if ('environmentIntensity' in scene) scene.environmentIntensity = 1.2;
        return () => {
            scene.environment = null;
            target.dispose();
            pmrem.dispose();
            env.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material && obj.material.dispose) obj.material.dispose();
            });
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
        const panel = document.getElementById('columbInfoPanel');
        if (panel) panel.style.display = 'none';
        return;
    }
    sheet.hidden = true;
    if (start) start.hidden = true;
    if (stage) stage.classList.add('is-focused');
}

function Scene({ snap, onSelect, concept }) {
    const [hover, setHover] = useState(-1);
    const [focusIndex, setFocusIndex] = useState(-1);
    const [focusDepth, setFocusDepth] = useState(0);
    const [ceilingOn, setCeilingOn] = useState(() => bus.ceilingOn !== false);
    useEffect(() => {
        bus.setCeilingOn = (on) => {
            bus.ceilingOn = on;
            setCeilingOn(on);
        };
        return () => { bus.setCeilingOn = null; };
    }, []);
    const packs = useHallFloors(snap);
    const activeFloor = String((snap && snap.floor) || '1');
    const order = [activeFloor].concat(['1', '2', '3'].filter((level) => level !== activeFloor));
    const shifts = [0, -4.2, -8.4];
    const slots = (packs[activeFloor] && packs[activeFloor].length) ? packs[activeFloor] : [];
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
        bus.focusTo = (index, rowSlots, depth) => {
            const list = (rowSlots && rowSlots.length) ? rowSlots : (bus.viewSlots || slots);
            if (rowSlots && rowSlots.length) bus.viewSlots = rowSlots;
            if (depth != null) bus.focusDepth = depth;
            if (!list.length) return;
            const wrapped = ((index % list.length) + list.length) % list.length;
            bus.focusIndex = wrapped;
            setFocusIndex(wrapped);
            setFocusDepth(bus.focusDepth || 0);
            const slot = list[wrapped];
            showSheet(slot);
            if (bus.api && bus.api.showSlot) bus.api.showSlot(slot);
            else if (onSelect && !bus.focusDepth) onSelect(slot);
        };
        bus.clearFocus = () => {
            bus.focusIndex = -1;
            bus.focusDepth = 0;
            bus.viewSlots = slots;
            setFocusIndex(-1);
            setFocusDepth(0);
            showSheet(null);
        };
    }, [slots, onSelect]);

    return h(React.Fragment, null,
        h('color', { attach: 'background', args: [(concept || CONCEPTS[0]).marble ? '#f7f6f3' : (concept || CONCEPTS[0]).wall] }),
        h(HallEnv),
        (concept || CONCEPTS[0]).marble ? null : h('fog', { attach: 'fog', args: [(concept || CONCEPTS[0]).wall, 14, 28] }),
        h('hemisphereLight', { args: ['#fffdf8', '#e7e2da', ((concept || CONCEPTS[0]).marble ? 0.42 : 0.4) * (ceilingOn ? 1 : 0.4)] }),
        h('ambientLight', { color: '#fff6ee', intensity: (concept || CONCEPTS[0]).marble ? 0.16 : (concept || CONCEPTS[0]).amb }),
        h('directionalLight', {
            position: [0.2, 7.2, 3.4],
            intensity: ((concept || CONCEPTS[0]).marble ? 0.48 : 0.45) * (ceilingOn ? 1 : 0),
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
                h('pointLight', { position: [-1.6, 1.7, 1.4], color: '#ffd7a8', intensity: 1.15, distance: 4.2, decay: 2 }),
                h('pointLight', { position: [1.6, 1.7, 0.2], color: '#ffd7a8', intensity: 1.15, distance: 4.2, decay: 2 }),
                h('pointLight', { position: [-1.6, 1.7, -2.8], color: '#ffe0b8', intensity: 0.9, distance: 4.2, decay: 2 }),
                h('pointLight', { position: [1.6, 1.7, -5.2], color: '#ffe0b8', intensity: 0.9, distance: 4.2, decay: 2 })
            )
            : h('pointLight', { position: [0, 3.4, 0.2], color: '#ffe3bf', intensity: (concept || CONCEPTS[0]).spot, distance: 12 }),
        h(Room, { concept, ceilingOn }),
        h(ModelBoundary, null, h(React.Suspense, { fallback: null }, h(HeroCase))),
        (concept || CONCEPTS[0]).marble ? null : h(CorridorMarks),
        ...order.flatMap((level, index) => [
            h(NicheGrid, {
                key: 'niche-' + level,
                slots: packs[level] || [],
                hover: focusDepth === shifts[index] ? hover : -1,
                selectedId: focusDepth === shifts[index] ? selectedId : '',
                focusIndex: focusDepth === shifts[index] ? focusIndex : -1,
                onHover: (hit) => { if (focusDepth === shifts[index]) setHover(hit); },
                onSelect: (slot) => {
                    const list = packs[level] || [];
                    const hit = list.findIndex((item) => item.r === slot.r && item.c === slot.c);
                    if (bus.focusTo) bus.focusTo(hit, list, shifts[index]);
                },
                concept,
                shiftZ: shifts[index],
            }),
            h(ModelBoundary, { key: 'urn-' + level }, h(React.Suspense, { fallback: null },
                h(UrnGrid, { slots: packs[level] || [], concept, shiftZ: shifts[index] })
            )),
            h(PortraitPlates, { key: 'photo-' + level, slots: packs[level] || [], shiftZ: shifts[index] }),
        ]),
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
        if (!slot) return;
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
            gl.toneMappingExposure = 1.08;
            gl.outputColorSpace = THREE.SRGBColorSpace;
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
    const ceilingBtn = root.querySelector('[data-ceiling-led]');
    if (ceilingBtn && !ceilingBtn.dataset.bound) {
        ceilingBtn.dataset.bound = '1';
        const paintCeiling = () => {
            const on = bus.ceilingOn !== false;
            ceilingBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
            ceilingBtn.textContent = on ? '천장등 끄기' : '천장등 켜기';
        };
        paintCeiling();
        ceilingBtn.addEventListener('click', () => {
            const next = bus.ceilingOn === false;
            if (bus.setCeilingOn) bus.setCeilingOn(next);
            else bus.ceilingOn = next;
            paintCeiling();
        });
    }
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
    const infoClose = document.getElementById('columbInfoClose');
    const clearTour = () => {
        if (bus.clearFocus) bus.clearFocus();
    };
    if (closeSheet) closeSheet.addEventListener('click', clearTour);
    if (infoClose && !infoClose.dataset.tourBound) {
        infoClose.dataset.tourBound = '1';
        infoClose.addEventListener('click', clearTour);
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
