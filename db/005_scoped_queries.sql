CREATE OR REPLACE FUNCTION civic.report_population(f jsonb) RETURNS TABLE(id text,report jsonb,item jsonb,revision jsonb) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog,civic AS $$
DECLARE m civic.memberships:=civic.require_actor();
BEGIN
 IF length(coalesce(f->>'search',''))>80 OR (coalesce(f->>'from','')<>'' AND coalesce(f->>'to','')<>'' AND f->>'from'>f->>'to') THEN RAISE EXCEPTION 'FILTER_INVALID'; END IF;
 RETURN QUERY SELECT r.id,r.data,i.data,v.data FROM civic.reports r JOIN civic.items i ON i.id=r.item_id JOIN civic.revisions v ON v.id=r.data->>'currentRevisionId'
 WHERE r.workspace_id=m.workspace_id AND i.workspace_id=m.workspace_id AND r.data->>'reviewState'<>'DRAFT'
 AND (m.role='ADMIN' OR (m.role='MEAL' AND i.lga_id=ANY(m.lga_ids)) OR r.author_id=m.user_id)
 AND (coalesce(f->>'search','')='' OR position(lower(f->>'search') in lower(concat_ws(' ',r.data->>'reference',i.data->>'title',i.data->>'community',v.data->>'observation')))>0)
 AND (coalesce(f->>'lga','')='' OR i.lga_id=f->>'lga')
 AND (coalesce(f->>'sector','')='' OR i.data->>'sectorId'=f->>'sector')
 AND (coalesce(f->>'state','')='' OR r.data->>'reviewState'=f->>'state')
 AND (coalesce(f->>'itemType','')='' OR i.data->>'type'=f->>'itemType')
 AND (coalesce(f->>'progress','')='' OR i.data->>'confirmedProgress'=f->>'progress')
 AND (coalesce(f->>'from','')='' OR CASE WHEN f->>'dateBasis'='OBSERVED' THEN (v.data->>'observedDate')::date ELSE ((r.data->>'firstSubmittedAt')::timestamptz AT TIME ZONE 'Africa/Lagos')::date END >=nullif(f->>'from','')::date)
 AND (coalesce(f->>'to','')='' OR CASE WHEN f->>'dateBasis'='OBSERVED' THEN (v.data->>'observedDate')::date ELSE ((r.data->>'firstSubmittedAt')::timestamptz AT TIME ZONE 'Africa/Lagos')::date END <=nullif(f->>'to','')::date);
END $$;
CREATE OR REPLACE FUNCTION civic.dashboard(f jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog,civic AS $$
DECLARE m civic.memberships:=civic.require_actor(); result jsonb;
BEGIN
 WITH population AS MATERIALIZED (SELECT * FROM civic.report_population(f)),
 lgas AS (SELECT id,data FROM civic.reference_data WHERE kind='lga' AND (m.role='ADMIN' OR id=ANY(m.lga_ids))),
 lga_counts AS (SELECT item->>'lgaId' label,count(*)::int value FROM population GROUP BY 1),
 sector_counts AS (SELECT item->>'sectorId' label,count(*)::int value FROM population GROUP BY 1),
 trend AS (SELECT to_char((report->>'firstSubmittedAt')::timestamptz AT TIME ZONE 'Africa/Lagos','YYYY-MM-DD') label,count(*)::int value FROM population GROUP BY 1),
 item_counts AS (SELECT data->>'confirmedProgress' label,count(*)::int value FROM (SELECT DISTINCT item->>'id',item data FROM population) items GROUP BY 1)
 SELECT jsonb_build_object(
 'counts',(SELECT jsonb_build_object('reportsSubmitted',count(*),'itemsTracked',count(distinct item->>'id'),'verified',count(*) filter(where report->>'reviewState' IN ('VERIFIED','APPROVED')),'pending',count(*) filter(where report->>'reviewState' IN ('SUBMITTED','IN_REVIEW','NEEDS_CLARIFICATION')),'rejected',count(*) filter(where report->>'reviewState'='REJECTED'),'coverage',count(distinct item->>'lgaId')) FROM population),
 'byLga',coalesce((SELECT jsonb_agg(jsonb_build_object('label',l.data->>'name','value',coalesce(c.value,0)) ORDER BY l.data->>'name') FROM lgas l LEFT JOIN lga_counts c ON c.label=l.id),'[]'::jsonb),
 'bySector',coalesce((SELECT jsonb_agg(jsonb_build_object('label',s.data->>'label','value',coalesce(c.value,0)) ORDER BY s.data->>'label') FROM civic.reference_data s LEFT JOIN sector_counts c ON c.label=s.id WHERE s.kind='sector'),'[]'::jsonb),
 'trend',coalesce((SELECT jsonb_agg(jsonb_build_object('label',label,'value',value) ORDER BY label) FROM trend),'[]'::jsonb),
 'progress',coalesce((SELECT jsonb_agg(jsonb_build_object('label',label,'value',value) ORDER BY label) FROM item_counts),'[]'::jsonb),
 'configuredLgas',(SELECT count(*) FROM lgas),'filters',f,'dateBasis',coalesce(f->>'dateBasis','FIRST_SUBMITTED'),'refreshedAt',now()) INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION civic.report_population(jsonb),civic.dashboard(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION civic.report_population(jsonb),civic.dashboard(jsonb) TO arewa_app;
INSERT INTO civic.schema_migrations(version) VALUES('005_scoped_queries');
