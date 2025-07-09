const { error } = require('console');
const express=require('express');
const app=express();
const nodecache=require('node-cache');

app.use(express.json());

const cache=new nodecache({stdTTL:300});
const senttime=[];
const ratelimit=5;

//fake email
const provider1=async(email)=>{
    if(Math.random()<0.7) return{success:true};
    throw new Error("provider1 has failed");
}

const provider2=async(email)=>{
    if(Math.random()<0.8) return {success:true};
    throw new Error('provider2 has failed');
};

const sleep=(ms)=>new Promise((res)=>setTimeout(res,ms));

function ratel(){
    const now=Date.now();
    const oneminute=now-60_000;
    const recentsend=senttime.filter((t)=>t>oneminute);
    return recentsend.length>=ratelimit;
}

app.post("/email",async(req,res)=>{
    const{emailid,emaildata}=req.body;
    if(!emailid || !emaildata) {
        console.log("Missing emailid or email data ");
        return res.status(400).json({error:'missing emailid or email data'});
    }

    console.log(`new email request ${emailid}`);

    //idempotency check
    if(cache.has(`sent_${emailid}`)){
        console.log(`duplicate email skipped ${emailid}`);
        return res.json({status:'duplicate',message:'already sent'});

    }
//rate limiting check
    if(ratel()){
        console.log("rate limit exceeded");
        cache.set(`status_${emailid}`,"ratelimited");
        return res.status(429).json({message:'rate limit exceeded',status:'error'})
    }

    //retry && fall back
    const providers=[provider1,provider2];
    for(let i=0;i<providers.length;i++){
        const provider=providers[i];
        let attempt=0;

        while(attempt<3){
            try{
                console.log(`provider ${i==0 ?'1':'2'} (Attemp ${attempt+1})`);
                await sleep(2**attempt*100);
                await provider(emaildata);

                senttime.push(Date.now());
                cache.set(`sent_${emailid}`,true);
                cache.set(`status_${emailid}`,'success');

                console.log(`email sent via Provider${i + 1}`);
                return res.json({status:"success",provider: `Provider${i + 1}` });

            } catch(err){
                console.log("error sending email");
                attempt++;
            }
        }
          console.log(`provider${i + 1} failed all retries`);
    }
    cache.set(`status_${emailid}`,'failed');
     console.log("Email failed with all providers ");
  res.status(500).json({ status: "error", message: "All providers failed" });


});


//checking starus
app.get("/email/:emailid",(req,res)=>{
    const{emailid}=req.params;
    const status=cache.get(`status_${emailid}`) ||'notfound';
    console.log(`status check:${emailid}->${status}`);
    res.json({emailid,status});
});


const PORT = process.env.PORT || 3000;

app.listen(PORT,'0.0.0.0',()=>{
    console.log(`server is running at ${PORT}`);
});
