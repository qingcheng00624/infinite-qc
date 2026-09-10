// Regressions: selected dark navigation and toolbar content must remain readable.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const base=process.env.CANVAS_TEST_URL || 'http://localhost:3000';
function luminance(rgb){return rgb.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);}
function contrast(a,b){const values=[luminance(a),luminance(b)].sort((a,b)=>b-a);return(values[0]+.05)/(values[1]+.05);}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const theme of ['light','dark']) for(const width of [320,390,768,820]){
   const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});
   await context.addInitScript(theme=>localStorage.setItem('studio_theme',theme),theme);
   await context.route('**/api/**',route=>{
    if(route.request().url().endsWith('/api/canvases/ui-test'))return route.fulfill({json:{canvas:{id:'ui-test',title:'Toolbar test',nodes:[],connections:[],viewport:{x:0,y:0,scale:1}}}});
    return ['GET','HEAD'].includes(route.request().method())?route.continue():route.fulfill({json:{ok:true}});
   });
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/');
   async function assertContrast(selector,icon=false){
    const colors=await page.locator(selector).evaluate(e=>{
     const s=getComputedStyle(e);const icon=e.querySelector('svg');
     return {fg:s.color.match(/[\d.]+/g).map(Number),bg:s.backgroundColor.match(/[\d.]+/g).map(Number),icon:icon?getComputedStyle(icon).stroke.match(/[\d.]+/g).map(Number):null};
    });
    assert(contrast(colors.fg,colors.bg)>=4.5,`${theme} selected text contrast`);
    if(icon)assert(colors.icon&&contrast(colors.icon,colors.bg)>=3,`${theme} selected icon contrast`);
   }
   await page.locator('.mobile-nav [data-mobile-target="canvas"]').click();
   await assertContrast('.mobile-nav .active',true);
   await page.locator('#mobileMore').click();
   await page.locator('.mobile-menu [data-mobile-target="api-settings"]').click();
   await page.locator('#mobileMore').click();
   await assertContrast('.mobile-menu-grid .active');
   await page.goto(base+'/static/canvas.html');await page.waitForTimeout(500);
   await page.evaluate(()=>openCanvas('ui-test'));await page.waitForTimeout(100);
   for(const language of ['zh','en']){
    if(language==='en') await page.evaluate(()=>window.StudioI18n.set('en'));
    const overflow=await page.locator('#quickToolbar button').evaluateAll(buttons=>buttons.filter(e=>{
     if(!e.getClientRects().length)return false;
     const box=e.getBoundingClientRect();
     const range=document.createRange();range.selectNodeContents(e);
     return [...range.getClientRects()].some(r=>r.width>0&&(r.left<box.left-1||r.right>box.right+1));
    }).map(e=>e.textContent.trim()));
    assert.deepEqual(overflow,[],`${theme}/${width}/${language} button text and icons must stay inside borders`);
   }
   const boxes=await page.locator('.toolbar-items .tool-btn').evaluateAll(es=>es.map(e=>({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})));
   for(let i=1;i<boxes.length;i++)assert(boxes[i].left>=boxes[i-1].right,'Buttons must not overlap');
   await page.locator('.toolbar-items').evaluate(e=>e.scrollLeft=e.scrollWidth);
   const last=await page.locator('.toolbar-items .tool-btn').last().boundingBox(),row=await page.locator('.toolbar-items').boundingBox();
   assert(last.x+last.width<=row.x+row.width+1,'Last tool reachable by scrolling');
   await page.locator('.toolbar-toggle').click();assert.equal(await page.locator('.toolbar-items').isVisible(),false);
   assert.deepEqual(errors,[]);
   console.log(`PASS ${theme} ${width}px: contrast, toolbar bounds, scrolling, collapse`);
   await context.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
