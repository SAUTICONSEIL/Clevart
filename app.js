import * as THREE from './three.module.min.js';
import { buildLoft } from './loft.js';
const $=s=>document.querySelector(s);
const mobile=matchMedia('(max-width: 700px), (pointer: coarse)').matches;
const works=[
 {title:'Apprends-moi',file:'apprends-moi',size:'75 × 55',technique:'Huile sur toile',ratio:1486/2048,x:0,z:-6.83,rotation:0,h:2.9,far:true},
 {title:'Safe place',file:'safe-place',size:'55 × 75',technique:'Huile sur toile',ratio:2048/1468,x:-5.83,z:-3.2,rotation:Math.PI/2,h:2.05,far:true},
 {title:'Hope',file:'hope',size:'55 × 75',technique:'Huile sur toile et acrylique',ratio:2048/1576,x:5.83,z:-3.2,rotation:-Math.PI/2,h:2.05,far:true},
 {title:'Locks',file:'locks',size:'55 × 75',technique:'Huile sur toile et acrylique',ratio:2048/1502,x:-5.83,z:3.3,rotation:Math.PI/2,h:2.05},
 {title:'Humain',file:'humain',size:'40 × 50',technique:'Huile sur toile et acrylique',ratio:2048/1596,x:5.83,z:3.3,rotation:-Math.PI/2,h:1.95},
 {title:'Hell-p',file:'hell-p',size:'30 × 30',technique:'Huile sur toile',ratio:1600/1578,x:-5.83,z:6.3,rotation:Math.PI/2,h:1.55},
 {title:'Canicule',file:'canicule',size:'40 × 50',technique:'Huile sur toile et acrylique',ratio:2048/1642,x:5.83,z:6.3,rotation:-Math.PI/2,h:1.85},
 {title:'Lievangel',file:'lievangel',size:'30 × 40',technique:'Acrylique sur toile',ratio:1600/1284,x:-4.97,z:8.05,rotation:Math.PI/2,h:.84,y:1.15,view:1.9,stand:'easel',mapX:34,mapY:80},
 {title:'Lieve',file:'lieve',size:'50 × 50',technique:'Huile sur toile',ratio:2048/2040,x:-5.83,z:9.8,rotation:Math.PI/2,h:1.85},
 {title:'Tradition',file:'tradition',size:'50 × 40',technique:'Huile sur toile',ratio:1626/2048,x:0,z:11.2,rotation:Math.PI,h:1.9,y:1.6,view:2.7,stand:'easel',mapX:50,mapY:93}
].map(w=>({...w,w:w.h*w.ratio,image:w.file+'.jpg',thumb:w.file+'-s.jpg'}));
const count=works.length;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let selected=0,visiting=false,guided=false,tourElapsed=0,scene,camera,renderer,raycaster,floorMesh,hoverRing,artMeshes=[],transition=null,keys=new Set(),yaw=Math.PI,pitch=0,targetYaw=Math.PI,targetPitch=0;
const current=new THREE.Vector3(0,1.72,6.6),target=current.clone(),pointer=new THREE.Vector2();
const total=String(count).padStart(2,'0');
function number(i){return String(i+1).padStart(2,'0')}
function stopTour(){guided=false;tourElapsed=0;$('#autotour').textContent='▷ Visite guidée';$('#autotour').setAttribute('aria-pressed','false');$('#tourprogress').style.width='0'}
function setVisiting(){visiting=true;document.body.classList.add('visiting')}
function updateLabels(){let w=works[selected];$('#position').textContent='LA GALERIE / '+number(selected);$('#counter').textContent=number(selected)+' / '+total;$('.scene-label span').textContent=number(selected)+' / '+total;$('.scene-label p').textContent=w.title;document.querySelectorAll('#mapButtons button').forEach((b,i)=>b.classList.toggle('current',i===selected))}
function safePath(a,b){
 let crosses=false;
 for(let i=0;i<=60;i++){let p=a.clone().lerp(b,i/60);if(Math.abs(p.x)<2.05&&p.z>.25&&p.z<4.3){crosses=true;break}}
 if(!crosses)return [a,b];
 const side=(a.x+b.x>=0?1:-1)*2.5;
 if((a.z>4.3&&b.z<.25)||(b.z>4.3&&a.z<.25))return [a,new THREE.Vector3(side,1.72,a.z),new THREE.Vector3(side,1.72,b.z),b];
 const bypass=a.z<.25||b.z<.25?-.2:4.75;
 return [a,new THREE.Vector3(a.x,1.72,bypass),new THREE.Vector3(b.x,1.72,bypass),b];
}
function onPath(points,t){const lengths=points.slice(1).map((p,i)=>p.distanceTo(points[i])),sum=lengths.reduce((a,b)=>a+b,0);let d=t*sum;for(let i=0;i<lengths.length;i++){if(d<=lengths[i]||i===lengths.length-1)return points[i].clone().lerp(points[i+1],lengths[i]?d/lengths[i]:1);d-=lengths[i]}return points.at(-1)}
function angleNear(value,base){return base+Math.atan2(Math.sin(value-base),Math.cos(value-base))}
function viewDistance(w){const small=innerWidth<700;if(w.view)return small?Math.max(w.view,w.w*1.9):w.view;return w.far?(small?Math.max(3.7,w.w*1.2):4.1):(small?Math.min(3.5,w.w*1.2):3.15)}
function go(i,automatic=false){if(!automatic)stopTour();selected=(i+count)%count;setVisiting();const w=works[selected],n=new THREE.Vector3(Math.sin(w.rotation),0,Math.cos(w.rotation)),distance=viewDistance(w);const dest=new THREE.Vector3(w.x,1.72,w.z).addScaledVector(n,distance);target.copy(dest);targetYaw=angleNear(Math.atan2(-n.x,n.z),yaw);targetPitch=Math.atan2((w.y??2.6)-1.72,distance);transition={from:current.clone(),to:dest.clone(),yawFrom:yaw,yawTo:targetYaw,pitchFrom:pitch,pitchTo:targetPitch,t:0};tourElapsed=0;updateLabels();$('#artHint').style.display='block'}
function openDetail(i){stopTour();selected=(i+count)%count;let w=works[selected];$('#detailImage').src=w.image;$('#detailImage').alt='Clevart, '+w.title;$('#detailTitle').textContent=w.title;$('#detailSize').textContent=w.size+' cm';$('#detailTechnique').textContent=w.technique;$('.detail-image').classList.remove('zoomed');$('#zoom').textContent='Agrandir ＋';if($('#works').open)$('#works').close();if(!$('#detail').open)$('#detail').showModal()}
works.forEach((w,i)=>{const b=document.createElement('button');b.className='work-card';b.innerHTML=`<img src="${w.thumb}" alt="Clevart, ${w.title}" loading="lazy" decoding="async"><h3>${w.title}</h3><span>${w.size} cm · ${w.technique}</span>`;b.onclick=()=>{$('#works').close();go(i)};$('#workGrid').append(b);const m=document.createElement('button');m.textContent=number(i);m.setAttribute('aria-label','Rejoindre '+w.title);m.style.left=(w.mapX??(w.x===0?50:w.x<0?14:86))+'%';m.style.top=(w.mapY??(8+(w.z+6.83)*4.9))+'%';m.onclick=()=>go(i);$('#mapButtons').append(m)});
$('#collection').onclick=()=>{stopTour();$('#works').showModal()};$('#fallbackCollection').onclick=()=>$('#works').showModal();document.querySelectorAll('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('close',()=>{if(d.id==='detail')go(selected)});d.addEventListener('click',e=>{if(e.target===d){let r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}})});
$('#detailPrev').onclick=()=>openDetail(selected-1);$('#detailNext').onclick=()=>openDetail(selected+1);function zoom(){let a=$('.detail-image').classList.toggle('zoomed');$('#zoom').textContent=a?'Réduire −':'Agrandir ＋'}$('#zoom').onclick=zoom;$('#detailImage').onclick=zoom;
$('#help').onclick=()=>{$('#guide').hidden=!$('#guide').hidden;stopTour()};$('#closeGuide').onclick=()=>$('#guide').hidden=true;
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{}};
$('#enter').onclick=()=>go(0);$('#next').onclick=()=>go(visiting?selected+1:0);$('#previous').onclick=()=>go(visiting?selected-1:count-1);$('#artHint').onclick=()=>openDetail(selected);
$('#autotour').onclick=()=>{if(guided)stopTour();else{go(visiting?selected:0,true);guided=true;$('#autotour').textContent='Ⅱ Mettre en pause';$('#autotour').setAttribute('aria-pressed','true')}};
$('#hideui').onclick=()=>{document.body.classList.add('contemplating');$('#restoreui').hidden=false};$('#restoreui').onclick=()=>{document.body.classList.remove('contemplating');$('#restoreui').hidden=true};
$('#overview').onclick=()=>{stopTour();visiting=false;document.body.classList.remove('visiting');target.set(0,1.72,6.6);targetYaw=angleNear(Math.PI,yaw);targetPitch=.015;transition={from:current.clone(),to:target.clone(),yawFrom:yaw,yawTo:targetYaw,pitchFrom:pitch,pitchTo:targetPitch,t:0};$('#position').textContent='LE VESTIBULE';$('#counter').textContent='Visite libre';$('.scene-label p').textContent='Des histoires en couleurs.'};
function free(){if(transition){target.copy(current);targetYaw=yaw;targetPitch=pitch;transition=null}stopTour();setVisiting();$('#position').textContent='PROMENADE LIBRE';$('#counter').textContent='Visite libre'}
function blocked(x,z){return Math.abs(x)<1.9&&z>.35&&z<4.15}
function move(forward,side,dt){free();let nx=target.x+(Math.sin(targetYaw)*forward+Math.cos(targetYaw)*side)*dt,nz=target.z+(-Math.cos(targetYaw)*forward+Math.sin(targetYaw)*side)*dt;nx=THREE.MathUtils.clamp(nx,-4.1,4.1);nz=THREE.MathUtils.clamp(nz,-4.15,10.5);if(!blocked(nx,nz)){target.x=nx;target.z=nz}}
const movementKeys=['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','z','q'];window.addEventListener('keydown',e=>{if($('dialog[open]')||e.target.closest('button,a,input'))return;let k=e.key.toLowerCase();if(movementKeys.includes(k)){e.preventDefault();keys.add(k)}if(e.key==='Escape')$('#restoreui').click()});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>{keys.clear();if(document.hidden)stopTour()});
let pad=null;document.querySelectorAll('[data-move]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();pad=b.dataset.move;b.setPointerCapture(e.pointerId)};b.onpointerup=b.onpointercancel=()=>pad=null});
try{
scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(innerWidth<700?65:54,innerWidth/innerHeight,.08,70);camera.position.copy(current);
renderer=new THREE.WebGLRenderer({antialias:!mobile,powerPreference:'high-performance'});
let ratio=Math.min(devicePixelRatio,1.5);renderer.setPixelRatio(ratio);renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=!mobile;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;$('#scene').append(renderer.domElement);raycaster=new THREE.Raycaster();
const loft=buildLoft(scene,{mobile,reduced});floorMesh=loft.floor;const wall=loft.wall,dark=loft.dark,wood=loft.wood;
const loader=new THREE.TextureLoader(),canvasEdge=new THREE.MeshLambertMaterial({color:0xe9e1d4});
let shadowsDirty=true;
function easel(x,z){const parts=[];const add=(m,rx=0,rz=0)=>{m.rotation.set(rx,0,rz);m.castShadow=true;m.receiveShadow=true;scene.add(m);parts.push(m)};const b=(w,h,d,px,py,pz)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wood);m.position.set(px,py,pz);return m};
 for(const side of [-1,1])add(b(.07,2.95,.07,x+side*.42,1.47,z+.07),0,side*.09);add(b(.06,3.1,.06,x,1.55,z+.08));add(b(.06,2.9,.06,x,1.35,z+.55),-.32);add(b(1.75,.06,.2,x,.62,z-.02));add(b(.22,.08,.12,x,2.58,z+.04));add(b(1.2,.04,.04,x,.55,z+.4))}
works.forEach((w,i)=>{const group=new THREE.Group();group.position.set(w.x,w.y??2.6,w.z);group.rotation.y=w.rotation;scene.add(group);
 const depth=w.stand?.04:.12,frame=new THREE.Mesh(new THREE.BoxGeometry(w.stand?w.w:w.w+.10,w.stand?w.h:w.h+.10,depth),w.stand?canvasEdge:dark);frame.castShadow=true;frame.receiveShadow=true;group.add(frame);
 const tex=loader.load(mobile?w.thumb:w.image,undefined,undefined,()=>{const card=document.querySelectorAll('.work-card span')[i];if(card)card.textContent='Image indisponible'});tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const painting=new THREE.Mesh(new THREE.PlaneGeometry(w.w,w.h),new THREE.MeshBasicMaterial({map:tex,toneMapped:false}));painting.position.z=depth/2+.003;painting.userData.work=i;group.add(painting);artMeshes.push(painting);
 if(!w.stand){const plaque=new THREE.Mesh(new THREE.BoxGeometry(.35,.18,.014),wall);plaque.position.set(w.w/2+.31,-w.h/2+.1,0);group.add(plaque);if(!mobile){const spot=new THREE.SpotLight(0xffd5b3,8,6,.5,.65,1.7);spot.position.set(w.x+Math.sin(w.rotation)*1.3,5.35,w.z+Math.cos(w.rotation)*1.3);spot.target=group;scene.add(spot)}}
 else if(w.title==='Tradition')easel(w.x,w.z)});
hoverRing=new THREE.Mesh(new THREE.RingGeometry(.22,.25,48),new THREE.MeshBasicMaterial({color:0xf2b4ca,transparent:true,opacity:.65,side:THREE.DoubleSide}));hoverRing.rotation.x=-Math.PI/2;hoverRing.visible=false;scene.add(hoverRing);
const targets=[...artMeshes,...loft.interactives,floorMesh];
function hits(e){pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(targets,false)}
let down=null,hoverQueued=null;renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,yaw:targetYaw,pitch:targetPitch,drag:false};renderer.domElement.setPointerCapture(e.pointerId)});
function hover(e){const hit=hits(e)[0];renderer.domElement.style.cursor=(hit?.object.userData.work!==undefined||hit?.object.userData.music)?'pointer':hit?'crosshair':'grab';hoverRing.visible=!!hit&&hit.object===floorMesh;if(hoverRing.visible){hoverRing.position.copy(hit.point);hoverRing.position.y=.003}}
renderer.domElement.addEventListener('pointermove',e=>{if(down){let dx=e.clientX-down.x,dy=e.clientY-down.y;if(Math.abs(dx)+Math.abs(dy)>7&&!down.drag){free();down.yaw=targetYaw;down.pitch=targetPitch;down.drag=true}if(down.drag){targetYaw=down.yaw-dx*.004;targetPitch=THREE.MathUtils.clamp(down.pitch+dy*.003,-.8,.8);hoverRing.visible=false}}else if(e.pointerType==='mouse'){if(!hoverQueued)requestAnimationFrame(()=>{hover(hoverQueued);hoverQueued=null});hoverQueued=e}});
renderer.domElement.addEventListener('pointerup',e=>{if(down&&!down.drag){let hit=hits(e)[0];if(hit?.object.userData.music){window.dispatchEvent(new Event('clevart-open-music'))}else if(hit?.object.userData.work!==undefined){let i=hit.object.userData.work;if(visiting&&selected===i&&!transition&&current.distanceTo(new THREE.Vector3(works[i].x,1.72,works[i].z))<4.8)openDetail(i);else go(i)}else if(hit?.object===floorMesh){free();let x=THREE.MathUtils.clamp(hit.point.x,-4.1,4.1),z=THREE.MathUtils.clamp(hit.point.z,-4.15,10.5);if(!blocked(x,z)){target.set(x,1.72,z);transition={from:current.clone(),to:target.clone(),yawFrom:yaw,yawTo:targetYaw,pitchFrom:pitch,pitchTo:targetPitch,t:0}}}}down=null});renderer.domElement.addEventListener('pointercancel',()=>down=null);renderer.domElement.addEventListener('pointerleave',()=>hoverRing.visible=false);
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();move(-Math.sign(e.deltaY),0,.45)},{passive:false});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<700?65:54;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
const mapDot=$('#mapPosition');let last=performance.now(),lastMap=0,slowTime=0,slowFrames=0;
function animate(now){requestAnimationFrame(animate);const frameMs=now-last;last=now;if(document.hidden)return;const dialogOpen=!!$('dialog[open]');let dt=Math.min(frameMs/1000,.05);
 if(!dialogOpen){let f=(keys.has('w')||keys.has('z')||keys.has('arrowup')||pad==='forward'?1:0)-(keys.has('s')||keys.has('arrowdown')||pad==='back'?1:0),s=(keys.has('d')||keys.has('arrowright')||pad==='right'?1:0)-(keys.has('a')||keys.has('q')||keys.has('arrowleft')||pad==='left'?1:0);if(f||s){let norm=Math.hypot(f,s);move(f/norm,s/norm,dt*2.4)}if(guided&&!transition){tourElapsed+=dt;$('#tourprogress').style.width=`${Math.min(tourElapsed/10,1)*90}%`;if(tourElapsed>=10)go(selected+1,true)}}
 else if(!transition)return;
 if(transition){transition.t=Math.min(1,transition.t+dt/(reduced?.01:2.15));let t=transition.t,t2=t*t*(3-2*t);if(!transition.path)transition.path=safePath(transition.from,transition.to);current.copy(onPath(transition.path,t2));yaw=THREE.MathUtils.lerp(transition.yawFrom,transition.yawTo,t2);pitch=THREE.MathUtils.lerp(transition.pitchFrom,transition.pitchTo,t2);if(t===1)transition=null}else{let t=reduced?1:1-Math.exp(-9*dt);current.lerp(target,t);yaw+=(targetYaw-yaw)*t;pitch+=(targetPitch-pitch)*t}
 camera.position.copy(current);camera.rotation.order='YXZ';camera.rotation.set(pitch,-yaw,0);
 if(now-lastMap>120){mapDot.setAttribute('cx',String(60+current.x*7.5));mapDot.setAttribute('cy',String(18+(current.z+7)*6.7));lastMap=now}
 if(frameMs<250){slowTime+=frameMs;slowFrames++}if(slowFrames>=60){if(slowTime/slowFrames>24&&ratio>.75){ratio=Math.max(.75,ratio-.25);renderer.setPixelRatio(ratio);renderer.setSize(innerWidth,innerHeight)}slowTime=0;slowFrames=0}
 if(shadowsDirty&&renderer.shadowMap.enabled){renderer.shadowMap.needsUpdate=true;shadowsDirty=false}
 loft.update(now/1000);renderer.render(scene,camera)}
requestAnimationFrame(animate);
}catch(e){console.error(e);$('#fallback').hidden=false;$('#intro').style.display='none';$('#artHint').style.display='none';$('#enter').disabled=true;document.querySelectorAll('.work-card').forEach((b,i)=>b.onclick=()=>openDetail(i))}
