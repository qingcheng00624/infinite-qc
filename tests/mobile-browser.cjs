/* Run against the existing Docker service; all write requests are mocked. */
const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const base = process.env.CANVAS_TEST_URL || 'http://localhost:3000';
(async () => {
    const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
    try {
        for (const width of [320,390,768,1280]) {
            const context = await browser.newContext({viewport:{width,height:844},isMobile:width<820,hasTouch:width<820});
            // Never save, delete, generate, or modify actual user data in browser tests.
            await context.route('**/api/**', route => ['GET','HEAD'].includes(route.request().method()) ? route.continue() : route.fulfill({json:{ok:true}}));
            const page = await context.newPage();
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            for (const name of ['index','canvas','gpt-chat','api-settings','asset-manager','online','zimage','enhance','klein','angle','comfyui-settings','smart-canvas']) {
                await page.goto(base + (name === 'index' ? '/' : `/static/${name}.html`));
                await page.waitForTimeout(200);
                if (width<820) {
                    const dimensions = await page.evaluate(() => ({viewport:innerWidth,width:document.documentElement.scrollWidth}));
                    assert(dimensions.viewport<=width+1, `${name} at ${width}: viewport enlarged to ${dimensions.viewport}`);
                    assert(dimensions.width<=width+1, `${name} at ${width}: overflow ${dimensions.width}`);
                }
                if (name==='index') {
                    if(width<820) {
                        await page.locator('.mobile-nav [data-mobile-target="gpt-chat"]').click();
                        await page.waitForFunction(() => document.querySelector('#frame-gpt-chat').classList.contains('active'));
                        assert.equal(await page.locator('.mobile-nav svg').count(),5);
                        await page.locator('#mobileMore').click();
                        assert(await page.locator('.mobile-menu').evaluate(el=>el.open));
                        await page.locator('.mobile-menu [data-mobile-target="api-settings"]').click();
                        assert(!(await page.locator('.mobile-menu').evaluate(el=>el.open)));
                        assert(await page.locator('#frame-api-settings').evaluate(el=>el.classList.contains('active')));
                    } else assert.equal(await page.locator('.mobile-nav').isVisible(),false);
                }
                if(name==='gpt-chat' && width<820) {
                    await page.locator('#messageInput').fill('第一行');
                    await page.locator('#messageInput').press('Enter');
                    assert.equal(await page.locator('#messageInput').inputValue(),'第一行\n');
                    const composer = await page.locator('.composer').boundingBox();
                    const send = await page.locator('.send-btn').boundingBox();
                    assert(send && composer && send.y+send.height<=composer.y+composer.height+1,'Send button must not be clipped');
                    await page.setViewportSize({width,height:440});
                    await page.waitForTimeout(200);
                    const reducedSend = await page.locator('.send-btn').boundingBox();
                    assert(reducedSend.y+reducedSend.height<=440,'Send must remain above keyboard-height viewport');
                    await page.setViewportSize({width,height:844});
                }
                if(name==='api-settings' && width<820) {
                    const list = await page.locator('.provider-list').boundingBox();
                    assert(list.height<120,'Provider selection must stay compact');
                    await page.locator('.api-page-save-btn').scrollIntoViewIfNeeded();
                    assert(await page.locator('.api-page-save-btn').isVisible());
                }
                if(name==='asset-manager' && width<820) {
                    assert.equal(await page.locator('.asset-nav').isVisible(),false);
                    await page.locator('.mobile-section-toggle').click();
                    assert.equal(await page.locator('.asset-nav').isVisible(),true);
                }
            }
            assert.deepEqual(errors,[],`JS errors at ${width}`);
            console.log(`PASS ${width}px: pages, navigation, forms and dialogs`);
            await context.close();
        }
        // Real touch input through Chromium, with an in-memory test canvas only.
        const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
        await context.route('**/api/**',route=>{
            if(route.request().url().endsWith('/api/canvases/mobile-test')) return route.fulfill({json:{canvas:{id:'mobile-test',name:'Touch test',nodes:[],connections:[],viewport:{x:0,y:0,scale:1}}}});
            return ['GET','HEAD'].includes(route.request().method())?route.continue():route.fulfill({json:{ok:true}});
        });
        const page=await context.newPage();
        await page.goto(base+'/static/canvas.html');
        await page.waitForTimeout(500);
        await page.evaluate(()=>openCanvas('mobile-test'));
        await page.waitForTimeout(200);
        const cdp=await context.newCDPSession(page);
        const touch=async(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([x,y,id])=>({x,y,id}))});
        const initial=await page.evaluate(()=>({...viewport}));
        await touch('touchStart',[[110,450,1]]);await touch('touchMove',[[170,490,1]]);await touch('touchEnd',[]);
        const panned=await page.evaluate(()=>({...viewport}));
        assert(panned.x!==initial.x || panned.y!==initial.y,'One-finger pan');
        await touch('touchStart',[[110,450,1],[230,450,2]]);await touch('touchMove',[[70,450,1],[270,450,2]]);await touch('touchEnd',[]);
        assert((await page.evaluate(()=>viewport.scale))>panned.scale,'Two-finger pinch zoom');
        await page.locator('.toolbar-toggle').click();
        assert.equal(await page.locator('.toolbar-items').isVisible(),false);
        await page.locator('.toolbar-toggle').click();
        assert.equal(await page.locator('.toolbar-items').isVisible(),true);
        console.log('PASS touch: pan, pinch, tool toggle');
        await page.goto(base+'/static/smart-canvas.html?id=mobile-test');
        await page.waitForFunction(()=>typeof canvas !== 'undefined' && canvas?.id==='mobile-test');
        await page.waitForTimeout(200);
        const smartInitial=await page.evaluate(()=>({...viewport}));
        await touch('touchStart',[[100,400,1]]);await touch('touchMove',[[150,450,1]]);await touch('touchEnd',[]);
        const smartPan=await page.evaluate(()=>({...viewport}));
        assert(smartPan.x!==smartInitial.x || smartPan.y!==smartInitial.y,'Smart canvas one-finger pan');
        await touch('touchStart',[[100,400,1],[220,400,2]]);await touch('touchMove',[[60,400,1],[260,400,2]]);await touch('touchEnd',[]);
        assert((await page.evaluate(()=>viewport.scale))>smartPan.scale,'Smart canvas pinch');
        await page.locator('#mobileSmartAdd').click();
        assert(await page.locator('#createMenu').evaluate(el=>el.classList.contains('open')));
        await page.locator('[data-create-type="prompt"]').click();
        assert(await page.locator('.image-node').count()>0,'Add node without double-click');
        // Position the new node in the visible area for a deterministic header drag.
        await page.evaluate(()=>{viewport={x:0,y:0,scale:1};nodes[0].x=35;nodes[0].y=220;applyViewport();render();});
        const head=await page.locator('.image-node .node-head').first().boundingBox();
        assert(head);
        const beforeDrag=await page.evaluate(()=>({x:nodes[0].x,y:nodes[0].y}));
        await touch('touchStart',[[head.x+40,head.y+20,1]]);await touch('touchMove',[[head.x+75,head.y+50,1]]);await touch('touchEnd',[]);
        const afterDrag=await page.evaluate(()=>({x:nodes[0].x,y:nodes[0].y}));
        assert(afterDrag.x!==beforeDrag.x || afterDrag.y!==beforeDrag.y,'Smart node touch drag');
        console.log('PASS smart touch: pan, pinch, add node, drag node');
        await context.close();
    } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
