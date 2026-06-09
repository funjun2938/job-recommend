---
config:
  layout: elk
---
erDiagram
    user_profiles ||--o{ namecards : "owns (1:N)"
    namecards }o--|| company_network_edges : "co-occurrence 집계"
    namecards }o--|| contact_transitions : "명함 교체 = 이직 감지"
    contact_transitions }o--|| company_network_edges : "이직 흐름 가중치"
    contact_transitions }o--|| career_paths : "회사 시퀀스 누적"
    company_insights }o--|| company_reputation : "company_name 집계"
    company_insights }o--|| salary_benchmarks : "직군+규모 집계"
    user_profiles ||--o{ recommendation_scores : "추천 결과 (1:N)"
    recommendation_scores }o--|| company_reputation : "회사 기준 추천 결과"

    company_insights {
        uuid id PK
        timestamptz created_at
        text job_category "직군"
        text experience_years "경력 구간"
        text salary_range "연봉 구간"
        text_array skills "스킬 배열"
        text company_size "회사 규모"
        text company_name "회사명(선택)"
        text job_level "직급"
        int actual_salary "실연봉(만원)"
        text_array resignation_reasons "이직 이유"
        text_array pros "장점"
        text_array cons "단점"
        smallint mgmt_trust_score "경영진신뢰 1-5"
        smallint stay_probability "재직의향 0-100"
        smallint nps_score "NPS 0-10"
        boolean is_verified
    }

    alert_subscriptions {
        uuid id PK
        timestamptz created_at
        text email
        text job_category
        text company_size
        text timeline
        boolean is_active
        timestamptz unsubscribed_at
    }

    analysis_cache {
        uuid id PK
        timestamptz created_at
        text cache_key UK
        text stage1_hash
        jsonb result_json
        int hit_count
        timestamptz expires_at
    }

    salary_benchmarks {
        uuid id PK
        text job_category
        text company_size
        smallint experience_min
        smallint experience_max
        int salary_p25
        int salary_p50
        int salary_p75
        int sample_count
    }

    company_reputation {
        uuid id PK
        text company_name UK
        text industry
        text size_category
        decimal avg_nps
        decimal avg_mgmt_trust
        decimal avg_stay_prob
        text_array top_pros
        text_array top_cons
        text_array top_exit_reasons
        int insight_count
    }

    user_profiles {
        uuid id PK
        timestamptz created_at
        uuid auth_user_id UK
        text session_id
        text display_name
        text current_company
        text current_job_category
        text namecard_provider "remember/rolodex/linkedin"
        timestamptz namecard_synced_at
        int namecard_count
        boolean consent_network
    }

    namecards {
        uuid id PK
        uuid owner_id FK
        timestamptz created_at
        text contact_hash "비식별 해시"
        text company_name "네트워크 노드"
        text job_title
        text job_category
        text industry
        text company_size
        text seniority "실무/리더/임원"
        date exchanged_at
        boolean is_current
    }

    contact_transitions {
        uuid id PK
        timestamptz created_at
        text contact_hash "이직한 사람"
        text from_company "이전 회사"
        text to_company "이직한 회사"
        text job_category
        text from_seniority
        text to_seniority
        date transitioned_at
        int observed_count "교차검증 수"
    }

    company_network_edges {
        uuid id PK
        text company_a "a<b 정규화"
        text company_b
        text job_category
        int edge_weight "동시등장"
        int transition_weight "이직흐름"
        timestamptz updated_at
    }

    career_paths {
        uuid id PK
        text contact_hash UK
        text job_category
        text_array company_seq "회사 궤적(과거→현재)"
        text_array seniority_seq
        smallint total_moves "이직 횟수"
        timestamptz updated_at
    }

    recommendation_scores {
        uuid id PK
        timestamptz created_at
        uuid user_id FK "user_profiles.id"
        text company_name "추천 대상 회사"
        decimal survey_fit "서베이 적합도 (0~1)"
        decimal network_proximity "네트워크 근접도 (0~1)"
        decimal career_similarity "커리어 경로 유사도 (0~1)"
        decimal final_score "가중 합산 점수"
        decimal weight_survey "가중치 서베이"
        decimal weight_network "가중치 네트워크"
        decimal weight_career "가중치 커리어"
        timestamptz calculated_at "계산 시각"
    }