const $=s=>document.querySelector(s);
const tracks=[{src:'pink-white.mp3',title:'Pink + White',artist:'Frank Ocean'},{src:'open-arms.mp3',title:'Open Arms',artist:'SZA, Travis Scott'}];
const audio=new Audio();audio.preload='none';audio.volume=.6;
let index=0,loaded=false;
const panel=$('#musicPanel'),toggle=$('#musicToggle');
function label(){const t=tracks[index];$('#musicTrack').textContent=t.title+' · '+t.artist}
function load(i){index=(i+tracks.length)%tracks.length;audio.src=tracks[index].src;loaded=true;label()}
function state(){const playing=!audio.paused;$('#musicPlay').textContent=playing?'Pause':'Lire';$('#musicLabel').textContent=playing?tracks[index].title:'Musique';document.body.classList.toggle('music-playing',playing);window.dispatchEvent(new CustomEvent('clevart-music-state',{detail:{playing}}))}
function play(){if(!loaded)load(index);audio.play().catch(()=>{})}
function open(){panel.hidden=false;document.body.classList.add('music-open');toggle.setAttribute('aria-expanded','true');if(!loaded)play()}
function minimize(){panel.hidden=true;document.body.classList.remove('music-open');toggle.setAttribute('aria-expanded','false')}
function stop(){audio.pause();minimize()}
toggle.onclick=()=>panel.hidden?open():minimize();
window.addEventListener('clevart-open-music',open);
$('#musicMin').onclick=minimize;$('#musicClose').onclick=stop;
$('#musicPlay').onclick=()=>audio.paused?play():audio.pause();
$('#musicPrev').onclick=()=>{if(audio.currentTime>3){audio.currentTime=0;return}load(index-1);play()};
$('#musicNext').onclick=()=>{load(index+1);play()};
$('#musicVolume').oninput=e=>audio.volume=Number(e.target.value)/100;
audio.addEventListener('ended',()=>{load(index+1);play()});
audio.addEventListener('play',state);audio.addEventListener('pause',state);
audio.addEventListener('timeupdate',()=>{if(audio.duration)$('#musicProgress').style.width=(audio.currentTime/audio.duration*100)+'%'});
$('#musicBar').onclick=e=>{if(!audio.duration)return;const r=e.currentTarget.getBoundingClientRect();audio.currentTime=(e.clientX-r.left)/r.width*audio.duration};
label();
