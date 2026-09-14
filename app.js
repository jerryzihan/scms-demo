const cases = [
  {id:1, name:'Chinese example 01', language:'Chinese'},
  {id:2, name:'Chinese example 02', language:'Chinese'},
  {id:3, name:'English example 01', language:'English'},
  {id:4, name:'English example 02', language:'English'},
  {id:5, name:'English example 03', language:'English'}
];
function el(tag, cls, text){const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n}
function segments(text){const result=[];for(const line of text.split(/\r?\n/)){const t=line.trim();if(!t)continue;if(/^\[[^\]]+\]$/.test(t)){const value=t.slice(1,-1);if(!result.length||result[result.length-1].style){result.push({name:value,style:'',lyrics:[]})}else result[result.length-1].style=value;}else if(result.length)result[result.length-1].lyrics.push(t)}return result}
async function promptView(id,part){const text=window.SCMS_PROMPTS?.[id];if(!text)throw new Error('Prompt unavailable');const grid=el('div','segment-list');for(const s of segments(text)){const box=el('div','segment');box.append(el('h5','',s.name),el('p','prompt-label','Style description'),el('p','',s.style),el('p','prompt-label','Lyrics'),el('p','lyrics',s.lyrics.length?s.lyrics.join('\n'):'Instrumental segment (no lyrics)'));grid.append(box)}return grid}
const root=document.querySelector('#songs');root.replaceChildren();
for(const c of cases){
  const article=el('article','song');article.id=`example-${c.id}`;
  const heading=el('div','song-head');heading.append(el('h3','',c.name),el('span','badge',c.language));article.append(heading);
  const body=el('div','song-body');
  const prompts=el('div','prompt-sidebar');
  prompts.append(el('h4','','Segment style descriptions & lyrics'));
  const scroll=el('div','prompt-scroll');scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label',`${c.name}: style descriptions and lyrics`);
  promptView(c.id,1).then(grid=>scroll.append(grid)).catch(()=>scroll.append(el('p','error','Prompt could not load. Please reload the page.')));
  prompts.append(scroll);body.append(prompts);
  const players=el('div','players');
  for(const [part,name] of [[1,'HeartMuLa'],[2,'Muse']]){
    const col=el('div',`backbone ${part===2?'muse':''}`);col.append(el('h4','',name));
    for(const [sample,method] of [[1,'SFT'],[2,'SCMS']]){
      const track=el('div',`track ${method==='SCMS'?'scms':''}`);const label=el('label','',`${name}-${method}`);const audio=el('audio');
      audio.id=`audio-${c.id}-${part}-${sample}`;label.htmlFor=audio.id;audio.controls=true;audio.preload='none';audio.src=`assets/case${c.id}/part${part}/sample${sample}.mp3`;audio.setAttribute('aria-label',`${c.name}, ${name}-${method}`);
      audio.addEventListener('play',()=>{document.querySelectorAll('audio').forEach(other=>{if(other!==audio)other.pause()})});
      audio.addEventListener('error',()=>{if(!track.querySelector('.error'))track.append(el('p','error','Audio could not load. Please reload the page.'))});
      track.append(label,audio);col.append(track);
    }
    players.append(col);
  }
  body.append(players);article.append(body);root.append(article);
}
