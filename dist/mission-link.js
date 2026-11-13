import {decodeLayout,encodeLayout} from './base-design.js';
import {validSite} from './landing-sites.js';
import {validEventId} from './nasa-data.js';
export function parseMissionLink(url){const p=new URL(url,'https://example.invalid').searchParams,site=p.get('site'),base=p.get('base'),event=p.get('event');return {site:validSite(site)?site:null,layout:decodeLayout(base),eventId:validEventId(event)?event:null,invalid:!!((site&&!validSite(site))||(base&&!decodeLayout(base))||(event&&!validEventId(event)))};}
export function missionLink(url,s){const u=new URL(url);u.search='';u.hash='';u.searchParams.set('code',s.code);u.searchParams.set('site',s.site);u.searchParams.set('base',encodeLayout(s.layout));if(validEventId(s.stormEvent?.flrID))u.searchParams.set('event',s.stormEvent.flrID);return u.href;}
