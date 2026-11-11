const $ = id => document.getElementById(id);
const EXT = { png: 'png', jpeg: 'jpg', webp: 'webp', bmp: 'bmp', ico: 'ico' };
let lastUrl = null;

const canvasBlob = (c, type, q) => new Promise(r => c.toBlob(r, type, q));

async function loadImage(file) {
    try {
        return await new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject();
            };
            img.src = url;
        });
    } catch (_) {
        try {
            const bmp = await createImageBitmap(file);
            return {naturalWidth: bmp.width, naturalHeight: bmp.height, source: bmp};
        } catch (__) {
            throw new Error('Your browser cannot read this (Type: ' + (file.type || 'unkown') + ', File: ' + file.name + ').');
        }
    }
}

function toBMP(c) {
    const w = c.width, h = c.height;
    const d = c.getContext('2d').getImageData(0, 0, w, h).data;
    const size = 54 + w * h * 4;
    const buf = new ArrayBuffer(size), v = new DataView(buf);
    v.setUint16(0, 0x4D42, true);
    v.setUint32(2, size, true);
    v.setUint32(10, 54, true);
    v.setUint32(14, 40, true);
    v.setInt32(18, w, true);
    v.setInt32(22, -h, true);
    v.setUint16(26, 1, true);
    v.setUint16(28, 32, true);
    v.setUint32(34, w * h * 4, true);
    const p = new Uint8Array(buf, 54);
    for (let i = 0; i < w * h; i++) {
        p[i*4] = d[i*4+2]; p[i*4+1] = d[i*4+1]; p[i*4+2] = d[i*4]; p[i*4+3] = d[i*4+3];
    }
    return new Blob([buf], { type: 'image/bmp' });
}

async function toICO(c) {
    const s = Math.min(1, 256 / Math.max(c.width, c.height));
    const t = document.createElement('canvas');
    t.width = Math.max(1, Math.round(c.width * s));
    t.height = Math.max(1, Math.round(c.height * s));
    t.getContext('2d').drawImage(c, 0, 0, t.width, t.height);
    const png = new Uint8Array(await (await canvasBlob(t, 'image/png')).arrayBuffer());
    const b = new Uint8Array(22 + png.length), v = new DataView(b.buffer);
    v.setUint16(2, 1, true);
    v.setUint16(4, 1, true);
    b[6] = t.width >= 256 ? 0 : t.width;
    b[7] = t.height >= 256 ? 0 : t.height;
    v.setUint16(10, 1, true);
    v.setUint16(12, 32, true);
    v.setUint32(14, png.length, true);
    v.setUint32(18, 22, true);
    b.set(png, 22);
    return new Blob([b], { type: 'image/x-icon' });
}

$('go').addEventListener('click', async () => {
    const msg = $('msg');
    const file = $('file').files[0];
    $('result').hidden = true;
    if (!file) { msg.textContent = 'Please choose an Image first.'; return; }
    msg.textContent = 'Converting…';
    try {
        const img = await loadImage(file);
        const c = document.createElement('canvas');
        c.width = img.naturalWidth || 512;
        c.height = img.naturalHeight || 512;
        const ctx = c.getContext('2d');
        const f = $('fmt').value;
        if (f === 'jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
        ctx.drawImage(img.source || img, 0, 0, c.width, c.height);

        let blob;
        if (f === 'bmp') blob = toBMP(c);
        else if (f === 'ico') blob = await toICO(c);
        else {
            blob = await canvasBlob(c, 'image/' + f, 0.9);
            if (!blob || blob.type !== 'image/' + f) throw new Error("Your browser can't export to:" + f.toUpperCase());
        }

        if (lastUrl) URL.revokeObjectURL(lastUrl);
        lastUrl = URL.createObjectURL(blob);
        const base = file.name.replace(/\.[^.]+$/, '') || 'image';
        $('dl').href = lastUrl;
        $('dl').download = base + '.' + EXT[f];
        $('result').hidden = false;
        msg.textContent = 'Done!';
    } catch (e) {
        msg.textContent = 'Error: ' + e.message;
    }
});