-- ============================================================
-- EcoData — Triggers e Procedures (PostgreSQL)
-- Executar APÓS a migration do Prisma
-- ============================================================
-- ─── 1. Auto-update updated_at ─────────────────────────
-- Trigger que atualiza automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION fn_auto_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Aplicar em todas as tabelas que têm updated_at
DO $$
DECLARE t TEXT;
BEGIN FOR t IN
SELECT table_name
FROM information_schema.columns
WHERE column_name = 'updated_at'
    AND table_schema = 'public' LOOP EXECUTE format(
        'CREATE OR REPLACE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION fn_auto_updated_at()',
        t,
        t
    );
END LOOP;
END;
$$;
-- ─── 2. Audit Log Imutável ─────────────────────────────
-- Bloqueia UPDATE e DELETE na tabela audit_logs
CREATE OR REPLACE FUNCTION fn_audit_immutable() RETURNS TRIGGER AS $$ BEGIN RAISE EXCEPTION 'audit_logs é IMUTÁVEL — operações UPDATE/DELETE são proibidas';
RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE TRIGGER trg_audit_immutable BEFORE
UPDATE
    OR DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION fn_audit_immutable();
-- ─── 3. Hash SHA-256 automático ao inserir documento ───
CREATE OR REPLACE FUNCTION fn_hash_document() RETURNS TRIGGER AS $$ BEGIN -- Se não foi fornecido hash, gerar baseado no filename + timestamp
    IF NEW.hash_sha256 IS NULL THEN NEW.hash_sha256 = encode(
        digest(
            NEW.filename || NEW.mime_type || NEW.created_at::text,
            'sha256'
        ),
        'hex'
    );
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE TRIGGER trg_hash_document BEFORE
INSERT ON documents FOR EACH ROW EXECUTE FUNCTION fn_hash_document();
-- ─── 4. Versionamento automático de Schema ─────────────
-- Ao alterar um schema, cria snapshot na tabela schema_versions
CREATE OR REPLACE FUNCTION fn_schema_version_snapshot() RETURNS TRIGGER AS $$ BEGIN -- Só versiona se houve alteração nos campos
    IF OLD.fields IS DISTINCT
FROM NEW.fields THEN
INSERT INTO schema_versions (
        id,
        schema_id,
        version,
        fields,
        changelog,
        created_at
    )
VALUES (
        gen_random_uuid(),
        OLD.id,
        OLD.version,
        OLD.fields,
        'Auto-snapshot antes de alteração',
        NOW()
    );
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE TRIGGER trg_schema_version BEFORE
UPDATE ON schemas FOR EACH ROW EXECUTE FUNCTION fn_schema_version_snapshot();
-- ─── 5. Indexes adicionais para performance ────────────
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_extractions_created ON extractions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource, resource_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id)
WHERE read = false;