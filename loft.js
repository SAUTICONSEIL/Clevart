import * as T from './three.module.min.js';
export function buildLoft(scene,{mobile=false,reduced=false}={}){
 const solids=[], movers=[];let seed=82;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const ramp=new T.DataTexture(new Uint8Array([18,62,143,240]),4,1,T.RedFormat);ramp.minFilter=ramp.magFilter=T.NearestFilter;ramp.generateMipmaps=false;ramp.needsUpdate=true;
 const materialCache=new Map();const mat=(c,r=.75,m=0)=>{let key=[c,r,m].join(':');if(!materialCache.has(key))materialCache.set(key,new T.MeshToonMaterial({color:c,gradientMap:ramp}));return materialCache.get(key)};
 const metal=mat('#19212d',.38,.65),wood=mat('#855539'),teal=mat('#168ca8'),purple=mat('#723f99'),pink=mat('#ec548d'),gold=mat('#bb8c49',.4,.5),paper=mat('#dfceab'),terra=mat('#a45b50');
 const glowCache=new Map();const glow=c=>{if(!glowCache.has(c))glowCache.set(c,new T.MeshBasicMaterial({color:c}));return glowCache.get(c)};
 function mesh(g,m,x,y,z,group=scene){let o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o}
 function box(w,h,d,x,y,z,m=wood,g=scene){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,g)}
 function cyl(r1,r2,h,x,y,z,m,g=scene,n=12){return mesh(new T.CylinderGeometry(r1,r2,h,n),m,x,y,z,g)}
 function sphere(r,x,y,z,m,g=scene){return mesh(new T.IcosahedronGeometry(r,1),m,x,y,z,g)}
 function rod(a,b,r,m=metal,g=scene){let v=new T.Vector3(...b).sub(new T.Vector3(...a)),o=cyl(r,r,v.length(),...(new T.Vector3(...a).addScaledVector(v,.5).toArray()),m,g,8);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o}
 function texture(type){let c=document.createElement('canvas');c.width=c.height=512;let ctx=c.getContext('2d');ctx.fillStyle=type==='brick'?'#8a2a62':'#604039';ctx.fillRect(0,0,512,512);
 if(type==='brick'){for(let row=0;row<16;row++)for(let col=-1;col<5;col++){let x=col*128+(row%2)*64,y=row*32;let v=rand()*16;ctx.fillStyle=(row+col)%3===0?`rgb(${232+v},${58+v},${146+v})`:`rgb(${206+v},${40+v},${124+v})`;ctx.fillRect(x+2,y+2,124,28);ctx.fillStyle='#ffffff12';ctx.fillRect(x+3,y+3,122,2);for(let j=0;j<20;j++){ctx.fillStyle=rand()>.5?'#0000000b':'#ffffff0c';ctx.fillRect(x+rand()*124,y+rand()*28,rand()*18,1)}}}
 else{for(let x=0;x<512;x+=64){ctx.fillStyle=['#996e4c','#855a43','#b08054','#78604b'][Math.floor(rand()*4)];ctx.fillRect(x+1,0,62,512);for(let j=0;j<130;j++){ctx.strokeStyle=rand()>.5?'#24182420':'#ffd4a31a';ctx.beginPath();let xx=x+rand()*62;ctx.moveTo(xx,0);ctx.bezierCurveTo(xx+7,170,xx-5,340,xx,512);ctx.stroke()}for(let y=(x%128?90:250);y<512;y+=270){ctx.fillStyle='#261a2466';ctx.fillRect(x,y,64,2)}}}
 let t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(type==='brick'?3:4,type==='brick'?2:5);return t}
 const brick=new T.MeshToonMaterial({map:texture('brick'),gradientMap:ramp}),planks=new T.MeshToonMaterial({map:texture('wood'),gradientMap:ramp}),wall=mat('#c24c94');
 brick.bumpMap=brick.map;brick.bumpScale=.035;planks.bumpMap=planks.map;planks.bumpScale=.013;
 const floor=box(12,.2,25,0,-.11,5.3,planks);box(.2,6,25,-6,3,5.3,brick);box(.2,6,25,6,3,5.3,brick);box(12,.16,25,0,6,5.3,wood);box(12,6,.2,0,3,17.7,brick);
 box(3.4,6,.28,0,3,-7,brick);for(let x of [-5.8,5.8])box(.4,6,.28,x,3,-7,brick);box(12,.8,.3,0,.4,-7,brick);box(12,.5,.3,0,5.75,-7,brick);
 const skyC=document.createElement('canvas');skyC.width=8;skyC.height=256;let sc=skyC.getContext('2d'),grad=sc.createLinearGradient(0,0,0,256);grad.addColorStop(0,'#080e2a');grad.addColorStop(.45,'#252254');grad.addColorStop(.75,'#714170');grad.addColorStop(1,'#bc6485');sc.fillStyle=grad;sc.fillRect(0,0,8,256);let skyT=new T.CanvasTexture(skyC);skyT.colorSpace=T.SRGBColorSpace;box(60,35,.1,0,10,-24,new T.MeshBasicMaterial({map:skyT}));
 for(let i=0;i<25;i++){let x=-21+i*1.8,h=2+rand()*8,z=-16-rand()*5;let b=box(1.4,h,1.5,x,h/2-2,z,mat(['#343853','#54405e','#3d506a'][i%3]));for(let yy=0;yy<h-.5;yy+=.65)for(let xx of [-.4,0,.4])if(rand()>.5)box(.12,.23,.025,x+xx,yy-1.5,z+.77,glow(rand()>.5?'#f1b474':'#73b4c2'))}
 for(let cx of [-3.75,3.75]){for(let x of [cx-1.65,cx,cx+1.65])box(.07,4.6,.12,x,3.1,-6.95,metal);for(let y of [.82,2.3,3.8,5.4])box(3.35,.075,.14,cx,y,-6.94,metal);box(3.7,.13,.6,cx,.83,-6.76,wood)}
 for(let z=-5;z<17;z+=3.8){box(12,.3,.22,0,5.65,z,wood);box(12,.04,.07,0,5.47,z,metal)}for(let x of [-5.72,5.72]){box(.17,5.8,.17,x,2.9,.1,metal);box(.13,5.8,.13,x,2.9,8,metal)}
 scene.add(new T.HemisphereLight('#ffb6dc','#5a2448',1.05));const sun=new T.DirectionalLight('#d987c4',.9);sun.position.set(-4,5,-10);sun.target.position.set(1,0,4);scene.add(sun,sun.target);sun.castShadow=true;sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,far:45});sun.shadow.normalBias=.035;
 function light(c,int,x,y,z,d=12){if(mobile&&int<=12)return null;let l=new T.PointLight(c,int,d,2);l.position.set(x,y,z);scene.add(l);return l}light('#19abd0',33,-4,2.5,-4,7);light('#da297d',29,4,2.4,1,6);light('#bf64a7',15,0,3.8,8,6);
 box(3.9,.025,2.0,0,.012,3.3,mat('#85415f'));for(let x of [-1.78,1.78])box(.045,.028,1.8,x,.03,3.3,gold);
 box(3.15,.26,.95,0,.36,3.35,teal);box(3.18,.7,.2,0,.75,3.83,teal);for(let x of [-1.55,1.55]){box(.2,.6,1,x,.66,3.35,teal);for(let z of [2.98,3.75])cyl(.035,.03,.25,x,.14,z,metal)}
 for(let x of [-1,0,1]){box(.95,.17,.8,x,.58,3.27,mat(x===0?'#2c8292':'#246d86'));let c=box(.57,.5,.16,x,.92,3.62,mat(x===0?'#d5648e':'#593776'));c.rotation.z=x*.12;c.rotation.x=-.2}
 let blanket=box(.65,.07,.74,1.03,.7,3.17,mat('#ce9665'));blanket.rotation.y=.12;box(.65,.43,.06,1.03,.51,2.8,mat('#ce9665'));
 box(3.9,.023,4.2,0,.014,2.24,mat('#683654'));
 for(let x of [-1.82,1.82])box(.042,.03,4.0,x,.032,2.24,gold);
 let coffee=cyl(.65,.65,.11,-.27,.49,1.78,wood,scene,24);coffee.scale.x=1.7;
 for(let x of [-1.03,.49])for(let z of [1.42,2.11])rod([x,.045,z],[x,.44,z],.036,metal);
 box(.57,.035,.38,-.53,.57,1.71,pink);let magazine=box(.45,.025,.32,-.37,.6,1.79,paper);magazine.rotation.y=.23;
 for(let i=0;i<5;i++)box(.29,.005,.011,-.36,.615,1.7+i*.035,teal);
 cyl(.12,.12,.022,.13,.565,1.78,metal);cyl(.08,.065,.13,.13,.65,1.78,terra);
 let mug=mesh(new T.TorusGeometry(.055,.014,6,12),terra,.22,.65,1.78);mug.rotation.y=Math.PI/2;
 cyl(.07,.07,.22,-.97,.655,1.67,paper);sphere(.028,-.97,.78,1.67,glow('#ffbd74'));light('#ffad68',3,-.97,.84,1.67,2.5);
 cyl(.38,.42,.4,1.31,.22,.87,mat('#803d6e'),scene,12);cyl(.37,.37,.065,1.31,.45,.87,mat('#bc617e'),scene,12);
 box(.52,.35,.42,-1.23,.2,.67,wood);for(let i=0;i<6;i++){let sleeve=box(.39,.36,.035,-1.23,.37,.5+i*.047,mat(['#8562b0','#db7d87','#458d9c'][i%3]));sleeve.rotation.x=-.18}
 cyl(.19,.21,.05,1.75,.035,2.37,metal);rod([1.75,.05,2.37],[1.75,1.7,2.37],.018,gold);cyl(.12,.29,.32,1.75,1.73,2.37,mat('#9c667b'));cyl(.26,.26,.016,1.75,1.565,2.37,glow('#e9ab73'));light('#f8ad72',10,1.75,1.5,2.37,3.2);
 for(let sign of [-1,1]){
 const x=sign*3.65,z=-5.38;
 box(2.45,.024,2.15,x,.016,z,mat(sign<0?'#583b70':'#3c566e'));
 box(.9,.23,.85,x,.3,z,mat('#406e88'));box(.92,.65,.14,x,.7,z-.38,mat('#58578b'));
 for(let xx of [x-.45,x+.45])box(.14,.47,.87,xx,.56,z,mat('#485781'));
 let cushion=box(.55,.35,.18,x,.75,z-.26,mat(sign<0?'#cf697f':'#b87d63'));cushion.rotation.z=sign*.12;
 const tx=x-sign*.79;cyl(.29,.29,.07,tx,.58,z+.25,wood);rod([tx,.06,z+.25],[tx,.55,z+.25],.04,gold);cyl(.22,.22,.04,tx,.04,z+.25,metal);
 cyl(.065,.055,.12,tx,.68,z+.25,terra);box(.24,.025,.18,tx+.04,.635,z+.06,paper);
 for(let i=0;i<5;i++){let b=box(.4,.055,.3,x+sign*.65,.04+i*.06,z+.73,mat(['#ab7186','#437982','#b79160'][i%3]));b.rotation.y=i*.07}
 cyl(.22,.17,.38,x-sign*.68,.19,z-.6,terra);for(let i=0;i<7;i++)rod([x-sign*.68,.35,z-.6],[x-sign*.68+(rand()-.5)*.3,.85+rand()*.35,z-.6+(rand()-.5)*.2],.008,gold);
 }
 for(let x of [-4.7,-2.75,2.75,4.7]){cyl(.09,.065,.21,x,1,-6.73,mat('#805876'));for(let i=0;i<3;i++)rod([x,1.1,-6.73],[x+(i-1)*.08,1.42+rand()*.12,-6.7],.006,gold)}
 for(let i=0;i<6;i++)book(-3.9+i*.1,.9,-6.75,.075,.25+rand()*.12,.19);
 plant(3.78,-6.3,.56,.9);
 for(let z of [-3.2,2,7.5]){rod([0,5.8,z],[0,4.48,z],.012);cyl(.16,.48,.43,0,4.4,z,metal,scene,16);cyl(.43,.43,.025,0,4.19,z,glow('#ffe0a0'));light('#ffba68',12,0,4.05,z,5)}
 function book(x,y,z,w=.09,h=.35,d=.25,g=scene){box(w,h,d,x,y+h/2,z,mat(['#d78f61','#6c96a3','#c95380','#d9c192','#323953'][Math.floor(rand()*5)]),g);box(w*.75,.018,.008,x,y+h*.2,z+d/2+.005,paper,g)}
 function speaker(x,y,z){box(.42,.8,.35,x,y+.4,z,metal);for(let yy of [y+.23,y+.58]){let o=cyl(.14,.14,.03,x,yy,z+.19,mat('#576176'));o.rotation.x=Math.PI/2;let a=sphere(.075,x,yy,z+.22,metal);a.scale.z=.3}}
 box(.7,1.08,2.1,-5.33,.54,.1,wood);for(let z of [-.65,0,.65])box(.74,.04,.03,-5.3,.62,z,gold);speaker(-5.15,1.08,-.65);speaker(-5.15,1.08,.7);let tt=box(.64,.08,.6,-5.16,1.14,.05,metal);tt.userData.live=true;tt.userData.music=true;
 const record=new T.Group();record.position.set(-5.16,1.19,.05);scene.add(record);
 cyl(.275,.275,.022,0,0,0,metal,record,40);cyl(.08,.08,.025,0,.014,0,pink,record,24);
 for(let r of [.12,.16,.2,.24]){const groove=mesh(new T.TorusGeometry(r,.0018,3,40),mat('#636076'),0,.014,0,record);groove.rotation.x=Math.PI/2}
 box(.014,.003,.07,.019,.03,0,paper,record);box(.033,.003,.018,-.033,.03,.015,gold,record);
 record.traverse(o=>{o.userData.live=true;o.userData.music=true});
 rod([-4.92,1.23,-.19],[-5.02,1.235,.14],.012,gold);sphere(.018,-5.02,1.235,.14,gold);
 let musicPlaying=false,previousTime=null;window.addEventListener('clevart-music-state',e=>{musicPlaying=Boolean(e.detail?.playing)});

 for(let i=0;i<8;i++)book(-5.2,0.1,-.8+i*.2,.35,.35,.08);
 function shelves(x,z){box(.55,.07,1.8,x,1.15,z,wood);box(.55,.07,1.8,x,1.95,z,wood);box(.55,.07,1.8,x,2.75,z,wood);for(let dz of [-.88,.88])box(.06,2.85,.06,x+.2,1.42,z+dz,metal);for(let i=0;i<9;i++)book(x,1.99,z-.72+i*.17,.35,.25+rand()*.23,.1);for(let i=0;i<7;i++)book(x,1.19,z-.66+i*.19,.3,.24+rand()*.2,.12)}shelves(5.35,.1);
 function plant(x,z,size=1,y=0){let g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(size);scene.add(g);cyl(.25,.18,.44,0,.22,0,terra,g);cyl(.23,.23,.025,0,.45,0,mat('#2f2430'),g);for(let i=0;i<9;i++){let a=i*2.4,h=.7+rand()*.9,r=.2+rand()*.35;rod([0,.4,0],[Math.cos(a)*r,h,Math.sin(a)*r],.014,mat('#3d6a54'),g);let leaf=sphere(.28,Math.cos(a)*r,h,Math.sin(a)*r,mat(i%2?'#348978':'#467850'),g);leaf.scale.set(.5,1.6,.16);leaf.rotation.set(.4,a,.55)}}
 function stackedBooks(x,z){for(let i=0;i<6;i++){let b=box(.48,.07,.34,x,.06+i*.073,z,mat(['#c96572','#c5a770','#537c99'][i%3]));b.rotation.y=(rand()-.5)*.4}}stackedBooks(4.9,-5);stackedBooks(-4.75,5.1);
 function carton(x,z,s){box(s,s*.7,s,x,s*.35,z,mat('#a17959'));box(s,.012,.075,x,s*.7+.01,z,mat('#ccb088'));box(.2,.045,.012,x,s*.45,z+s/2+.01,metal)}carton(5.1,7,.65);carton(4.6,7.35,.55);carton(-4.8,7,.72);
 box(12,.2,5.5,0,3.7,14.6,wood);for(let x of [-5.7,-2.5,2.5,5.7])box(.16,3.7,.16,x,1.85,12,metal);for(let x=-5.8;x<=5.8;x+=.72)rod([x,3.78,11.9],[x,4.7,11.9],.02);rod([-5.9,4.7,11.9],[5.9,4.7,11.9],.035);rod([-5.9,4.1,11.9],[5.9,4.1,11.9],.016);
 for(let i=0;i<15;i++){let z=7.5+i*.29,y=.12+i*.244;box(1.15,.1,.32,5,y,z,wood);rod([4.4,y+.1,z],[4.4,y+1,z],.016)}rod([4.4,1.1,7.5],[4.4,4.52,11.56],.03);rod([5.58,1.1,7.5],[5.58,4.52,11.56],.03);
 box(5,.9,.8,-2, .45,17,mat('#747688'));box(5,.09,.92,-2,.93,17,paper);box(1.1,2.1,.8,2,.99,17,mat('#7a8b95'));for(let x of [-3.8,-2.8,-1.8,-.8]){box(.018,.75,.025,x,.46,16.58,metal);box(.18,.025,.025,x+.4,.76,16.57,gold)}
 box(2.2,.22,2.3,-3.5,3.94,15.4,wood);box(2.15,.2,2.2,-3.5,4.15,15.4,mat('#4e7983'));box(2.12,.12,1.5,-3.5,4.31,15.65,purple);for(let x of [-4,-3])box(.7,.17,.44,x,4.31,14.7,pink);box(2.5,.12,.8,1,4.48,16.4,wood);for(let x of [0,2])rod([x,3.8,16.4],[x,4.45,16.4],.035);box(.7,.5,.06,1,4.85,16.5,metal);box(.62,.41,.01,1,4.85,16.46,glow('#429daf'));
 let easel=new T.Group();easel.position.set(-5,0,8.05);easel.rotation.y=-Math.PI/2;scene.add(easel);rod([-.42,0,0],[0,2,0],.035,wood,easel);rod([.42,0,0],[0,2,0],.035,wood,easel);rod([0,1.8,0],[0,0,.55],.035,wood,easel);box(1.05,.06,.22,0,.7,0,wood,easel);for(let i=0;i<7;i++){cyl(.045,.045,.16,-4.55+i*.05,.12,8.75-i*.04,mat(['#cc4775','#2692a3','#e1b24b'][i%3]));}
 const bike=new T.Group();bike.position.set(5.4,.05,9.1);bike.rotation.y=Math.PI/2;scene.add(bike);for(let x of [-.65,.65]){let wheel=mesh(new T.TorusGeometry(.43,.025,6,32),metal,x,.44,0,bike);for(let i=0;i<12;i++){let a=i*Math.PI/6;rod([x,.44,0],[x+Math.cos(a)*.42,.44+Math.sin(a)*.42,0],.004,paper,bike)}}for(let [a,b] of [[[ -.65,.44,0],[-.15,.5,0]],[[-.15,.5,0],[-.3,1,0]],[[-.3,1,0],[-.65,.44,0]],[[-.3,1,0],[.4,1,0]],[[.4,1,0],[-.15,.5,0]],[[.4,1,0],[.65,.44,0]]])rod(a,b,.024,pink,bike);box(.3,.05,.12,-.3,1.06,0,metal,bike);rod([.4,1,0],[.45,1.25,0],.02,metal,bike);rod([.45,1.25,-.16],[.45,1.25,.16],.02,metal,bike);
 const plum=mat('#843965'),orange=mat('#e5a15d'),cream=mat('#dfbb9b');
 box(7.5,.03,4.8,-.8,.02,14,plum);
 for(let x=-4.35;x<2.8;x+=.3)box(.13,.012,.21,x,.042,11.76,orange);
 for(let z=11.9;z<16.1;z+=.38){box(.14,.013,.2,-4.43,.043,z,orange);box(.14,.013,.2,2.83,.043,z,orange)}
 box(2.8,.28,.9,-3.6,.4,15.1,purple);box(2.85,.75,.16,-3.6,.85,15.53,plum);
 for(let x of [-4.98,-2.22])box(.18,.65,1,x,.65,15.1,purple);
 for(let i=0;i<3;i++){box(.86,.18,.74,-4.5+i*.9,.62,15.03,mat('#a34077'));let c=box(.52,.48,.16,-4.5+i*.9,.96,15.35,i===1?teal:orange);c.rotation.z=(i-1)*.17}
 box(.58,.05,.7,-2.75,.74,14.99,teal);box(.58,.36,.05,-2.75,.54,14.63,teal);
 let table=cyl(.72,.72,.1,-3.55,.53,13.45,wood,scene,28);table.scale.x=1.45;
 for(let x of [-4.18,-2.92])for(let z of [13.15,13.74])rod([x,.04,z],[x,.48,z],.028);
 for(let i=0;i<3;i++){let b=box(.48,.028,.35,-3.65+i*.12,.6+i*.03,13.38,mat(['#ed738c','#66bac4','#ebc784'][i]));b.rotation.y=.25*i}
 cyl(.085,.07,.12,-3.03,.65,13.22,cream);let handle=mesh(new T.TorusGeometry(.057,.013,6,12),cream,-2.94,.65,13.22);handle.rotation.y=Math.PI/2;
 for(let [x,z] of [[-4.1,13.4],[-4.02,13.7]]){cyl(.055,.055,.19,x,.67,z,paper);sphere(.025,x,.79,z,glow('#ffb85a'))}
 box(2.0,.12,1.15,.9,.84,14.65,wood);for(let x of [.1,1.7])for(let z of [14.22,15.08])rod([x,0,z],[x,.79,z],.04);
 function chair(x,z,angle){let g=new T.Group();g.position.set(x,0,z);g.rotation.y=angle;scene.add(g);box(.5,.08,.5,0,.44,0,orange,g);box(.5,.49,.06,0,.73,.23,teal,g);for(let xx of [-.19,.19])for(let zz of [-.19,.19])rod([xx,0,zz],[xx,.4,zz],.022,metal,g)}
 chair(.35,13.73,Math.PI);chair(1.45,13.73,Math.PI);chair(.35,15.56,0);chair(1.45,15.56,0);
 box(.64,.035,.43,.65,.925,14.48,paper);box(.37,.04,.53,1.16,.925,14.72,pink);cyl(.1,.08,.18,1.58,.98,14.4,terra);
 for(let i=0;i<7;i++)rod([1.58,.98,14.4],[1.52+rand()*.14,1.25+rand()*.1,14.32+rand()*.15],.008,i%2?gold:teal);
 for(let y of [.18,.88,1.58,2.28,2.98])box(2.3,.055,.44,-4.5,y,16.88,wood);
 for(let x of [-5.63,-3.37])box(.06,3.1,.45,x,1.55,16.88,metal);
 for(let y of [.22,.92,1.62,2.32])for(let i=0;i<15;i++)book(-5.49+i*.132,y,16.85,.1,.27+rand()*.21,.3);
 for(let x of [-5.15,-4.5,-3.85]){cyl(.13,.09,.26,x,3.13,16.85,mat(x===-4.5?'#a884c5':'#e4a374'));sphere(.15,x,3.33,16.85,teal)}
 box(1.8,.9,.63,3.73,.45,16.81,wood);box(1.7,.075,.58,3.73,.94,16.78,metal);
 for(let i=0;i<18;i++){box(.074,.035,.31,2.95+i*.086,1.0,16.61,paper);if(i%7!==2&&i%7!==6)box(.037,.04,.18,2.99+i*.086,1.03,16.68,metal)}
 speaker(2.8,.99,16.89);speaker(4.64,.99,16.89);box(.55,.24,.28,3.74,1.1,17,metal);box(.38,.07,.013,3.74,1.13,16.852,glow('#65decb'));
 cyl(.28,.28,.06,-1.98,.035,15.68,metal);rod([-1.98,.05,15.68],[-1.98,2.05,15.68],.025,gold);cyl(.22,.38,.38,-1.98,2.12,15.68,orange);cyl(.34,.34,.018,-1.98,1.925,15.68,glow('#ffd795'));light('#ffac65',25,-1.98,1.9,15.68,4.5);
 plant(-5.25,12.2,1.05);plant(2.72,12.17,.85);plant(5.3,15.75,1.2);
 for(let x of [-4,2.4]){rod([x,3.56,12.5],[x,2.93,12.5],.012,gold);cyl(.16,.11,.22,x,2.83,12.5,terra);for(let i=0;i<6;i++){let z=12.5+Math.sin(i)*.15;rod([x,2.8,12.5],[x+Math.cos(i)*.24,2.25,z],.011,teal);let leaf=sphere(.11,x+Math.cos(i)*.24,2.34,z,teal);leaf.scale.set(.7,1.6,.3)}}
 for(let [x,z] of [[-5.32,6.3],[5.32,6.3]]){box(.64,.77,1.05,x,.39,z,wood);for(let y of [.25,.53]){box(.015,.025,.11,x>0?x-.33:x+.33,y,z,gold)}stackedBooks(x,z-.2)}
 for(let i=0;i<12;i++){let stripe=box(.16,.02,.5,-4.25+i*.17,.065,12.02,i%2?teal:orange);stripe.rotation.y=.4}
 light('#cb329c',26,-4,2.2,14,6);light('#25aace',25,4,2,13.5,6);
 for(let i=0;i<20;i++){let x=-5.5+i*11/19,y=4.8-.35*Math.sin(i/19*Math.PI);sphere(.04,x,y,6.7,glow(i%3?'#ffcc92':'#eb78ac'));if(i)rod([x-11/19,4.8-.35*Math.sin((i-1)/19*Math.PI),6.7],[x,y,6.7],.007,metal)}
 const pts=new Float32Array((mobile?35:80)*3);for(let i=0;i<pts.length;i+=3){pts[i]=(rand()-.5)*11;pts[i+1]=.8+rand()*4;pts[i+2]=-5+rand()*15}let geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pts,3));let dust=new T.Points(geo,new T.PointsMaterial({color:'#eed0b0',size:.018,transparent:true,opacity:.3,depthWrite:false}));scene.add(dust);
 scene.background=new T.Color('#101124');scene.fog=new T.Fog('#171429',20,44);
 scene.updateMatrixWorld(true);const lineArrays=[];scene.traverse(o=>{if(!o.isMesh||o.material.isMeshBasicMaterial||o===floor||o.userData.live)return;const e=new T.EdgesGeometry(o.geometry,38);e.applyMatrix4(o.matrixWorld);lineArrays.push(e.getAttribute('position').array.slice());e.dispose()});let totalLines=lineArrays.reduce((n,a)=>n+a.length,0),ink=new Float32Array(totalLines),offset=0;for(const a of lineArrays){ink.set(a,offset);offset+=a.length}let inkGeo=new T.BufferGeometry();inkGeo.setAttribute('position',new T.BufferAttribute(ink,3));let outlines=new T.LineSegments(inkGeo,new T.LineBasicMaterial({color:'#19182b',transparent:true,opacity:.58}));scene.add(outlines);
 scene.updateMatrixWorld(true);const batches=new Map();scene.traverse(o=>{if(o.isMesh&&o!==floor&&!o.userData.live){let list=batches.get(o.material);if(!list)batches.set(o.material,list=[]);list.push(o)}});
 for(const [material,items] of batches){if(items.length<2)continue;let geos=items.map(o=>{let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);return g});const merged=new T.BufferGeometry();for(const name of ['position','normal','uv']){if(!geos.every(g=>g.getAttribute(name)))continue;const size=geos[0].getAttribute(name).itemSize,total=geos.reduce((n,g)=>n+g.getAttribute(name).array.length,0),data=new Float32Array(total);let offset=0;for(const g of geos){data.set(g.getAttribute(name).array,offset);offset+=g.getAttribute(name).array.length}merged.setAttribute(name,new T.BufferAttribute(data,size))}merged.computeBoundingSphere();const object=new T.Mesh(merged,material);object.castShadow=!material.isMeshBasicMaterial;object.receiveShadow=true;scene.add(object);for(const o of items){o.removeFromParent();o.geometry.dispose()}for(const g of geos)g.dispose()}
 return {floor,wall,dark:metal,wood,interactives:[tt,...record.children],record,update(t){const dt=previousTime===null?0:Math.min(t-previousTime,.06);previousTime=t;if(musicPlaying&&!reduced)record.rotation.y-=dt*3.49;if(!reduced)dust.position.y=Math.sin(t*.17)*.055}};
}
