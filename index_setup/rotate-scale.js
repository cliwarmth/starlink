/*!
 * rotate-scale.js — 旋转联动缩放文字组件（零依赖）
 *
 * 能力：
 *   1. 2D / 3D / 拖拽（鼠标 + 触摸）三种旋转方式
 *   2. 缩放与旋转角度联动，缩放曲线与缓动函数可自定义
 *   3. 配置项：缩放强度、最小/最大缩放、旋转中心点、透视距离、惯性、吸附
 *   4. 多个文字元素同时响应，且每个元素可单独覆盖配置
 *   5. 全程使用 CSS transform + 单一 rAF 批处理，避免布局抖动
 *   6. 可选 HUD：实时显示当前角度与缩放倍率
 *
 * 用法：
 *   const inst = RotateScale.create({ targets: el, mode: '3d', drag: true });
 *   inst.setAngle(45, 'y');
 *   RotateScale.applyTo(elements, { angleY: 30, angleZ: 120 }, cfg);
 */
(function (global) {
    'use strict';

    var DEFAULTS = {
        mode: '3d',            // '2d' | '3d' | 'both'
        drive: null,           // 'z' | 'y' | 'x' | 'magnitude'，默认跟随 mode
        perspective: 800,
        intensity: 1,
        minScale: 0.7,
        maxScale: 1.3,
        scaleCurve: 'cosine',  // 'cosine' | 'sine' | 'linear' | function(rad)
        easing: null,          // function(t01)
        origin: '50% 50%',
        baseTransform: '',
        writeTransform: true,
        writeVars: true,
        willChange: true,
        drag: false,
        dragTarget: null,
        dragAxis: 'xy',        // 'x' | 'y' | 'z' | 'xy'
        sensitivity: 0.45,
        friction: 0.92,
        snap: 0,
        hud: null,
        hudFormat: null,
        hudAutoHide: 1500,
        onUpdate: null
    };

    var CURVES = {
        cosine: function (rad) { return (Math.cos(rad) + 1) / 2; },
        sine: function (rad) { return Math.abs(Math.sin(rad)); },
        linear: function (rad) { return 1 - Math.min(Math.abs(rad) / Math.PI, 1); }
    };

    var EASINGS = {
        linear: function (t) { return t; },
        easeOutCubic: function (t) { return 1 - Math.pow(1 - t, 3); },
        easeInOutCubic: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
        smoothstep: function (t) { return t * t * (3 - 2 * t); }
    };

    function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }
    function merge(base, ext) {
        var out = {}, k;
        for (k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
        if (ext) for (k in ext) if (Object.prototype.hasOwnProperty.call(ext, k)) out[k] = ext[k];
        return out;
    }

    function compute(state, cfg) {
        var ax = state.angleX || 0, ay = state.angleY || 0, az = state.angleZ || 0;
        var drive = cfg.drive || (cfg.mode === '2d' ? 'z' : (cfg.mode === 'both' ? 'magnitude' : 'y'));
        var driveAngle;
        if (drive === 'x') driveAngle = ax;
        else if (drive === 'y') driveAngle = ay;
        else if (drive === 'z') driveAngle = az;
        else driveAngle = Math.sqrt(ax * ax + ay * ay + az * az);

        var rad = driveAngle * Math.PI / 180;
        var curve = typeof cfg.scaleCurve === 'function' ? cfg.scaleCurve : (CURVES[cfg.scaleCurve] || CURVES.cosine);
        var t = clamp01(curve(rad));
        var eased = typeof cfg.easing === 'function' ? cfg.easing(t) : t;
        var scale = cfg.minScale + (cfg.maxScale - cfg.minScale) * clamp01(eased * cfg.intensity);

        return { angleX: ax, angleY: ay, angleZ: az, angle: driveAngle, t: eased, scale: scale };
    }

    function transformFor(r, cfg) {
        var parts = [];
        if (cfg.baseTransform) parts.push(cfg.baseTransform);
        if (cfg.mode === '2d') {
            parts.push('rotate(' + r.angleZ.toFixed(3) + 'deg)');
        } else {
            parts.push('perspective(' + cfg.perspective + 'px)');
            if (r.angleX) parts.push('rotateX(' + r.angleX.toFixed(3) + 'deg)');
            if (r.angleY) parts.push('rotateY(' + r.angleY.toFixed(3) + 'deg)');
            if (cfg.mode === 'both' && r.angleZ) parts.push('rotate(' + r.angleZ.toFixed(3) + 'deg)');
        }
        parts.push('scale(' + r.scale.toFixed(4) + ')');
        return parts.join(' ');
    }

    function paint(el, r, cfg) {
        if (cfg.writeTransform) el.style.transform = transformFor(r, cfg);
        if (cfg.writeVars) {
            el.style.setProperty('--rs-angle', r.angle.toFixed(2));
            el.style.setProperty('--rs-rot-x', r.angleX.toFixed(2) + 'deg');
            el.style.setProperty('--rs-rot-y', r.angleY.toFixed(2) + 'deg');
            el.style.setProperty('--rs-rot-z', r.angleZ.toFixed(2) + 'deg');
            el.style.setProperty('--rs-scale', r.scale.toFixed(4));
        }
        if (cfg.origin) el.style.transformOrigin = cfg.origin;
    }

    function hudText(r, cfg) {
        return cfg.hudFormat ? cfg.hudFormat(r) : '角度 ' + r.angle.toFixed(1) + '° · 缩放 ' + r.scale.toFixed(2) + '×';
    }

    function updateHud(cfg, r) {
        var el = cfg.hud;
        if (!el) return;
        if (typeof el === 'string') el = document.querySelector(el);
        if (!el) return;
        el.textContent = hudText(r, cfg);
        el.classList.add('is-visible');
        clearTimeout(el.__rsTimer);
        el.__rsTimer = setTimeout(function () {
            if (!el.__rsPinned) el.classList.remove('is-visible');
        }, cfg.hudAutoHide);
    }

    function applyTo(elements, state, cfg) {
        var c = merge(DEFAULTS, cfg || {});
        var r = compute(state || {}, c);
        var list = !elements ? [] : (elements.length !== undefined && !elements.tagName ? elements : [elements]);
        for (var i = 0; i < list.length; i++) {
            var el = list[i], cc = c, ov;
            if (el && el.el) { ov = el.cfg; el = el.el; if (ov) cc = merge(c, ov); }
            if (!el) continue;
            paint(el, r, cc);
        }
        updateHud(c, r);
        if (c.onUpdate) c.onUpdate(r);
        return r;
    }

    function bindDrag(el, onStart, onMove, onEnd) {
        var id = null;
        function pt(e) {
            if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            return { x: e.clientX, y: e.clientY };
        }
        function start(e) {
            id = pt(e);
            if (el.setPointerCapture && e.pointerId != null) { try { el.setPointerCapture(e.pointerId); } catch (err) {} }
            onStart(e);
        }
        function move(e) {
            if (!id) return;
            var p = pt(e), d = { dx: p.x - id.x, dy: p.y - id.y };
            id = p;
            onMove(d, e);
        }
        function end() { if (!id) return; id = null; onEnd(); }

        if (global.PointerEvent) {
            el.addEventListener('pointerdown', start);
            global.addEventListener('pointermove', move, { passive: true });
            global.addEventListener('pointerup', end);
            global.addEventListener('pointercancel', end);
        } else {
            el.addEventListener('mousedown', start);
            global.addEventListener('mousemove', move);
            global.addEventListener('mouseup', end);
            el.addEventListener('touchstart', start, { passive: true });
            global.addEventListener('touchmove', move, { passive: true });
            global.addEventListener('touchend', function () { end(); });
        }
        el.style.touchAction = 'none';
        return function unbind() {
            el.removeEventListener('pointerdown', start);
            global.removeEventListener('pointermove', move);
            global.removeEventListener('pointerup', end);
            global.removeEventListener('pointercancel', end);
            el.removeEventListener('mousedown', start);
            global.removeEventListener('mousemove', move);
            global.removeEventListener('mouseup', end);
            el.removeEventListener('touchstart', start);
            global.removeEventListener('touchmove', move);
        };
    }

    function Instance(options) {
        var cfg = merge(DEFAULTS, options || {});
        this.cfg = cfg;
        this.state = { angleX: cfg.angleX || 0, angleY: cfg.angleY || 0, angleZ: cfg.angleZ || 0 };
        this._vel = { x: 0, y: 0, z: 0 };
        this._raf = null;
        this._unbind = null;
        this.targets = [];

        var list = cfg.targets || [];
        list = (list.length !== undefined && !list.tagName) ? list : [list];
        for (var i = 0; i < list.length; i++) {
            var item = list[i], el = item, c = null;
            if (item && item.el) { el = item.el; c = item.cfg; }
            if (!el) continue;
            if (cfg.willChange) el.style.willChange = 'transform';
            this.targets.push({ el: el, cfg: c });
        }

        if (cfg.drag) this._initDrag();
        this.render();
    }

    Instance.prototype._initDrag = function () {
        var self = this, cfg = this.cfg;
        var el = cfg.dragTarget || (this.targets[0] && this.targets[0].el);
        if (!el) return;
        var axis = cfg.dragAxis;
        this._unbind = bindDrag(el,
            function () { self._vel.x = self._vel.y = self._vel.z = 0; },
            function (d) {
                var k = cfg.sensitivity;
                if (axis === 'y' || axis === 'xy') { self.state.angleY += d.dx * k; self._vel.y = d.dx * k; }
                if (axis === 'x' || axis === 'xy') { self.state.angleX -= d.dy * k; self._vel.x = -d.dy * k; }
                if (axis === 'z') { self.state.angleZ += d.dx * k; self._vel.z = d.dx * k; }
                self.invalidate();
            },
            function () {
                if (cfg.snap > 0) self.snapTo(cfg.snap);
                else self._spin();
            }
        );
    };

    Instance.prototype._spin = function () {
        var self = this, v = this._vel, f = this.cfg.friction;
        function step() {
            v.x *= f; v.y *= f; v.z *= f;
            self.state.angleX += v.x; self.state.angleY += v.y; self.state.angleZ += v.z;
            self.render();
            if (Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z) > 0.08) {
                self._raf = requestAnimationFrame(step);
            } else { self._raf = null; }
        }
        if (!this._raf) this._raf = requestAnimationFrame(step);
    };

    Instance.prototype.snapTo = function (step) {
        var self = this, s = this.state, from = { x: s.angleX, y: s.angleY, z: s.angleZ };
        function nearest(v) { return Math.round(v / step) * step; }
        var to = { x: nearest(from.x), y: nearest(from.y), z: nearest(from.z) };
        var t0 = performance.now(), dur = 320;
        function frame(now) {
            var p = Math.min((now - t0) / dur, 1), e = EASINGS.easeOutCubic(p);
            s.angleX = from.x + (to.x - from.x) * e;
            s.angleY = from.y + (to.y - from.y) * e;
            s.angleZ = from.z + (to.z - from.z) * e;
            self.render();
            if (p < 1) requestAnimationFrame(frame); else self._raf = null;
        }
        requestAnimationFrame(frame);
    };

    Instance.prototype.set = function (state) {
        if (state.angleX !== undefined) this.state.angleX = state.angleX;
        if (state.angleY !== undefined) this.state.angleY = state.angleY;
        if (state.angleZ !== undefined) this.state.angleZ = state.angleZ;
        this.invalidate();
        return this;
    };

    Instance.prototype.setAngle = function (deg, axis) {
        axis = axis || 'y';
        if (axis === 'x') this.state.angleX = deg;
        else if (axis === 'z') this.state.angleZ = deg;
        else this.state.angleY = deg;
        this.invalidate();
        return this;
    };

    Instance.prototype.invalidate = function () {
        if (this._raf) return;
        var self = this;
        this._raf = requestAnimationFrame(function () { self._raf = null; self.render(); });
    };

    Instance.prototype.render = function () {
        var r = compute(this.state, this.cfg);
        for (var i = 0; i < this.targets.length; i++) {
            var t = this.targets[i];
            paint(t.el, r, t.cfg ? merge(this.cfg, t.cfg) : this.cfg);
        }
        updateHud(this.cfg, r);
        if (this.cfg.onUpdate) this.cfg.onUpdate(r);
        return r;
    };

    Instance.prototype.destroy = function () {
        if (this._unbind) this._unbind();
        if (this._raf) cancelAnimationFrame(this._raf);
        for (var i = 0; i < this.targets.length; i++) {
            var el = this.targets[i].el;
            el.style.willChange = '';
            el.style.transform = '';
        }
        this.targets = [];
    };

    global.RotateScale = {
        create: function (opts) { return new Instance(opts); },
        applyTo: applyTo,
        compute: compute,
        CURVES: CURVES,
        EASINGS: EASINGS
    };
})(window);
