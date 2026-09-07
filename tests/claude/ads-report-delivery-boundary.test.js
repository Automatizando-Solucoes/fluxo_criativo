#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'); const fs=require('node:fs'); const path=require('node:path');
const {createAdsReport,createReportDelivery}=require('../../adapters/claude/ads-report');
const root=path.resolve(__dirname,'../..');
for(const file of ['scripts/relatorio-ads-cli.py','scripts/relatorio-ads.ps1']) { const text=fs.readFileSync(path.join(root,file),'utf8'); for(const forbidden of ['api.z-api.io','api.telegram.org','ZAPI_TOKEN','ZAPI_CLIENT_TOKEN','TELEGRAM_BOT_TOKEN','RELATORIO_CANAL']) assert.equal(text.includes(forbidden),false,`${file}: ${forbidden}`); }
const tmp=fs.mkdtempSync('/tmp/report-boundary-'); try { fs.mkdirSync(path.join(tmp,'meus-produtos','produto'),{recursive:true}); const report=createAdsReport({projectRoot:tmp,product_slug:'produto',period:'fixture',metrics:{spend:0},analysis:'mock'}); assert.equal(report.status,'ready'); assert.equal(createReportDelivery({channel:'local',artifact_path:report.artifact_path}).sent,false); } finally { fs.rmSync(tmp,{recursive:true,force:true}); }
process.stdout.write('Ads report delivery boundary: ok\n');
