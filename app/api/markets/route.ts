const SYMBOLS=["AAPL","NVDA","MSFT","GOOGL","AMD"];

/** Fixed public symbols only: never an arbitrary URL proxy. Quotes are cached. */
export async function GET(){
  const quotes=await Promise.all(SYMBOLS.map(async symbol=>{
    try{
      const response=await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`,{headers:{"User-Agent":"Mozilla/5.0"},next:{revalidate:300},signal:AbortSignal.timeout(6000)});
      if(!response.ok)return null;
      const data=await response.json(),result=data.chart?.result?.[0],meta=result?.meta;
      const price=meta?.regularMarketPrice,previous=meta?.previousClose??meta?.chartPreviousClose;
      const closes=result?.indicators?.quote?.[0]?.close?.filter((n:unknown)=>typeof n==="number")??[];
      const baseline=closes.length>=2?closes[closes.length-2]:previous;
      if(!Number.isFinite(price)||!Number.isFinite(baseline)||baseline<=0||!Number.isFinite(meta.regularMarketTime))return null;
      return {symbol,price,change:(price-baseline)/baseline*100,asOf:new Date(meta.regularMarketTime*1000).toISOString()};
    }catch{return null;}
  }));
  return Response.json({quotes:quotes.filter(Boolean)},{headers:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=600"}});
}
