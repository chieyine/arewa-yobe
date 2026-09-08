CREATE OR REPLACE FUNCTION civic.dashboard(f jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog,civic AS $$
DECLARE m civic.memberships:=civic.require_actor(); result jsonb;
BEGIN
 WITH population AS MATERIALIZED (SELECT r.id,r.item_id,i.lga_id,i.data->>'sectorId' sector_id,i.data->>'confirmedProgress' progress,r.data->>'reviewState' state,r.data->>'firstSubmittedAt' AS submitted_at FROM civic.filtered_report_ids(f) visible(id) JOIN civic.reports r ON r.id=visible.id JOIN civic.items i ON i.id=r.item_id),
 lgas AS (SELECT id,data FROM civic.reference_data WHERE kind='lga' AND (m.role='ADMIN' OR id=ANY(m.lga_ids))),
 lga_counts AS (SELECT lga_id label,count(*)::int value FROM population GROUP BY 1),
 sector_counts AS (SELECT sector_id label,count(*)::int value FROM population GROUP BY 1),
 trend_raw AS (SELECT submitted_at,count(*)::int value FROM population GROUP BY 1),
 trend AS (SELECT to_char(submitted_at::timestamptz AT TIME ZONE 'Africa/Lagos','YYYY-MM-DD') label,sum(value)::int value FROM trend_raw GROUP BY 1),
 item_counts AS (SELECT progress label,count(*)::int value FROM (SELECT DISTINCT item_id,progress FROM population) items GROUP BY 1)
 SELECT jsonb_build_object(
 'counts',(SELECT jsonb_build_object('reportsSubmitted',count(*),'itemsTracked',count(distinct item_id),'verified',count(*) filter(where state IN ('VERIFIED','APPROVED')),'pending',count(*) filter(where state IN ('SUBMITTED','IN_REVIEW','NEEDS_CLARIFICATION')),'rejected',count(*) filter(where state='REJECTED'),'coverage',count(distinct lga_id)) FROM population),
 'byLga',coalesce((SELECT jsonb_agg(jsonb_build_object('label',l.data->>'name','value',coalesce(c.value,0)) ORDER BY l.data->>'name') FROM lgas l LEFT JOIN lga_counts c ON c.label=l.id),'[]'::jsonb),
 'bySector',coalesce((SELECT jsonb_agg(jsonb_build_object('label',s.data->>'label','value',coalesce(c.value,0)) ORDER BY s.data->>'label') FROM civic.reference_data s LEFT JOIN sector_counts c ON c.label=s.id WHERE s.kind='sector'),'[]'::jsonb),
 'trend',coalesce((SELECT jsonb_agg(jsonb_build_object('label',label,'value',value) ORDER BY label) FROM trend),'[]'::jsonb),
 'progress',coalesce((SELECT jsonb_agg(jsonb_build_object('label',label,'value',value) ORDER BY label) FROM item_counts),'[]'::jsonb),
 'configuredLgas',(SELECT count(*) FROM lgas),'filters',f,'dateBasis',coalesce(f->>'dateBasis','FIRST_SUBMITTED'),'refreshedAt',now()) INTO result;
 RETURN result;
END $$;


INSERT INTO civic.schema_migrations(version) VALUES('007_trend_aggregation');
