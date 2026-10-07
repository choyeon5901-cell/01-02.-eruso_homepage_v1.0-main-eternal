import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';

const KIOSK_FONT = 'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-kr@5.2.8/korean-700-normal.ttf';
const h = React.createElement;

const CELL_W = 0.76;
const CELL_H = 0.64;
const SHELF_Y = -CELL_H * 0.88 / 2 + 0.008;
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
    walkTo: null,
    walkHome: null,
};

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

function floorFromRow(r) {
    if (r <= 1) return '1';
    if (r <= 3) return '2';
    return '3';
}

function useHallFloors(snap) {
    const facilityKey = (snap && snap.facility && snap.facility.id) || 'sejong-columbarium';
    const [packs, setPacks] = useState(() => ({
        A: buildSlots(null),
        B: buildSlots(null),
        C: buildSlots(null),
    }));
    useEffect(() => {
        let cancel = false;
        const base = resolveApiBase();
        const filterName = facilityKey === 'sejong-columbarium'
            ? '세종봉안당'
            : ((snap && snap.facility && snap.facility.name) || '세종봉안당');
        const zones = ['A', 'B', 'C'];
        const jobs = [];
        zones.forEach((zone) => {
            ['1', '2', '3'].forEach((level) => {
                jobs.push(fetch(
                    base + '/api/memorial-rooms/columbarium-layout?zone='
                    + encodeURIComponent(zone) + '&floor=' + level + '&cols=10&rows=6&facility_key='
                    + encodeURIComponent(facilityKey) + '&facility_name=' + encodeURIComponent(filterName)
                ).then((res) => {
                    if (!res.ok) throw new Error(String(res.status));
                    return res.json();
                }).then((payload) => ({ zone, level, slots: slotsFromPayload(payload, zone, level) })));
            });
        });
        Promise.all(jobs).then((rows) => {
            if (cancel) return;
            const buckets = { A: {}, B: {}, C: {} };
            rows.forEach(({ zone, slots }) => {
                slots.forEach((slot) => {
                    const key = slot.r + '-' + slot.c;
                    const want = floorFromRow(slot.r);
                    const prev = buckets[zone][key];
                    const score = (item) => {
                        if (!item || !item.occupied) return 0;
                        let n = 2;
                        if (item.cell && item.cell.image_url) n += 4;
                        if (item.cell && String(item.cell.floor) === want) n += 1;
                        return n;
                    };
                    if (!prev || score(slot) > score(prev)) buckets[zone][key] = slot;
                });
            });
            const next = {};
            let occupied = 0;
            let total = 0;
            zones.forEach((zone) => {
                next[zone] = buildSlots(null).map((slot) => {
                    const found = buckets[zone][slot.r + '-' + slot.c];
                    const floor = floorFromRow(slot.r);
                    const row = slot.r + 1;
                    const col = slot.c + 1;
                    const code = zone + floor + '-' + String(row).padStart(2, '0') + String(col).padStart(2, '0');
                    total += 1;
                    if (!found || !found.cell) {
                        return Object.assign({}, slot, {
                            id: code,
                            occupied: false,
                            isPublic: false,
                            cell: { zone, floor, row, col, occupied: false, id: code },
                        });
                    }
                    if (found.occupied) occupied += 1;
                    const cell = Object.assign({}, found.cell, { zone, floor, row, col, id: code });
                    return Object.assign({}, found, { id: code, cell });
                });
            });
            setPacks(next);
            const seats = document.querySelector('#columbarium-template-root [data-seat-count]');
            if (seats && total) {
                seats.textContent = 'A·B·C동 ' + total + '석 중 안치 ' + occupied + '석 · 분양 가능 ' + (total - occupied) + '석';
            }
        }).catch(() => {});
        return () => { cancel = true; };
    }, [facilityKey]);
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
        placeLocal(dummy, slot, [0.16, SHELF_Y + 0.102, 0.15], 1);
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

const NICHE_GLOW_PUBLIC = new THREE.Color(2.2, 1.78, 1.28);
const NICHE_GLOW_BASE = new THREE.Color(1, 1, 1);
const NICHE_LED_PUBLIC = new THREE.Color(1.9, 1.48, 0.82);
const NICHE_LED_BASE = new THREE.Color(1, 1, 1);

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
    const uv = box.attributes.uv;
    const base = target.positions.length / 3;
    if (!target.uvs) target.uvs = [];
    for (let i = 0; i < pos.count; i += 1) {
        target.positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
        target.normals.push(nor.getX(i), nor.getY(i), nor.getZ(i));
        target.uvs.push(uv.getX(i) * Math.max(size[0], size[2]), uv.getY(i) * size[1]);
    }
    const idx = box.index;
    for (let i = 0; i < idx.count; i += 1) target.indices.push(base + idx.getX(i));
    box.dispose();
}

function geometryFromParts(parts) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(parts.positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(parts.normals, 3));
    if (parts.uvs && parts.uvs.length) geo.setAttribute('uv', new THREE.Float32BufferAttribute(parts.uvs, 2));
    geo.setIndex(parts.indices);
    return geo;
}

function makeFrameGeometry() {
    const w = CELL_W * 0.98;
    const hh = CELL_H * 0.96;
    const d = 0.1;
    const t = 0.04;
    const z = 0.14;
    const parts = { positions: [], normals: [], indices: [] };
    appendBox(parts, [w, t, d], [0, hh / 2 - t / 2, z]);
    appendBox(parts, [w, t, d], [0, -hh / 2 + t / 2, z]);
    appendBox(parts, [t, hh - t * 2, d], [-w / 2 + t / 2, 0, z]);
    appendBox(parts, [t, hh - t * 2, d], [w / 2 - t / 2, 0, z]);
    return geometryFromParts(parts);
}

function makeCavityGeometry() {
    const w = CELL_W * 0.94;
    const hh = CELL_H * 0.92;
    const d = 0.3;
    const t = 0.02;
    const zc = -0.07;
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

function makeStoneTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f4efe8';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 6; i += 1) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = 80 + Math.random() * 140;
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, 'rgba(214, 196, 176, 0.28)');
        g.addColorStop(1, 'rgba(244, 239, 232, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.lineCap = 'round';
    for (let v = 0; v < 5; v += 1) {
        ctx.strokeStyle = 'rgba(168, 142, 116, ' + (0.18 + Math.random() * 0.12) + ')';
        ctx.lineWidth = 8 + Math.random() * 10;
        ctx.beginPath();
        let x = -20;
        let y = Math.random() * size;
        ctx.moveTo(x, y);
        while (x < size + 40) {
            const nx = x + 80 + Math.random() * 70;
            const ny = y + (Math.random() - 0.5) * 36;
            ctx.quadraticCurveTo(x + 40, y + (Math.random() - 0.5) * 16, nx, ny);
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

function makeWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e7c99a';
    ctx.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 1) {
        const grain = 168 + Math.sin(y * 0.35) * 10 + Math.sin(y * 0.07) * 8;
        ctx.fillStyle = 'rgba(' + Math.round(grain + 28) + ',' + Math.round(grain * 0.78) + ',' + Math.round(grain * 0.48) + ',0.35)';
        ctx.fillRect(0, y, 512, 1);
    }
    ctx.strokeStyle = 'rgba(120, 86, 48, 0.28)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= 512; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
    }
    for (let i = 0; i < 180; i += 1) {
        ctx.fillStyle = 'rgba(110, 78, 42, 0.18)';
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 1);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
}

function makeLinenTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e7d7c2';
    ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 3) {
        ctx.fillStyle = y % 6 === 0 ? 'rgba(140, 108, 74, 0.16)' : 'rgba(255, 248, 236, 0.12)';
        ctx.fillRect(0, y, 256, 1);
    }
    for (let x = 0; x < 256; x += 4) {
        ctx.fillStyle = 'rgba(120, 92, 62, 0.07)';
        ctx.fillRect(x, 0, 1, 256);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 3);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
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
    const oak = useMemo(() => {
        const tex = makeWoodTexture();
        tex.repeat.set(1.2, 1.6);
        return tex;
    }, []);
    const frameMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#f0d7b0', map: oak, roughness: 0.75, metalness: 0.1,
        polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
    }), [oak]);
    const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#f4f8fb', roughness: 0.02, metalness: 0.08, transparent: true, opacity: 0.22,
        envMapIntensity: 1.35, depthWrite: false,
    }), []);
    const wood = useMemo(() => makeWoodTexture(), []);
    const glowMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#f0d7b0', map: wood, emissive: '#e8a86a', emissiveIntensity: 0.14, roughness: 0.75, metalness: 0.1,
    }), [wood]);
    const ledMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#07131f',
        emissive: '#c5e4ff',
        emissiveIntensity: 4.4,
        toneMapped: false,
        roughness: 0.45,
        metalness: 0,
    }), []);
    const tabletMat = useMemo(() => new THREE.MeshBasicMaterial({ map: tabletTex }), [tabletTex]);

    useLayoutEffect(() => {
        const look = concept || CONCEPTS[0];
        frameMat.color.set(look.marble ? '#f0d7b0' : look.frame);
        frameMat.map = look.marble ? oak : null;
        frameMat.emissive.set('#000000');
        frameMat.emissiveIntensity = 0;
        frameMat.metalness = look.marble ? 0.1 : Math.max(look.metal, 0.35);
        frameMat.roughness = look.marble ? 0.75 : look.rough;
        glassMat.color.set(look.marble ? '#eef4f8' : '#ffffff');
        glassMat.opacity = look.marble ? 0.18 : 0.08;
        glassMat.metalness = look.marble ? 0.02 : 0;
        glassMat.roughness = look.marble ? 0.28 : 0.12;
        glassMat.envMapIntensity = look.marble ? 0.35 : 0.2;
        glowMat.map = wood;
        glowMat.color.set(look.marble ? '#f0d7b0' : '#d7b48a');
        glowMat.emissive.set(look.marble ? '#e8a86a' : '#a87840');
        glowMat.emissiveIntensity = look.marble ? 0.14 : 0.2;
        glowMat.roughness = look.marble ? 0.75 : 0.72;
        glowMat.metalness = look.marble ? 0.1 : 0;
        glowMat.needsUpdate = true;
        syncNicheFrames();
    }, [slots, hover, selectedId, focusIndex, concept, frameMat, glassMat, glowMat, ledMat, oak, wood]);

    const syncNicheFrames = () => {
        const ledOn = bus.ceilingOn !== false;
        ledMat.color.set(ledOn ? '#07131f' : '#1c1b19');
        ledMat.emissive.set(ledOn ? '#c5e4ff' : '#000000');
        ledMat.emissiveIntensity = ledOn ? 4.4 : 0;
        ledMat.toneMapped = false;
        const dim = new THREE.Color('#d7c4a4');
        const base = new THREE.Color('#ffffff');
        const hot = new THREE.Color('#fff4e2');
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
        paint(glass.current, [0, 0, 0.22]);
        paint(glow.current, [0, 0, 0]);
        paint(led.current, [0, CELL_H * 0.28, 0.02]);
        const tint = (mesh, pick) => {
            if (!mesh) return;
            slots.forEach((slot, i) => mesh.setColorAt(i, pick(slot)));
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        };
        tint(glow.current, (slot) => (slot.isPublic ? NICHE_GLOW_PUBLIC : NICHE_GLOW_BASE));
        tint(led.current, (slot) => (slot.isPublic ? NICHE_LED_PUBLIC : NICHE_LED_BASE));
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
            receiveShadow: true,
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
            userData: { nicheGlass: true, slots, shiftZ: shiftZ || 0 },
            ...glassHandlers,
        })
    );
}

function makeGlazeMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const wash = ctx.createLinearGradient(0, 0, 256, 0);
    wash.addColorStop(0, '#f4ece3');
    wash.addColorStop(0.32, '#fffdf8');
    wash.addColorStop(0.58, '#fffdf8');
    wash.addColorStop(1, '#efe4d6');
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, 256, 512);
    const band = ctx.createLinearGradient(0, 0, 256, 0);
    band.addColorStop(0.28, 'rgba(255,255,255,0)');
    band.addColorStop(0.4, 'rgba(255,255,255,0.7)');
    band.addColorStop(0.48, 'rgba(255,255,255,0)');
    ctx.fillStyle = band;
    ctx.fillRect(0, 0, 256, 512);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.anisotropy = 8;
    return tex;
}

function makeUrnGeometries() {
    const pts = [
        [0.002, 0],
        [0.044, 0],
        [0.056, 0.007],
        [0.062, 0.016],
        [0.074, 0.032],
        [0.098, 0.058],
        [0.116, 0.092],
        [0.118, 0.116],
        [0.110, 0.142],
        [0.092, 0.166],
        [0.074, 0.186],
        [0.064, 0.200],
        [0.074, 0.212],
        [0.078, 0.220],
        [0.062, 0.240],
        [0.040, 0.260],
        [0.018, 0.278],
        [0.008, 0.290],
        [0.002, 0.300],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const body = new THREE.LatheGeometry(pts, 72);
    body.computeVertexNormals();
    const bands = [
        { y: 0.116, r: 0.118, tube: 0.004 },
        { y: 0.186, r: 0.074, tube: 0.0034 },
        { y: 0.214, r: 0.076, tube: 0.0032 },
    ].map((band) => {
        const geo = new THREE.TorusGeometry(band.r, band.tube, 12, 72);
        geo.rotateX(Math.PI / 2);
        geo.translate(0, band.y, 0);
        return geo;
    });
    return { body, bands };
}

function UrnModel({ slot, geo, bodyMat, goldMat }) {
    const root = useMemo(() => {
        const group = new THREE.Group();
        const body = new THREE.Mesh(geo.body, bodyMat);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        geo.bands.forEach((band) => {
            const ring = new THREE.Mesh(band, goldMat);
            ring.castShadow = true;
            group.add(ring);
        });
        return group;
    }, [geo, bodyMat, goldMat]);
    useLayoutEffect(() => {
        const dummy = new THREE.Object3D();
        placeLocal(dummy, slot, [-0.13, SHELF_Y, 0.03], 1);
        root.position.copy(dummy.position);
        root.quaternion.copy(dummy.quaternion);
        root.scale.setScalar(1);
        root.visible = true;
    }, [slot, root]);
    return h('primitive', { object: root });
}

function PublicNicheLight({ slot }) {
    const ref = useRef(null);
    useLayoutEffect(() => {
        if (!ref.current) return;
        const dummy = new THREE.Object3D();
        placeLocal(dummy, slot, [0, SHELF_Y + 0.18, 0.18], 1);
        ref.current.position.copy(dummy.position);
    }, [slot]);
    return h('pointLight', {
        ref,
        color: '#ffe4b8',
        intensity: 1.15,
        distance: 1.05,
        decay: 2,
    });
}

function UrnGrid({ slots, concept, shiftZ }) {
    const geo = useMemo(() => makeUrnGeometries(), []);
    const glazeMap = useMemo(() => makeGlazeMap(), []);
    const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#fffdf8', map: glazeMap, roughness: 0.2, metalness: 0, clearcoat: 0.62, clearcoatRoughness: 0.12,
        envMapIntensity: 0.35, sheen: 0.35, sheenRoughness: 0.28, sheenColor: new THREE.Color('#fffdf8'),
        emissive: '#fff6ea', emissiveIntensity: 0.18,
    }), [glazeMap]);
    const goldMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#e4c57a', roughness: 0.32, metalness: 0.4, clearcoat: 0.16, clearcoatRoughness: 0.28,
        envMapIntensity: 0.28, emissive: '#a87828', emissiveIntensity: 0.22,
    }), []);
    const publicBody = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#fffefb', map: glazeMap, roughness: 0.12, metalness: 0, clearcoat: 0.74, clearcoatRoughness: 0.08,
        envMapIntensity: 0.42, sheen: 0.5, sheenRoughness: 0.18, sheenColor: new THREE.Color('#fff6e8'),
        emissive: '#fff3d4', emissiveIntensity: 0.68,
    }), [glazeMap]);
    const publicGold = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: '#f0d48a', roughness: 0.26, metalness: 0.42, clearcoat: 0.2, clearcoatRoughness: 0.22,
        envMapIntensity: 0.32, emissive: '#c4923a', emissiveIntensity: 0.48,
    }), []);
    useLayoutEffect(() => {
        const look = concept || CONCEPTS[0];
        bodyMat.color.set(look.marble ? '#fffdf8' : look.urn);
        bodyMat.emissive.set(look.marble ? '#fff6ea' : '#fffaf6');
        bodyMat.emissiveIntensity = look.marble ? 0.18 : 0.04;
        bodyMat.metalness = look.marble ? 0 : look.urnMetal;
        bodyMat.roughness = look.marble ? 0.2 : look.urnRough;
        bodyMat.clearcoat = look.marble ? 0.62 : 0.2;
        bodyMat.clearcoatRoughness = look.marble ? 0.12 : 0.4;
        bodyMat.envMapIntensity = look.marble ? 0.35 : 0.35;
        goldMat.color.set(look.marble ? '#e4c57a' : look.trim);
        goldMat.metalness = look.marble ? 0.4 : 0.5;
        goldMat.roughness = look.marble ? 0.32 : 0.4;
        goldMat.emissive.set(look.marble ? '#a87828' : '#000000');
        goldMat.emissiveIntensity = look.marble ? 0.22 : 0.02;
        goldMat.envMapIntensity = look.marble ? 0.28 : 0.4;
    }, [concept, bodyMat, goldMat]);
    const list = (slots || []).filter((slot) => hasPhoto(slot));
    if (!list.length) return null;
    return h('group', { position: [0, 0, shiftZ || 0] }, list.map((slot) => h(React.Fragment, { key: slot.id + '-' + slot.r + '-' + slot.c },
        h(UrnModel, {
            slot,
            geo,
            bodyMat: slot.isPublic ? publicBody : bodyMat,
            goldMat: slot.isPublic ? publicGold : goldMat,
        }),
        slot.isPublic ? h(PublicNicheLight, { slot }) : null
    )));
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
    ctx.fillStyle = '#e6e1d8';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 8; i += 1) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = 220 + Math.random() * 260;
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, 'rgba(214, 206, 194, 0.16)');
        g.addColorStop(1, 'rgba(230, 225, 216, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
}

function makeAltarVase() {
    const pts = [
        new THREE.Vector2(0.001, 0),
        new THREE.Vector2(0.034, 0.004),
        new THREE.Vector2(0.03, 0.014),
        new THREE.Vector2(0.042, 0.06),
        new THREE.Vector2(0.055, 0.12),
        new THREE.Vector2(0.046, 0.168),
        new THREE.Vector2(0.026, 0.198),
        new THREE.Vector2(0.032, 0.214),
        new THREE.Vector2(0.024, 0.224),
    ];
    const geo = new THREE.LatheGeometry(pts, 40);
    geo.computeVertexNormals();
    return geo;
}

const FILM_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:1200/assets/videos/'
    : '/';
const HALL_FILM_URLS = [
    FILM_BASE + 'gateway-human.mp4?v=12024-noletter',
    FILM_BASE + 'gateway-pet.mp4?v=12024-hq',
];

function createFilmReel(urls) {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    const grain = document.createElement('canvas');
    grain.width = 160;
    grain.height = 160;
    const gctx = grain.getContext('2d');
    const dots = gctx.createImageData(160, 160);
    for (let i = 0; i < dots.data.length; i += 4) {
        const n = 90 + Math.random() * 140;
        dots.data[i] = n;
        dots.data[i + 1] = n;
        dots.data[i + 2] = n;
        dots.data[i + 3] = 255;
    }
    gctx.putImageData(dots, 0, 0);
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', 'true');
    video.preload = 'auto';
    video.loop = false;
    video.setAttribute('data-hall-film', '1');
    video.style.cssText = 'position:fixed;width:2px;height:2px;opacity:0;pointer-events:none;left:0;bottom:0;';
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    let index = 0;
    const playAt = (next) => {
        index = ((next % urls.length) + urls.length) % urls.length;
        video.src = urls[index];
        const pending = video.play();
        if (pending && typeof pending.catch === 'function') pending.catch(() => {});
    };
    const onEnded = () => playAt(index + 1);
    const motes = Array.from({ length: 14 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.7 + Math.random() * 1.3,
        v: 0.00015 + Math.random() * 0.0003,
    }));
    const paint = () => {
        const w = canvas.width;
        const h = canvas.height;
        const now = performance.now();
        ctx.fillStyle = '#100d0a';
        ctx.fillRect(0, 0, w, h);
        if (video.readyState >= 2 && video.videoWidth > 0) {
            const vw = video.videoWidth;
            const vh = video.videoHeight;
            const cover = Math.max(w / vw, h / vh);
            const dw = vw * cover;
            const dh = vh * cover;
            ctx.drawImage(video, (w - dw) / 2, (h - dh) / 2, dw, dh);
        }
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgba(210, 168, 112, 0.32)';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = 0.14;
        ctx.drawImage(grain, (now / 28) % 160 - 160, (now / 41) % 160 - 160, w + 160, h + 160);
        ctx.restore();
        motes.forEach((mote) => {
            mote.y -= mote.v * 16;
            if (mote.y < 0) mote.y = 1;
            ctx.fillStyle = 'rgba(255, 236, 206, 0.4)';
            ctx.beginPath();
            ctx.arc(mote.x * w, mote.y * h, mote.r, 0, Math.PI * 2);
            ctx.fill();
        });
        if (Math.floor(now / 48) % 3 === 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.14)';
            ctx.fillRect(0, 0, w, h);
        }
        texture.needsUpdate = true;
    };
    return {
        texture,
        start() {
            document.body.appendChild(video);
            video.addEventListener('ended', onEnded);
            const kick = () => {
                if (video.paused) {
                    const pending = video.play();
                    if (pending && typeof pending.catch === 'function') pending.catch(() => {});
                }
            };
            video.addEventListener('canplay', kick);
            playAt(0);
            window.addEventListener('pointerdown', kick);
            return () => {
                window.removeEventListener('pointerdown', kick);
                video.removeEventListener('ended', onEnded);
                video.removeEventListener('canplay', kick);
                video.pause();
                video.removeAttribute('src');
                video.load();
                if (video.parentNode) video.parentNode.removeChild(video);
                texture.dispose();
            };
        },
        paint,
    };
}

function EndAlcove() {
    const oak = useMemo(() => {
        const tex = makeWoodTexture();
        tex.repeat.set(1.4, 1.1);
        return tex;
    }, []);
    const wood = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#e7d0aa', map: oak, roughness: 0.78, metalness: 0.08,
    }), [oak]);
    const woodDark = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#b48958', map: oak, roughness: 0.82, metalness: 0.06,
    }), [oak]);
    const vaseGeo = useMemo(() => makeAltarVase(), []);
    const ceramic = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#f3efe8', roughness: 0.46, metalness: 0.04,
    }), []);
    const bandMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#c6a36a', roughness: 0.38, metalness: 0.42,
    }), []);
    const film = useMemo(() => createFilmReel(HALL_FILM_URLS), []);
    useEffect(() => film.start(), [film]);
    useFrame(() => {
        film.paint();
    });
    const topY = 0.78;
    const leg = (x, z) => h('mesh', {
        key: 'leg-' + x + '-' + z,
        position: [x, 0.36, z],
        castShadow: true,
        receiveShadow: true,
        material: woodDark,
    }, h('boxGeometry', { args: [0.07, 0.72, 0.07] }));
    const vase = (x) => h('group', { key: 'vase-' + x, position: [x, topY, 0.24] },
        h('mesh', { geometry: vaseGeo, material: ceramic, castShadow: true, receiveShadow: true }),
        h('mesh', {
            position: [0, 0.168, 0],
            rotation: [Math.PI / 2, 0, 0],
            material: bandMat,
            castShadow: true,
        }, h('torusGeometry', { args: [0.046, 0.004, 10, 28] }))
    );
    return h('group', { position: [0, 0, -13.12] },
        [-0.72, 0.72].flatMap((x) => [0.08, 0.4].map((z) => leg(x, z))),
        h('mesh', { position: [0, 0.68, 0.24], castShadow: true, receiveShadow: true, material: woodDark },
            h('boxGeometry', { args: [1.52, 0.1, 0.4] })
        ),
        h('mesh', { position: [0, topY - 0.022, 0.24], castShadow: true, receiveShadow: true, material: wood },
            h('boxGeometry', { args: [1.7, 0.044, 0.5] })
        ),
        h('mesh', { position: [0, 2.32, 0.04] },
            h('planeGeometry', { args: [3.2, 1.8] }),
            h('meshBasicMaterial', { map: film.texture, toneMapped: false })
        ),
        vase(-0.28),
        vase(0.28)
    );
}

function Room({ concept, ceilingOn }) {
    const look = concept || CONCEPTS[0];
    const ledOn = ceilingOn !== false;
    const floorTex = useMemo(() => {
        const tex = makeMarbleTexture();
        tex.repeat.set(2.2, 2.8);
        return tex;
    }, []);
    const oakTex = useMemo(() => {
        const tex = makeWoodTexture();
        tex.repeat.set(4, 8);
        return tex;
    }, []);
    const oakMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#f2ddb8', map: oakTex, roughness: 0.75, metalness: 0.1,
    }), [oakTex]);
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
        wallMat.color.set(look.marble ? '#e6dccb' : look.wall);
        wallMat.map = look.marble ? wallTex : null;
        wallMat.emissive = wallMat.emissive || new THREE.Color();
        wallMat.emissive.set('#000000');
        wallMat.emissiveIntensity = 0;
        wallMat.roughnessMap = null;
        wallMat.roughness = look.marble ? 0.86 : Math.min(0.92, look.rough + 0.08);
        wallMat.clearcoat = 0;
        wallMat.needsUpdate = true;
    }, [look, floorMat, wallMat, floorTex, wallTex]);

    return h('group', null,
        look.marble
            ? h('mesh', {
                rotation: [-Math.PI / 2, 0, 0],
                position: [0, 0.002, -0.55],
                receiveShadow: true,
                material: oakMat,
                userData: { aisleFloor: true },
                onClick: (event) => {
                    event.stopPropagation();
                    if (bus.suppressClick || !bus.walkTo) return;
                    bus.walkTo(event.point.z);
                },
            },
                h('planeGeometry', { args: [5.56, 25.5] })
            )
            : h('mesh', {
                rotation: [-Math.PI / 2, 0, 0],
                position: [0, 0, 0.15],
                receiveShadow: true,
                material: floorMat,
                userData: { aisleFloor: true },
                onClick: (event) => {
                    event.stopPropagation();
                    if (bus.suppressClick || !bus.walkTo) return;
                    bus.walkTo(event.point.z);
                },
            },
                h('planeGeometry', { args: [6.2, 7.2, 12, 12] })
            ),
        h('mesh', { position: [0, 4.15, look.marble ? -0.55 : -2.2], rotation: [Math.PI / 2, 0, 0], receiveShadow: true, material: look.marble ? oakMat : wallMat },
            h('planeGeometry', { args: [look.marble ? 5.56 : 7.2, look.marble ? 25.5 : 16, 8, 8] })
        ),
        h('mesh', { position: [-2.72, 2.05, look.marble ? -0.55 : -2.2], material: wallMat },
            h('boxGeometry', { args: [0.12, 4.15, look.marble ? 25.5 : 16] })
        ),
        h('mesh', { position: [2.72, 2.05, look.marble ? -0.55 : -2.2], material: wallMat },
            h('boxGeometry', { args: [0.12, 4.15, look.marble ? 25.5 : 16] })
        ),
        h('mesh', { position: [0, 2.05, look.marble ? -13.2 : -9.2], material: wallMat },
            h('boxGeometry', { args: [5.56, 4.15, 0.12] })
        ),
        look.marble ? h('mesh', { position: [0, 2.05, 12.05], material: wallMat },
            h('boxGeometry', { args: [5.56, 4.15, 0.18] })
        ) : null,
        ...(look.marble ? [
            h('mesh', { key: 'skylight', position: [0, 4.11, -4.6], rotation: [Math.PI / 2, 0, 0] },
                h('planeGeometry', { args: [0.78, 12] }),
                h('meshStandardMaterial', {
                    color: ledOn ? '#07131f' : '#1c1b19',
                    emissive: ledOn ? '#c5e4ff' : '#000000',
                    emissiveIntensity: ledOn ? 4.4 : 0,
                    toneMapped: false,
                    roughness: 0.45,
                    metalness: 0,
                })
            ),
            h('mesh', { key: 'base-left', position: [-2.58, 0.09, -0.55] },
                h('boxGeometry', { args: [0.08, 0.18, 25.2] }),
                h('meshStandardMaterial', { color: '#c4a06a', map: oakTex, roughness: 0.75, metalness: 0.1, emissive: ledOn ? '#FFAA55' : '#000000', emissiveIntensity: ledOn ? 0.18 : 0 })
            ),
            h('mesh', { key: 'base-right', position: [2.58, 0.09, -0.55] },
                h('boxGeometry', { args: [0.08, 0.18, 25.2] }),
                h('meshStandardMaterial', { color: '#c4a06a', map: oakTex, roughness: 0.75, metalness: 0.1, emissive: ledOn ? '#FFAA55' : '#000000', emissiveIntensity: ledOn ? 0.18 : 0 })
            ),
            h('mesh', { key: 'base-end', position: [0, 0.09, -13.08] },
                h('boxGeometry', { args: [5.2, 0.18, 0.08] }),
                h('meshStandardMaterial', { color: '#c4a06a', map: oakTex, roughness: 0.75, metalness: 0.1, emissive: ledOn ? '#FFAA55' : '#000000', emissiveIntensity: ledOn ? 0.18 : 0 })
            ),
            h('mesh', { key: 'cove-left', position: [-2.58, 3.92, -0.55] },
                h('boxGeometry', { args: [0.1, 0.1, 25.2] }),
                h('meshStandardMaterial', { color: '#e7c99a', map: oakTex, roughness: 0.75, metalness: 0.1, emissive: ledOn ? '#FFCC88' : '#000000', emissiveIntensity: ledOn ? 0.28 : 0 })
            ),
            h('mesh', { key: 'cove-right', position: [2.58, 3.92, -0.55] },
                h('boxGeometry', { args: [0.1, 0.1, 25.2] }),
                h('meshStandardMaterial', { color: '#e7c99a', map: oakTex, roughness: 0.75, metalness: 0.1, emissive: ledOn ? '#FFCC88' : '#000000', emissiveIntensity: ledOn ? 0.28 : 0 })
            ),
            h('mesh', { key: 'base-front', position: [0, 0.09, 11.92] },
                h('boxGeometry', { args: [5.2, 0.18, 0.08] }),
                h('meshStandardMaterial', { color: '#c4a06a', map: oakTex, roughness: 0.75, metalness: 0.1, emissive: ledOn ? '#FFAA55' : '#000000', emissiveIntensity: ledOn ? 0.18 : 0 })
            ),
            h('mesh', { key: 'cove-front', position: [0, 3.92, 11.92] },
                h('boxGeometry', { args: [5.2, 0.1, 0.1] }),
                h('meshStandardMaterial', { color: '#e7c99a', map: oakTex, roughness: 0.75, metalness: 0.1, emissive: ledOn ? '#FFCC88' : '#000000', emissiveIntensity: ledOn ? 0.28 : 0 })
            ),
            h('mesh', { key: 'cove-end', position: [0, 3.92, -13.08] },
                h('boxGeometry', { args: [5.2, 0.1, 0.1] }),
                h('meshStandardMaterial', { color: '#e7c99a', map: oakTex, roughness: 0.75, metalness: 0.1, emissive: ledOn ? '#FFCC88' : '#000000', emissiveIntensity: ledOn ? 0.28 : 0 })
            ),
            h(EndAlcove, { key: 'alcove' }),
        ].concat([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => h('mesh', {
            key: 'spot-' + i,
            position: [0, 4.135, 2.8 - i * 1.25],
            rotation: [Math.PI / 2, 0, 0],
        },
            h('circleGeometry', { args: [0.07, 24] }),
            h('meshStandardMaterial', {
                color: ledOn ? '#07131f' : '#1c1b19',
                emissive: ledOn ? '#d6eeff' : '#000000',
                emissiveIntensity: ledOn ? 6 : 0,
                toneMapped: false,
                roughness: 0.4,
                metalness: 0,
            })
        ))) : [
            h('mesh', { key: 'sky', position: [0, 4.08, -2.2] },
                h('boxGeometry', { args: [1.15, 0.04, 12] }),
                h('meshStandardMaterial', {
                    color: ledOn ? '#07131f' : '#6e6a64',
                    emissive: ledOn ? '#c5e4ff' : '#000000',
                    emissiveIntensity: ledOn ? 4.4 : 0,
                    toneMapped: false,
                    roughness: 0.6,
                    metalness: 0,
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

const HALL_EYE_Z = 7.6;
const YAW_LIMIT = 0.32;

function poseFor() {
    return {
        pos: new THREE.Vector3(0, 1.88, HALL_EYE_Z),
        target: new THREE.Vector3(0, 0.42, -4.8),
    };
}

function clampNum(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function GuidedCamera({ focusIndex }) {
    const { camera, gl, scene } = useThree();
    const pos = useRef(new THREE.Vector3(0, 1.88, 7.6));
    const target = useRef(new THREE.Vector3(0, 0.42, -4.8));
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
        const raycaster = new THREE.Raycaster();
        const ndc = new THREE.Vector2();
        const forward = new THREE.Vector3();
        bus.walkTo = (z) => {
            camera.getWorldDirection(forward);
            const aisle = forward.z < 0 ? -1 : 1;
            const dolly = aisle < 0 ? (HALL_EYE_Z - z) : (z - HALL_EYE_Z);
            L.aimDolly = clampNum(dolly, -1.6, 13);
        };
        bus.walkHome = () => {
            L.aimYaw = 0;
            L.aimPitch = 0;
            L.aimDolly = 0;
        };
        const walkFromPointer = (event) => {
            if (D.moved > 10 || bus.suppressClick) return;
            const rect = el.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(ndc, camera);
            const hits = raycaster.intersectObjects(scene.children, true);
            if (!hits.length) return;
            const hit = hits[0];
            const data = (hit.object && hit.object.userData) || {};
            if (data.aisleFloor) {
                bus.walkTo(hit.point.z);
                return;
            }
            if (data.nicheGlass && hit.instanceId != null && data.slots && data.slots[hit.instanceId]) {
                bus.focusTo(hit.instanceId, data.slots, data.shiftZ || 0);
            }
        };
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
            L.aimYaw = clampNum(L.aimYaw + dx * 0.0048, -YAW_LIMIT, YAW_LIMIT);
            L.aimPitch = clampNum(L.aimPitch + dy * 0.0048, -1.5, 1.5);
            if (D.moved > 10) bus.suppressClick = true;
        };
        const up = (event) => {
            if (!D.on) return;
            D.on = false;
            el.style.cursor = 'grab';
            walkFromPointer(event);
            window.setTimeout(() => { bus.suppressClick = false; }, 90);
        };
        const wheel = (event) => {
            event.preventDefault();
            const step = clampNum(event.deltaY, -120, 120) * 0.018;
            L.aimDolly = clampNum(L.aimDolly + step, -1.6, 13);
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
            bus.walkTo = null;
            bus.walkHome = null;
        };
    }, [gl, camera, scene]);

    useFrame((_, rawDt) => {
        const dt = Math.min(rawDt || 0.016, 0.033);
        const L = look.current;
        if (seenFocus.current !== focusIndex) {
            const back = focusIndex < 0;
            seenFocus.current = focusIndex;
            if (back) {
                L.aimYaw = 0;
                L.aimPitch = 0;
                L.aimDolly = 0;
            }
        }
        const ease = (shown, aim, maxStep) => {
            const gap = aim - shown;
            return shown + clampNum(gap * 0.08, -maxStep, maxStep);
        };
        L.yaw = ease(L.yaw, L.aimYaw, 0.055);
        L.pitch = ease(L.pitch, L.aimPitch, 0.055);
        L.dolly = ease(L.dolly, L.aimDolly, 0.28);

        const pose = poseFor();
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
        const aisle = t.dir.z < 0 ? -1 : 1;
        t.eye.copy(pos.current);
        t.eye.z += aisle * L.dolly;
        t.eye.x = clampNum(t.eye.x, -1.45, 1.45);
        t.eye.y = clampNum(t.eye.y, 0.95, 2.25);
        t.eye.z = clampNum(t.eye.z, -5.2, 9.2);
        if (Math.abs(t.eye.x) < 0.5 && t.eye.y < 2.2 && t.eye.z < -0.7 && t.eye.z > -1.55) {
            t.eye.z = (t.eye.z > -1.15) ? -0.7 : -1.55;
        }
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

function makeLotusPetal() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.016, 0.018, 0.03, 0.062, 0.01, 0.118);
    shape.bezierCurveTo(0.004, 0.128, 0, 0.132, 0, 0.132);
    shape.bezierCurveTo(0, 0.132, -0.004, 0.128, -0.01, 0.118);
    shape.bezierCurveTo(-0.03, 0.062, -0.016, 0.018, 0, 0);
    const geo = new THREE.ShapeGeometry(shape, 8);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
        const y = pos.getY(i);
        pos.setZ(i, -y * y * 1.35);
    }
    geo.computeVertexNormals();
    return geo;
}

function makeLotusLeaf() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.045, 0.02, 0.055, 0.09, 0, 0.15);
    shape.bezierCurveTo(-0.055, 0.09, -0.045, 0.02, 0, 0);
    const geo = new THREE.ShapeGeometry(shape, 8);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
        const y = pos.getY(i);
        pos.setZ(i, -y * y * 0.55);
    }
    geo.computeVertexNormals();
    return geo;
}

function makeLotusPod() {
    const pts = [
        new THREE.Vector2(0.001, 0),
        new THREE.Vector2(0.011, 0.003),
        new THREE.Vector2(0.015, 0.01),
        new THREE.Vector2(0.013, 0.018),
        new THREE.Vector2(0.006, 0.022),
        new THREE.Vector2(0.001, 0.024),
    ];
    return new THREE.LatheGeometry(pts, 18);
}

function lotusBloom(petalGeo, leafGeo, podGeo, mats, prefix) {
    const rings = [
        { n: 12, radius: 0.006, tilt: 1.42, y: 0, mat: mats.outer, spin: 0 },
        { n: 9, radius: 0.003, tilt: 1.02, y: 0.01, mat: mats.mid, spin: 0.22 },
        { n: 6, radius: 0.001, tilt: 0.55, y: 0.02, mat: mats.inner, spin: 0.4 },
    ];
    const nodes = [];
    rings.forEach((ring, ri) => {
        for (let i = 0; i < ring.n; i += 1) {
            const a = (i / ring.n) * Math.PI * 2 + ring.spin;
            nodes.push(h('mesh', {
                key: prefix + '-p-' + ri + '-' + i,
                geometry: petalGeo,
                material: ring.mat,
                position: [Math.cos(a) * ring.radius, ring.y, Math.sin(a) * ring.radius],
                rotation: [ring.tilt, a, 0],
                castShadow: true,
            }));
        }
    });
    nodes.push(h('mesh', {
        key: prefix + '-pod',
        geometry: podGeo,
        material: mats.pod,
        position: [0, 0.03, 0],
        castShadow: true,
    }));
    [[0.5, 1.15], [2.6, 1.25], [4.4, 1.08]].forEach((leaf, i) => {
        nodes.push(h('mesh', {
            key: prefix + '-leaf-' + i,
            geometry: leafGeo,
            material: mats.leaf,
            position: [Math.cos(leaf[0]) * 0.018, -0.012, Math.sin(leaf[0]) * 0.018],
            rotation: [leaf[1], leaf[0], 0.15],
            castShadow: true,
        }));
    });
    return nodes;
}

function HeroCase() {
    const oak = useMemo(() => makeWoodTexture(), []);
    const body = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#f0d7b0', map: oak, roughness: 0.75, metalness: 0.1,
    }), [oak]);
    const plinthMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#e4c48e', map: oak, roughness: 0.78, metalness: 0.1,
    }), [oak]);
    const screenMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a2330', roughness: 0.62, metalness: 0.04 }), []);
    const paperMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f7f4ef', roughness: 0.72 }), []);
    const petalGeo = useMemo(() => makeLotusPetal(), []);
    const leafGeo = useMemo(() => makeLotusLeaf(), []);
    const podGeo = useMemo(() => makeLotusPod(), []);
    const lotusMats = useMemo(() => ({
        outer: new THREE.MeshStandardMaterial({ color: '#ecd4c6', roughness: 0.72, metalness: 0.02, side: THREE.DoubleSide }),
        mid: new THREE.MeshStandardMaterial({ color: '#f7efe6', roughness: 0.68, metalness: 0.02, side: THREE.DoubleSide }),
        inner: new THREE.MeshStandardMaterial({ color: '#fbf6ef', roughness: 0.64, metalness: 0.02, side: THREE.DoubleSide }),
        pod: new THREE.MeshStandardMaterial({ color: '#c9a15a', roughness: 0.58, metalness: 0.08 }),
        leaf: new THREE.MeshStandardMaterial({ color: '#5d7354', roughness: 0.78, metalness: 0.02, side: THREE.DoubleSide }),
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
        h('mesh', { position: [0, 0.07, 0], castShadow: true, receiveShadow: true, material: plinthMat },
            h('boxGeometry', { args: [0.62, 0.14, 0.42] })
        ),
        h('mesh', { position: [0, 1.05, 0], castShadow: true, receiveShadow: true, material: body },
            h('boxGeometry', { args: [0.48, 1.82, 0.32] })
        ),
        h('mesh', { position: [0, 1.988, 0], castShadow: true, receiveShadow: true, material: plinthMat },
            h('boxGeometry', { args: [0.56, 0.05, 0.38] })
        ),
        h('mesh', { position: [0, 1.02, 0.168], castShadow: true, material: screenMat },
            h('boxGeometry', { args: [0.36, 0.92, 0.012] })
        ),
        kioskText('세종 이루소 봉안당', [0, 1.36, 0.182], 0.028, '#ffffff'),
        ['봉안함 찾기', '상담 안내', '시설 안내'].map((label, i) => h('group', { key: label },
            h('mesh', { position: [0, 1.14 - i * 0.2, 0.182], castShadow: true, material: paperMat },
                h('boxGeometry', { args: [0.3, 0.12, 0.012] })
            ),
            kioskText(label, [0, 1.14 - i * 0.2, 0.194], 0.026, '#111111')
        )),
        h('mesh', { position: [0, 1.72, 0.17], castShadow: true, material: paperMat },
            h('boxGeometry', { args: [0.4, 0.12, 0.012] })
        ),
        kioskText('추모 안내 키오스크', [0, 1.72, 0.182], 0.026, '#111111'),
        [-0.78, 0.78].map((x) => h('group', { key: 'planter-' + x, position: [x, 0, 0.28] },
            h('mesh', { position: [0, 0.16, 0], castShadow: true, receiveShadow: true, material: plinthMat },
                h('boxGeometry', { args: [0.34, 0.32, 0.3] })
            ),
            h('mesh', { position: [0, 0.5, 0], castShadow: true },
                h('cylinderGeometry', { args: [0.016, 0.022, 0.34, 20] }),
                h('meshStandardMaterial', { color: '#f4f1ea', roughness: 0.38, metalness: 0.06 })
            ),
            h('mesh', { position: [0, 0.68, 0], castShadow: true },
                h('cylinderGeometry', { args: [0.024, 0.016, 0.02, 20] }),
                h('meshStandardMaterial', { color: '#f4f1ea', roughness: 0.38, metalness: 0.06 })
            ),
            h('group', { position: [0, 0.7, 0], scale: 1.55 },
                lotusBloom(petalGeo, leafGeo, podGeo, lotusMats, 'lotus-' + x)
            )
        ))
    );
}

function HallEnv() {
    const { gl, scene } = useThree();
    useEffect(() => {
        const pmrem = new THREE.PMREMGenerator(gl);
        const env = new THREE.Scene();
        env.add(new THREE.HemisphereLight('#f3e6d4', '#8d7b68', 0.7));
        const key = new THREE.DirectionalLight('#fffaf2', 2.4);
        key.position.set(1.5, 8, 3);
        env.add(key);
        const ceil = new THREE.Mesh(
            new THREE.PlaneGeometry(16, 16),
            new THREE.MeshBasicMaterial({ color: '#e4d5c2' })
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
        const sideMat = new THREE.MeshBasicMaterial({ color: '#c4aa90' });
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
        if ('environmentIntensity' in scene) scene.environmentIntensity = 0.85;
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
    const order = ['A', 'B', 'C'];
    const shifts = [0, -4.2, -8.4];
    const slots = (packs.A && packs.A.length) ? packs.A : [];
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
            if (slot && slot.position && bus.walkTo) {
                bus.walkTo(slot.position.z + (bus.focusDepth || 0));
            }
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
            if (bus.walkHome) bus.walkHome();
        };
    }, [slots, onSelect]);

    return h(React.Fragment, null,
        h('color', { attach: 'background', args: [(concept || CONCEPTS[0]).marble ? '#e6ddd2' : (concept || CONCEPTS[0]).wall] }),
        h(HallEnv),
        (concept || CONCEPTS[0]).marble ? null : h('fog', { attach: 'fog', args: [(concept || CONCEPTS[0]).wall, 14, 28] }),
        h('hemisphereLight', { args: ['#ffe0b8', '#c4a574', ((concept || CONCEPTS[0]).marble ? 0.22 : 0.4) * (ceilingOn ? 1 : 0.4)] }),
        h('ambientLight', { color: '#FFAA55', intensity: ((concept || CONCEPTS[0]).marble ? 0.42 : (concept || CONCEPTS[0]).amb) * (ceilingOn ? 1 : 0.45) }),
        h('directionalLight', {
            position: [1.4, 8.4, 1.2],
            intensity: ((concept || CONCEPTS[0]).marble ? 0.72 : 0.45) * (ceilingOn ? 1 : 0),
            color: '#ffe0b8',
            castShadow: true,
            'shadow-mapSize-width': 2048,
            'shadow-mapSize-height': 2048,
            'shadow-camera-near': 0.5,
            'shadow-camera-far': 36,
            'shadow-camera-left': -8,
            'shadow-camera-right': 8,
            'shadow-camera-top': 14,
            'shadow-camera-bottom': -14,
            'shadow-bias': -0.0006,
            'shadow-normalBias': 0.03,
        }),
        (concept || CONCEPTS[0]).marble
            ? h(React.Fragment, null,
                [2.4, 0.2, -2.2, -4.6].flatMap((z) => [
                    h('pointLight', { key: 'cove-lo-' + z, position: [-2.2, 0.42, z], color: '#FFAA55', intensity: ceilingOn ? 0.7 : 0.05, distance: 3.4, decay: 2 }),
                    h('pointLight', { key: 'cove-ro-' + z, position: [2.2, 0.42, z], color: '#FFAA55', intensity: ceilingOn ? 0.7 : 0.05, distance: 3.4, decay: 2 }),
                    h('pointLight', { key: 'cove-hi-' + z, position: [-2.2, 2.65, z], color: '#FFCC88', intensity: ceilingOn ? 0.45 : 0, distance: 3.6, decay: 2 }),
                    h('pointLight', { key: 'cove-up-' + z, position: [2.2, 2.65, z], color: '#FFCC88', intensity: ceilingOn ? 0.45 : 0, distance: 3.6, decay: 2 }),
                ])
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
        h(GuidedCamera, { focusIndex }),
        h(EffectComposer, { disableNormalPass: true, multisampling: 8, resolutionScale: 1.5 },
            h(Bloom, {
                mipmapBlur: true,
                luminanceThreshold: 0.9,
                luminanceSmoothing: 0.42,
                intensity: ceilingOn ? 1.85 : 0,
                radius: 0.92,
            })
        )
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
        camera: { position: [0, 1.88, 7.6], fov: 50, near: 0.08, far: 80 },
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
    if (nameEl) nameEl.textContent = facility.name || '세종봉안당';
    if (addrEl) addrEl.textContent = facility.address || '';
    if (phoneEl) phoneEl.textContent = facility.phone || '';
    if (vip) vip.textContent = (facility.name || '봉안당') + ' 3D 복도';

    const grid = root.querySelector('[data-grid]');
    if (!grid) return;
    grid.innerHTML = '';
    const rows = snap.rows || 6;
    const cols = snap.cols || 10;
    const cells = (snap && snap.cells) || {};
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
            const label = ceilingBtn.querySelector('[data-ceiling-label]');
            if (label) label.textContent = on ? '천장등 끄기' : '천장등 켜기';
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
