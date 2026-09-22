"use client";
import {useEffect,useState} from "react";
import styles from "./WorldMarketTicker.module.css";
type Quote={symbol:string;price:number;change:number;asOf:string};
export function WorldMarketTicker(){
  const [quotes,setQuotes]=useState<Quote[]>([]),[loaded,setLoaded]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();
    const refresh=()=>fetch("/api/markets",{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(data=>{if(!controller.signal.aborted)setQuotes(data.quotes??[]);}).catch(()=>{}).finally(()=>{if(!controller.signal.aborted)setLoaded(true);});
    void refresh();const timer=setInterval(refresh,300000);return()=>{controller.abort();clearInterval(timer);};
  },[]);
  const stamp=quotes[0]?.asOf;
  return <div className={styles.ticker} aria-label="Stock market quotes">
    {quotes.length?<div className={styles.track}>{[0,1].map(copy=><div className={styles.quotes} key={copy} aria-hidden={copy===1}>{quotes.map(q=><div className={styles.quote} key={q.symbol}><strong>{q.symbol}</strong><span className={q.change>=0?styles.up:styles.down}>{q.price.toFixed(2)} <small>{q.change>=0?"▲":"▼"} {Math.abs(q.change).toFixed(2)}%</small></span></div>)}</div>)}</div>:<div className={styles.status}>{loaded?"MARKET DATA UNAVAILABLE":"CONNECTING TO MARKETS"}</div>}
    <div className={styles.led} aria-hidden="true"/>
    <footer>NASDAQ · DELAYED{stamp?` · AS OF ${new Date(stamp).toLocaleString("en-GB",{timeZone:"UTC",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})} UTC`:""}</footer>
  </div>;
}
