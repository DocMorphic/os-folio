"use client";

import {useEffect,useState} from "react";
import type {BlogEntry} from "@/lib/blogs-store";
import {worldSound} from "@/lib/world-sound";
import styles from "./JournalVending.module.css";
import {ChocolateProduct} from "./ChocolateProduct";

const safeLink=(url:string)=>{try{return /^https?:$/.test(new URL(url).protocol);}catch{return false;}};
const PAGE_SIZE=4;
const sourceName=(url:string)=>new URL(url).hostname.replace(/^www\./,"");
function ShopOtter(){return <div className={styles.mascot} aria-hidden="true"><svg viewBox="0 0 240 260" fill="none"><ellipse cx="120" cy="242" rx="73" ry="10" fill="#175c4d" opacity=".15"/><path d="M62 219Q14 232 31 182Q44 151 67 172" fill="#986345" stroke="#583a32" strokeWidth="5"/><ellipse cx="120" cy="181" rx="64" ry="65" fill="#ab7753" stroke="#583a32" strokeWidth="5"/><ellipse cx="120" cy="189" rx="43" ry="44" fill="#ffe5bc"/><circle cx="60" cy="57" r="22" fill="#ab7753" stroke="#583a32" strokeWidth="5"/><circle cx="180" cy="57" r="22" fill="#ab7753" stroke="#583a32" strokeWidth="5"/><circle cx="60" cy="57" r="11" fill="#e8b299"/><circle cx="180" cy="57" r="11" fill="#e8b299"/><ellipse cx="120" cy="92" rx="77" ry="67" fill="#ab7753" stroke="#583a32" strokeWidth="5"/><path d="M55 101C59 56 104 67 120 82C142 62 181 68 186 105C185 166 54 163 55 101Z" fill="#ffe5bc"/><g className={styles.otterEyes} fill="#3d302f"><ellipse cx="87" cy="91" rx="6" ry="8"/><ellipse cx="153" cy="91" rx="6" ry="8"/></g><ellipse cx="72" cy="113" rx="12" ry="6" fill="#edab98"/><ellipse cx="168" cy="113" rx="12" ry="6" fill="#edab98"/><path d="M111 111Q120 103 129 111L120 121Z" fill="#583a32"/><path d="M120 119V125M120 125Q109 137 102 125M120 125Q131 137 138 125" stroke="#583a32" strokeWidth="3" strokeLinecap="round"/><path d="M66 147Q120 169 174 147L167 169Q121 185 72 168Z" fill="#34b4a4" stroke="#226d69" strokeWidth="3"/><path d="M153 170L176 201L150 208L137 174" fill="#34b4a4"/><g transform="rotate(-8 121 199)"><rect x="91" y="159" width="58" height="81" rx="5" fill="#663c2d" stroke="#422c28" strokeWidth="3"/><path d="M95 164H145V191H95Z" fill="#a77453"/><path d="M119 164V191M95 178H145" stroke="#663c2d" strokeWidth="4"/><path d="M89 188L102 183L115 191L131 183L150 189V240H89Z" fill="#ebe9dc"/><path d="M89 200H151V240H89Z" fill="#7962bc"/><text x="120" y="228" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="bold" fontSize="25" fill="#fff3ce">DD</text></g><ellipse cx="78" cy="199" rx="17" ry="24" transform="rotate(-28 78 199)" fill="#ab7753" stroke="#583a32" strokeWidth="4"/><ellipse cx="163" cy="199" rx="17" ry="24" transform="rotate(28 163 199)" fill="#ab7753" stroke="#583a32" strokeWidth="4"/></svg></div>;}
function Icon({kind}:{kind:"close"|"add"|"back"}){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={kind==="close"?"M6 6l12 12M18 6L6 18":kind==="add"?"M12 5v14M5 12h14":"M15 5l-7 7 7 7"}/></svg>;}
export function Chocolate({index=0,label="DD"}:{index?:number;label?:string}){
  return <ChocolateProduct index={index} label={label} className={styles.chocolate}/>;
}
export function JournalVending({onBack,focused}:{onBack():void;focused:boolean}){
  const [entries,setEntries]=useState<BlogEntry[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
  const [page,setPage]=useState(0),[selected,setSelected]=useState<BlogEntry|null>(null),[sharing,setSharing]=useState(false);
  const [title,setTitle]=useState(""),[url,setUrl]=useState(""),[sending,setSending]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();
    fetch("/api/blogs",{signal:controller.signal}).then(async res=>{
      if(!res.ok)throw new Error("The shelf couldn't load. Please try again.");
      const data=await res.json();if(!controller.signal.aborted)setEntries((data.blogs??[]).filter((entry:BlogEntry)=>safeLink(entry.url)));
    }).catch(err=>{if(!controller.signal.aborted)setError(err.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>controller.abort();
  },[]);
  const pages=Math.max(1,Math.ceil(entries.length/PAGE_SIZE)),items=entries.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
  const choose=(entry:BlogEntry)=>{worldSound.play("paper",{gain:.18});setSelected(entry);};
  const back=()=>{worldSound.play("key",{gain:.14});if(selected)setSelected(null);else if(sharing)setSharing(false);else onBack();};
  return <div className={styles.machine} data-state={sharing?"form":selected?"detail":"shelf"} aria-label="Chocolate blog selection screen">
    {!focused?<div className={styles.attract}><h2>Blogs</h2><ShopOtter/><p>A little treat for your brain.</p></div>:<>
      <header className={styles.header}><div><h2>Blogs</h2><p>{sharing?"Share a good read.":selected?"Your next read.":"Pick a chocolate. Find a good read."}</p></div><button onClick={onBack} aria-label="Leave vending machine"><Icon kind="close"/></button></header>
      {sharing?<form className={styles.form} onSubmit={async event=>{
        event.preventDefault();if(sending)return;if(!safeLink(url.trim())){setError("Use an http or https link.");return;}setSending(true);setError("");
        try{const res=await fetch("/api/blogs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:title.trim(),url:url.trim()})});const data=await res.json();if(!res.ok||!data.blog)throw new Error(data.error??"Couldn't add that blog.");setEntries(prev=>[data.blog,...prev]);setPage(0);setSharing(false);setTitle("");setUrl("");}
        catch(err){setError(err instanceof Error?err.message:"Please try again.");}finally{setSending(false);}
      }}><div className={styles.formHeading}><span>STOCK THE SHELF</span><h3>Add a blog</h3><p>A good read, freshly wrapped.</p></div><div className={styles.formCard}><div className={styles.formPreview}><Chocolate index={entries.length} label="NEW"/><strong>{title.trim()||"Your next great read"}</strong><span>WRAPPER PREVIEW</span></div><div className={styles.formFields}><label><span><i>01</i> Title</span><input required maxLength={200} value={title} placeholder="Give it a good name" onChange={e=>setTitle(e.target.value)}/></label><label><span><i>02</i> Link</span><input required type="url" maxLength={1000} value={url} placeholder="https://your-blog.com" onChange={e=>setUrl(e.target.value)}/></label><p>The chocolate opens your original article.</p></div></div>{error&&<p role="alert">{error}</p>}<button disabled={sending||!title.trim()||!url.trim()}><span>{sending?"Wrapping…":"Add to the shelf"}</span><span aria-hidden="true">↗</span></button></form>
      :selected?<article className={styles.detail}><div className={styles.detailProduct}><Chocolate index={Math.max(0,entries.findIndex(entry=>entry.id===selected.id))} label={String(entries.findIndex(entry=>entry.id===selected.id)+1).padStart(2,"0")}/></div><div className={styles.detailCopy}><span>{sourceName(selected.url)}</span><h3>{selected.title}</h3><p>Unwrap the full story on the author’s website.</p></div><a href={selected.url} target="_blank" rel="noopener noreferrer" onClick={()=>worldSound.play("paper",{gain:.15})}>Read blog ↗</a></article>
      :<div className={styles.shelf} aria-busy={loading}>
        {items.map((entry,i)=><button className={styles.card} key={entry.id} onClick={()=>choose(entry)} aria-label={`Choose chocolate: ${entry.title}`} title={entry.title}><div className={styles.productStage}><span className={styles.productNumber}>{String(page*PAGE_SIZE+i+1).padStart(2,"0")}</span><Chocolate index={page*PAGE_SIZE+i} label={String(page*PAGE_SIZE+i+1).padStart(2,"0")}/></div><div className={styles.cardCopy}><span className={styles.source}>{sourceName(entry.url)}</span><strong>{entry.title}</strong><span className={styles.unwrap}>Unwrap <span aria-hidden="true">↗</span></span></div></button>)}
        {!items.length&&Array.from({length:PAGE_SIZE},(_,i)=><div className={`${styles.card} ${styles.unstocked}`} key={i} aria-hidden="true"><div className={styles.productStage}><Chocolate index={i} label="DD"/></div><div className={styles.cardCopy}><strong>{loading?"Loading…":"Coming soon"}</strong></div></div>)}
        {error&&<p className={styles.error} role="alert">{error}</p>}
      </div>}
      <footer className={styles.footer}><button className={styles.back} onClick={back}><Icon kind="back"/><span>Back</span></button>{!selected&&!sharing&&<><nav aria-label="Blog pages">{pages>1&&<button disabled={page===0} onClick={()=>setPage(p=>p-1)} aria-label="Previous chocolates">‹</button>}<span aria-live="polite">{page+1} / {pages}</span>{pages>1&&<button disabled={page===pages-1} onClick={()=>setPage(p=>p+1)} aria-label="More chocolates">›</button>}</nav><button className={styles.add} onClick={()=>{setSharing(true);setError("");}} aria-label="Add a blog"><Icon kind="add"/><span>Add blog</span></button></>}</footer>
    </>}
  </div>;
}
