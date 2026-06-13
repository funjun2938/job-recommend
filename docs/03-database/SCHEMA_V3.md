# SCHEMA V3 — 이직추천 서비스 엔터프라이즈 데이터 모델

> **v3 엔터프라이즈 모델(78테이블)** — 9개 도메인으로 구성된 확장 스키마.
> 시각 뷰어는 `recommendation_system_erd_fixed.html` / `recommendation_system_schema_.html`,
> 가이드는 `ERD_guide.html` 를 참고하라.

마이그레이션 파일: `migrations/008_domain_user_profile.sql` ~ `migrations/016_domain_notification.sql`
(legacy v2 마이그레이션 `001`~`007` 은 그대로 유지된다.)

## 공통 규약
- PK: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- 감사 컬럼: `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- FK: `REFERENCES ... ON DELETE CASCADE` (선택적 관계는 `ON DELETE SET NULL`)
- 상태/enum: `TEXT + CHECK` 제약
- 한국어 → 영문 `snake_case` (회사명→`company_name`, 총경력연차→`total_experience_years`, 이직의향상태→`job_seeking_status`)
- 사용자 소유 데이터: RLS 활성화 + 본인(`user_profiles.auth_user_id = auth.uid()`) 또는 `service_role`
- 모든 객체 생성은 멱등(`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`), 파일별 `BEGIN; ... COMMIT;`

## 도메인/테이블 요약
| # | 도메인 | 파일 | 테이블 수 |
|---|--------|------|-----------|
| 1 | 사용자 프로필 | 008_domain_user_profile.sql | 15 |
| 2 | 채용 공고 | 009_domain_job_posting.sql | 7 |
| 3 | 추천 시스템 | 010_domain_recommendation.sql | 9 |
| 4 | 관리자/기업 | 011_domain_admin.sql | 7 |
| 5 | 결제/정산 | 012_domain_billing.sql | 12 |
| 6 | 보안/개인정보 | 013_domain_security.sql | 8 |
| 7 | 커리어 인텔리전스 | 014_domain_career_intel.sql | 6 |
| 8 | 소셜/네트워크 | 015_domain_social.sql | 7 |
| 9 | 알림/개인화 | 016_domain_notification.sql | 6 |
| | **합계** | | **78** |

---

## 1. 사용자 프로필 (008)
| 테이블 | 핵심 컬럼 | 역할 |
|--------|-----------|------|
| user_profiles* | residence, desired_location, total_experience_years, current_salary, desired_salary, job_seeking_status, is_public, profile_completeness | 사용자 핵심 프로필(legacy 보강, ALTER) |
| business_cards | user_id→user_profiles, company_name, job_title, work_start_date, status(재직/이직/종료) | 명함 기반 재직 이력 |
| user_preferences | user_id, desired_job_group, desired_salary_min/max, work_type, excluded_companies[] | 희망 근무 조건 |
| skills | skill_name, skill_category, parent_skill_id(self), synonyms[] | 스킬 마스터(계층) |
| user_skills | user_id, skill_id→skills, proficiency(1..5), years_used, is_primary | 사용자 보유 스킬 |
| user_careers | user_id, company_name, responsibilities, achievements, tech_used[], is_current, visibility | 경력 상세 |
| user_educations | user_id, school_name, degree, graduation_status | 학력 |
| user_resumes | user_id, resume_name, file_id, parse_status, is_primary | 이력서 파일 |
| user_certificates | user_id, certificate_name, issuer, verify_status | 자격증 |
| user_languages | user_id, language, level, test_name, score | 외국어 능력 |
| user_projects | user_id, project_name, tech_used[], metrics | 프로젝트 경험 |
| user_portfolios | user_id, portfolio_type(github/blog/...), url, is_primary | 포트폴리오 링크 |
| career_goals | user_id, change_reason, target_company_type, target_salary_ideal, dealbreakers(JSONB) | 커리어 목표/협상 조건 |
| job_readiness | user_id, interview_availability, readiness_stage, readiness_score | 이직 준비도 |
| user_activities | user_id, activity_type, earned_points, completeness_score | 활동/포인트/완성도 추적 |

\* user_profiles 는 legacy(007) 테이블을 `ALTER ... ADD COLUMN IF NOT EXISTS` 로 보강.

## 2. 채용 공고 (009)
| 테이블 | 핵심 컬럼 | 역할 |
|--------|-----------|------|
| companies | company_name, ceo_name, industry, company_size, employee_count, is_listed | 기업 마스터 |
| job_roles | job_group, standard_role_name, parent_role_id(self) | 직무 마스터(계층) |
| job_role_mappings | job_role_id→job_roles, raw_role_name, confidence | 원시 직무명 표준화 매핑 |
| job_postings | company_id→companies, job_role_id→job_roles, title, work_type, salary_min/max, status | 채용 공고 |
| posting_skills | job_posting_id→job_postings, skill_id→skills, is_required, importance | 공고 요구 스킬 |
| applications | user_id→user_profiles, job_posting_id, company_id, status(applied..accepted), is_hired | 지원 이력 |
| job_views | user_id, job_posting_id, dwell_seconds, inflow_channel | 공고 조회 로그 |

## 3. 추천 시스템 (010)
| 테이블 | 핵심 컬럼 | 역할 |
|--------|-----------|------|
| recommendations | user_id, job_posting_id, score, skill/career/salary/location/industry_match_score, model_version, is_exposed | 추천 결과 |
| recommend_models | model_name, model_version, algorithm_type, params(JSONB) | 추천 모델 레지스트리 |
| recommend_scores | recommendation_id→recommendations, score_item, raw_score, weight, final_score | 점수 항목 분해 |
| recommend_feedback | user_id, recommendation_id, feedback_type | 추천 피드백 |
| feature_snapshots | recommendation_id, features_json(JSONB), model_version | 추론 시점 피처 스냅샷 |
| experiments | experiment_name, target_ratio, status | A/B 실험 |
| experiment_groups | experiment_id→experiments, group_name, exposure_ratio | 실험 그룹 |
| model_metrics | model_id→recommend_models, impressions, clicks, ctr, apply_conversion | 모델 성과 지표 |
| behavior_logs | user_id, job_posting_id, event_type, device | 행동 로그 |

## 4. 관리자/기업 (011)
| 테이블 | 핵심 컬럼 | 역할 |
|--------|-----------|------|
| admin_roles | role_name, role_status | 관리자 역할 |
| admin_accounts | role_id→admin_roles, email, two_fa_enabled | 관리자 계정 |
| admin_menus | parent_menu_id(self), menu_name, menu_code | 백오피스 메뉴(계층) |
| admin_permissions | role_id, menu_id, can_read/create/update/delete | 역할별 메뉴 권한 |
| company_managers | company_id→companies, name, duty, account_status | 기업 담당자 |
| manager_permissions | manager_id→company_managers, can_post_jobs, can_send_offers | 담당자 권한 |
| company_offers | company_id, manager_id, user_id→user_profiles, job_posting_id, offer_status | 기업의 제안(offer) |

## 5. 결제/정산 (012)
| 테이블 | 핵심 컬럼 | 역할 |
|--------|-----------|------|
| plans | plan_code, monthly_fee, annual_fee, success_fee_rate | 요금제 |
| contracts | company_id→companies, contract_type, billing_method | 계약 |
| billing_subscriptions** | company_id, plan_id→plans, contract_id→contracts, subscription_status | 구독(legacy subscriptions 충돌 회피) |
| payment_methods | company_id, method_type, is_default | 결제수단 |
| invoices | company_id, subscription_id, total_amount, invoice_status | 청구서 |
| invoice_items | invoice_id→invoices, charge_type, unit_price, quantity | 청구 항목 |
| payments | company_id, invoice_id, payment_method_id, payment_status | 결제 |
| refunds | payment_id→payments, refund_amount, refund_status | 환불 |
| tax_invoices | payment_id, invoice_id, issue_status | 세금계산서 |
| success_fees | company_id, application_id→applications, fee_amount | 성공 보수(채용 성사 수수료) |
| settlements | company_id, total_amount, unpaid_amount, settlement_status | 정산 |
| credits | company_id, credit_type, remaining_qty | 크레딧 |

\** 명세상 `subscriptions` 였으나 legacy(006) 테이블과 충돌하여 `billing_subscriptions` 로 명명.

## 6. 보안/개인정보 (013)
| 테이블 | 핵심 컬럼 | 역할 |
|--------|-----------|------|
| terms | terms_type, version, effective_date, status | 약관 마스터 |
| consent_history | user_id→user_profiles, consent_item, is_agreed, consented_at | 동의 이력 |
| terms_agreements | user_id, terms_id→terms, is_agreed, agreed_at | 약관 동의 |
| access_logs | user_id, accessor_type, accessed_item, access_result | 개인정보 접근 로그 |
| delete_requests | user_id, request_type, process_status | 삭제(파기) 요청 |
| masking_policies | target_table, masking_method, target_scope | 마스킹 정책 |
| batch_jobs | job_type, processed_count, job_status | 배치 작업 |
| error_logs | user_id, location, process_status | 에러 로그 |

## 7. 커리어 인텔리전스 (014)
| 테이블 | 핵심 컬럼 | 역할 |
|--------|-----------|------|
| salary_benchmark_v3*** | job_role_id→job_roles, exp_range, salary_median, salary_avg, data_source | 연봉 벤치마크 |
| skill_trends | skill_id→skills, posting_count, salary_premium, trend_direction | 스킬 수요 트렌드 |
| hiring_trends | industry, new_posting_count, hiring_temperature | 채용 시장 온도 |
| skill_gap_analyses | user_id→user_profiles, target_job_role_id, skill_match_rate, expected_prep_weeks | 스킬 갭 분석 |
| company_reputation_v3*** | company_id→companies, overall_rating, wlb_score, review_count | 기업 평판 |
| career_paths_v3*** | from_job_role_id, to_job_role_id, move_frequency, move_type | 직무 이동 경로 |

\*** legacy `salary_benchmarks` / `company_reputation` / `career_paths` 와 충돌 회피를 위해 `_v3` 접미사 사용.

## 8. 소셜/네트워크 (015)
| 테이블 | 핵심 컬럼 | 역할 |
|--------|-----------|------|
| social_accounts | user_id→user_profiles, platform, last_synced_at, connection_status | 소셜 계정 연동 |
| user_connections | from_user_id, to_user_id→user_profiles, connection_type, connection_strength | 사용자 간 연결 |
| card_exchanges | from_user_id, to_user_id, exchange_method, exchanged_at | 명함 교환 |
| network_signals | user_id, company_id→companies, signal_type, signal_strength | 네트워크 신호 |
| linkedin_imports | user_id, social_account_id→social_accounts, profile_mapping_status | LinkedIn 임포트 |
| remember_imports | user_id, social_account_id, imported_card_count, import_status | 리멤버 명함 임포트 |
| connection_suggestions | user_id, suggested_user_id, suggestion_reason, suggestion_score | 연결 추천 |

## 9. 알림/개인화 (016)
| 테이블 | 핵심 컬럼 | 역할 |
|--------|-----------|------|
| notif_templates | template_name, notif_type, channel, target_segment | 알림 템플릿 |
| notif_preferences | user_id→user_profiles, notif_type, allowed_channels[], is_subscribed | 알림 수신 설정 |
| optimal_send_times | user_id, channel, avg_open_rate, model_confidence | 최적 발송 시간(개인화) |
| notif_history | user_id, template_id→notif_templates, sent_channel, sent_status, sent_at | 발송 이력 |
| channel_fatigue | user_id, channel, consecutive_no_response_days, fatigue_level | 채널 피로도 |
| user_segments | user_id, job_seeking_segment, activity_segment, readiness_score | 사용자 세그먼트 |

---

## Legacy v2(001~007) ↔ v3 매핑

| 영역 | legacy v2 | v3 대응 | 비고 |
|------|-----------|---------|------|
| 사용자 프로필 | user_profiles(007) | user_profiles(008, ALTER 보강) | 동일 테이블 확장, 충돌 없음 |
| 서베이 인사이트 | company_insights(001) | (설문 데이터 소스로 유지) | company_insights → 설문 기반 입력, v3 추천 피처로 결합 |
| 명함첩(노드) | namecards(007) | business_cards(008) + card_exchanges(015) | namecards←명함 자산이 v3에서 재직이력/교환으로 분리 |
| 명함 이직 이벤트 | contact_transitions(007) | career_paths_v3(014) | 익명 이직 이벤트 → 직무 이동 경로 집계 |
| 회사 네트워크 | company_network_edges(007) | network_signals(015), user_connections(015) | 네트워크 근접도 신호 축 |
| 커리어 경로 | career_paths(007) | career_paths_v3(014) | 이름 충돌 회피(_v3), 직무 기준 재모델링 |
| 추천 점수 | recommendation_scores(007) | recommendations(010) + recommend_scores(010) | recommend_scores ← recommendation_scores 점수 분해 |
| 연봉 벤치마크 | salary_benchmarks(001) | salary_benchmark_v3(014) | 이름 충돌 회피(_v3) |
| 회사 평판 | company_reputation(001) | company_reputation_v3(014) | 이름 충돌 회피(_v3) |
| 구독 | subscriptions(006) | billing_subscriptions(012) | 이름 충돌 회피, B2B 정산 모델로 확장 |
| 공유 결과 | shared_results(005) | (유지) | v3 변경 없음 |
| 사용량 | usage_counts(006) | model_metrics(010), user_activities(008) | 사용/성과 집계 축으로 일반화 |
| 알림 구독 | alert_subscriptions(001) | notif_preferences(016), notif_history(016) | 알림 개인화로 확장 |

### 충돌 회피 정리
- `user_profiles` → 동일 테이블 `ALTER ... ADD COLUMN IF NOT EXISTS` (보강)
- `salary_benchmarks` → `salary_benchmark_v3`
- `company_reputation` → `company_reputation_v3`
- `career_paths` → `career_paths_v3`
- `namecards` / `recommendation_scores` → v3는 별도 영문명(`business_cards`, `recommend_scores`)으로 신설(legacy 보존)
- `subscriptions` → `billing_subscriptions`
