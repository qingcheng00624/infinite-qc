/* Touch adapter for the smart canvas. Reuses existing node drag / undo handling. */
(() => {
    const points = new Map();
    let gesture = null;
    let suppressClickUntil = 0;
    const controls = 'button,input,textarea,select,[contenteditable],.composer,.asset-panel,.log-modal,.shortcut-modal,.image-edit-modal,.create-menu,.smart-minimap,.workflow-transfer-panel';
    const pair = () => {
        const [a,b=a] = [...points.values()];
        return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,d:Math.hypot(a.x-b.x,a.y-b.y)};
    };
    function capture(event) { try { shell.setPointerCapture(event.pointerId); } catch {} }
    function beginPinch() {
        const center = pair();
        if(center.d<8) return;
        gesture = {kind:'pinch',distance:center.d,scale:viewport.scale,anchor:screenToWorld({clientX:center.x,clientY:center.y}),moved:false};
    }
    shell.addEventListener('pointerdown', event => {
        if(event.pointerType!=='touch' || !canvas || zoomPreviewState || event.target.closest(controls)) return;
        const node = event.target.closest('.image-node');
        // Text and node actions remain native; drag from a node header or media surface.
        if(node && !event.target.closest('.node-head') && event.target.closest('.prompt-input,.node-body,.prompt-body')) return;
        if(gesture?.kind==='node') return;
        if(node && points.size===0) {
            event.preventDefault(); event.stopPropagation();
            event.target.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,clientX:event.clientX,clientY:event.clientY,button:0}));
            if(!dragState) return;
            gesture={kind:'node',id:event.pointerId,moved:false};
            points.set(event.pointerId,{x:event.clientX,y:event.clientY}); capture(event); return;
        }
        if(!node && event.target!==shell && event.target!==world && !event.target.closest('.connection-layer')) return;
        event.preventDefault(); event.stopPropagation(); closeCreateMenu();
        points.set(event.pointerId,{x:event.clientX,y:event.clientY}); capture(event);
        if(points.size>=2) beginPinch();
        else gesture={kind:'pan',x:event.clientX,y:event.clientY,ox:viewport.x,oy:viewport.y,moved:false};
    },{passive:false,capture:true});
    shell.addEventListener('pointermove',event=>{
        if(!points.has(event.pointerId)||!gesture) return;
        event.preventDefault(); event.stopPropagation();
        points.set(event.pointerId,{x:event.clientX,y:event.clientY});
        if(gesture.kind==='node') {
            gesture.moved=true;
            window.onmousemove?.(event);
        } else if(gesture.kind==='pinch' && points.size>=2) {
            const center=pair(),rect=shell.getBoundingClientRect();
            viewport.scale=safeScale(gesture.scale*center.d/gesture.distance);
            viewport.x=center.x-rect.left-gesture.anchor.x*viewport.scale;
            viewport.y=center.y-rect.top-gesture.anchor.y*viewport.scale;
            gesture.moved=true;applyViewport();
        } else if(gesture.kind==='pan') {
            viewport.x=gesture.ox+event.clientX-gesture.x;
            viewport.y=gesture.oy+event.clientY-gesture.y;
            gesture.moved ||= Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>4;
            applyViewport();
        }
    },{passive:false,capture:true});
    function finish(event) {
        if(!points.has(event.pointerId)) return;
        event.preventDefault();event.stopPropagation();
        const moved=gesture?.moved;
        if(gesture?.kind==='node') {
            if(event.type==='pointercancel') restoreDraggedNodePosition();
            window.onmouseup?.(event);
        } else if(moved) scheduleSave();
        if(moved) suppressClickUntil=Date.now()+350;
        points.forEach((_,id)=>{try{shell.releasePointerCapture(id);}catch{}});
        points.clear();gesture=null;
    }
    shell.addEventListener('pointerup',finish,{passive:false,capture:true});
    shell.addEventListener('pointercancel',finish,{passive:false,capture:true});
    shell.addEventListener('click',event=>{if(Date.now()<suppressClickUntil && !event.target.closest(controls)){event.preventDefault();event.stopImmediatePropagation();}},true);
    const add=document.getElementById('mobileSmartAdd');
    ['pointerdown','mousedown'].forEach(type=>add?.addEventListener(type,event=>event.stopPropagation()));
    add?.addEventListener('click',event=>{event.stopPropagation();openCreateMenu({clientX:shell.clientWidth/2,clientY:shell.clientHeight/2});});
})();
