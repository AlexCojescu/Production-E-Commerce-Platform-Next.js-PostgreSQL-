import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Auth Seller
export async function GET(request) {
    try {
        const { userId } = getAuth(request);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'is-seller/route.js:9',message:'is-seller API called',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        const isSeller = await authSeller(userId);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'is-seller/route.js:11',message:'authSeller result',data:{userId,isSeller,isSellerType:typeof isSeller},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
      
        if (!isSeller) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'is-seller/route.js:14',message:'Returning not authorized',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          return NextResponse.json({ error: 'not authorized' }, {
            status: 401
          });
        }
      
        const storeInfo = await prisma.store.findUnique({
          where: { userId }
        })
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'is-seller/route.js:22',message:'Store info fetched',data:{userId,storeInfoExists:!!storeInfo,storeInfoId:storeInfo?.id,storeInfoStatus:storeInfo?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      
        return NextResponse.json({ isSeller, storeInfo })
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ca9dae1e-7bdc-4da3-861c-f9a19bbf779b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'is-seller/route.js:25',message:'Exception in is-seller route',data:{userId,error:error.message,errorStack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
      }
    }