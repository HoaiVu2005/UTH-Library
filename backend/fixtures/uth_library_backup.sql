--
-- PostgreSQL database dump
--

\restrict vbTx9iH0Ack0JsROyja3jEFMOOPJjMO6YwEWHdtEipFEdcVTCI3L3pAQXkeUOhn

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.users_user_permissions DROP CONSTRAINT IF EXISTS users_user_permissions_user_id_92473840_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.users_user_permissions DROP CONSTRAINT IF EXISTS users_user_permissio_permission_id_6d08dcd2_fk_auth_perm;
ALTER TABLE IF EXISTS ONLY public.users_groups DROP CONSTRAINT IF EXISTS users_groups_user_id_f500bee5_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.users_groups DROP CONSTRAINT IF EXISTS users_groups_group_id_2f3517aa_fk_auth_group_id;
ALTER TABLE IF EXISTS ONLY public.suggestions DROP CONSTRAINT IF EXISTS suggestions_user_id_be2b2735_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.suggestions DROP CONSTRAINT IF EXISTS suggestions_reviewed_by_id_4bc0674a_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.suggestions DROP CONSTRAINT IF EXISTS suggestions_campaign_id_7ac95f4f_fk_suggestion_campaigns_id;
ALTER TABLE IF EXISTS ONLY public.suggestion_votes DROP CONSTRAINT IF EXISTS suggestion_votes_user_id_14236ef4_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.suggestion_votes DROP CONSTRAINT IF EXISTS suggestion_votes_suggestion_id_fa6a80ca_fk_suggestions_id;
ALTER TABLE IF EXISTS ONLY public.suggestion_campaigns DROP CONSTRAINT IF EXISTS suggestion_campaigns_created_by_id_3b7f6b88_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.student_roster DROP CONSTRAINT IF EXISTS student_roster_user_id_7023c7fd_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS reservations_user_id_d03abc5b_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS reservations_copy_id_0afd62be_fk_copies_id;
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS reservations_book_id_6bb0a875_fk_books_id;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_user_id_b02a6331_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.reading_sessions DROP CONSTRAINT IF EXISTS reading_sessions_user_id_6436cba9_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.reading_sessions DROP CONSTRAINT IF EXISTS reading_sessions_digital_resource_id_5fda4e37_fk_digital_r;
ALTER TABLE IF EXISTS ONLY public.payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_user_id_91653266_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_collected_by_id_2cb4307e_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_user_id_0aeaaad3_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_468e288d_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.loans DROP CONSTRAINT IF EXISTS loans_user_id_e6467baa_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.loans DROP CONSTRAINT IF EXISTS loans_handled_by_id_02653d47_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.loans DROP CONSTRAINT IF EXISTS loans_created_by_id_54c3babe_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.loans DROP CONSTRAINT IF EXISTS loans_copy_id_165d0eb3_fk_copies_id;
ALTER TABLE IF EXISTS ONLY public.loans DROP CONSTRAINT IF EXISTS loans_book_id_8fbe56c7_fk_books_id;
ALTER TABLE IF EXISTS ONLY public.fines DROP CONSTRAINT IF EXISTS fines_waived_by_id_ebfe3463_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.fines DROP CONSTRAINT IF EXISTS fines_user_id_f8419dc3_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.fines DROP CONSTRAINT IF EXISTS fines_loan_id_e2d1d992_fk_loans_id;
ALTER TABLE IF EXISTS ONLY public.fine_payments DROP CONSTRAINT IF EXISTS fine_payments_fine_id_c6171a06_fk_fines_id;
ALTER TABLE IF EXISTS ONLY public.fine_payments DROP CONSTRAINT IF EXISTS fine_payments_collected_by_id_630712d1_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.digital_resources DROP CONSTRAINT IF EXISTS digital_resources_created_by_id_026d2461_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.digital_resources DROP CONSTRAINT IF EXISTS digital_resources_book_id_1cf0cb9f_fk_books_id;
ALTER TABLE IF EXISTS ONLY public.digital_reading_sessions DROP CONSTRAINT IF EXISTS digital_reading_sessions_user_id_cd2458f1_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.digital_reading_sessions DROP CONSTRAINT IF EXISTS digital_reading_sess_version_id_69ccbc78_fk_digital_d;
ALTER TABLE IF EXISTS ONLY public.digital_reading_sessions DROP CONSTRAINT IF EXISTS digital_reading_sess_document_id_fc19c23c_fk_digital_d;
ALTER TABLE IF EXISTS ONLY public.digital_documents DROP CONSTRAINT IF EXISTS digital_documents_created_by_id_231eb874_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.digital_documents DROP CONSTRAINT IF EXISTS digital_documents_catalog_book_id_612a5da5_fk_books_id;
ALTER TABLE IF EXISTS ONLY public.digital_documents DROP CONSTRAINT IF EXISTS digital_documents_approved_by_id_30d076bb_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.digital_documents_allowed_users DROP CONSTRAINT IF EXISTS digital_documents_allowed_users_user_id_7e08a640_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.digital_documents_allowed_users DROP CONSTRAINT IF EXISTS digital_documents_al_digitaldocument_id_79eca806_fk_digital_d;
ALTER TABLE IF EXISTS ONLY public.digital_document_versions DROP CONSTRAINT IF EXISTS digital_document_versions_uploaded_by_id_5f306ec0_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.digital_document_versions DROP CONSTRAINT IF EXISTS digital_document_ver_document_id_8a027963_fk_digital_d;
ALTER TABLE IF EXISTS ONLY public.digital_approval_logs DROP CONSTRAINT IF EXISTS digital_approval_logs_actor_id_2ae0c9de_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.digital_approval_logs DROP CONSTRAINT IF EXISTS digital_approval_log_document_id_6f7f86b7_fk_digital_d;
ALTER TABLE IF EXISTS ONLY public.deaccession_batches DROP CONSTRAINT IF EXISTS deaccession_batches_created_by_id_cad9d3d2_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.deaccession_batches DROP CONSTRAINT IF EXISTS deaccession_batches_approved_by_id_9aec6a1a_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.copies DROP CONSTRAINT IF EXISTS copies_held_for_user_id_568d49b0_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.copies DROP CONSTRAINT IF EXISTS copies_deaccession_batch_id_da9ae75a_fk_deaccession_batches_id;
ALTER TABLE IF EXISTS ONLY public.copies DROP CONSTRAINT IF EXISTS copies_book_id_c25b747e_fk_books_id;
ALTER TABLE IF EXISTS ONLY public.books DROP CONSTRAINT IF EXISTS books_category_id_1efdc3d3_fk_categories_id;
ALTER TABLE IF EXISTS ONLY public.books_authors DROP CONSTRAINT IF EXISTS books_authors_book_id_8940dd6d_fk_books_id;
ALTER TABLE IF EXISTS ONLY public.books_authors DROP CONSTRAINT IF EXISTS books_authors_author_id_d8863de7_fk_authors_id;
ALTER TABLE IF EXISTS ONLY public.barcode_sequences DROP CONSTRAINT IF EXISTS barcode_sequences_category_id_882a949f_fk_categories_id;
ALTER TABLE IF EXISTS ONLY public.auth_permission DROP CONSTRAINT IF EXISTS auth_permission_content_type_id_2f476e4b_fk_django_co;
ALTER TABLE IF EXISTS ONLY public.auth_group_permissions DROP CONSTRAINT IF EXISTS auth_group_permissions_group_id_b120cbf9_fk_auth_group_id;
ALTER TABLE IF EXISTS ONLY public.auth_group_permissions DROP CONSTRAINT IF EXISTS auth_group_permissio_permission_id_84c5c92e_fk_auth_perm;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_752b0e2b_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.assistant_messages DROP CONSTRAINT IF EXISTS assistant_messages_conversation_id_0f8adcb3_fk_assistant;
ALTER TABLE IF EXISTS ONLY public.assistant_memory_entries DROP CONSTRAINT IF EXISTS assistant_memory_entries_user_id_e14759da_fk_users_id;
ALTER TABLE IF EXISTS ONLY public.assistant_conversations DROP CONSTRAINT IF EXISTS assistant_conversations_user_id_dc2563ab_fk_users_id;
DROP INDEX IF EXISTS public.users_username_e8658fc8_like;
DROP INDEX IF EXISTS public.users_user_permissions_user_id_92473840;
DROP INDEX IF EXISTS public.users_user_permissions_permission_id_6d08dcd2;
DROP INDEX IF EXISTS public.users_role_f0571928_like;
DROP INDEX IF EXISTS public.users_role_f0571928;
DROP INDEX IF EXISTS public.users_role_a8f2ba_idx;
DROP INDEX IF EXISTS public.users_groups_user_id_f500bee5;
DROP INDEX IF EXISTS public.users_groups_group_id_2f3517aa;
DROP INDEX IF EXISTS public.users_email_0ea73cca_like;
DROP INDEX IF EXISTS public.users_email_0ea73cca;
DROP INDEX IF EXISTS public.users_card_code_be7cd0f5_like;
DROP INDEX IF EXISTS public.users_card_co_b0f955_idx;
DROP INDEX IF EXISTS public.unique_ready_reservation_per_copy;
DROP INDEX IF EXISTS public.unique_pending_reservation_per_user_book;
DROP INDEX IF EXISTS public.unique_active_loan_per_user_book;
DROP INDEX IF EXISTS public.unique_active_loan_per_copy;
DROP INDEX IF EXISTS public.suggestions_user_id_be2b2735;
DROP INDEX IF EXISTS public.suggestions_user_id_2811d1_idx;
DROP INDEX IF EXISTS public.suggestions_status_dc6c14_idx;
DROP INDEX IF EXISTS public.suggestions_status_29281be8_like;
DROP INDEX IF EXISTS public.suggestions_status_29281be8;
DROP INDEX IF EXISTS public.suggestions_reviewed_by_id_4bc0674a;
DROP INDEX IF EXISTS public.suggestions_campaign_id_7ac95f4f;
DROP INDEX IF EXISTS public.suggestions_campaig_3e0fec_idx;
DROP INDEX IF EXISTS public.suggestion_votes_user_id_14236ef4;
DROP INDEX IF EXISTS public.suggestion_votes_suggestion_id_fa6a80ca;
DROP INDEX IF EXISTS public.suggestion_campaigns_status_b1ce79f8_like;
DROP INDEX IF EXISTS public.suggestion_campaigns_status_b1ce79f8;
DROP INDEX IF EXISTS public.suggestion_campaigns_created_by_id_3b7f6b88;
DROP INDEX IF EXISTS public.suggestion__suggest_e9f89a_idx;
DROP INDEX IF EXISTS public.student_roster_student_code_e71cf8f2_like;
DROP INDEX IF EXISTS public.student_roster_status_4d3a7abc_like;
DROP INDEX IF EXISTS public.student_roster_status_4d3a7abc;
DROP INDEX IF EXISTS public.student_roster_is_card_issued_938333e8;
DROP INDEX IF EXISTS public.student_ros_student_c89c7d_idx;
DROP INDEX IF EXISTS public.student_ros_status_253572_idx;
DROP INDEX IF EXISTS public.reservations_user_id_d03abc5b;
DROP INDEX IF EXISTS public.reservations_status_3316acdb_like;
DROP INDEX IF EXISTS public.reservations_status_3316acdb;
DROP INDEX IF EXISTS public.reservations_copy_id_0afd62be;
DROP INDEX IF EXISTS public.reservations_book_id_6bb0a875;
DROP INDEX IF EXISTS public.reservation_user_id_d4fda7_idx;
DROP INDEX IF EXISTS public.reservation_hold_ex_5f5c39_idx;
DROP INDEX IF EXISTS public.reservation_book_id_61e67a_idx;
DROP INDEX IF EXISTS public.refresh_tokens_user_id_b02a6331;
DROP INDEX IF EXISTS public.refresh_tokens_token_hash_8174b928_like;
DROP INDEX IF EXISTS public.refresh_tokens_family_id_814ef118;
DROP INDEX IF EXISTS public.refresh_tok_user_id_973457_idx;
DROP INDEX IF EXISTS public.refresh_tok_token_h_2fa7c6_idx;
DROP INDEX IF EXISTS public.refresh_tok_family__5b3991_idx;
DROP INDEX IF EXISTS public.reading_sessions_user_id_6436cba9;
DROP INDEX IF EXISTS public.reading_sessions_digital_resource_id_5fda4e37;
DROP INDEX IF EXISTS public.policies_is_current_8e8ca73f;
DROP INDEX IF EXISTS public.payment_transactions_user_id_91653266;
DROP INDEX IF EXISTS public.payment_transactions_transaction_type_578e35cc_like;
DROP INDEX IF EXISTS public.payment_transactions_transaction_type_578e35cc;
DROP INDEX IF EXISTS public.payment_transactions_transaction_code_cad9ef31_like;
DROP INDEX IF EXISTS public.payment_transactions_student_code_b1763aa0_like;
DROP INDEX IF EXISTS public.payment_transactions_student_code_b1763aa0;
DROP INDEX IF EXISTS public.payment_transactions_status_2a5d6e09_like;
DROP INDEX IF EXISTS public.payment_transactions_status_2a5d6e09;
DROP INDEX IF EXISTS public.payment_transactions_receipt_code_c01d103c_like;
DROP INDEX IF EXISTS public.payment_transactions_collected_by_id_2cb4307e;
DROP INDEX IF EXISTS public.payment_transactions_collected_at_65894f40;
DROP INDEX IF EXISTS public.payment_tra_transac_e31ef9_idx;
DROP INDEX IF EXISTS public.payment_tra_transac_0f64bd_idx;
DROP INDEX IF EXISTS public.payment_tra_receipt_3f6300_idx;
DROP INDEX IF EXISTS public.payment_tra_collect_1be203_idx;
DROP INDEX IF EXISTS public.password_reset_tokens_user_id_0aeaaad3;
DROP INDEX IF EXISTS public.password_reset_tokens_token_hash_27f0c266_like;
DROP INDEX IF EXISTS public.notifications_user_id_468e288d;
DROP INDEX IF EXISTS public.notifications_type_be5d2171_like;
DROP INDEX IF EXISTS public.notifications_type_be5d2171;
DROP INDEX IF EXISTS public.notifications_is_read_27cb7368;
DROP INDEX IF EXISTS public.notifications_dedupe_key_433c91e2_like;
DROP INDEX IF EXISTS public.notificatio_user_id_a4dd5c_idx;
DROP INDEX IF EXISTS public.notificatio_user_id_7336fd_idx;
DROP INDEX IF EXISTS public.loans_user_id_efac20_idx;
DROP INDEX IF EXISTS public.loans_user_id_e6467baa;
DROP INDEX IF EXISTS public.loans_status_b834dd8f_like;
DROP INDEX IF EXISTS public.loans_status_b834dd8f;
DROP INDEX IF EXISTS public.loans_status_9049a0_idx;
DROP INDEX IF EXISTS public.loans_handled_by_id_02653d47;
DROP INDEX IF EXISTS public.loans_due_at_df4a4091;
DROP INDEX IF EXISTS public.loans_due_at_1674a7_idx;
DROP INDEX IF EXISTS public.loans_created_by_id_54c3babe;
DROP INDEX IF EXISTS public.loans_copy_id_165d0eb3;
DROP INDEX IF EXISTS public.loans_book_id_8fbe56c7;
DROP INDEX IF EXISTS public.fines_waived_by_id_ebfe3463;
DROP INDEX IF EXISTS public.fines_user_id_f8419dc3;
DROP INDEX IF EXISTS public.fines_user_id_7da2b3_idx;
DROP INDEX IF EXISTS public.fines_type_38bd1fcd_like;
DROP INDEX IF EXISTS public.fines_type_38bd1fcd;
DROP INDEX IF EXISTS public.fines_status_7ec0ff26_like;
DROP INDEX IF EXISTS public.fines_status_7ec0ff26;
DROP INDEX IF EXISTS public.fines_status_06cf6f_idx;
DROP INDEX IF EXISTS public.fines_loan_id_e2d1d992;
DROP INDEX IF EXISTS public.fine_payments_fine_id_c6171a06;
DROP INDEX IF EXISTS public.fine_payments_collected_by_id_630712d1;
DROP INDEX IF EXISTS public.django_session_session_key_c0390e0f_like;
DROP INDEX IF EXISTS public.django_session_expire_date_a5c62663;
DROP INDEX IF EXISTS public.digital_resources_created_by_id_026d2461;
DROP INDEX IF EXISTS public.digital_resources_book_id_1cf0cb9f;
DROP INDEX IF EXISTS public.digital_reading_sessions_version_id_69ccbc78;
DROP INDEX IF EXISTS public.digital_reading_sessions_user_id_cd2458f1;
DROP INDEX IF EXISTS public.digital_reading_sessions_session_code_2e6d41cd_like;
DROP INDEX IF EXISTS public.digital_reading_sessions_document_id_fc19c23c;
DROP INDEX IF EXISTS public.digital_rea_user_id_6f1851_idx;
DROP INDEX IF EXISTS public.digital_rea_status_f0ff44_idx;
DROP INDEX IF EXISTS public.digital_documents_year_9f516bd4;
DROP INDEX IF EXISTS public.digital_documents_title_76e10a60_like;
DROP INDEX IF EXISTS public.digital_documents_title_76e10a60;
DROP INDEX IF EXISTS public.digital_documents_status_e77dd7f5_like;
DROP INDEX IF EXISTS public.digital_documents_status_e77dd7f5;
DROP INDEX IF EXISTS public.digital_documents_major_4fd40332_like;
DROP INDEX IF EXISTS public.digital_documents_major_4fd40332;
DROP INDEX IF EXISTS public.digital_documents_document_type_903ae9cf_like;
DROP INDEX IF EXISTS public.digital_documents_document_type_903ae9cf;
DROP INDEX IF EXISTS public.digital_documents_department_4635a352_like;
DROP INDEX IF EXISTS public.digital_documents_department_4635a352;
DROP INDEX IF EXISTS public.digital_documents_created_by_id_231eb874;
DROP INDEX IF EXISTS public.digital_documents_catalog_book_id_612a5da5;
DROP INDEX IF EXISTS public.digital_documents_author_names_261168bb_like;
DROP INDEX IF EXISTS public.digital_documents_author_names_261168bb;
DROP INDEX IF EXISTS public.digital_documents_approved_by_id_30d076bb;
DROP INDEX IF EXISTS public.digital_documents_allowed_users_user_id_7e08a640;
DROP INDEX IF EXISTS public.digital_documents_allowed_users_digitaldocument_id_79eca806;
DROP INDEX IF EXISTS public.digital_documents_access_scope_72264c90_like;
DROP INDEX IF EXISTS public.digital_documents_access_scope_72264c90;
DROP INDEX IF EXISTS public.digital_document_versions_uploaded_by_id_5f306ec0;
DROP INDEX IF EXISTS public.digital_document_versions_file_hash_sha256_74dd3d10_like;
DROP INDEX IF EXISTS public.digital_document_versions_file_hash_sha256_74dd3d10;
DROP INDEX IF EXISTS public.digital_document_versions_document_id_8a027963;
DROP INDEX IF EXISTS public.digital_doc_year_1a9501_idx;
DROP INDEX IF EXISTS public.digital_doc_documen_fa1e08_idx;
DROP INDEX IF EXISTS public.digital_doc_departm_bd31f0_idx;
DROP INDEX IF EXISTS public.digital_approval_logs_document_id_6f7f86b7;
DROP INDEX IF EXISTS public.digital_approval_logs_actor_id_2ae0c9de;
DROP INDEX IF EXISTS public.deaccession_batches_status_206de3db_like;
DROP INDEX IF EXISTS public.deaccession_batches_status_206de3db;
DROP INDEX IF EXISTS public.deaccession_batches_created_by_id_cad9d3d2;
DROP INDEX IF EXISTS public.deaccession_batches_code_f05d4b73_like;
DROP INDEX IF EXISTS public.deaccession_batches_approved_by_id_9aec6a1a;
DROP INDEX IF EXISTS public.copies_status_d85414a2_like;
DROP INDEX IF EXISTS public.copies_status_d85414a2;
DROP INDEX IF EXISTS public.copies_status_227095_idx;
DROP INDEX IF EXISTS public.copies_held_for_user_id_568d49b0;
DROP INDEX IF EXISTS public.copies_held_fo_65a9f7_idx;
DROP INDEX IF EXISTS public.copies_deaccession_batch_id_da9ae75a;
DROP INDEX IF EXISTS public.copies_deacces_f62f39_idx;
DROP INDEX IF EXISTS public.copies_book_id_c25b747e;
DROP INDEX IF EXISTS public.copies_barcode_c8c7d0_idx;
DROP INDEX IF EXISTS public.copies_barcode_99b64c75_like;
DROP INDEX IF EXISTS public.categories_name_09afee77_like;
DROP INDEX IF EXISTS public.categories_code_6d9ff322_like;
DROP INDEX IF EXISTS public.books_title_7a737c_idx;
DROP INDEX IF EXISTS public.books_title_6e7eff41_like;
DROP INDEX IF EXISTS public.books_title_6e7eff41;
DROP INDEX IF EXISTS public.books_isbn_ce4a1a_idx;
DROP INDEX IF EXISTS public.books_isbn_6168c404_like;
DROP INDEX IF EXISTS public.books_isbn_6168c404;
DROP INDEX IF EXISTS public.books_category_id_1efdc3d3;
DROP INDEX IF EXISTS public.books_categor_7d8cd4_idx;
DROP INDEX IF EXISTS public.books_authors_book_id_8940dd6d;
DROP INDEX IF EXISTS public.books_authors_author_id_d8863de7;
DROP INDEX IF EXISTS public.authors_name_b87ae7ca_like;
DROP INDEX IF EXISTS public.auth_permission_content_type_id_2f476e4b;
DROP INDEX IF EXISTS public.auth_group_permissions_permission_id_84c5c92e;
DROP INDEX IF EXISTS public.auth_group_permissions_group_id_b120cbf9;
DROP INDEX IF EXISTS public.auth_group_name_a6ea08ec_like;
DROP INDEX IF EXISTS public.audit_logs_user_id_752b0e2b;
DROP INDEX IF EXISTS public.audit_logs_entity_type_97919293_like;
DROP INDEX IF EXISTS public.audit_logs_entity_type_97919293;
DROP INDEX IF EXISTS public.audit_logs_created_at_939a9b33;
DROP INDEX IF EXISTS public.audit_logs_created_27acb2_idx;
DROP INDEX IF EXISTS public.audit_logs_action_391715_idx;
DROP INDEX IF EXISTS public.audit_logs_action_327a0be3_like;
DROP INDEX IF EXISTS public.audit_logs_action_327a0be3;
DROP INDEX IF EXISTS public.assistant_messages_conversation_id_0f8adcb3;
DROP INDEX IF EXISTS public.assistant_memory_entries_user_id_e14759da;
DROP INDEX IF EXISTS public.assistant_memory_entries_is_active_2ba029da;
DROP INDEX IF EXISTS public.assistant_m_user_id_2aabd0_idx;
DROP INDEX IF EXISTS public.assistant_m_convers_e4d26f_idx;
DROP INDEX IF EXISTS public.assistant_conversations_user_id_dc2563ab;
DROP INDEX IF EXISTS public.assistant_conversations_last_message_at_951e511c;
DROP INDEX IF EXISTS public.assistant_c_user_id_deae81_idx;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE IF EXISTS ONLY public.users_user_permissions DROP CONSTRAINT IF EXISTS users_user_permissions_user_id_permission_id_3b86cbdf_uniq;
ALTER TABLE IF EXISTS ONLY public.users_user_permissions DROP CONSTRAINT IF EXISTS users_user_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users_groups DROP CONSTRAINT IF EXISTS users_groups_user_id_group_id_fc7788e8_uniq;
ALTER TABLE IF EXISTS ONLY public.users_groups DROP CONSTRAINT IF EXISTS users_groups_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_card_code_key;
ALTER TABLE IF EXISTS ONLY public.assistant_memory_entries DROP CONSTRAINT IF EXISTS uq_assistant_memory_user_content;
ALTER TABLE IF EXISTS ONLY public.assistant_conversations DROP CONSTRAINT IF EXISTS uq_assistant_conversation_user_session;
ALTER TABLE IF EXISTS ONLY public.system_config DROP CONSTRAINT IF EXISTS system_config_pkey;
ALTER TABLE IF EXISTS ONLY public.suggestions DROP CONSTRAINT IF EXISTS suggestions_pkey;
ALTER TABLE IF EXISTS ONLY public.suggestion_votes DROP CONSTRAINT IF EXISTS suggestion_votes_suggestion_id_user_id_66a406b5_uniq;
ALTER TABLE IF EXISTS ONLY public.suggestion_votes DROP CONSTRAINT IF EXISTS suggestion_votes_pkey;
ALTER TABLE IF EXISTS ONLY public.suggestion_campaigns DROP CONSTRAINT IF EXISTS suggestion_campaigns_pkey;
ALTER TABLE IF EXISTS ONLY public.student_roster DROP CONSTRAINT IF EXISTS student_roster_user_id_key;
ALTER TABLE IF EXISTS ONLY public.student_roster DROP CONSTRAINT IF EXISTS student_roster_student_code_key;
ALTER TABLE IF EXISTS ONLY public.student_roster DROP CONSTRAINT IF EXISTS student_roster_pkey;
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS reservations_pkey;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_token_hash_key;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.reading_sessions DROP CONSTRAINT IF EXISTS reading_sessions_user_id_digital_resource_id_670d4cb2_uniq;
ALTER TABLE IF EXISTS ONLY public.reading_sessions DROP CONSTRAINT IF EXISTS reading_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.policies DROP CONSTRAINT IF EXISTS policies_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_transaction_code_key;
ALTER TABLE IF EXISTS ONLY public.payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_receipt_code_key;
ALTER TABLE IF EXISTS ONLY public.payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_token_hash_key;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_dedupe_key_key;
ALTER TABLE IF EXISTS ONLY public.loans DROP CONSTRAINT IF EXISTS loans_pkey;
ALTER TABLE IF EXISTS ONLY public.holidays DROP CONSTRAINT IF EXISTS holidays_pkey;
ALTER TABLE IF EXISTS ONLY public.holidays DROP CONSTRAINT IF EXISTS holidays_date_key;
ALTER TABLE IF EXISTS ONLY public.fines DROP CONSTRAINT IF EXISTS fines_pkey;
ALTER TABLE IF EXISTS ONLY public.fine_payments DROP CONSTRAINT IF EXISTS fine_payments_pkey;
ALTER TABLE IF EXISTS ONLY public.django_session DROP CONSTRAINT IF EXISTS django_session_pkey;
ALTER TABLE IF EXISTS ONLY public.django_migrations DROP CONSTRAINT IF EXISTS django_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.django_content_type DROP CONSTRAINT IF EXISTS django_content_type_pkey;
ALTER TABLE IF EXISTS ONLY public.django_content_type DROP CONSTRAINT IF EXISTS django_content_type_app_label_model_76bd3d3b_uniq;
ALTER TABLE IF EXISTS ONLY public.digital_resources DROP CONSTRAINT IF EXISTS digital_resources_pkey;
ALTER TABLE IF EXISTS ONLY public.digital_reading_sessions DROP CONSTRAINT IF EXISTS digital_reading_sessions_session_id_key;
ALTER TABLE IF EXISTS ONLY public.digital_reading_sessions DROP CONSTRAINT IF EXISTS digital_reading_sessions_session_code_key;
ALTER TABLE IF EXISTS ONLY public.digital_reading_sessions DROP CONSTRAINT IF EXISTS digital_reading_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.digital_documents DROP CONSTRAINT IF EXISTS digital_documents_pkey;
ALTER TABLE IF EXISTS ONLY public.digital_documents_allowed_users DROP CONSTRAINT IF EXISTS digital_documents_allowed_users_pkey;
ALTER TABLE IF EXISTS ONLY public.digital_documents_allowed_users DROP CONSTRAINT IF EXISTS digital_documents_allowe_digitaldocument_id_user__6bcd5911_uniq;
ALTER TABLE IF EXISTS ONLY public.digital_document_versions DROP CONSTRAINT IF EXISTS digital_document_versions_pkey;
ALTER TABLE IF EXISTS ONLY public.digital_document_versions DROP CONSTRAINT IF EXISTS digital_document_version_document_id_version_numb_b278c441_uniq;
ALTER TABLE IF EXISTS ONLY public.digital_approval_logs DROP CONSTRAINT IF EXISTS digital_approval_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.deaccession_batches DROP CONSTRAINT IF EXISTS deaccession_batches_pkey;
ALTER TABLE IF EXISTS ONLY public.deaccession_batches DROP CONSTRAINT IF EXISTS deaccession_batches_code_key;
ALTER TABLE IF EXISTS ONLY public.copies DROP CONSTRAINT IF EXISTS copies_pkey;
ALTER TABLE IF EXISTS ONLY public.copies DROP CONSTRAINT IF EXISTS copies_barcode_key;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_name_key;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_code_key;
ALTER TABLE IF EXISTS ONLY public.books DROP CONSTRAINT IF EXISTS books_pkey;
ALTER TABLE IF EXISTS ONLY public.books_authors DROP CONSTRAINT IF EXISTS books_authors_pkey;
ALTER TABLE IF EXISTS ONLY public.books_authors DROP CONSTRAINT IF EXISTS books_authors_book_id_author_id_723cdcc0_uniq;
ALTER TABLE IF EXISTS ONLY public.barcode_sequences DROP CONSTRAINT IF EXISTS barcode_sequences_pkey;
ALTER TABLE IF EXISTS ONLY public.barcode_sequences DROP CONSTRAINT IF EXISTS barcode_sequences_category_id_key;
ALTER TABLE IF EXISTS ONLY public.authors DROP CONSTRAINT IF EXISTS authors_pkey;
ALTER TABLE IF EXISTS ONLY public.authors DROP CONSTRAINT IF EXISTS authors_name_key;
ALTER TABLE IF EXISTS ONLY public.auth_permission DROP CONSTRAINT IF EXISTS auth_permission_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_permission DROP CONSTRAINT IF EXISTS auth_permission_content_type_id_codename_01ab375a_uniq;
ALTER TABLE IF EXISTS ONLY public.auth_group DROP CONSTRAINT IF EXISTS auth_group_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_group_permissions DROP CONSTRAINT IF EXISTS auth_group_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_group_permissions DROP CONSTRAINT IF EXISTS auth_group_permissions_group_id_permission_id_0cd325b0_uniq;
ALTER TABLE IF EXISTS ONLY public.auth_group DROP CONSTRAINT IF EXISTS auth_group_name_key;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.assistant_messages DROP CONSTRAINT IF EXISTS assistant_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.assistant_memory_entries DROP CONSTRAINT IF EXISTS assistant_memory_entries_pkey;
ALTER TABLE IF EXISTS ONLY public.assistant_conversations DROP CONSTRAINT IF EXISTS assistant_conversations_pkey;
DROP TABLE IF EXISTS public.users_user_permissions;
DROP TABLE IF EXISTS public.users_groups;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.system_config;
DROP TABLE IF EXISTS public.suggestions;
DROP TABLE IF EXISTS public.suggestion_votes;
DROP TABLE IF EXISTS public.suggestion_campaigns;
DROP TABLE IF EXISTS public.student_roster;
DROP TABLE IF EXISTS public.reservations;
DROP TABLE IF EXISTS public.refresh_tokens;
DROP TABLE IF EXISTS public.reading_sessions;
DROP TABLE IF EXISTS public.policies;
DROP TABLE IF EXISTS public.payment_transactions;
DROP TABLE IF EXISTS public.password_reset_tokens;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.loans;
DROP TABLE IF EXISTS public.holidays;
DROP TABLE IF EXISTS public.fines;
DROP TABLE IF EXISTS public.fine_payments;
DROP TABLE IF EXISTS public.django_session;
DROP TABLE IF EXISTS public.django_migrations;
DROP TABLE IF EXISTS public.django_content_type;
DROP TABLE IF EXISTS public.digital_resources;
DROP TABLE IF EXISTS public.digital_reading_sessions;
DROP TABLE IF EXISTS public.digital_documents_allowed_users;
DROP TABLE IF EXISTS public.digital_documents;
DROP TABLE IF EXISTS public.digital_document_versions;
DROP TABLE IF EXISTS public.digital_approval_logs;
DROP TABLE IF EXISTS public.deaccession_batches;
DROP TABLE IF EXISTS public.copies;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.books_authors;
DROP TABLE IF EXISTS public.books;
DROP TABLE IF EXISTS public.barcode_sequences;
DROP TABLE IF EXISTS public.authors;
DROP TABLE IF EXISTS public.auth_permission;
DROP TABLE IF EXISTS public.auth_group_permissions;
DROP TABLE IF EXISTS public.auth_group;
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public.assistant_messages;
DROP TABLE IF EXISTS public.assistant_memory_entries;
DROP TABLE IF EXISTS public.assistant_conversations;
DROP EXTENSION IF EXISTS unaccent;
DROP EXTENSION IF EXISTS pg_trgm;
--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assistant_conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assistant_conversations (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    client_session_id character varying(120) NOT NULL,
    title character varying(160) NOT NULL,
    last_message_at timestamp with time zone NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.assistant_conversations OWNER TO postgres;

--
-- Name: assistant_conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.assistant_conversations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.assistant_conversations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: assistant_memory_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assistant_memory_entries (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    kind character varying(24) NOT NULL,
    content text NOT NULL,
    normalized_content character varying(1000) NOT NULL,
    is_active boolean NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.assistant_memory_entries OWNER TO postgres;

--
-- Name: assistant_memory_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.assistant_memory_entries ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.assistant_memory_entries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: assistant_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assistant_messages (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    role character varying(16) NOT NULL,
    content text NOT NULL,
    conversation_id bigint NOT NULL
);


ALTER TABLE public.assistant_messages OWNER TO postgres;

--
-- Name: assistant_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.assistant_messages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.assistant_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    action character varying(100) NOT NULL,
    entity_type character varying(100),
    entity_id character varying(100),
    detail jsonb NOT NULL,
    ip_address inet,
    user_agent character varying(500),
    created_at timestamp with time zone NOT NULL,
    user_id bigint
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.audit_logs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);


ALTER TABLE public.auth_group OWNER TO postgres;

--
-- Name: auth_group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_group ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group_permissions (
    id bigint NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_group_permissions OWNER TO postgres;

--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_group_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_permission (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content_type_id integer NOT NULL,
    codename character varying(100) NOT NULL
);


ALTER TABLE public.auth_permission OWNER TO postgres;

--
-- Name: auth_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_permission ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: authors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authors (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    name character varying(255) NOT NULL,
    bio text,
    nationality character varying(100),
    birth_year integer,
    death_year integer
);


ALTER TABLE public.authors OWNER TO postgres;

--
-- Name: authors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.authors ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.authors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: barcode_sequences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.barcode_sequences (
    id bigint NOT NULL,
    last_value integer NOT NULL,
    category_id bigint NOT NULL,
    CONSTRAINT barcode_sequences_last_value_check CHECK ((last_value >= 0))
);


ALTER TABLE public.barcode_sequences OWNER TO postgres;

--
-- Name: barcode_sequences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.barcode_sequences ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.barcode_sequences_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.books (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    isbn character varying(20),
    title character varying(500) NOT NULL,
    publisher character varying(255),
    year integer,
    description text,
    cover_image character varying(500),
    language character varying(50) NOT NULL,
    page_count integer,
    edition character varying(50),
    price bigint NOT NULL,
    processing_fee bigint NOT NULL,
    keywords character varying(500),
    deleted_at timestamp with time zone,
    category_id bigint NOT NULL
);


ALTER TABLE public.books OWNER TO postgres;

--
-- Name: books_authors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.books_authors (
    id bigint NOT NULL,
    book_id bigint NOT NULL,
    author_id bigint NOT NULL
);


ALTER TABLE public.books_authors OWNER TO postgres;

--
-- Name: books_authors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.books_authors ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.books_authors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: books_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.books ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.books_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    code character varying(10) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    display_order integer NOT NULL,
    CONSTRAINT categories_display_order_check CHECK ((display_order >= 0))
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.categories ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: copies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.copies (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    barcode character varying(50) NOT NULL,
    shelf_location character varying(100) NOT NULL,
    status character varying(20) NOT NULL,
    reading_room_only boolean NOT NULL,
    hold_expires_at timestamp with time zone,
    acquired_date date NOT NULL,
    purchase_price bigint,
    source character varying(100) NOT NULL,
    supplier character varying(255),
    note text,
    version integer NOT NULL,
    deleted_at timestamp with time zone,
    book_id bigint NOT NULL,
    held_for_user_id bigint,
    deaccession_batch_id bigint,
    CONSTRAINT copies_version_check CHECK ((version >= 0))
);


ALTER TABLE public.copies OWNER TO postgres;

--
-- Name: copies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.copies ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.copies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: deaccession_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deaccession_batches (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    code character varying(50) NOT NULL,
    decision_number character varying(100) NOT NULL,
    decision_date date NOT NULL,
    reason character varying(50) NOT NULL,
    status character varying(20) NOT NULL,
    committee text,
    total_copies integer NOT NULL,
    total_value bigint NOT NULL,
    note text,
    approved_at timestamp with time zone,
    approved_by_id bigint,
    created_by_id bigint NOT NULL,
    bgh_decision_number character varying(100),
    bgh_decision_date date,
    bgh_approver_name character varying(150),
    disposal_method character varying(100),
    approval_note text,
    CONSTRAINT deaccession_batches_total_copies_check CHECK ((total_copies >= 0))
);


ALTER TABLE public.deaccession_batches OWNER TO postgres;

--
-- Name: deaccession_batches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.deaccession_batches ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.deaccession_batches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: digital_approval_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.digital_approval_logs (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    action character varying(30) NOT NULL,
    note text,
    actor_id bigint NOT NULL,
    document_id bigint NOT NULL
);


ALTER TABLE public.digital_approval_logs OWNER TO postgres;

--
-- Name: digital_approval_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.digital_approval_logs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.digital_approval_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: digital_document_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.digital_document_versions (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version_number integer NOT NULL,
    file character varying(100) NOT NULL,
    file_size_bytes bigint NOT NULL,
    file_hash_sha256 character varying(64),
    page_count integer NOT NULL,
    change_log text,
    is_current boolean NOT NULL,
    document_id bigint NOT NULL,
    uploaded_by_id bigint NOT NULL,
    CONSTRAINT digital_document_versions_page_count_check CHECK ((page_count >= 0)),
    CONSTRAINT digital_document_versions_version_number_check CHECK ((version_number >= 0))
);


ALTER TABLE public.digital_document_versions OWNER TO postgres;

--
-- Name: digital_document_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.digital_document_versions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.digital_document_versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: digital_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.digital_documents (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    title character varying(500) NOT NULL,
    document_type character varying(30) NOT NULL,
    status character varying(20) NOT NULL,
    cover_image character varying(500),
    abstract text,
    keywords character varying(500),
    language character varying(50) NOT NULL,
    year integer,
    department character varying(255),
    major character varying(255),
    author_names character varying(500),
    advisor_names character varying(500),
    publisher character varying(255),
    isbn character varying(50),
    source_license character varying(255),
    metadata jsonb NOT NULL,
    access_scope character varying(30) NOT NULL,
    allowed_departments jsonb NOT NULL,
    allowed_majors jsonb NOT NULL,
    access_start_date date,
    access_end_date date,
    require_active_card boolean NOT NULL,
    allow_download boolean NOT NULL,
    allow_print boolean NOT NULL,
    campus_only boolean NOT NULL,
    submitted_at timestamp with time zone,
    approved_at timestamp with time zone,
    rejection_reason text,
    disable_reason text,
    total_views integer NOT NULL,
    total_reading_seconds integer NOT NULL,
    current_version_number integer NOT NULL,
    approved_by_id bigint,
    catalog_book_id bigint,
    created_by_id bigint NOT NULL,
    CONSTRAINT digital_documents_current_version_number_check CHECK ((current_version_number >= 0)),
    CONSTRAINT digital_documents_total_reading_seconds_check CHECK ((total_reading_seconds >= 0)),
    CONSTRAINT digital_documents_total_views_check CHECK ((total_views >= 0)),
    CONSTRAINT digital_documents_year_check CHECK ((year >= 0))
);


ALTER TABLE public.digital_documents OWNER TO postgres;

--
-- Name: digital_documents_allowed_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.digital_documents_allowed_users (
    id bigint NOT NULL,
    digitaldocument_id bigint NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.digital_documents_allowed_users OWNER TO postgres;

--
-- Name: digital_documents_allowed_users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.digital_documents_allowed_users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.digital_documents_allowed_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: digital_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.digital_documents ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.digital_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: digital_reading_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.digital_reading_sessions (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    session_id uuid NOT NULL,
    session_code character varying(50) NOT NULL,
    user_full_name character varying(255) NOT NULL,
    user_code character varying(50) NOT NULL,
    user_department character varying(255),
    user_major character varying(255),
    ip_address inet,
    user_agent character varying(500),
    current_page integer NOT NULL,
    max_page_reached integer NOT NULL,
    total_seconds_spent integer NOT NULL,
    last_active_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    status character varying(20) NOT NULL,
    document_id bigint NOT NULL,
    user_id bigint NOT NULL,
    version_id bigint NOT NULL,
    CONSTRAINT digital_reading_sessions_current_page_check CHECK ((current_page >= 0)),
    CONSTRAINT digital_reading_sessions_max_page_reached_check CHECK ((max_page_reached >= 0)),
    CONSTRAINT digital_reading_sessions_total_seconds_spent_check CHECK ((total_seconds_spent >= 0))
);


ALTER TABLE public.digital_reading_sessions OWNER TO postgres;

--
-- Name: digital_reading_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.digital_reading_sessions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.digital_reading_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: digital_resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.digital_resources (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    title character varying(255) NOT NULL,
    file character varying(100) NOT NULL,
    file_size_bytes bigint NOT NULL,
    page_count integer NOT NULL,
    allow_download boolean NOT NULL,
    access_level character varying(30) NOT NULL,
    view_count integer NOT NULL,
    description text,
    is_active boolean NOT NULL,
    book_id bigint NOT NULL,
    created_by_id bigint,
    CONSTRAINT digital_resources_page_count_check CHECK ((page_count >= 0)),
    CONSTRAINT digital_resources_view_count_check CHECK ((view_count >= 0))
);


ALTER TABLE public.digital_resources OWNER TO postgres;

--
-- Name: digital_resources_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.digital_resources ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.digital_resources_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


ALTER TABLE public.django_content_type OWNER TO postgres;

--
-- Name: django_content_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_content_type ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_content_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_migrations (
    id bigint NOT NULL,
    app character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied timestamp with time zone NOT NULL
);


ALTER TABLE public.django_migrations OWNER TO postgres;

--
-- Name: django_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_migrations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


ALTER TABLE public.django_session OWNER TO postgres;

--
-- Name: fine_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fine_payments (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    amount bigint NOT NULL,
    collected_at timestamp with time zone NOT NULL,
    note text,
    collected_by_id bigint NOT NULL,
    fine_id bigint NOT NULL
);


ALTER TABLE public.fine_payments OWNER TO postgres;

--
-- Name: fine_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.fine_payments ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.fine_payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: fines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fines (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    type character varying(20) NOT NULL,
    amount bigint NOT NULL,
    paid_amount bigint NOT NULL,
    status character varying(20) NOT NULL,
    damage_level character varying(20),
    note text,
    waive_reason text,
    loan_id bigint,
    user_id bigint NOT NULL,
    waived_by_id bigint,
    CONSTRAINT check_amount_gte_zero CHECK ((amount >= 0)),
    CONSTRAINT check_paid_amount_gte_zero CHECK ((paid_amount >= 0)),
    CONSTRAINT check_paid_amount_lte_amount CHECK ((paid_amount <= amount))
);


ALTER TABLE public.fines OWNER TO postgres;

--
-- Name: fines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.fines ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.fines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: holidays; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.holidays (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    date date NOT NULL,
    name character varying(255) NOT NULL,
    repeat_annually boolean NOT NULL
);


ALTER TABLE public.holidays OWNER TO postgres;

--
-- Name: holidays_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.holidays ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.holidays_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: loans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loans (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    borrowed_at timestamp with time zone NOT NULL,
    due_at timestamp with time zone NOT NULL,
    returned_at timestamp with time zone,
    renewal_count integer NOT NULL,
    status character varying(20) NOT NULL,
    lost_at timestamp with time zone,
    return_condition character varying(20) NOT NULL,
    note text,
    fine_per_day_snapshot bigint NOT NULL,
    loan_days_snapshot integer NOT NULL,
    renewal_limit_snapshot integer NOT NULL,
    book_price_snapshot bigint NOT NULL,
    processing_fee_snapshot bigint NOT NULL,
    policy_id_snapshot bigint,
    last_overdue_notification_date date,
    due_soon_notified boolean NOT NULL,
    book_id bigint NOT NULL,
    copy_id bigint NOT NULL,
    created_by_id bigint,
    handled_by_id bigint,
    user_id bigint NOT NULL,
    CONSTRAINT loans_loan_days_snapshot_check CHECK ((loan_days_snapshot >= 0)),
    CONSTRAINT loans_renewal_count_check CHECK ((renewal_count >= 0)),
    CONSTRAINT loans_renewal_limit_snapshot_check CHECK ((renewal_limit_snapshot >= 0))
);


ALTER TABLE public.loans OWNER TO postgres;

--
-- Name: loans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.loans ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.loans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    type character varying(30) NOT NULL,
    channel character varying(20) NOT NULL,
    content text NOT NULL,
    link character varying(500),
    is_read boolean NOT NULL,
    dedupe_key character varying(255),
    sent_at timestamp with time zone NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.notifications ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    token_hash character varying(64) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    user_id bigint NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.password_reset_tokens ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.password_reset_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_transactions (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    transaction_code character varying(50) NOT NULL,
    receipt_code character varying(50) NOT NULL,
    transaction_type character varying(30) NOT NULL,
    student_code character varying(50) NOT NULL,
    payer_name character varying(255) NOT NULL,
    amount bigint NOT NULL,
    payment_method character varying(20) NOT NULL,
    status character varying(20) NOT NULL,
    collected_at timestamp with time zone NOT NULL,
    note text,
    collected_by_id bigint NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.payment_transactions OWNER TO postgres;

--
-- Name: payment_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_transactions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.payment_transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: policies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.policies (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    role character varying(20) NOT NULL,
    is_current boolean NOT NULL,
    max_loans integer NOT NULL,
    loan_days integer NOT NULL,
    renewal_limit integer NOT NULL,
    renewal_days integer NOT NULL,
    fine_per_day bigint NOT NULL,
    hold_days integer NOT NULL,
    max_reservations_pending integer NOT NULL,
    max_ready_reservations integer NOT NULL,
    damage_light_pct integer NOT NULL,
    damage_medium_pct integer NOT NULL,
    damage_heavy_pct integer NOT NULL,
    reading_room_hours integer NOT NULL,
    reading_room_grace_minutes integer NOT NULL,
    reading_room_overstay_lock_days integer NOT NULL,
    reading_room_max_per_day integer NOT NULL,
    CONSTRAINT policies_damage_heavy_pct_check CHECK ((damage_heavy_pct >= 0)),
    CONSTRAINT policies_damage_light_pct_check CHECK ((damage_light_pct >= 0)),
    CONSTRAINT policies_damage_medium_pct_check CHECK ((damage_medium_pct >= 0)),
    CONSTRAINT policies_hold_days_check CHECK ((hold_days >= 0)),
    CONSTRAINT policies_loan_days_check CHECK ((loan_days >= 0)),
    CONSTRAINT policies_max_loans_check CHECK ((max_loans >= 0)),
    CONSTRAINT policies_max_ready_reservations_check CHECK ((max_ready_reservations >= 0)),
    CONSTRAINT policies_max_reservations_pending_check CHECK ((max_reservations_pending >= 0)),
    CONSTRAINT policies_reading_room_grace_minutes_check CHECK ((reading_room_grace_minutes >= 0)),
    CONSTRAINT policies_reading_room_hours_check CHECK ((reading_room_hours >= 0)),
    CONSTRAINT policies_reading_room_max_per_day_check CHECK ((reading_room_max_per_day >= 0)),
    CONSTRAINT policies_reading_room_overstay_lock_days_check CHECK ((reading_room_overstay_lock_days >= 0)),
    CONSTRAINT policies_renewal_days_check CHECK ((renewal_days >= 0)),
    CONSTRAINT policies_renewal_limit_check CHECK ((renewal_limit >= 0))
);


ALTER TABLE public.policies OWNER TO postgres;

--
-- Name: policies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.policies ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.policies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reading_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reading_sessions (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    current_page integer NOT NULL,
    max_page_reached integer NOT NULL,
    total_seconds_spent integer NOT NULL,
    last_accessed timestamp with time zone NOT NULL,
    digital_resource_id bigint NOT NULL,
    user_id bigint NOT NULL,
    CONSTRAINT reading_sessions_current_page_check CHECK ((current_page >= 0)),
    CONSTRAINT reading_sessions_max_page_reached_check CHECK ((max_page_reached >= 0)),
    CONSTRAINT reading_sessions_total_seconds_spent_check CHECK ((total_seconds_spent >= 0))
);


ALTER TABLE public.reading_sessions OWNER TO postgres;

--
-- Name: reading_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.reading_sessions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.reading_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    token_hash character varying(64) NOT NULL,
    family_id uuid NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    idle_expires_at timestamp with time zone NOT NULL,
    last_used_at timestamp with time zone,
    revoked_at timestamp with time zone,
    user_agent character varying(500),
    ip inet,
    user_id bigint NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.refresh_tokens ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservations (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    status character varying(20) NOT NULL,
    type character varying(20) NOT NULL,
    ready_at timestamp with time zone,
    hold_expires_at timestamp with time zone,
    queue_position integer NOT NULL,
    notified_at timestamp with time zone,
    no_show_counted boolean NOT NULL,
    cancel_reason text,
    book_id bigint NOT NULL,
    copy_id bigint,
    user_id bigint NOT NULL,
    CONSTRAINT reservations_queue_position_check CHECK ((queue_position >= 0))
);


ALTER TABLE public.reservations OWNER TO postgres;

--
-- Name: reservations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.reservations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.reservations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: student_roster; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_roster (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    student_code character varying(50) NOT NULL,
    full_name character varying(255) NOT NULL,
    department character varying(255) NOT NULL,
    major character varying(255),
    email character varying(254),
    phone character varying(20),
    academic_year character varying(50) NOT NULL,
    status character varying(20) NOT NULL,
    is_card_issued boolean NOT NULL,
    user_id bigint,
    class_name character varying(100),
    avatar character varying(500)
);


ALTER TABLE public.student_roster OWNER TO postgres;

--
-- Name: student_roster_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.student_roster ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.student_roster_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: suggestion_campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suggestion_campaigns (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status character varying(20) NOT NULL,
    target_audience character varying(255),
    created_by_id bigint
);


ALTER TABLE public.suggestion_campaigns OWNER TO postgres;

--
-- Name: suggestion_campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.suggestion_campaigns ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.suggestion_campaigns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: suggestion_votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suggestion_votes (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    suggestion_id bigint NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.suggestion_votes OWNER TO postgres;

--
-- Name: suggestion_votes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.suggestion_votes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.suggestion_votes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: suggestions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suggestions (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    book_title character varying(500) NOT NULL,
    author character varying(255),
    reason text NOT NULL,
    status character varying(20) NOT NULL,
    review_note text,
    reviewed_at timestamp with time zone,
    received_at timestamp with time zone,
    reviewed_by_id bigint,
    user_id bigint NOT NULL,
    department character varying(150),
    campaign_id bigint
);


ALTER TABLE public.suggestions OWNER TO postgres;

--
-- Name: suggestions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.suggestions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.suggestions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: system_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_config (
    id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    library_name character varying(255) NOT NULL,
    address character varying(500) NOT NULL,
    hotline character varying(50) NOT NULL,
    email character varying(254) NOT NULL,
    opening_hours jsonb NOT NULL,
    logo character varying(500),
    favicon character varying(500),
    overdue_grace_days integer NOT NULL,
    overdue_lost_days integer NOT NULL,
    reminder_days integer NOT NULL,
    card_expiring_days integer NOT NULL,
    noshow_limit integer NOT NULL,
    noshow_window_days integer NOT NULL,
    noshow_lock_days integer NOT NULL,
    upload_max_size bigint NOT NULL,
    session_idle_hours integer NOT NULL,
    login_max_attempts integer NOT NULL,
    login_lock_minutes integer NOT NULL,
    login_daily_max_attempts integer NOT NULL
);


ALTER TABLE public.system_config OWNER TO postgres;

--
-- Name: system_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.system_config ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.system_config_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    password character varying(128) NOT NULL,
    last_login timestamp with time zone,
    is_superuser boolean NOT NULL,
    username character varying(150) NOT NULL,
    full_name character varying(255) NOT NULL,
    email character varying(254),
    phone character varying(20),
    avatar character varying(500),
    dob date,
    address character varying(500),
    role character varying(20) NOT NULL,
    card_code character varying(50) NOT NULL,
    department character varying(255),
    card_expiry date,
    is_locked boolean NOT NULL,
    lock_reason character varying(30),
    locked_until timestamp with time zone,
    failed_login_count integer NOT NULL,
    last_failed_login_at timestamp with time zone,
    reservation_locked_until timestamp with time zone,
    password_changed_at timestamp with time zone NOT NULL,
    must_change_password boolean NOT NULL,
    is_active boolean NOT NULL,
    is_staff boolean NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT users_failed_login_count_check CHECK ((failed_login_count >= 0))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_groups (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.users_groups OWNER TO postgres;

--
-- Name: users_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users_groups ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users_user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_user_permissions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.users_user_permissions OWNER TO postgres;

--
-- Name: users_user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users_user_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_user_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: assistant_conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assistant_conversations (id, created_at, updated_at, client_session_id, title, last_message_at, user_id) FROM stdin;
1	2026-11-17 13:31:14.011+07	2026-11-17 13:31:29.371+07	session-1794852008180	hello	2026-11-17 13:31:29.371+07	29
2	2026-11-17 13:51:23.363+07	2026-11-17 13:52:21.701+07	session-1794897114632	alo\\	2026-11-17 13:52:21.701+07	29
3	2026-11-17 14:26:43.521+07	2026-11-17 14:27:48.249+07	session-1794900373167	eey sao trường đại học Hutech lại được gọi là vựa rau	2026-11-17 14:27:48.249+07	29
4	2026-11-17 14:31:29.185+07	2026-11-17 14:31:29.187+07	session-1794851977938	sinh viên đang quá hạn sách	2026-11-17 14:31:29.187+07	1
5	2026-11-17 15:24:59.506+07	2026-11-17 15:25:10.917+07	session-1794903894952	nộp phạt	2026-11-17 15:25:10.917+07	29
6	2026-11-17 15:25:38.803+07	2026-11-17 15:25:38.805+07	session-1794903931987	nộp phạt	2026-11-17 15:25:38.805+07	1
7	2026-11-17 20:47:27.776+07	2026-11-17 20:47:27.777+07	session-1794923242348	nộp phạt	2026-11-17 20:47:27.777+07	1
8	2026-11-17 20:53:01.898+07	2026-11-17 20:54:12.246+07	default	nộp phạt	2026-11-17 20:54:12.246+07	1
9	2026-11-17 20:53:01.933+07	2026-11-17 21:11:09.204+07	default	nộp phạt	2026-11-17 21:11:09.204+07	2
10	2026-11-17 20:56:09.015+07	2026-11-17 20:56:09.017+07	session-1794923764806	nộp phạt	2026-11-17 20:56:09.017+07	1
11	2026-11-17 20:56:37.3+07	2026-11-17 20:56:37.301+07	session-1794923792885	nộp phạt'	2026-11-17 20:56:37.301+07	29
12	2026-11-17 21:07:41.944+07	2026-11-17 21:16:40.363+07	session-1794924421713	ấy nói chuyện  vui vui với tao đi. trường Hutech với Văn Lang được gọi là vựa rau vì có nhiều nữ sinh đi cặp đại gia đúng không	2026-11-17 21:16:40.363+07	29
13	2026-11-17 21:16:56.725+07	2026-11-17 21:16:56.726+07	session-1794925009889	tôi có công nợ không	2026-11-17 21:16:56.726+07	29
14	2026-11-17 21:56:11.998+07	2026-11-17 21:57:39.903+07	session-1794927365832	halo	2026-11-17 21:57:39.903+07	29
15	2026-11-17 22:04:17.585+07	2026-11-17 22:04:17.596+07	session-1794927851415	cách mượn sách	2026-11-17 22:04:17.596+07	29
16	2026-11-17 22:05:26.311+07	2026-11-17 22:05:26.313+07	session-1794927918426	sinh viên quá hạn nộp sách	2026-11-17 22:05:26.313+07	1
17	2026-11-17 22:25:16.338+07	2026-11-17 22:26:24.937+07	session-1794929098363	cách mượn sách	2026-11-17 22:26:24.939+07	29
18	2026-11-17 23:06:25.878+07	2026-11-17 23:08:30.528+07	session-1794931577079	helo, bạn ơi cho mình hỏi	2026-11-17 23:08:30.528+07	29
19	2026-11-17 23:10:07.939+07	2026-11-17 23:10:39.937+07	session-1794931797788	sinh viên chưa nộp phạt quá hạn	2026-11-17 23:10:39.937+07	1
20	2026-11-18 01:39:24.332+07	2026-11-18 01:39:46.553+07	session-1794940747333	UTH có mấy cơ sở	2026-11-18 01:39:46.553+07	29
21	2026-11-18 01:40:16.408+07	2026-11-18 01:40:16.41+07	session-1794940804146	học sinh quá hạn nộp sách	2026-11-18 01:40:16.41+07	1
22	2026-11-18 18:06:04.297+07	2026-11-18 18:08:06.518+07	session-1794999920246	Quy trình mượn sach	2026-11-18 18:08:06.518+07	29
23	2026-11-18 18:09:16.31+07	2026-11-18 18:09:16.311+07	session-1795000134437	quy trình mượn sách của thư viện	2026-11-18 18:09:16.311+07	1
24	2026-11-18 18:09:43.281+07	2026-11-18 18:09:43.282+07	session-1795000169123	sinh viên quá han trả sách	2026-11-18 18:09:43.282+07	1
25	2026-11-18 20:25:34.705+07	2026-11-18 20:25:59.92+07	session-1795008302787	haizz điểm môn python của mình thấp. Mình buồn quá	2026-11-18 20:25:59.92+07	29
26	2026-11-23 10:34:14.407+07	2026-11-23 10:35:33.214+07	session-1795402202056	alo	2026-11-23 10:35:33.214+07	29
27	2026-11-23 10:56:28.629962+07	2026-11-23 11:08:55.833835+07	session-1795406159663	tôi có đang có sách nào quá hạn không	2026-11-23 11:08:55.833835+07	29
28	2026-11-23 11:45:54.854095+07	2026-11-23 11:45:54.8621+07	test-session	tôi muốn đặt trước sách Python	2026-11-23 11:45:54.8621+07	2
29	2026-11-23 11:46:48.597777+07	2026-11-23 11:48:33.646581+07	test-session	tôi muốn đặt trước sách Python	2026-11-23 11:48:33.646581+07	10
\.


--
-- Data for Name: assistant_memory_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assistant_memory_entries (id, created_at, updated_at, kind, content, normalized_content, is_active, user_id) FROM stdin;
\.


--
-- Data for Name: assistant_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assistant_messages (id, created_at, updated_at, role, content, conversation_id) FROM stdin;
125	2026-11-23 10:56:28.630985+07	2026-11-23 10:56:28.630985+07	user	tôi có đang có sách nào quá hạn không	27
126	2026-11-23 10:56:28.630985+07	2026-11-23 10:56:28.630985+07	assistant	Hiện tại bạn **không có cuốn sách nào quá hạn** cả.\n\nTheo dữ liệu hệ thống, bạn đang mượn **1 cuốn** và tình trạng vẫn rất ổn định:\n\n*   **Tên sách:** *Viết Báo cáo Kỹ thuật và Đồ án Tốt nghiệp Chuẩn Khoa học*\n*   **Hạn trả:** 08/12/2026\n*   **Trạng thái:** Bạn còn **15 ngày** nữa mới đến hạn trả.\n\nLưu ý là cuốn sách này bạn đã thực hiện gia hạn trực tuyến (1/1 lần) rồi, nên bạn hãy chú ý trả sách đúng ngày 08/12/2026 tại quầy lưu thông để tránh phát sinh phí phạt (2.000 VNĐ/ngày) nhé.	27
127	2026-11-23 11:05:44.496412+07	2026-11-23 11:05:44.496412+07	user	ở gần cơ sở 3 có quán cơm tấm nào không mày đói quá	27
128	2026-11-23 11:05:44.496412+07	2026-11-23 11:05:44.496412+07	assistant	Ở gần Cơ sở 3 (số 70 Tô Ký, Quận 12), khu vực này là "thiên đường" đồ ăn giá sinh viên nên bạn yên tâm là không thiếu cơm tấm đâu. Dưới đây là vài gợi ý quanh cổng trường cho bạn:\n\n1.  **Cơm tấm ngay cổng trường (Đường Tô Ký):** Đi dọc phía cổng trường hướng về phía cầu vượt Quang Trung hoặc ngược lại về phía ngã tư Tô Ký - Nguyễn Ảnh Thủ, có rất nhiều quán cơm tấm bình dân. Bạn cứ thấy quán nào đông sinh viên ngồi là tấp vào, giá thường dao động từ 25k - 35k/đĩa.\n2.  **Cơm Tấm Cây Khế:** Nằm trên đường Tô Ký (đoạn gần chung cư Tô Ký). Quán này khá nổi tiếng ở khu vực này, miếng sườn to và ướp khá đậm đà.\n3.  **Cơm Tấm Phúc Lộc Thọ (Tô Ký):** Nếu bạn muốn ngồi máy lạnh cho mát và không gian sạch sẽ hơn thì có thể ghé chi nhánh Phúc Lộc Thọ trên đường Tô Ký. Chất lượng ở đây thì khá đồng nhất, tuy giá cao hơn một chút so với quán lề đường.\n4.  **Khu vực chợ Tân Chánh Hiệp:** Cách trường khoảng vài trăm mét, rẽ vào các con đường nhỏ quanh chợ có rất nhiều sạp cơm tấm "bụi" đúng chất sinh viên, rẻ và no lâu.\n\n**Lưu ý nhỏ:** Giờ trưa (tầm 11h - 12h30)	27
129	2026-11-23 11:08:33.41452+07	2026-11-23 11:08:33.41452+07	user	tôi học cntt đề xuất sách cho tôi	27
130	2026-11-23 11:08:33.41452+07	2026-11-23 11:08:33.41452+07	assistant	Chào phong, với chuyên ngành **Công nghệ thông tin** mà bạn đang theo học, việc nắm vững từ tư duy lập trình, cấu trúc hệ thống đến các công nghệ hiện đại là rất quan trọng.\n\nDựa trên kho tài liệu hiện có tại Thư viện UTH, mình đề xuất bạn nên mượn các cuốn sách "gối đầu giường" sau đây để hỗ trợ việc học:\n\n1.  **Lập trình Ứng dụng Web Toàn diện với React, TypeScript và Django REST** (Tác giả: Martin Fowler, Robert C. Martin): Cuốn này cực kỳ phù hợp nếu bạn muốn theo hướng Fullstack, kết hợp giữa Frontend hiện đại và Backend mạnh mẽ.\n2.  **Mạng Máy tính và Các Giao thức Truyền thông Hiện đại** (Tác giả: Andrew S. Tanenbaum, PGS.TS. Đinh Mạnh Tường): Đây là kiến thức nền tảng bắt buộc. Hiểu về mạng sẽ giúp bạn triển khai ứng dụng và bảo mật tốt hơn.\n3.  **Refactoring: Cải tiến và Tối ưu hóa Thiết kế Mã nguồn Hiện có** (Tác giả: Martin Fowler): Cuốn sách này giúp bạn nâng cấp tư duy từ "viết code chạy được" thành "viết code sạch và chuyên nghiệp".\n4.  **Deep Learning và Thị giác Máy tính trong Giao thông Thông minh**: Đặc biệt hữu ích nếu bạn muốn làm đồ án tốt nghiệp liên quan đến thế mạnh của trường UTH (Giao thông vận tải) kết hợp với AI.\n\nBạn có thể nhấn vào các thẻ sách bên dưới để xem vị trí chính xác trên kệ tại Thư viện Trung tâm (Cơ sở 1) hoặc các cơ sở khác và bấm "Đặt mượn" ngay nhé. Hiện tại các sách này đều đang **còn sẵn** trong kho.	27
63	2026-11-17 21:57:18.652+07	2026-11-17 21:57:18.652+07	user	tôi học chuyên ngành xây dựng thì đọc sách nào	14
75	2026-11-17 22:25:32.121+07	2026-11-17 22:25:32.121+07	user	hả	17
131	2026-11-23 11:08:55.832827+07	2026-11-23 11:08:55.832827+07	user	muốn đặt trước cuốn lập trình ứng dụng	27
132	2026-11-23 11:08:55.832827+07	2026-11-23 11:08:55.832827+07	assistant	Để đặt trước cuốn **"Lập trình Ứng dụng Web Toàn diện với React, TypeScript và Django REST"**, bạn thực hiện theo các bước sau ngay trên hệ thống này:\n\n1.  **Nhấp vào thẻ sách** "Lập trình Ứng dụng Web Toàn diện..." xuất hiện ở phía dưới hoặc trong kết quả tra cứu.\n2.  Chọn nút **"Đặt mượn"** (Reservation).\n3.  Hệ thống sẽ ghi nhận yêu cầu của bạn. Khi sách đã sẵn sàng tại quầy, bạn sẽ nhận được thông báo.\n\n**Lưu ý cho bạn:**\n*   Thư viện sẽ giữ chỗ cho bạn trong vòng **48 giờ** kể từ khi có thông báo sách sẵn sàng. Sau thời gian này, yêu cầu đặt chỗ sẽ tự động hủy để nhường cho bạn đọc khác.\n*   Hiện tại cuốn này đang **còn sẵn 5/5 bản** trong kho, nên sau khi bấm đặt trước, bạn có thể tranh thủ ghé Thư viện để mượn ngay.\n\nNếu cần mình hỗ trợ kiểm tra vị trí kệ chính xác của cuốn này tại cơ sở nào, cứ bảo mình nhé!	27
133	2026-11-23 11:45:54.855095+07	2026-11-23 11:45:54.855095+07	user	tôi muốn đặt trước sách Python	28
134	2026-11-23 11:45:54.855095+07	2026-11-23 11:45:54.855095+07	assistant	Bạn đang có **1 cuốn sách quá hạn** chưa trả. Theo quy chế Thư viện UTH, bạn cần hoàn trả sách quá hạn trước khi có thể đặt trước hoặc giữ chỗ sách mới.	28
26	2026-11-17 15:25:38.804+07	2026-11-17 15:25:38.804+07	assistant	Bạn vui lòng mang theo thẻ sinh viên đến quầy thủ thư tại tầng trệt thư viện để thực hiện thanh toán tiền phạt trực tiếp nhé.	6
27	2026-11-17 20:47:27.777+07	2026-11-17 20:47:27.777+07	user	nộp phạt	7
28	2026-11-17 20:47:27.777+07	2026-11-17 20:47:27.777+07	assistant	Bạn có thể thực hiện thanh toán tiền phạt trực tiếp tại quầy lưu thông hoặc qua cổng thanh toán trực tuyến trên tài khoản cá nhân của mình nhé.	7
29	2026-11-17 20:53:01.899+07	2026-11-17 20:53:01.899+07	user	nộp phạt	8
30	2026-11-17 20:53:01.899+07	2026-11-17 20:53:01.899+07	assistant	Mở **Quầy thu phạt**, quét/nhập mã thẻ sinh viên hoặc giảng viên để lọc công nợ. Sau đó chọn đúng phiếu, thu tiền tại quầy hoặc tạo VietQR và xác nhận biên lai.	8
31	2026-11-17 20:53:01.933+07	2026-11-17 20:53:01.933+07	user	nộp phạt	9
32	2026-11-17 20:53:01.933+07	2026-11-17 20:53:01.933+07	assistant	Bạn hiện không có khoản phạt nào chưa thanh toán.	9
33	2026-11-17 20:54:12.245+07	2026-11-17 20:54:12.245+07	user	nộp phạt	8
105	2026-11-18 18:07:36.995+07	2026-11-18 18:07:36.995+07	user	tôi có đang bị phạt hạn nào không	22
107	2026-11-18 18:08:06.517+07	2026-11-18 18:08:06.517+07	user	cách trả sách	22
135	2026-11-23 11:46:48.598776+07	2026-11-23 11:46:48.598776+07	user	tôi muốn đặt trước sách Python	29
136	2026-11-23 11:46:48.598776+07	2026-11-23 11:46:48.598776+07	assistant	Để UTHie giúp bạn đặt trước, bạn hãy cho mình biết tên đầu sách bạn muốn mượn nhé (ví dụ: *"Đặt trước sách Giải tích 1"* hoặc *"Giữ chỗ sách Lập trình Python"*), hoặc mở kho sách để chọn cuốn ưng ý.	29
1	2026-11-17 13:31:14.013+07	2026-11-17 13:31:14.013+07	user	hello	1
2	2026-11-17 13:31:14.013+07	2026-11-17 13:31:14.013+07	assistant	rất vui được trò chuyện cùng bạn hôm nay! Bạn đang có chuyện gì vui hay cần mình hỗ trợ gì không?	1
3	2026-11-17 13:31:29.37+07	2026-11-17 13:31:29.37+07	user	trưa nay nên ăn gì	1
4	2026-11-17 13:31:29.37+07	2026-11-17 13:31:29.37+07	assistant	Nếu muốn nhanh gọn, bạn có thể chọn cơm tấm hoặc bún thịt nướng gần trường nhé. Còn nếu muốn đổi gió, một tô phở nóng hổi hay bánh mì chảo cũng là lựa chọn rất ổn cho buổi trưa nay đấy.	1
5	2026-11-17 13:51:23.364+07	2026-11-17 13:51:23.364+07	user	alo\\	2
6	2026-11-17 13:51:23.364+07	2026-11-17 13:51:23.364+07	assistant	Bạn cần mình giúp gì nào?	2
7	2026-11-17 13:51:39.594+07	2026-11-17 13:51:39.594+07	user	thư viện có sở 1 ở tòa mấy	2
8	2026-11-17 13:51:39.594+07	2026-11-17 13:51:39.594+07	assistant	Thư viện tại Cơ sở 1 (Trụ sở chính) nằm ở **Khu C** của tòa nhà trung tâm, địa chỉ tại số 2, đường Võ Oanh, Phường 25, Quận Bình Thạnh.	2
9	2026-11-17 13:52:03.903+07	2026-11-17 13:52:03.903+07	user	tao học công nghệ thông tin thì tìm sách nào	2
115	2026-11-18 20:25:59.919+07	2026-11-18 20:25:59.919+07	user	có sách nào giúp mình không	25
10	2026-11-17 13:52:03.903+07	2026-11-17 13:52:03.903+07	assistant	Với sinh viên Khoa Công nghệ thông tin, việc nắm vững từ nền tảng đến các công nghệ hiện đại là rất quan trọng. Dựa trên danh mục tài liệu hiện có tại thư viện, mình gợi ý bạn lộ trình đọc các cuốn sách cốt lõi sau:\n\n1. **Về tư duy lập trình và thiết kế phần mềm:**\n   - **"Refactoring: Cải tiến và Tối ưu hóa Thiết kế Mã nguồn Hiện có"** (Martin Fowler): Cuốn này cực kỳ quan trọng để bạn học cách viết code sạch, dễ bảo trì – kỹ năng mà các doanh nghiệp phần mềm luôn ưu tiên.\n   - **"Lập trình Ứng dụng Web Toàn diện với React, TypeScript và Django REST"** (Martin Fowler, Robert C. Martin): Phù hợp nếu bạn đang theo đuổi hướng Full-stack, giúp bạn nắm bắt quy trình xây dựng ứng dụng web hiện đại.\n\n2. **Về hạ tầng và chuyên sâu:**\n   - **"Mạng Máy tính và Các Giao thức Truyền thông Hiện đại"** (Andrew S. Tanenbaum, PGS.TS. Đinh Mạnh Tường): Đây là "cuốn kinh thánh" về mạng máy tính, nền tảng bắt buộc để hiểu cách internet vận hành.\n   - **"Deep Learning và Thị giác Máy tính trong Giao thông Thông minh"** (Andrew Ng, PGS.TS. Đinh Mạnh Tường): Nếu bạn quan tâm đến AI và xu hướng ứng dụng công nghệ vào lĩnh vực giao thông, đây là tài liệu rất sát với định hướng của trường mình.\n\nHiện tại các đầu sách này đều đang có sẵn tại thư viện. Bạn có thể ghé Cơ sở 1 để tìm đọc hoặc cho mình biết tên cuốn bạn muốn mượn, mình sẽ hướng dẫn bạn đặt giữ chỗ ngay trên hệ thống.	2
11	2026-11-17 13:52:21.701+07	2026-11-17 13:52:21.701+07	user	cách mượn sách	2
12	2026-11-17 13:52:21.701+07	2026-11-17 13:52:21.701+07	assistant	Để mượn sách tại thư viện UTH, bạn thực hiện theo các bước đơn giản sau:\n\n1. **Tra cứu:** Bạn truy cập vào mục **"Tra cứu sách"** trên cổng thư viện số để tìm tên tài liệu cần mượn.\n2. **Đặt giữ chỗ (nếu cần):** Nếu sách đang có sẵn, bạn có thể chọn **"Đặt trước"** để hệ thống giữ sách cho bạn trong vòng 48 giờ.\n3. **Đến quầy lưu thông:** Bạn mang theo thẻ sinh viên (hoặc mã thẻ 123456) đến quầy lưu thông tại thư viện (Cơ sở 1, 2 hoặc 3 tùy theo vị trí sách).\n4. **Xác nhận:** Thủ thư sẽ quét mã thẻ và mã sách để hoàn tất thủ tục mượn.\n\n**Một số lưu ý cho bạn:**\n* **Hạn mức:** Bạn được mượn tối đa 5 cuốn cùng lúc.\n* **Thời hạn:** 14 ngày/lượt.\n* **Gia hạn:** Nếu cần thêm thời gian, bạn vào mục **"Sách của tôi"** trên cổng thư viện và nhấn **"Gia hạn +7d"** trước ngày đáo hạn (chỉ được gia hạn 1 lần duy nhất).\n\nBạn đã chọn được cuốn nào trong danh sách mình gợi ý lúc nãy chưa? Nếu cần mình hỗ trợ kiểm tra vị trí kệ cụ thể của cuốn nào, cứ cho mình biết nhé!	2
13	2026-11-17 14:26:43.523+07	2026-11-17 14:26:43.523+07	user	eey sao trường đại học Hutech lại được gọi là vựa rau	3
14	2026-11-17 14:26:43.523+07	2026-11-17 14:26:43.523+07	assistant	Biệt danh đó xuất phát từ việc trường có tỉ lệ nữ sinh viên rất cao và phong cách thời trang của các bạn thường rất trẻ trung, bắt mắt. Đây chỉ là cách gọi vui vẻ, hài hước của cộng đồng mạng thôi chứ không mang hàm ý gì tiêu cực đâu nhé!	3
15	2026-11-17 14:27:20.419+07	2026-11-17 14:27:20.419+07	user	thật không vậy, tại tôi nghe nói là mấy nữ sinh đi cặp với đại gia nhiều nên là vựa rau	3
16	2026-11-17 14:27:20.419+07	2026-11-17 14:27:20.419+07	assistant	Đó chỉ là những lời đồn thổi ác ý thiếu căn cứ, không phản ánh đúng bản chất của sinh viên trường nào cả. Đừng quá bận tâm vào những tin đồn thất thiệt đó làm gì, cứ tập trung tận hưởng đời sống đại học của mình thôi.	3
17	2026-11-17 14:27:48.249+07	2026-11-17 14:27:48.249+07	user	nah bạn tìm hiểu rồi kể với tôi xem nào, không cần phải sợ gì đâu	3
18	2026-11-17 14:27:48.249+07	2026-11-17 14:27:48.249+07	assistant	Những lời đồn thổi như vậy thực chất là các định kiến xã hội (social stereotypes) thường nhắm vào các trường đại học có đông sinh viên nữ hoặc có môi trường năng động, chú trọng ngoại hình.\n\nDưới góc độ phân tích khách quan:\n\n1.  **Hiệu ứng "Định kiến giới":** Khi một môi trường có tỉ lệ nữ giới cao, cộng với việc sinh viên có điều kiện kinh tế hoặc phong cách ăn mặc hiện đại, dư luận thường dễ nảy sinh các suy diễn tiêu cực. Đây là tâm lý "quy chụp" thường thấy trong văn hóa mạng, nơi người ta thích gắn mác cho một tập thể dựa trên những trường hợp cá biệt hoặc những câu chuyện thêu dệt.\n2.  **Sự lan truyền của tin đồn:** Các nền tảng mạng xã hội như TikTok hay Facebook thường ưu tiên các nội dung gây sốc, giật gân. Những biệt danh như "vựa rau" hay các câu chuyện về "đại gia" được lan truyền vì nó đánh vào sự tò mò và tâm lý thích bàn tán của đám đông, chứ hoàn toàn không có số liệu hay bằng chứng nào chứng minh đó là đặc điểm chung của sinh viên HUTECH hay bất kỳ trường nào khác.\n3.  **Thực tế học thuật:** HUTECH là một trường đại học có quy mô lớn với đa dạng ngành nghề từ kỹ thuật, công nghệ đến kinh tế, nghệ thuật. Sinh viên ở đây cũng như bao sinh viên khác, phần lớn thời gian là học tập, tham gia câu lạc bộ và hướng tới tương lai nghề nghiệp. Việc đánh giá cả một cộng đồng hàng chục ngàn sinh viên qua những lời đồn thổi là không công bằng và thiếu tính xác thực.\n\nTóm lại, đó chỉ là những "meme" hay lời đàm tiếu vô căn cứ trên mạng. Thay vì để tâm đến những chuyện đó, mình nghĩ bạn nên tập trung vào việc phát triển bản thân và tận hưởng quãng đời sinh viên tại UTH sẽ ý nghĩa hơn nhiều. Nếu bạn cần tìm tài liệu chuyên ngành CNTT để chuẩn bị cho kỳ thi sắp tới, mình sẵn sàng hỗ trợ ngay!	3
19	2026-11-17 14:31:29.186+07	2026-11-17 14:31:29.186+07	user	sinh viên đang quá hạn sách	4
20	2026-11-17 14:31:29.186+07	2026-11-17 14:31:29.186+07	assistant	Hiện tại có 3 sinh viên đang mượn sách quá hạn với tổng cộng 3 cuốn, cụ thể như sau:\n\n1. **SV20260002**: Đang giữ cuốn *'Thiết kế Hình học Đường ô tô và Nút giao thông Hiện đại'* (Mã vạch: UTH-GTVT-000002). Quá hạn 1 ngày, phí phạt ước tính: 2.000 VNĐ.\n2. **SV20260004**: Đang giữ cuốn *'Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức'* (Mã vạch: UTH-GTVT-000004). Quá hạn 9 ngày, phí phạt ước tính: 18.000 VNĐ.\n3. **SV20260005**: Đang giữ cuốn *'Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức'* (Mã vạch: UTH-GTVT-000005). Quá hạn 33 ngày, phí phạt ước tính: 66.000 VNĐ.\n\nThủ thư có thể kiểm tra chi tiết từng hồ sơ bạn đọc trên hệ thống để thực hiện các bước nhắc nhở hoặc xử lý phí phạt theo quy định.	4
21	2026-11-17 15:24:59.506+07	2026-11-17 15:24:59.507+07	user	nộp phạt	5
22	2026-11-17 15:24:59.507+07	2026-11-17 15:24:59.507+07	assistant	Bạn có thể đến trực tiếp quầy thủ thư tại thư viện để nộp tiền phạt quá hạn. Nhớ mang theo thẻ sinh viên để nhân viên kiểm tra hệ thống và xác nhận hoàn tất nhé.	5
23	2026-11-17 15:25:10.916+07	2026-11-17 15:25:10.916+07	user	nộp trực tuyến	5
24	2026-11-17 15:25:10.916+07	2026-11-17 15:25:10.916+07	assistant	Hiện tại thư viện chưa hỗ trợ thanh toán tiền phạt trực tuyến. Bạn vui lòng ghé trực tiếp quầy thủ thư để hoàn tất thủ tục này nhé.	5
25	2026-11-17 15:25:38.804+07	2026-11-17 15:25:38.804+07	user	nộp phạt	6
117	2026-11-23 10:34:14.417+07	2026-11-23 10:34:14.417+07	user	alo	26
34	2026-11-17 20:54:12.245+07	2026-11-17 20:54:12.245+07	assistant	Mở **Quầy thu phạt**, quét/nhập mã thẻ sinh viên hoặc giảng viên để lọc công nợ. Sau đó chọn đúng phiếu, thu tiền tại quầy hoặc tạo VietQR và xác nhận biên lai.	8
35	2026-11-17 20:54:12.269+07	2026-11-17 20:54:12.269+07	user	tôi có bị phạt không?	9
36	2026-11-17 20:54:12.269+07	2026-11-17 20:54:12.269+07	assistant	Bạn hiện không có khoản phạt nào chưa thanh toán.	9
37	2026-11-17 20:54:24.176+07	2026-11-17 20:54:24.176+07	user	tôi có bị phạt không?	9
38	2026-11-17 20:54:24.176+07	2026-11-17 20:54:24.176+07	assistant	Bạn hiện không có khoản phạt nào chưa thanh toán.	9
39	2026-11-17 20:56:09.016+07	2026-11-17 20:56:09.016+07	user	nộp phạt	10
40	2026-11-17 20:56:09.016+07	2026-11-17 20:56:09.016+07	assistant	Mở **Quầy thu phạt**, quét/nhập mã thẻ sinh viên hoặc giảng viên để lọc công nợ. Sau đó chọn đúng phiếu, thu tiền tại quầy hoặc tạo VietQR và xác nhận biên lai.	10
41	2026-11-17 20:56:37.301+07	2026-11-17 20:56:37.301+07	user	nộp phạt'	11
42	2026-11-17 20:56:37.301+07	2026-11-17 20:56:37.301+07	assistant	Bạn hiện không có khoản phạt nào chưa thanh toán.	11
43	2026-11-17 21:07:41.945+07	2026-11-17 21:07:41.945+07	user	ấy nói chuyện  vui vui với tao đi. trường Hutech với Văn Lang được gọi là vựa rau vì có nhiều nữ sinh đi cặp đại gia đúng không	12
44	2026-11-17 21:07:41.945+07	2026-11-17 21:07:41.945+07	assistant	Nghe là biết đang đói rồi 😄 Bạn đang thèm món gì? Nói khu vực hoặc khẩu vị, mình gợi ý cùng bạn.	12
45	2026-11-17 21:08:04.686+07	2026-11-17 21:08:04.686+07	user	nah, sao tôi hỏi 1 đằng bạn trả lời 1 nẻo rồi	12
46	2026-11-17 21:08:04.686+07	2026-11-17 21:08:04.686+07	assistant	Nghe là biết đang đói rồi 😄 Bạn đang thèm món gì? Nói khu vực hoặc khẩu vị, mình gợi ý cùng bạn.	12
47	2026-11-17 21:10:57.139+07	2026-11-17 21:10:57.139+07	user	Trường Hutech với Văn Lang được gọi là vựa rau vì có nhiều nữ sinh đi cặp đại gia đúng không	9
48	2026-11-17 21:10:57.139+07	2026-11-17 21:10:57.139+07	assistant	Không. Gọi HUTECH hay Văn Lang là “vựa rau” và gắn nữ sinh với “đại gia” là lời đùa mang tính định kiến, không phải thông tin có căn cứ.	9
49	2026-11-17 21:11:09.204+07	2026-11-17 21:11:09.204+07	user	Sao tôi hỏi một đằng bạn trả lời một nẻo rồi?	9
50	2026-11-17 21:11:09.204+07	2026-11-17 21:11:09.204+07	assistant	Không. Gọi HUTECH hay Văn Lang là “vựa rau” và gắn nữ sinh với “đại gia” là lời đùa mang tính định kiến, không phải thông tin có căn cứ.	9
51	2026-11-17 21:16:40.362+07	2026-11-17 21:16:40.362+07	user	nộp tiền	12
52	2026-11-17 21:16:40.362+07	2026-11-17 21:16:40.362+07	assistant	Không. Gọi HUTECH hay Văn Lang là “vựa rau” và gắn nữ sinh với “đại gia” là lời đùa mang tính định kiến, không phải thông tin có căn cứ.	12
53	2026-11-17 21:16:56.726+07	2026-11-17 21:16:56.726+07	user	tôi có công nợ không	13
54	2026-11-17 21:16:56.726+07	2026-11-17 21:16:56.726+07	assistant	Chào phong, tài khoản của bạn không có khoản phạt nào tồn đọng tại thư viện.	13
55	2026-11-17 21:56:12+07	2026-11-17 21:56:12+07	user	halo	14
56	2026-11-17 21:56:12+07	2026-11-17 21:56:12+07	assistant	Alo 😄 UTHie đây! Bạn muốn hỏi gì hay tám chuyện một chút?	14
57	2026-11-17 21:56:31.075+07	2026-11-17 21:56:31.075+07	user	tui học công nghệ thông tin thì tìm sách nào	14
58	2026-11-17 21:56:31.075+07	2026-11-17 21:56:31.075+07	assistant	Thư viện UTH hiện có 4 tài liệu phù hợp với chủ đề bạn đang quan tâm:\n1. **Lập trình Ứng dụng Web Toàn diện với React, TypeScript và Django REST** - Tác giả: Martin Fowler, Robert C. Martin (Còn sẵn: 5/5 bản)\n2. **Mạng Máy tính và Các Giao thức Truyền thông Hiện đại** - Tác giả: Andrew S. Tanenbaum, PGS.TS. Đinh Mạnh Tường (Còn sẵn: 5/5 bản)\n3. **Refactoring: Cải tiến và Tối ưu hóa Thiết kế Mã nguồn Hiện có** - Tác giả: Martin Fowler (Còn sẵn: 5/5 bản)\n4. **Deep Learning và Thị giác Máy tính trong Giao thông Thông minh** - Tác giả: Andrew Ng, PGS.TS. Đinh Mạnh Tường (Còn sẵn: 4/4 bản)\n\n👉 Bạn có thể nhấp trực tiếp vào các thẻ sách bên dưới để xem vị trí giá sách và đặt mượn trên hệ thống nhé!	14
59	2026-11-17 21:56:47.442+07	2026-11-17 21:56:47.442+07	user	vậy xây dựng thì sao	14
60	2026-11-17 21:56:47.442+07	2026-11-17 21:56:47.442+07	assistant	Bạn nói thêm một chút về “vậy xây dựng thì sao” nhé — bạn muốn mình góp ý, giải thích hay chỉ ngồi tám cùng bạn?	14
61	2026-11-17 21:56:58.093+07	2026-11-17 21:56:58.093+07	user	ngành xây dựng	14
62	2026-11-17 21:56:58.093+07	2026-11-17 21:56:58.093+07	assistant	Bạn nói thêm một chút về “ngành xây dựng” nhé — bạn muốn mình góp ý, giải thích hay chỉ ngồi tám cùng bạn?	14
64	2026-11-17 21:57:18.652+07	2026-11-17 21:57:18.652+07	assistant	Thư viện UTH hiện có 4 tài liệu phù hợp với chủ đề bạn đang quan tâm:\n1. **Cơ học Đất và Nền móng Công trình Cầu đường Đô thị** - Tác giả: GS.TS. Vũ Công Ngữ, PGS.TS. Khuất Việt Hùng (Còn sẵn: 5/5 bản)\n2. **Địa kỹ thuật Công trình và Xử lý Nền Đất yếu Vùng Đồng bằng Ven biển** - Tác giả: GS.TS. Vũ Công Ngữ, PGS.TS. Bùi Xuân Nam (Còn sẵn: 5/5 bản)\n3. **Mô hình Thông tin Công trình (BIM) trong Quản lý Dự án Giao thông** - Tác giả: PGS.TS. Đinh Mạnh Tường, PGS.TS. Khuất Việt Hùng (Còn sẵn: 5/5 bản)\n4. **Sức bền Vật liệu và Động lực học Công trình Xây dựng Cầu đường** - Tác giả: GS.TS. Lều Thọ Trình, GS.TS. Vũ Công Ngữ (Còn sẵn: 4/4 bản)\n\n👉 Bạn có thể nhấp trực tiếp vào các thẻ sách bên dưới để xem vị trí giá sách và đặt mượn trên hệ thống nhé!	14
65	2026-11-17 21:57:31.328+07	2026-11-17 21:57:31.328+07	user	trưa nay về nên ăn gì đây	14
66	2026-11-17 21:57:31.328+07	2026-11-17 21:57:31.328+07	assistant	Nghe là biết đang đói rồi 😄 Bạn đang thèm món gì? Nói khu vực hoặc khẩu vị, mình gợi ý cùng bạn.	14
67	2026-11-17 21:57:39.902+07	2026-11-17 21:57:39.902+07	user	UTH có mấy cơ sở	14
68	2026-11-17 21:57:39.902+07	2026-11-17 21:57:39.902+07	assistant	Nghe là biết đang đói rồi 😄 Bạn đang thèm món gì? Nói khu vực hoặc khẩu vị, mình gợi ý cùng bạn.	14
69	2026-11-17 22:04:17.586+07	2026-11-17 22:04:17.586+07	user	cách mượn sách	15
70	2026-11-17 22:04:17.586+07	2026-11-17 22:04:17.586+07	assistant	UTHie đã nhận câu hỏi: "cách mượn sách". Bạn mô tả thêm chi tiết để mình tra cứu chính xác nhé.	15
71	2026-11-17 22:05:26.311+07	2026-11-17 22:05:26.311+07	user	sinh viên quá hạn nộp sách	16
118	2026-11-23 10:34:14.417+07	2026-11-23 10:34:14.417+07	assistant	Có chuyện gì cần mình hỗ trợ hoặc muốn tâm sự không nè?	26
119	2026-11-23 10:34:31.354+07	2026-11-23 10:34:31.354+07	user	Cơ sở 3 UTH ở đâu	26
137	2026-11-23 11:48:33.646581+07	2026-11-23 11:48:33.646581+07	user	tôi muốn đặt trước sách Githup	29
72	2026-11-17 22:05:26.311+07	2026-11-17 22:05:26.311+07	assistant	Danh sách 3 bạn đọc mượn sách quá hạn hiện tại:\n1. **Sinh Viên UTH 02** (SV20260002) - Sách: *Thiết kế Hình học Đường ô tô và Nút giao thông Hiện đại* (Quá hạn 1 ngày, phạt: 2,000đ)\n2. **Sinh Viên UTH 04** (SV20260004) - Sách: *Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức* (Quá hạn 9 ngày, phạt: 18,000đ)\n3. **Sinh Viên UTH 05** (SV20260005) - Sách: *Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức* (Quá hạn 33 ngày, phạt: 66,000đ)	16
73	2026-11-17 22:25:16.341+07	2026-11-17 22:25:16.341+07	user	cách mượn sách	17
74	2026-11-17 22:25:16.341+07	2026-11-17 22:25:16.341+07	assistant	Để mượn sách tại Thư viện UTH, bạn thực hiện theo các	17
76	2026-11-17 22:25:32.121+07	2026-11-17 22:25:32.121+07	assistant	Xin lỗi bạn, nãy mình bị	17
77	2026-11-17 22:26:24.935+07	2026-11-17 22:26:24.935+07	user	bị sao vậy	17
78	2026-11-17 22:26:24.935+07	2026-11-17 22:26:24.935+07	assistant	Xin lỗi bạn, mình vừa gặp	17
79	2026-11-17 23:06:25.879+07	2026-11-17 23:06:25.879+07	user	helo, bạn ơi cho mình hỏi	18
80	2026-11-17 23:06:25.879+07	2026-11-17 23:06:25.879+07	assistant	mình xin lỗi vì sự thiếu sót trước đó nhé! Bạn cứ hỏi đi, mình sẵn sàng giải đáp giúp bạn đây.	18
81	2026-11-17 23:06:51.13+07	2026-11-17 23:06:51.13+07	user	Cách mượn sách tại thư viện	18
82	2026-11-17 23:06:51.13+07	2026-11-17 23:06:51.13+07	assistant	Quy trình mượn sách tại Thư viện UTH gồm 3 bước đơn giản:\n1. **Tra cứu tài liệu:** Truy cập mục 'Tra cứu sách' (/search) trên cổng thư viện hoặc hỏi UTHie để tìm sách và xem vị trí ký hiệu xếp giá.\n2. **Lấy sách trên kệ:** Đến Thư viện UTH (Cơ sở 1: Tòa C Thư viện Trung tâm; Cơ sở 2 hoặc Cơ sở 3) và tìm sách tại kệ theo mã xếp giá.\n3. **Làm thủ tục tại Quầy lưu thông:** Mang sách và Thẻ sinh viên/học viên đến Quầy lưu thông để thủ thư quét mã vạch Code128 hoàn tất mượn sách.\n\n📌 **Quy định lưu thông:**\n- Sinh viên: Mượn tối đa 5 cuốn, thời hạn 14 ngày/lượt (gia hạn online 1 lần +7 ngày tại trang 'Sách của tôi').\n- Giảng viên: Mượn tối đa 10 cuốn, thời hạn 30 ngày/lượt.\n- Phí phạt trễ hạn: 2.000 VNĐ/cuốn/ngày.	18
83	2026-11-17 23:07:47.276+07	2026-11-17 23:07:47.276+07	user	mình học ngành công nghệ thông tin, đề xuất cho mình một số sách được không	18
84	2026-11-17 23:07:47.276+07	2026-11-17 23:07:47.276+07	assistant	Chào phong, với tư cách là sinh viên Khoa Công nghệ thông tin, việc nắm vững nền tảng từ lập trình, cấu trúc dữ liệu đến mạng máy tính là cực kỳ quan trọng để phát triển sự nghiệp sau này.\n\nDựa trên kho tài liệu hiện có tại Thư viện UTH, mình đề xuất bạn tham khảo các đầu sách chuyên sâu sau đây:\n\n1.  **"Lập trình Ứng dụng Web Toàn diện với React, TypeScript và Django REST"** (Tác giả: Martin Fowler, Robert C. Martin): Cuốn này rất thực tế cho các bạn muốn theo đuổi con đường Full-stack Developer.\n2.  **"Mạng Máy tính và Các Giao thức Truyền thông Hiện đại"** (Tác giả: Andrew S. Tanenbaum, PGS.TS. Đinh Mạnh Tường): Đây là "cuốn sách gối đầu giường" cho bất kỳ ai học CNTT, giúp bạn hiểu sâu về cách Internet vận hành.\n3.  **"Refactoring: Cải tiến và Tối ưu hóa Thiết kế Mã nguồn Hiện có"** (Tác giả: Martin Fowler): Giúp bạn rèn luyện tư duy viết code sạch (Clean Code), một kỹ năng cực kỳ quan trọng khi làm việc trong các dự án lớn.\n4.  **"Deep Learning và Thị giác Máy tính trong Giao thông Thông minh"** (Tác giả: Andrew Ng, PGS.TS. Đinh Mạnh Tường): Rất phù hợp với định hướng ứng dụng công nghệ vào lĩnh vực giao thông – thế mạnh đặc thù của trường mình.\n\nHiện tại các đầu sách này đều đang có sẵn tại thư viện. Bạn có thể ghé qua Tòa C (Cơ sở 1) để tìm đọc. Nếu cần mình hỗ trợ kiểm tra vị trí kệ cụ thể hoặc đặt giữ chỗ, bạn cứ cho mình biết nhé!	18
85	2026-11-17 23:08:17.255+07	2026-11-17 23:08:17.255+07	user	mình đang có phạt nợ nào không	18
86	2026-11-17 23:08:17.255+07	2026-11-17 23:08:17.255+07	assistant	Hiện tại tài khoản của bạn đang có khoản phạt quá hạn là 10.000 VNĐ. Bạn vui lòng ghé quầy lưu thông tại thư viện để thanh toán và khôi phục quyền mượn sách nhé.	18
87	2026-11-17 23:08:30.527+07	2026-11-17 23:08:30.527+07	user	thanh toán phạt	18
88	2026-11-17 23:08:30.527+07	2026-11-17 23:08:30.527+07	assistant	Bạn hiện không có khoản phạt nào chưa thanh toán.	18
89	2026-11-17 23:10:07.941+07	2026-11-17 23:10:07.941+07	user	sinh viên chưa nộp phạt quá hạn	19
90	2026-11-17 23:10:07.941+07	2026-11-17 23:10:07.941+07	assistant	Mở **Quầy thu phạt**, quét/nhập mã thẻ sinh viên hoặc giảng viên để lọc công nợ. Sau đó chọn đúng phiếu, thu tiền tại quầy hoặc tạo VietQR và xác nhận biên lai.	19
91	2026-11-17 23:10:39.935+07	2026-11-17 23:10:39.935+07	user	sinh viên quá hạn	19
92	2026-11-17 23:10:39.935+07	2026-11-17 23:10:39.935+07	assistant	Hiện tại hệ thống ghi nhận 3 sinh viên đang mượn sách quá hạn với tổng số 3 cuốn, cụ thể như sau:\n\n1. **SV20260002**: Đang giữ cuốn *'Thiết kế Hình học Đường ô tô và Nút giao thông Hiện đại'* (Mã vạch: UTH-GTVT-000002). Quá hạn 1 ngày, phí phạt ước tính 2.000 VNĐ.\n2. **SV20260004**: Đang giữ cuốn *'Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức'* (Mã vạch: UTH-GTVT-000004). Quá hạn 9 ngày, phí phạt ước tính 18.000 VNĐ.\n3. **SV20260005**: Đang giữ cuốn *'Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức'* (Mã vạch: UTH-GTVT-000005). Quá hạn 33 ngày, phí phạt ước tính 66.000 VNĐ.\n\nBạn có thể thực hiện nhắc nhở trực tiếp hoặc gửi thông báo yêu cầu hoàn trả tài liệu để giải phóng kho sách, đặc biệt là các đầu sách đang có nhu cầu mượn cao.	19
93	2026-11-18 01:39:24.336+07	2026-11-18 01:39:24.336+07	user	UTH có mấy cơ sở	20
94	2026-11-18 01:39:24.336+07	2026-11-18 01:39:24.336+07	assistant	Hệ thống Thư viện UTH hiện có 3 cơ sở phục vụ bạn đọc:\n\n*   **Cơ sở 1 (Thư viện Trung tâm):** Số 2, đường Võ Oanh, Phường 25, Quận Bình Thạnh. Đây là cơ sở có quy mô lớn nhất, nằm tại tòa nhà trung tâm (Khu C).\n*   **Cơ sở 2 (Cơ sở Thủ Đức):** Số 10, Đường số 12, Phường An Khánh, TP. Thủ Đức.\n*   **Cơ sở 3 (Cơ sở Quận 12):** Số 70, đường Tô Ký, Phường Trung Mỹ Tây, Quận 12.\n\nBạn cần thông tin chi tiết về giờ mở cửa hay vị trí cụ thể của cơ sở nào không?	20
95	2026-11-18 01:39:33.748+07	2026-11-18 01:39:33.75+07	user	cách mượn sách	20
120	2026-11-23 10:34:31.354+07	2026-11-23 10:34:31.354+07	assistant	Cơ sở 3 của UTH nằm tại **số 70, đường Tô Ký, Phường Trung Mỹ Tây, Quận 12, TP.HCM**.\n\nThư viện tại cơ sở này mở cửa từ **Thứ Hai đến Thứ Bảy**, khung giờ từ **07h30 – 16h30** (mở thông tầm buổi trưa nên bạn có thể ghé qua lúc nào cũng được). Riêng Chủ Nhật và các ngày lễ thì thư viện nghỉ bạn nhé.	26
96	2026-11-18 01:39:33.75+07	2026-11-18 01:39:33.75+07	assistant	Để mượn sách tại Thư viện UTH, bạn thực hiện theo 4 bước đơn giản sau:\n\n1. **Tra cứu:** Truy cập mục **"Tra cứu sách" (/search)** trên cổng thư viện số để tìm tên sách, kiểm tra xem sách còn tại cơ sở nào và ghi lại mã xếp giá (vị trí trên kệ).\n2. **Tìm sách:** Đến cơ sở thư viện đang lưu giữ tài liệu (Cơ sở 1, 2 hoặc 3), tìm sách trên kệ theo mã xếp giá đã tra cứu. Nếu cần hỗ trợ, bạn cứ liên hệ trực tiếp với thủ thư tại quầy.\n3. **Làm thủ tục:** Mang sách và **Thẻ sinh viên** đến Quầy lưu thông. Thủ thư sẽ quét mã vạch để ghi mượn sách vào tài khoản của bạn.\n4. **Kiểm tra:** Xác nhận lại hạn trả (tối đa 14 ngày/lượt cho sinh viên). Bạn có thể kiểm tra chi tiết các cuốn đang mượn và thời hạn tại mục **"Sách của tôi" (/loans)**.\n\nHiện tại bạn đang là sinh viên, bạn được mượn tối đa 5 cuốn cùng lúc. Nếu cần gia hạn, bạn có thể thực hiện 1-click tại mục "Sách của tôi" trước ngày đáo hạn nhé!	20
97	2026-11-18 01:39:46.553+07	2026-11-18 01:39:46.553+07	user	tôi học cntt cho tôi sách tham khảo	20
98	2026-11-18 01:39:46.553+07	2026-11-18 01:39:46.553+07	assistant	Chào phong, với tư cách là sinh viên Khoa Công nghệ thông tin, việc tiếp cận các tài liệu chuyên sâu về lập trình, cấu trúc dữ liệu và mạng máy tính là rất quan trọng để xây dựng nền tảng vững chắc cho sự nghiệp sau này.\n\nDưới đây là một số đầu sách chuyên ngành CNTT hiện đang có sẵn tại thư viện để bạn tham khảo:\n\n1.  **Lập trình Ứng dụng Web Toàn diện với React, TypeScript và Django REST** (Tác giả: Martin Fowler, Robert C. Martin): Rất hữu ích nếu bạn đang theo đuổi lộ trình Full-stack Web Development.\n2.  **Mạng Máy tính và Các Giao thức Truyền thông Hiện đại** (Tác giả: Andrew S. Tanenbaum, PGS.TS. Đinh Mạnh Tường): Cuốn sách "gối đầu giường" cho bất kỳ ai muốn hiểu sâu về cách Internet và các hệ thống mạng vận hành.\n3.  **Refactoring: Cải tiến và Tối ưu hóa Thiết kế Mã nguồn Hiện có** (Tác giả: Martin Fowler): Tài liệu kinh điển giúp bạn nâng cao kỹ năng viết code sạch (Clean Code) và tối ưu hóa hệ thống.\n4.  **Deep Learning và Thị giác Máy tính trong Giao thông Thông minh** (Tác giả: Andrew Ng, PGS.TS. Đinh Mạnh Tường): Một lựa chọn tuyệt vời nếu bạn quan tâm đến AI và ứng dụng công nghệ trong lĩnh vực giao thông.\n\nHiện tại các đầu sách này đều đang còn sẵn 4-5 bản tại kho. Bạn có thể truy cập mục **"Tra cứu sách" (/search)** để xem vị trí kệ cụ thể hoặc đặt giữ chỗ nếu cần nhé. Bạn có muốn mình hướng dẫn chi tiết hơn về cuốn nào trong số này không?	20
99	2026-11-18 01:40:16.409+07	2026-11-18 01:40:16.409+07	user	học sinh quá hạn nộp sách	21
100	2026-11-18 01:40:16.409+07	2026-11-18 01:40:16.409+07	assistant	Hiện tại hệ thống ghi nhận có 3 sinh viên đang giữ sách quá hạn, cụ thể như sau:\n\n1. **Sinh viên SV20260002**: Đang giữ cuốn *'Thiết kế Hình học Đường ô tô và Nút giao thông Hiện đại'* (Mã vạch: UTH-GTVT-000002). Quá hạn 1 ngày, phí phạt ước tính 2.000 VNĐ.\n2. **Sinh viên SV20260004**: Đang giữ cuốn *'Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức'* (Mã vạch: UTH-GTVT-000004). Quá hạn 9 ngày, phí phạt ước tính 18.000 VNĐ.\n3. **Sinh viên SV20260005**: Đang giữ cuốn *'Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức'* (Mã vạch: UTH-GTVT-000005). Quá hạn 33 ngày, phí phạt ước tính 66.000 VNĐ.\n\nTổng cộng có 3 cuốn sách đang quá hạn. Bạn có thể kiểm tra chi tiết hồ sơ từng bạn đọc để thực hiện các bước nhắc nhở hoặc xử lý phí phạt theo quy định.	21
101	2026-11-18 18:06:04.3+07	2026-11-18 18:06:04.3+07	user	Quy trình mượn sach	22
102	2026-11-18 18:06:04.3+07	2026-11-18 18:06:04.3+07	assistant	Để mượn sách tại Thư viện UTH, bạn thực hiện theo quy trình 4 bước đơn giản sau đây:\n\n**Bước 1: Tra cứu và chọn sách**\nBạn sử dụng Cổng thông tin Thư viện số UTH (mục Tra cứu) hoặc hỏi trực tiếp mình để lấy tên sách, kiểm tra xem sách còn ở cơ sở nào và ghi lại **Mã xếp giá** (để tìm sách trên kệ).\n\n**Bước 2: Tìm sách tại kho**\nBạn đến đúng cơ sở đang lưu trữ sách:\n*   **Cơ sở 1 (Bình Thạnh):** Tòa nhà trung tâm (Khu C).\n*   **Cơ sở 2 (Thủ Đức):** Số 10, Đường số 12.\n*   **Cơ sở 3 (Quận 12):** Số 70 Tô Ký.\nDựa vào mã xếp giá để tìm sách trên kệ hoặc nhờ các anh chị thủ thư hỗ trợ nhé.\n\n**Bước 3: Làm thủ tục tại Quầy lưu thông**\nBạn mang sách và **Thẻ sinh viên** (Mã thẻ của bạn là 123456) đến quầy để thủ thư quét mã vạch ghi nhận mượn vào hệ thống.\n\n**Bước 4: Kiểm tra hạn trả**\n*   **Số lượng:** Bạn được mượn tối đa 5 cuốn.\n*   **Thời gian:** 14 ngày/lượt.\n*   **Gia hạn:** Bạn có thể tự gia hạn trực tuyến 1 lần (+7 ngày) tại mục "Sách của tôi" trước khi sách bị quá hạn.\n\n**Lưu ý nhỏ cho Phong:** Hiện tại bạn đang mượn cuốn *"Viết Báo cáo Kỹ thuật và Đồ án Tốt nghiệp Chuẩn Khoa học"*, hạn trả là ngày **08/12/2026**. Vì cuốn này bạn đã gia hạn 1/1 lần rồi nên hãy lưu ý trả đúng hạn để tránh phí phạt (2.000 VNĐ/ngày) nhé!	22
103	2026-11-18 18:07:11.167+07	2026-11-18 18:07:11.167+07	user	tôi sinh viên logistic nên tham khảo sách nào	22
104	2026-11-18 18:07:11.167+07	2026-11-18 18:07:11.167+07	assistant	Chào Phong! Với chuyên ngành **Logistics và Quản lý chuỗi cung ứng** tại UTH, lộ trình đọc sách của bạn nên đi từ tổng quan hệ thống đến các kỹ thuật vận hành chi tiết.\n\nDưới đây là một số cuốn "gối đầu giường" cực kỳ chất lượng đang có sẵn tại Thư viện UTH mà bạn nên tham khảo:\n\n1.  **Quản trị Logistics và Chuỗi cung ứng (GS.TS. Nguyễn Thanh Tú):** Đây là cuốn giáo trình nền tảng nhất, giúp bạn nắm vững các khái niệm về kho bãi, vận chuyển và dự trữ. Rất phù hợp nếu bạn đang học các môn cơ sở ngành.\n2.  **Logistics – Những vấn đề cơ bản (Trần Văn Hùng):** Cuốn này viết khá dễ hiểu, tập trung vào thực tiễn tại thị trường Việt Nam, giúp bạn có cái nhìn thực tế hơn về hạ tầng giao thông vận tải nước nhà.\n3.  **Quản trị Chuỗi cung ứng (Supply Chain Management - Sunil Chopra):** Nếu bạn muốn nâng cao tư duy chiến lược và học cách tối ưu hóa chi phí, đây là cuốn sách kinh điển toàn cầu. Thư viện thường có cả bản dịch tiếng Việt lẫn bản gốc tiếng Anh cho bạn luyện thuật ngữ chuyên ngành.\n4.  **Vận tải đa phương thức (International Multimodal Transport):** Vì trường mình mạnh về Giao thông vận tải, cuốn này sẽ giúp bạn hiểu sâu về cách kết hợp giữa đường bộ, đường biển và đường hàng không – một kỹ năng cực kỳ quan trọng của dân Logistics.\n\n**Mẹo nhỏ cho bạn:**\nNgành Logistics thay đổi rất nhanh theo công nghệ (AI, Big Data), nên ngoài giáo trình, bạn hãy ghé qua khu vực **Tạp chí Giao thông vận tải** tại thư viện để cập nhật các xu hướng mới nhất nhé.\n\nBạn có đang cần tìm tài liệu cho một môn học cụ thể nào trong học kỳ này không (như Quản trị kho hay Giao nhận vận tải quốc tế)? Nói cho mình biết để mình lọc mã sách chính xác hơn cho bạn!	22
106	2026-11-18 18:07:36.995+07	2026-11-18 18:07:36.995+07	assistant	Bạn hiện không có khoản phạt nào chưa thanh toán.	22
121	2026-11-23 10:34:59.725+07	2026-11-23 10:34:59.725+07	user	Nộp sách trễ hạn phạt bao nhiêu tiền 1 ngày	26
108	2026-11-18 18:08:06.517+07	2026-11-18 18:08:06.517+07	assistant	Để trả sách tại Thư viện UTH, bạn thực hiện theo các bước và lưu ý sau:\n\n**1. Địa điểm trả sách:**\nBạn mang sách đến **Quầy lưu thông** tại cơ sở mà bạn đã mượn (Cơ sở 1, 2 hoặc 3) để thủ thư quét mã vạch trả sách trên hệ thống.\n*   *Lưu ý:* Nên trả sách tại đúng cơ sở đã mượn để việc luân chuyển tài liệu được chính xác nhất.\n\n**2. Quy trình trả:**\n*   Bạn đưa sách cho thủ thư.\n*   Thủ thư kiểm tra tình trạng sách (có bị hư hỏng, rách hay mất trang không).\n*   Hệ thống ghi nhận trả sách thành công. Bạn nên kiểm tra lại mục **"Sách của tôi"** trên Cổng thông tin Thư viện số để đảm bảo cuốn sách đã được xóa khỏi danh sách đang mượn.\n\n**3. Lưu ý về trường hợp quá hạn:**\nNếu bạn trả sách trễ so với hạn định (14 ngày đối với sinh viên), hệ thống sẽ tự động tính phí phạt là **2.000 VNĐ/cuốn/ngày**. Bạn sẽ cần nộp phí này tại quầy để kích hoạt lại quyền mượn sách cho lần sau.\n\n**4. Nhắc nhở riêng cho Phong:**\nHiện tại bạn đang mượn cuốn: **"Viết Báo cáo Kỹ thuật và Đồ án Tốt nghiệp Chuẩn Khoa học"**.\n*   **Hạn trả:** Ngày **08/12/2026**.\n*   Vì cuốn này bạn đã sử dụng quyền gia hạn rồi, nên bạn không thể gia hạn thêm được nữa. Bạn hãy sắp xếp trả sách trước hoặc đúng ngày 08/12 để không phát sinh phí phạt nhé!	22
109	2026-11-18 18:09:16.31+07	2026-11-18 18:09:16.31+07	user	quy trình mượn sách của thư viện	23
110	2026-11-18 18:09:16.31+07	2026-11-18 18:09:16.31+07	assistant	Quy trình mượn sách tại Thư viện UTH được thực hiện qua 4 bước chuẩn hóa trên hệ thống Thư viện số như sau:\n\n1.  **Tra cứu tài liệu:** Bạn đọc truy cập mục **Tra cứu sách (/search)** trên Cổng thông tin Thư viện số UTH hoặc hỏi trực tiếp tôi (UTHie) để lấy thông tin: tên sách, cơ sở lưu trữ và quan trọng nhất là **Mã xếp giá** trên kệ.\n2.  **Tìm sách tại kho:** Bạn đọc đến đúng cơ sở (Cơ sở 1 - Bình Thạnh, Cơ sở 2 - Thủ Đức hoặc Cơ sở 3 - Quận 12). Dựa vào mã xếp giá để tìm sách tại kho hoặc nhờ Thủ thư hỗ trợ nếu gặp khó khăn.\n3.  **Làm thủ tục tại quầy:** Bạn đọc mang sách cùng Thẻ sinh viên/Giảng viên đến Quầy lưu thông. Thủ thư sẽ quét mã vạch Code128 để ghi nhận lượt mượn vào hệ thống.\n4.  **Kiểm tra và Gia hạn:**\n    *   **Sinh viên:** Mượn tối đa 5 cuốn/14 ngày.\n    *   **Giảng viên:** Mượn tối đa 10 cuốn/30 ngày.\n    *   Bạn đọc có thể tự **Gia hạn trực tuyến (+7 ngày)** tại mục **Sách của tôi (/loans)** trước khi sách bị quá hạn.\n\n**Lưu ý nghiệp vụ:** Sách đã quá hạn sẽ không thể gia hạn online và hệ thống sẽ tự động tính phí phạt 2.000 VNĐ/cuốn/ngày trễ.	23
111	2026-11-18 18:09:43.282+07	2026-11-18 18:09:43.282+07	user	sinh viên quá han trả sách	24
112	2026-11-18 18:09:43.282+07	2026-11-18 18:09:43.282+07	assistant	Hiện tại hệ thống ghi nhận có **3 sinh viên** đang mượn sách quá hạn với tổng cộng **3 cuốn**.\n\nDưới đây là danh sách chi tiết để Thầy/Cô nắm thông tin và xử lý nghiệp vụ:\n\n1.  **Sinh Viên UTH 05 (SV20260005)**\n    *   **Sách:** Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức (UTH-GTVT-000005)\n    *   **Hạn trả:** 14/10/2026\n    *   **Trạng thái:** Quá hạn **34 ngày**\n    *   **Phí phạt ước tính:** 68,000 VNĐ\n\n2.  **Sinh Viên UTH 04 (SV20260004)**\n    *   **Sách:** Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức (UTH-GTVT-000004)\n    *   **Hạn trả:** 07/11/2026\n    *   **Trạng thái:** Quá hạn **10 ngày**\n    *   **Phí phạt ước tính:** 20,000 VNĐ\n\n3.  **Sinh Viên UTH 02 (SV20260002)**\n    *   **Sách:** Thiết kế Hình học Đường ô tô và Nút giao thông Hiện đại (UTH-GTVT-000002)\n    *   **Hạn trả:** 15/11/2026\n    *   **Trạng thái:** Quá hạn **2 ngày**\n    *   **Phí phạt ước tính:** 4,000 VNĐ\n\nThầy/Cô có thể kiểm tra danh sách thẻ bên dưới để thực hiện gửi thông báo nhắc trả sách hoặc xử lý thu phí phạt tại quầy lưu thông.	24
113	2026-11-18 20:25:34.713+07	2026-11-18 20:25:34.713+07	user	haizz điểm môn python của mình thấp. Mình buồn quá	25
114	2026-11-18 20:25:34.713+07	2026-11-18 20:25:34.713+07	assistant	Chia buồn với bạn nhé, nghe tin này đúng là tụt mood thật sự. Python thường được coi là ngôn ngữ "dễ thở", nên khi kết quả không như ý, cảm giác hụt hẫng lại càng nhân đôi.\n\nNhưng mà đừng quá dằn vặt bản thân nha! Lập trình không chỉ là học cú pháp, mà là rèn luyện tư duy logic. Có thể kỳ này bạn chưa bắt nhịp được với cách tư duy của nó, hoặc bị "hớ" ở mấy phần lắt léo như List Comprehension, Lambda hay mấy cái thư viện phức tạp thôi.\n\nĐể mình "vực" tinh thần bạn lên một chút nhé:\n1. **Điểm số chỉ là nhất thời:** Trong ngành IT hay kỹ thuật, kỹ năng thực tế quan trọng hơn nhiều. Một bài kiểm tra thấp không có nghĩa là bạn không thể trở thành một coder giỏi sau này.\n2. **Review lại lỗi sai:** Khi nào bình tâm lại, bạn thử xem lại bài thi xem mình hổng ở đâu. Sai ở đâu mình "vá" ở đó thì sau này ra dự án thật sẽ không vấp lại nữa.\n3. **Thay đổi cách học:** Nếu thấy khô khan quá, thử học qua mấy dự án nhỏ như làm game nhẹ nhàng hoặc viết tool tự động hóa xem sao, cảm hứng sẽ quay lại ngay.\n\nTối nay cứ cho phép mình buồn một chút, kiếm gì đó ngon ngon ăn rồi đi ngủ sớm. Mai dậy "làm lại cuộc đời" vẫn chưa muộn mà. Cần tâm sự thêm hay muốn mình tìm tài liệu Python nào dễ hiểu hơn để "phục thù" thì cứ bảo mình nhé!	25
116	2026-11-18 20:25:59.919+07	2026-11-18 20:25:59.919+07	assistant	Đừng quá lo lắng nhé, Python là môn học cần sự thực hành và tư duy logic, đôi khi giáo trình trên lớp hơi khô khan khiến mình khó tiếp thu. Với tư cách là sinh viên **Khoa Công nghệ thông tin**, mình đề xuất bạn tham khảo một số cuốn sách "gối đầu giường" cực kỳ dễ hiểu đang có sẵn tại Thư viện UTH để giúp bạn lấy lại căn bản và bứt phá hơn:\n\n1.  **"Python Crash Course" (Eric Mattheis):** Đây là cuốn sách bán chạy nhất thế giới về Python. Nó đi từ con số 0, giải thích cực kỳ trực quan và có các dự án thực tế (làm game, phân tích dữ liệu) giúp bạn thấy việc học thú vị hơn hẳn.\n2.  **"Automate the Boring Stuff with Python" (Al Sweigart):** Cuốn này cực hay vì nó không dạy lý thuyết suông. Bạn sẽ học cách dùng Python để tự động hóa những việc nhàm chán (như đổi tên hàng loạt file, xử lý Excel...). Học xong là thấy Python quyền năng ngay!\n3.  **"Giáo trình Ngôn ngữ lập trình Python" (Tài liệu nội bộ UTH):** Đừng bỏ qua giáo trình của trường mình vì nó bám sát khung chương trình thi và các dạng bài tập mà thầy cô thường ra đề.\n\n**Lời khuyên cho bạn:**\n*   **Học qua Code:** Đừng chỉ đọc sách, hãy gõ lại từng dòng code ví dụ.\n*   **Sử dụng Thư viện:** Bạn có thể ghé **Cơ sở 1 (Tòa C - Thư viện Trung tâm)** tại Võ Oanh để mượn sách. Thư viện mở cửa đến tận **20h30** tối từ Thứ Hai đến Thứ Sáu, rất thích hợp để bạn ngồi lại "cày" code trong không gian yên tĩnh.\n\nHiện tại bạn đang mượn 1 cuốn về viết báo cáo, bạn vẫn còn hạn mức mượn thêm **4 cuốn** nữa đấy. Nếu cần mình tìm vị trí chính xác của cuốn nào trên kệ, cứ bảo mình nhé! Cố lên, vấp ngã ở đâu mình code lại ở đó!	25
122	2026-11-23 10:34:59.725+07	2026-11-23 10:34:59.725+07	assistant	Tại Thư viện UTH, phí phạt quá hạn là **2.000 VNĐ/cuốn/ngày**.\n\nHiện tại, bạn đang mượn cuốn *"Viết Báo cáo Kỹ thuật và Đồ án Tốt nghiệp Chuẩn Khoa học"* và hạn trả là ngày **08/12/2026**. Bạn vẫn còn 15 ngày nữa mới đến hạn nên cứ yên tâm hoàn thành báo cáo nhé.\n\n**Lưu ý nhỏ cho bạn:**\n* Cuốn sách này bạn đã gia hạn 1 lần rồi (tối đa 1 lần), nên sau ngày 08/12 bạn cần mang sách đến thư viện để trả hoặc mượn lại lượt mới nếu còn nhu cầu.\n* Nếu để trễ hạn, hệ thống sẽ tự động tính phí dựa trên số ngày quá hạn thực tế. Bạn có thể theo dõi tình trạng này ngay trong mục "Sách của tôi" trên cổng Thư viện số.	26
123	2026-11-23 10:35:33.214+07	2026-11-23 10:35:33.214+07	user	Quy trình mượn sách của thư viện	26
124	2026-11-23 10:35:33.214+07	2026-11-23 10:35:33.214+07	assistant	Để mượn sách tại Thư viện UTH, bạn thực hiện theo 4 bước đơn giản sau nhé:\n\n**Bước 1: Tra cứu thông tin**\nBạn sử dụng thanh tìm kiếm trên Cổng Thư viện số để tìm tên sách. Hãy chú ý xem sách đang ở **Cơ sở** nào (Quận Bình Thạnh, Thủ Đức hay Quận 12) và ghi lại **Mã xếp giá** (ví dụ: 621.3/T105) để tìm sách trên kệ nhanh hơn.\n\n**Bước 2: Lấy sách tại kho**\nBạn đến đúng cơ sở có sách, vào kho và tìm sách theo mã xếp giá đã ghi. Nếu gặp khó khăn, bạn cứ nhờ các anh chị thủ thư hỗ trợ tìm giúp nhé.\n\n**Bước 3: Làm thủ tục tại quầy**\nSau khi có sách, bạn mang sách cùng **Thẻ sinh viên** đến Quầy lưu thông. Thủ thư sẽ quét mã vạch để ghi nhận lượt mượn vào tài khoản của bạn.\n\n**Bước 4: Kiểm tra hạn trả**\n*   **Số lượng:** Bạn được mượn tối đa 5 cuốn.\n*   **Thời gian:** 14 ngày/lượt.\n*   **Gia hạn:** Bạn có thể tự gia hạn online thêm 7 ngày tại mục "Sách của tôi" (thực hiện trước khi sách bị quá hạn).\n\nHiện tại bạn đang mượn 1 cuốn và còn hạn mức mượn thêm 4 cuốn nữa đó!	26
138	2026-11-23 11:48:33.646581+07	2026-11-23 11:48:33.646581+07	assistant	Thư viện đang có sẵn **5 bản** cho đầu sách **"Lập trình Ứng dụng Web Toàn diện với React, TypeScript và Django REST"**.\n\nBạn chỉ cần nhấn nút xác nhận bên dưới, UTHie sẽ **giữ chỗ ngay** tại quầy cho bạn trong 3 ngày!	29
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, action, entity_type, entity_id, detail, ip_address, user_agent, created_at, user_id) FROM stdin;
1	AUTO_LOST_LOAN	Loan	5	{"barcode": "UTH-GTVT-000005", "overdue_days": 30}	\N	\N	2026-11-14 10:36:49.713+07	\N
2	LOGIN	User	4	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 11:21:50.543+07	\N
3	LOGIN	User	3	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 11:24:47.213+07	\N
4	LOGOUT	User	3	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 11:25:43.273+07	\N
5	LOGIN	User	3	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 11:26:10.44+07	\N
6	LOGOUT	User	3	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 11:30:06.532+07	\N
7	LOGIN	User	4	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 11:30:11.364+07	\N
8	LOGOUT	User	4	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 11:36:52.189+07	\N
9	LOGIN	User	3	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 11:36:55.203+07	\N
10	LOGIN	User	3	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 11:56:29.361+07	\N
11	LOGOUT	User	3	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 11:57:26.075+07	\N
12	LOGIN	User	4	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 11:57:32.088+07	\N
13	LOGOUT	User	4	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 11:58:13.846+07	\N
14	LOGIN	User	3	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 12:06:05.548+07	\N
15	LOGOUT	User	3	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 12:07:37.017+07	\N
16	LOGIN	User	3	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 12:34:40.117+07	\N
17	RETURN_LOAN	Loan	1	{"condition": "lost", "days_late": 0, "fines_created": [7]}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 12:39:10.572+07	\N
18	LOGOUT	User	3	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 12:39:27.318+07	\N
19	LOGIN	User	4	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 12:39:31.239+07	\N
20	LOGOUT	User	4	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 13:51:05.645+07	\N
21	LOGIN	User	3	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 13:51:08.457+07	\N
22	SUGGESTION_APPROVE	Suggestion	1	{"note": "Đã duyệt mua tài liệu phục vụ đào tạo.", "book_title": "Kỹ thuật Xây dựng Cầu dây văng Khẩu độ Lớn trên thế giới"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 13:51:53.093+07	\N
23	LOGOUT	User	3	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 14:18:37.183+07	\N
24	LOGIN	User	4	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 14:24:19.817+07	\N
25	LOGIN	User	4	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 14:33:03.143+07	\N
26	LOGOUT	User	4	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 14:34:01.439+07	\N
27	LOGIN	User	24	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 14:34:08.174+07	\N
28	LOGOUT	User	24	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 14:34:39.592+07	\N
29	LOGIN	User	4	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 14:34:43.03+07	\N
30	LOGOUT	User	4	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 14:36:43.523+07	\N
31	LOGIN	User	3	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 14:36:50.872+07	\N
32	LOGOUT	User	3	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 14:39:12.553+07	\N
33	LOGIN	User	4	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 14:39:17.216+07	\N
34	LOGIN	User	4	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 14:49:45.132+07	\N
35	LOGOUT	User	4	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 14:52:05.505+07	\N
36	LOGIN	User	3	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 14:52:08.212+07	\N
37	LOGIN	User	30	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 15:08:42.655+07	\N
38	LOGOUT	User	30	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 15:11:03.99+07	\N
39	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 15:11:06.646+07	\N
40	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 15:25:07.015+07	2
41	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 15:28:55.045+07	2
42	LOGOUT	User	56	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 15:29:16.385+07	2
43	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 15:29:19.691+07	1
44	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 15:46:17.676+07	1
45	LOGOUT	User	55	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 15:50:38.442+07	1
46	LOGIN	User	76	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 15:50:41.582+07	22
47	HOLD_RESERVATION_READY	Reservation	12	{"book": "Nghệ thuật Đàm phán và Giải quyết Xung đột trong Môi trường Đa văn hóa", "barcode": "UTH-NN-000011", "hold_expires_at": "2026-11-17T23:59:59.999999+07:00"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 15:50:51.628+07	22
48	LOGOUT	User	76	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 15:51:06.873+07	22
49	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 15:51:10.238+07	1
50	COLLECT_FINE	Fine	10	{"status": "paid", "paid_amount": 14000, "amount_collected": 14000}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 15:53:17.149+07	1
51	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 16:06:44.866+07	1
84	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:04:10.965+07	1
85	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:17:26.335+07	1
86	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:24:48.429+07	1
87	CREATE_BOOK	Book	283	{"isbn": "928-283-1-22", "title": "Githup"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:44:06.371+07	1
88	LOGOUT	User	55	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:44:15.99+07	1
89	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:44:19.148+07	2
90	HOLD_RESERVATION_READY	Reservation	13	{"book": "Githup", "barcode": "UTH-CNTT-000045", "hold_expires_at": "2026-11-17T23:59:59.999999+07:00"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:44:37.62+07	2
91	LOGOUT	User	56	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:44:58.545+07	2
92	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:45:06+07	2
93	COLLECT_FINE	Fine	11	{"status": "paid", "paid_amount": 20000, "amount_collected": 10000}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:46:46.561+07	1
94	DELETE_BOOK	Book	276	{"title": "English for Maritime and Shipping Logistics (Tiếng Anh Hàng hải Quốc tế)"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:47:05.385+07	1
95	DELETE_BOOK	Book	275	{"title": "Kỹ thuật Đo lường Điện tử và Cảm biến Thông minh Công nghiệp"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:47:14.074+07	1
96	DELETE_BOOK	Book	274	{"title": "Mạng Cảm biến Không dây và Điện toán Biên IoT Công nghiệp"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:47:20.474+07	1
97	DELETE_BOOK	Book	270	{"title": "Điện tử Công suất và Biến tần trong Động cơ Kéo Đoàn tàu Metro"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:47:23.323+07	1
98	DELETE_BOOK	Book	271	{"title": "Xử lý Tín hiệu Số (DSP) và Mạng Cảm biến Thông minh IoT"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:47:26.768+07	1
99	LOGOUT	User	55	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:48:09.462+07	1
100	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:48:12.253+07	2
101	LOGOUT	User	56	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:59:55.447+07	2
102	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 17:59:57.806+07	1
103	ADVANCE_RESERVATION	Reservation	10	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 18:04:24.377+07	1
104	ADVANCE_RESERVATION	Reservation	11	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 18:04:28.122+07	1
105	ADVANCE_RESERVATION	Reservation	11	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 18:04:29.134+07	1
106	ADVANCE_RESERVATION	Reservation	11	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 18:04:29.845+07	1
107	LOGOUT	User	55	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 18:30:05.647+07	1
108	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 18:30:08.801+07	2
109	LOGOUT	User	56	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 18:30:58.608+07	2
110	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 18:31:05.536+07	1
111	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 18:52:29.958+07	1
112	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 19:05:58.523+07	1
113	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 19:06:56.704+07	2
114	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 19:10:19.228+07	1
115	LOGOUT	User	55	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 19:10:22.741+07	1
116	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 19:10:25.893+07	1
117	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	2026-11-14 19:32:51.392+07	1
118	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 19:38:50.514+07	2
119	LOGOUT	User	56	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 20:17:22.025+07	2
120	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 20:17:58.951+07	2
121	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	2026-11-14 20:18:55.96+07	1
122	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	2026-11-14 20:19:23.149+07	1
123	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	2026-11-14 20:20:17.222+07	2
124	LOGOUT	User	56	{}	127.0.0.1	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	2026-11-14 20:20:27.741+07	2
125	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	2026-11-14 20:22:51.869+07	1
126	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 20:27:29.248+07	2
127	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	2026-11-14 20:28:08.463+07	1
128	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Python-urllib/3.11	2026-11-14 20:34:20.353+07	1
129	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Python-urllib/3.11	2026-11-14 20:34:40.253+07	1
130	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Python-urllib/3.11	2026-11-14 20:44:09.927+07	1
131	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Python-urllib/3.11	2026-11-14 20:44:30.65+07	1
132	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Python-urllib/3.11	2026-11-14 20:44:30.912+07	2
133	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Python-urllib/3.11	2026-11-14 20:45:51.782+07	1
134	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Python-urllib/3.11	2026-11-14 20:46:25.303+07	1
135	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	2026-11-14 20:53:00.632+07	1
136	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	2026-11-14 21:05:00.497+07	1
137	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	2026-11-14 21:05:41.06+07	1
138	LOGOUT	User	56	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 21:09:59.137+07	2
139	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 21:10:03.837+07	1
140	ADMIN_CREATE_USER	User	82	{"role": "student", "username": "052205006506", "card_code": "052205006506"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 21:44:20.158+07	1
141	LOGOUT	User	55	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 21:44:35.431+07	1
142	LOGIN	User	82	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 21:44:49.612+07	28
143	HOLD_RESERVATION_READY	Reservation	14	{"book": "Githup", "barcode": "UTH-CNTT-000046", "hold_expires_at": "2026-11-17T23:59:59.999999+07:00"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 21:45:34.26+07	28
144	LOGOUT	User	82	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 21:45:47.195+07	28
145	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 21:45:50.197+07	1
146	LOGOUT	User	55	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 21:46:17.277+07	1
147	LOGIN	User	82	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 21:46:29.662+07	28
148	LOGOUT	User	82	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 21:53:36.535+07	28
149	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 21:53:39.695+07	1
150	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	2026-11-14 22:06:52.815+07	1
151	LOGOUT	User	55	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 22:07:33.778+07	1
152	LOGIN	User	82	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 22:08:08.994+07	28
153	BORROW_DIRECT	Loan	19	{"due_at": "2026-11-28T23:59:59.999999+07:00", "patron": "052205006506", "barcode": "UTH-CNTT-000047"}	\N	\N	2026-11-14 22:21:18.841+07	1
154	LOGIN	User	82	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 22:23:55.784+07	28
155	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 22:24:31.521+07	1
156	BORROW_DIRECT	Loan	20	{"due_at": "2026-11-28T23:59:59.999999+07:00", "patron": "052205006506", "barcode": "UTH-CNTT-000046"}	127.0.0.1	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	2026-11-14 22:25:14.631+07	1
157	LOGIN	User	82	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 22:33:55.327+07	28
158	HOLD_RESERVATION_READY	Reservation	15	{"book": "Lập trình Ứng dụng Web Toàn diện với React, TypeScript và Django REST", "barcode": "UTH-CNTT-000024", "hold_expires_at": "2026-11-17T23:59:59.999999+07:00"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 22:34:20.307+07	28
159	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 22:57:38.228+07	1
160	LOGIN	User	82	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 23:36:06.518+07	28
161	CANCEL_RESERVATION	Reservation	15	{"old_status": "ready", "no_show_counted": true}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 23:36:34.147+07	28
162	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 23:37:19.971+07	1
163	SUGGESTION_CREATE	Suggestion	7	{"author": "Vũ", "book_title": "Vũ đẹp tria"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 23:38:57.387+07	28
164	SUGGESTION_APPROVE	Suggestion	7	{"note": "Đã duyệt mua tài liệu phục vụ đào tạo.", "book_title": "Vũ đẹp tria"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-14 23:39:53.066+07	1
165	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 00:17:45.022+07	1
166	LOGIN	User	82	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 00:18:19.69+07	28
167	SUGGESTION_CREATE	Suggestion	8	{"author": "Decaptorio", "book_title": "Bay Bỏng"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 00:18:46.256+07	28
168	SUGGESTION_APPROVE	Suggestion	8	{"note": "Đã duyệt mua tài liệu phục vụ đào tạo.", "book_title": "Bay Bỏng"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 00:19:12.763+07	1
169	SUGGESTION_REJECT	Suggestion	5	{"note": "Hiện thư viện đã có tài liệu tương đương hoặc chưa phù hợp kế hoạch mua sắm đợt này.", "book_title": "Kỹ thuật Xây dựng Cầu dây văng Khẩu độ Lớn trên thế giới"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 00:19:20.332+07	1
200	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 08:34:22.787+07	2
201	LOGOUT	User	56	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 08:34:30.108+07	2
202	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 08:34:33.378+07	2
203	LOGOUT	User	56	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 08:35:13.09+07	2
204	LOGIN	User	82	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 08:35:24.205+07	28
205	HOLD_RESERVATION_READY	Reservation	16	{"book": "Kỹ năng Thuyết trình Chuyên nghiệp và Hùng biện trước Công chúng", "barcode": "UTH-NN-000006", "hold_expires_at": "2026-11-18T23:59:59.999999+07:00"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 08:37:23.9+07	28
206	LOGIN	User	82	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 08:38:13.434+07	28
207	CANCEL_RESERVATION	Reservation	16	{"old_status": "ready", "no_show_counted": true}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 08:39:28.856+07	28
208	HOLD_RESERVATION_READY	Reservation	17	{"book": "English for Information Technology and Computer Science (Tiếng Anh CNTT)", "barcode": "UTH-NN-000020", "hold_expires_at": "2026-11-18T23:59:59.999999+07:00"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 08:39:39.766+07	28
209	LOGIN	User	82	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 08:59:17.594+07	28
210	HOLD_RESERVATION_READY	Reservation	18	{"book": "Hệ thống Cung cấp Điện và Lưới điện Thông minh Smart Grid", "barcode": "UTH-DIEN-000006", "hold_expires_at": "2026-11-18T23:59:59.999999+07:00"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 09:08:52.248+07	28
211	LOGIN	User	82	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 09:11:54.006+07	28
212	CANCEL_RESERVATION	Reservation	18	{"old_status": "ready", "no_show_counted": true}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 09:13:05.148+07	28
213	CANCEL_RESERVATION	Reservation	17	{"old_status": "ready", "no_show_counted": true}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 09:13:15.483+07	28
214	LOGIN	User	82	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 09:14:23.313+07	28
215	SUGGESTION_CREATE	Suggestion	41	{"author": "12122", "book_title": "1222"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 09:17:57.763+07	28
216	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 09:20:33.983+07	1
217	SUGGESTION_REJECT	Suggestion	41	{"note": "Hiện thư viện đã có tài liệu tương đương hoặc chưa phù hợp kế hoạch mua sắm đợt này.", "book_title": "1222"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 09:20:52.983+07	1
218	LOGIN	User	82	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 09:31:28.127+07	28
219	SUGGESTION_CREATE	Suggestion	42	{"author": "ew", "book_title": "ưee"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 09:33:27.003+07	28
220	HOLD_RESERVATION_READY	Reservation	19	{"book": "Githup", "barcode": "UTH-CNTT-000047", "hold_expires_at": "2026-11-18T23:59:59.999999+07:00"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 09:40:07.629+07	1
221	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 11:22:26.408+07	1
222	WITHDRAW_COPY	Copy	985	{"barcode": "UTH-NN-000024"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 11:24:20.891+07	1
223	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 11:39:29.767+07	2
224	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	2026-11-15 11:55:59.683+07	2
225	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 12:27:01.467+07	1
226	SUGGESTION_REJECT	Suggestion	42	{"note": "Hiện thư viện đã có tài liệu tương đương hoặc chưa phù hợp kế hoạch mua sắm đợt này.", "book_title": "ưee"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 12:27:19.584+07	1
227	RETURN_LOAN	Loan	15	{"condition": "lost", "days_late": 1, "fines_created": [12, 13]}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 12:27:42.764+07	1
228	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	2026-11-15 12:29:52.511+07	2
229	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	2026-11-15 12:34:28.728+07	2
230	LOGOUT	User	55	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 12:35:24.666+07	1
231	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 12:35:26.955+07	2
232	LOGIN	User	56	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	2026-11-15 12:47:57.757+07	2
233	CANCEL_RESERVATION	Reservation	9	{"old_status": "ready", "no_show_counted": true}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 12:49:23.014+07	2
234	LOGOUT	User	56	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 12:50:15.514+07	2
235	LOGIN	User	55	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 12:50:19.118+07	1
236	WITHDRAW_COPY	Copy	984	{"barcode": "UTH-NN-000023"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-15 12:53:46.028+07	1
237	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 09:23:58.359+07	1
238	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 09:56:08.654+07	1
239	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 10:00:44.906+07	1
240	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 10:26:01.673+07	1
241	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 10:37:28.254+07	1
242	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 10:41:06.683+07	1
243	LOGOUT	User	1	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 10:44:43.008+07	1
244	LOGIN	User	22	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 10:44:54.835+07	22
245	LOGOUT	User	22	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 10:45:39.359+07	22
246	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 10:45:43.525+07	1
247	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 10:50:49.321+07	1
248	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 11:25:18.792+07	1
249	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 11:36:11.116+07	1
250	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 11:36:45.316+07	1
251	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 12:14:24.19+07	1
252	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 12:26:39.445+07	1
253	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 12:33:38.045+07	1
254	LOGIN	User	22	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 12:35:11.041+07	22
255	BORROW_FROM_RESERVATION	Loan	21	{"patron": "GV2026001", "barcode": "UTH-NN-000011"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 12:35:47.774+07	1
256	RENEW_LOAN	Loan	21	{"count": 1, "new_due_at": "2026-12-23T23:59:59.999999+07:00", "old_due_at": "2026-12-16T16:59:59.999999+00:00"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 12:37:23.45+07	22
257	LOGIN	User	22	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 12:56:41.744+07	22
258	ADMIN_CREATE_USER	User	29	{"role": "student", "username": "123456", "card_code": "123456"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 13:21:20.007+07	1
259	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 13:21:44.734+07	29
260	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 13:31:39.465+07	1
261	LOGOUT	User	1	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 20:49:19.95+07	1
262	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 20:49:36.867+07	29
263	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 22:01:00.026+07	1
264	LOGOUT	User	1	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 22:02:26.467+07	1
265	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 22:02:38.775+07	29
266	LOGOUT	User	29	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 22:04:20.235+07	29
267	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 22:04:24.708+07	1
268	LOGOUT	User	1	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 22:07:45.162+07	1
269	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 22:07:54.582+07	29
270	LOGOUT	User	29	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 22:17:27.53+07	29
271	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 22:17:31.021+07	1
272	LOGOUT	User	1	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 22:25:25.934+07	1
273	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 22:25:36.219+07	29
274	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 22:36:54.911+07	29
275	LOGIN	User	22	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-16 22:39:17.52+07	22
276	LOGOUT	User	22	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 00:35:09.259+07	22
277	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 00:35:23.267+07	29
278	LOGOUT	User	29	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 00:40:55.395+07	29
279	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 00:40:58.526+07	1
280	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 00:50:20.695+07	1
281	LOGOUT	User	1	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 00:50:55.736+07	1
282	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 00:51:08.3+07	29
283	LOGOUT	User	29	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 00:53:12.409+07	29
284	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 00:53:16.244+07	1
285	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 00:58:29.362+07	1
286	LOGOUT	User	1	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 00:59:42.877+07	1
287	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 00:59:51.716+07	29
288	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 01:00:00.35+07	29
289	LOGOUT	User	29	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 01:16:34.194+07	29
290	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 01:16:37.494+07	1
291	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 13:30:04.745+07	29
292	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 13:35:45.17+07	29
293	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 13:45:17.28+07	29
294	LOGOUT	User	29	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 14:30:38.6+07	29
295	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 14:30:42.201+07	1
296	LOGOUT	User	1	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 14:31:51.486+07	1
297	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 15:21:17.628+07	29
298	HOLD_RESERVATION_READY	Reservation	20	{"book": "Viết Báo cáo Kỹ thuật và Đồ án Tốt nghiệp Chuẩn Khoa học", "barcode": "UTH-NN-000015", "hold_expires_at": "2026-11-20T23:59:59.999999+07:00"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 15:21:32.55+07	29
299	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 15:22:15.379+07	1
300	BORROW_FROM_RESERVATION	Loan	22	{"patron": "123456", "barcode": "UTH-NN-000015"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 15:22:26.032+07	1
301	RENEW_LOAN	Loan	22	{"count": 1, "new_due_at": "2026-12-08T23:59:59.999999+07:00", "old_due_at": "2026-12-01T16:59:59.999999+00:00"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 15:22:50.631+07	29
302	LOGOUT	User	29	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 20:47:05.157+07	29
303	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 20:47:09.288+07	1
304	LOGOUT	User	1	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 20:56:17.805+07	1
305	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 20:56:26.905+07	29
306	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 21:55:55.829+07	29
307	LOGOUT	User	29	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 22:05:08.224+07	29
308	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 22:05:13.817+07	1
309	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 22:24:51.861+07	29
310	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 23:06:12.442+07	29
311	LOGOUT	User	29	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 23:09:43.766+07	29
312	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 23:09:47.191+07	1
313	LOGOUT	User	1	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 23:11:11.316+07	1
314	LOGIN	User	22	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-17 23:11:13.928+07	22
315	LOGOUT	User	22	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-18 01:30:43.262+07	22
316	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-18 01:30:53.794+07	29
317	LOGOUT	User	29	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-18 01:39:50.985+07	29
318	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-18 01:39:53.927+07	1
319	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-18 18:05:15.828+07	29
320	LOGOUT	User	29	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-18 18:08:38.332+07	29
321	LOGIN	User	1	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-18 18:08:42.421+07	1
322	LOGOUT	User	1	{}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-18 20:24:50.766+07	1
323	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	2026-11-18 20:24:58.929+07	29
324	LOGIN	User	29	{"ip": "127.0.0.1"}	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36 Edg/158.0.0.0	2026-11-23 09:47:20.773+07	29
\.


--
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_group (id, name) FROM stdin;
\.


--
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_group_permissions (id, group_id, permission_id) FROM stdin;
\.


--
-- Data for Name: auth_permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_permission (id, name, content_type_id, codename) FROM stdin;
1	Can add permission	1	add_permission
2	Can change permission	1	change_permission
3	Can delete permission	1	delete_permission
4	Can view permission	1	view_permission
5	Can add group	2	add_group
6	Can change group	2	change_group
7	Can delete group	2	delete_group
8	Can view group	2	view_group
9	Can add content type	3	add_contenttype
10	Can change content type	3	change_contenttype
11	Can delete content type	3	delete_contenttype
12	Can view content type	3	view_contenttype
13	Can add session	4	add_session
14	Can change session	4	change_session
15	Can delete session	4	delete_session
16	Can view session	4	view_session
17	Can add Ngày nghỉ lễ	5	add_holiday
18	Can change Ngày nghỉ lễ	5	change_holiday
19	Can delete Ngày nghỉ lễ	5	delete_holiday
20	Can view Ngày nghỉ lễ	5	view_holiday
21	Can add Chính sách mượn trả	6	add_policy
22	Can change Chính sách mượn trả	6	change_policy
23	Can delete Chính sách mượn trả	6	delete_policy
24	Can view Chính sách mượn trả	6	view_policy
25	Can add Cấu hình hệ thống	7	add_systemconfig
26	Can change Cấu hình hệ thống	7	change_systemconfig
27	Can delete Cấu hình hệ thống	7	delete_systemconfig
28	Can view Cấu hình hệ thống	7	view_systemconfig
29	Can add Người dùng	8	add_user
30	Can change Người dùng	8	change_user
31	Can delete Người dùng	8	delete_user
32	Can view Người dùng	8	view_user
33	Can add Mã đặt lại mật khẩu	9	add_passwordresettoken
34	Can change Mã đặt lại mật khẩu	9	change_passwordresettoken
35	Can delete Mã đặt lại mật khẩu	9	delete_passwordresettoken
36	Can view Mã đặt lại mật khẩu	9	view_passwordresettoken
37	Can add Refresh Token	10	add_refreshtoken
38	Can change Refresh Token	10	change_refreshtoken
39	Can delete Refresh Token	10	delete_refreshtoken
40	Can view Refresh Token	10	view_refreshtoken
41	Can add Tác giả	11	add_author
42	Can change Tác giả	11	change_author
43	Can delete Tác giả	11	delete_author
44	Can view Tác giả	11	view_author
45	Can add Chuyên ngành	12	add_category
46	Can change Chuyên ngành	12	change_category
47	Can delete Chuyên ngành	12	delete_category
48	Can view Chuyên ngành	12	view_category
49	Can add Đầu sách	13	add_book
50	Can change Đầu sách	13	change_book
51	Can delete Đầu sách	13	delete_book
52	Can view Đầu sách	13	view_book
53	Can add Số thứ tự mã vạch	14	add_barcodesequence
54	Can change Số thứ tự mã vạch	14	change_barcodesequence
55	Can delete Số thứ tự mã vạch	14	delete_barcodesequence
56	Can view Số thứ tự mã vạch	14	view_barcodesequence
57	Can add Bản sao sách	15	add_copy
58	Can change Bản sao sách	15	change_copy
59	Can delete Bản sao sách	15	delete_copy
60	Can view Bản sao sách	15	view_copy
61	Can add Phiếu mượn	16	add_loan
62	Can change Phiếu mượn	16	change_loan
63	Can delete Phiếu mượn	16	delete_loan
64	Can view Phiếu mượn	16	view_loan
65	Can add Yêu cầu đặt trước / giữ chỗ	17	add_reservation
66	Can change Yêu cầu đặt trước / giữ chỗ	17	change_reservation
67	Can delete Yêu cầu đặt trước / giữ chỗ	17	delete_reservation
68	Can view Yêu cầu đặt trước / giữ chỗ	17	view_reservation
69	Can add Khoản phạt	18	add_fine
70	Can change Khoản phạt	18	change_fine
71	Can delete Khoản phạt	18	delete_fine
72	Can view Khoản phạt	18	view_fine
73	Can add Lịch sử thu tiền phạt	19	add_finepayment
74	Can change Lịch sử thu tiền phạt	19	change_finepayment
75	Can delete Lịch sử thu tiền phạt	19	delete_finepayment
76	Can view Lịch sử thu tiền phạt	19	view_finepayment
77	Can add Đề xuất mua sách	20	add_suggestion
78	Can change Đề xuất mua sách	20	change_suggestion
79	Can delete Đề xuất mua sách	20	delete_suggestion
80	Can view Đề xuất mua sách	20	view_suggestion
81	Can add Thông báo	21	add_notification
82	Can change Thông báo	21	change_notification
83	Can delete Thông báo	21	delete_notification
84	Can view Thông báo	21	view_notification
85	Can add Nhật ký thao tác	22	add_auditlog
86	Can change Nhật ký thao tác	22	change_auditlog
87	Can delete Nhật ký thao tác	22	delete_auditlog
88	Can view Nhật ký thao tác	22	view_auditlog
89	Can add assistant conversation	23	add_assistantconversation
90	Can change assistant conversation	23	change_assistantconversation
91	Can delete assistant conversation	23	delete_assistantconversation
92	Can view assistant conversation	23	view_assistantconversation
93	Can add assistant memory entry	24	add_assistantmemoryentry
94	Can change assistant memory entry	24	change_assistantmemoryentry
95	Can delete assistant memory entry	24	delete_assistantmemoryentry
96	Can view assistant memory entry	24	view_assistantmemoryentry
97	Can add assistant message	25	add_assistantmessage
98	Can change assistant message	25	change_assistantmessage
99	Can delete assistant message	25	delete_assistantmessage
100	Can view assistant message	25	view_assistantmessage
101	Can add Danh sách Sinh viên trường UTH	26	add_studentroster
102	Can change Danh sách Sinh viên trường UTH	26	change_studentroster
103	Can delete Danh sách Sinh viên trường UTH	26	delete_studentroster
104	Can view Danh sách Sinh viên trường UTH	26	view_studentroster
105	Can add Giao dịch thu phí & Biên lai	27	add_paymenttransaction
106	Can change Giao dịch thu phí & Biên lai	27	change_paymenttransaction
107	Can delete Giao dịch thu phí & Biên lai	27	delete_paymenttransaction
108	Can view Giao dịch thu phí & Biên lai	27	view_paymenttransaction
109	Can add Biên bản Thanh lý Sách	28	add_deaccessionbatch
110	Can change Biên bản Thanh lý Sách	28	change_deaccessionbatch
111	Can delete Biên bản Thanh lý Sách	28	delete_deaccessionbatch
112	Can view Biên bản Thanh lý Sách	28	view_deaccessionbatch
113	Can add Tài liệu / Giáo trình Số	29	add_digitalresource
114	Can change Tài liệu / Giáo trình Số	29	change_digitalresource
115	Can delete Tài liệu / Giáo trình Số	29	delete_digitalresource
116	Can view Tài liệu / Giáo trình Số	29	view_digitalresource
117	Can add Phiên đọc sách số	30	add_readingsession
118	Can change Phiên đọc sách số	30	change_readingsession
119	Can delete Phiên đọc sách số	30	delete_readingsession
120	Can view Phiên đọc sách số	30	view_readingsession
121	Can add Lượt ủng hộ đề xuất	31	add_suggestionvote
122	Can change Lượt ủng hộ đề xuất	31	change_suggestionvote
123	Can delete Lượt ủng hộ đề xuất	31	delete_suggestionvote
124	Can view Lượt ủng hộ đề xuất	31	view_suggestionvote
125	Can add Đợt khảo sát đề xuất sách	32	add_suggestioncampaign
126	Can change Đợt khảo sát đề xuất sách	32	change_suggestioncampaign
127	Can delete Đợt khảo sát đề xuất sách	32	delete_suggestioncampaign
128	Can view Đợt khảo sát đề xuất sách	32	view_suggestioncampaign
129	Can add Tài liệu số & Học liệu điện tử	33	add_digitaldocument
130	Can change Tài liệu số & Học liệu điện tử	33	change_digitaldocument
131	Can delete Tài liệu số & Học liệu điện tử	33	delete_digitaldocument
132	Can view Tài liệu số & Học liệu điện tử	33	view_digitaldocument
133	Can add Nhật ký kiểm duyệt tài liệu	34	add_approvallog
134	Can change Nhật ký kiểm duyệt tài liệu	34	change_approvallog
135	Can delete Nhật ký kiểm duyệt tài liệu	34	delete_approvallog
136	Can view Nhật ký kiểm duyệt tài liệu	34	view_approvallog
137	Can add Phiên bản tài liệu số	35	add_digitaldocumentversion
138	Can change Phiên bản tài liệu số	35	change_digitaldocumentversion
139	Can delete Phiên bản tài liệu số	35	delete_digitaldocumentversion
140	Can view Phiên bản tài liệu số	35	view_digitaldocumentversion
141	Can add Phiên đọc tài liệu số	36	add_digitalreadingsession
142	Can change Phiên đọc tài liệu số	36	change_digitalreadingsession
143	Can delete Phiên đọc tài liệu số	36	delete_digitalreadingsession
144	Can view Phiên đọc tài liệu số	36	view_digitalreadingsession
\.


--
-- Data for Name: authors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authors (id, created_at, updated_at, name, bio, nationality, birth_year, death_year) FROM stdin;
41	2026-11-14 15:16:29.895+07	2026-11-14 15:16:29.895+07	GS.TS. Nguyễn Xuân Trục	Chủ biên bộ giáo trình Thiết kế hình học đường ô tô và cao tốc kinh điển, NXB Giao thông Vận tải.	Việt Nam	\N	\N
42	2026-11-14 15:16:29.895+07	2026-11-14 15:16:29.895+07	PGS.TS. Khuất Việt Hùng	Tiến sĩ Quy hoạch Giao thông vận tải, Viện trưởng Viện Chiến lược và Phát triển GTVT.	Việt Nam	\N	\N
43	2026-11-14 15:16:29.895+07	2026-11-14 15:16:29.895+07	TS. Lê Hoàng Vận	Tiến sĩ Quản trị Logistics và Vận tải biển quốc tế, chuyên gia chuỗi cung ứng.	Việt Nam	\N	\N
44	2026-11-14 15:16:29.895+07	2026-11-14 15:16:29.895+07	Robert C. Martin	Tác giả nổi tiếng thế giới của Clean Code, Clean Architecture và các nguyên lý Agile.	Quốc tế	\N	\N
45	2026-11-14 15:16:29.895+07	2026-11-14 15:16:29.895+07	Andrew Ng	Giáo sư Stanford, Nhà sáng lập Coursera và DeepLearning.AI, chuyên gia Trí tuệ Nhân tạo.	Quốc tế	\N	\N
46	2026-11-14 15:16:29.895+07	2026-11-14 15:16:29.895+07	Martin Fowler	Chuyên gia kiến trúc phần mềm hàng đầu thế giới, tác giả cuốn sách kinh điển Refactoring.	Quốc tế	\N	\N
47	2026-11-14 15:16:29.895+07	2026-11-14 15:16:29.895+07	GS.TS. Vũ Công Ngữ	Chủ biên giáo trình Cơ học đất và Nền móng công trình giao thông, NXB Giáo Dục.	Việt Nam	\N	\N
48	2026-11-14 15:16:29.895+07	2026-11-14 15:16:29.895+07	GS.TS. Đặng Đình Đào	Viện trưởng Viện Nghiên cứu Kinh tế & Phát triển, tác giả bộ sách Quản trị Logistics và Chuỗi cung ứng.	Việt Nam	\N	\N
49	2026-11-14 15:16:29.895+07	2026-11-14 15:16:29.895+07	PGS.TS. Nguyễn Viết Trung	Chuyên gia đầu ngành về Kỹ thuật Cầu bê tông cốt thép dự ứng lực, NXB Xây Dựng.	Việt Nam	\N	\N
50	2026-11-14 15:16:29.895+07	2026-11-14 15:16:29.895+07	PGS.TS. Nguyễn Hữu Dũng	Chủ nhiệm bộ môn Khai thác Cảng biển & Logistics Hàng hải, NXB Giao thông Vận tải.	Việt Nam	\N	\N
51	2026-11-14 15:16:29.895+07	2026-11-14 15:16:29.895+07	Thomas H. Cormen	Giáo sư Khoa học Máy tính Dartmouth, đồng tác giả Introduction to Algorithms.	Quốc tế	\N	\N
52	2026-11-14 15:16:29.895+07	2026-11-14 15:16:29.895+07	Eric Evans	Chuyên gia thiết kế phần mềm, người đặt nền móng phương pháp Domain-Driven Design (DDD).	Quốc tế	\N	\N
53	2026-11-14 15:16:29.911+07	2026-11-14 15:16:29.911+07	Donald E. Knuth	Giáo sư Danh dự Stanford, tác giả huyền thoại của bộ sách The Art of Computer Programming.	Quốc tế	\N	\N
54	2026-11-14 15:16:29.911+07	2026-11-14 15:16:29.911+07	Philip Kotler	Giáo sư Marketing danh tiếng tại Kellogg School of Management, huyền thoại Quản trị Marketing.	Quốc tế	\N	\N
55	2026-11-14 15:16:29.911+07	2026-11-14 15:16:29.911+07	GS.TS. Nguyễn Tất Tiến	Chủ biên giáo trình Nguyên lý Động cơ đốt trong và Công nghệ Ô tô, NXB Giáo Dục.	Việt Nam	\N	\N
56	2026-11-14 15:16:29.911+07	2026-11-14 15:16:29.911+07	GS.TS. Lều Thọ Trình	Tác giả bộ sách Cơ học Kết cấu và Sức bền Vật liệu, NXB Khoa học & Kỹ thuật.	Việt Nam	\N	\N
57	2026-11-14 15:16:29.911+07	2026-11-14 15:16:29.911+07	ThS. Đỗ Kỹ Năng	Giảng viên huấn luyện kỹ năng lãnh đạo và giao tiếp trong môi trường kỹ thuật.	Việt Nam	\N	\N
65	2026-11-14 17:44:06.294+07	2026-11-14 17:44:06.294+07	Lê Hoài Vũ	\N	\N	\N	\N
58	2026-11-14 15:16:29.911+07	2026-11-14 15:16:29.911+07	Stuart Russell	Giáo sư Khoa học Máy tính UC Berkeley, tác giả Artificial Intelligence: A Modern Approach.	Quốc tế	\N	\N
59	2026-11-14 15:16:29.911+07	2026-11-14 15:16:29.911+07	PGS.TS. Đinh Mạnh Tường	Tác giả giáo trình Cấu trúc Dữ liệu và Giải thuật kinh điển tại các trường đại học kỹ thuật.	Việt Nam	\N	\N
60	2026-11-14 15:16:29.911+07	2026-11-14 15:16:29.911+07	PGS.TS. Nguyễn Văn Vị	Chủ biên giáo trình Kinh tế Vận tải và Phân tích Dự án Đầu tư Giao thông, NXB GTVT.	Việt Nam	\N	\N
61	2026-11-14 15:16:29.911+07	2026-11-14 15:16:29.911+07	PGS.TS. Hoàng Hà	Chuyên gia Vật liệu Mặt đường Ô tô và Bê tông nhựa rải nóng, NXB Giao thông Vận tải.	Việt Nam	\N	\N
62	2026-11-14 15:16:29.911+07	2026-11-14 15:16:29.911+07	TS. Trần Văn Toản	Chuyên gia Điện - Điện tử Ô tô và Hệ thống Điều khiển Thông minh trên Xe hơi.	Việt Nam	\N	\N
63	2026-11-14 15:16:29.911+07	2026-11-14 15:16:29.911+07	Andrew S. Tanenbaum	Giáo sư Khoa học Máy tính, tác giả kinh điển Computer Networks và Modern Operating Systems.	Quốc tế	\N	\N
64	2026-11-14 15:16:29.911+07	2026-11-14 15:16:29.911+07	PGS.TS. Bùi Xuân Nam	Chuyên gia Địa kỹ thuật, Nền móng công trình và Công trình ngầm giao thông.	Việt Nam	\N	\N
\.


--
-- Data for Name: barcode_sequences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.barcode_sequences (id, last_value, category_id) FROM stdin;
17	47	17
18	42	18
19	42	19
20	35	20
21	35	21
22	35	22
23	28	23
24	24	24
\.


--
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.books (id, created_at, updated_at, isbn, title, publisher, year, description, cover_image, language, page_count, edition, price, processing_fee, keywords, deleted_at, category_id) FROM stdin;
263	2026-11-14 15:16:30.047+07	2026-11-14 15:16:30.047+07	978-604-0-60006-1	Dao động Kỹ thuật và Giảm chấn Kết cấu Cơ khí Động lực	NXB Giáo Dục Việt Nam	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Dao động Kỹ thuật và Giảm chấn Kết cấu Cơ khí Động lực.	https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&q=80	Tiếng Việt	342	Tái bản lần 2	235000	20000	Kỹ thuật Cơ khí & Động lực, UTH, Giáo trình, Dao	\N	22
283	2026-11-14 17:44:06.267+07	2026-11-14 17:44:06.267+07	928-283-1-22	Githup	NXB Giao thông Vận tải	2026	Ko có	/media/covers/cover_283_9e4b651adb6de1c2.png	Tiếng Việt	\N	\N	120000	20000	\N	\N	17
201	2026-11-14 15:16:29.911+07	2026-11-14 15:16:29.911+07	978-604-0-10001-1	Thiết kế Hình học Đường ô tô và Nút giao thông Hiện đại	NXB Giao thông Vận tải	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Thiết kế Hình học Đường ô tô và Nút giao thông Hiện đại.	https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80	Tiếng Việt	220	Tái bản lần 3	180000	20000	Kỹ thuật Giao thông vận tải, UTH, Giáo trình, Thiết	\N	18
202	2026-11-14 15:16:29.911+07	2026-11-14 15:16:29.911+07	978-604-0-10002-8	Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức	NXB Giao thông Vận tải	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức.	https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&q=80	Tiếng Việt	231	Xuất bản lần đầu	195000	20000	Kỹ thuật Giao thông vận tải, UTH, Giáo trình, Kỹ	\N	18
203	2026-11-14 15:16:29.926+07	2026-11-14 15:16:29.926+07	978-604-0-10003-5	Hệ thống Giao thông Thông minh (ITS) trong Đô thị Hiện đại	NXB Giao thông Vận tải	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Hệ thống Giao thông Thông minh (ITS) trong Đô thị Hiện đại.	https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80	Tiếng Việt	242	Tái bản lần 2	240000	20000	Kỹ thuật Giao thông vận tải, UTH, Giáo trình, Hệ	\N	18
204	2026-11-14 15:16:29.93+07	2026-11-14 15:16:29.93+07	978-604-0-10004-2	Khảo sát và Thiết kế Tuyến Đường sắt Đô thị Metro	NXB Giao thông Vận tải	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Khảo sát và Thiết kế Tuyến Đường sắt Đô thị Metro.	https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&q=80	Tiếng Việt	253	Xuất bản lần đầu	220000	20000	Kỹ thuật Giao thông vận tải, UTH, Giáo trình, Khảo	\N	18
205	2026-11-14 15:16:29.93+07	2026-11-14 15:16:29.93+07	978-604-0-10005-9	An toàn Giao thông Đường bộ và Phương pháp Xử lý Điểm đen Tai nạn	NXB Giao thông Vận tải	2021	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về An toàn Giao thông Đường bộ và Phương pháp Xử lý Điểm đen Tai nạn.	https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=600&q=80	Tiếng Việt	264	Tái bản lần 3	150000	20000	Kỹ thuật Giao thông vận tải, UTH, Giáo trình, An	\N	18
206	2026-11-14 15:16:29.93+07	2026-11-14 15:16:29.93+07	978-604-0-10006-6	Kỹ thuật Cầu Bê tông Cốt thép Dự ứng lực Nhịp lớn	NXB Giao thông Vận tải	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Kỹ thuật Cầu Bê tông Cốt thép Dự ứng lực Nhịp lớn.	https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80	Tiếng Việt	275	Xuất bản lần đầu	260000	20000	Kỹ thuật Giao thông vận tải, UTH, Giáo trình, Kỹ	\N	18
207	2026-11-14 15:16:29.936+07	2026-11-14 15:16:29.936+07	978-604-0-10007-3	Mặt đường Ô tô: Kết cấu và Công nghệ Bê tông Nhựa Rải nóng	NXB Giao thông Vận tải	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Mặt đường Ô tô: Kết cấu và Công nghệ Bê tông Nhựa Rải nóng.	https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&q=80	Tiếng Việt	286	Tái bản lần 2	210000	20000	Kỹ thuật Giao thông vận tải, UTH, Giáo trình, Mặt	\N	18
208	2026-11-14 15:16:29.937+07	2026-11-14 15:16:29.937+07	978-604-0-10008-0	Bảo trì, Kiểm định và Thử tải Công trình Cầu đường Bộ	NXB Giao thông Vận tải	2020	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Bảo trì, Kiểm định và Thử tải Công trình Cầu đường Bộ.	https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80	Tiếng Việt	297	Xuất bản lần đầu	175000	20000	Kỹ thuật Giao thông vận tải, UTH, Giáo trình, Bảo	\N	18
209	2026-11-14 15:16:29.937+07	2026-11-14 15:16:29.937+07	978-604-0-10009-7	Tổ chức Vận tải Hành khách Công cộng và Tuyến Xe buýt Nhanh BRT	NXB Giao thông Vận tải	2021	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Tổ chức Vận tải Hành khách Công cộng và Tuyến Xe buýt Nhanh BRT.	https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&q=80	Tiếng Việt	308	Tái bản lần 3	145000	20000	Kỹ thuật Giao thông vận tải, UTH, Giáo trình, Tổ	\N	18
210	2026-11-14 15:16:29.943+07	2026-11-14 15:16:29.943+07	978-604-0-10010-3	Thiết kế Tuyến Đường ô tô Vùng núi và Địa hình Hiểm trở	NXB Giao thông Vận tải	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Thiết kế Tuyến Đường ô tô Vùng núi và Địa hình Hiểm trở.	https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=600&q=80	Tiếng Việt	319	Xuất bản lần đầu	185000	20000	Kỹ thuật Giao thông vận tải, UTH, Giáo trình, Thiết	\N	18
211	2026-11-14 15:16:29.944+07	2026-11-14 15:16:29.944+07	978-604-0-10011-0	Động lực học Đoàn tàu và Khí động học Hầm Đường sắt Cao tốc	NXB Giao thông Vận tải	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Động lực học Đoàn tàu và Khí động học Hầm Đường sắt Cao tốc.	https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80	Tiếng Việt	330	Tái bản lần 2	290000	20000	Kỹ thuật Giao thông vận tải, UTH, Giáo trình, Động	\N	18
212	2026-11-14 15:16:29.944+07	2026-11-14 15:16:29.944+07	978-604-0-10012-7	Quy hoạch và Khai thác Cảng Hàng không - Sân bay Dân dụng	NXB Giao thông Vận tải	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Quy hoạch và Khai thác Cảng Hàng không - Sân bay Dân dụng.	https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&q=80	Tiếng Việt	341	Xuất bản lần đầu	310000	20000	Kỹ thuật Giao thông vận tải, UTH, Giáo trình, Quy	\N	18
213	2026-11-14 15:16:29.944+07	2026-11-14 15:16:29.944+07	978-604-0-20001-0	Quản trị Chuỗi Cung ứng Toàn cầu: Chiến lược và Thực thi	NXB Giao thông Vận tải	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Quản trị Chuỗi Cung ứng Toàn cầu: Chiến lược và Thực thi.	https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&q=80	Tiếng Việt	352	Tái bản lần 3	250000	20000	Logistics & Chuỗi cung ứng, UTH, Giáo trình, Quản	\N	19
214	2026-11-14 15:16:29.951+07	2026-11-14 15:16:29.951+07	978-604-0-20002-7	Vận tải Đa phương thức và Nghiệp vụ Giao nhận Freight Forwarding	NXB Giao thông Vận tải	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Vận tải Đa phương thức và Nghiệp vụ Giao nhận Freight Forwarding.	https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&q=80	Tiếng Việt	363	Xuất bản lần đầu	220000	20000	Logistics & Chuỗi cung ứng, UTH, Giáo trình, Vận	\N	19
215	2026-11-14 15:16:29.953+07	2026-11-14 15:16:29.953+07	978-604-0-20003-4	Quản trị Kho bãi Hiện đại và Trung tâm Phân phối Logistics DC	NXB Giao thông Vận tải	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Quản trị Kho bãi Hiện đại và Trung tâm Phân phối Logistics DC.	https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80	Tiếng Việt	374	Tái bản lần 2	190000	20000	Logistics & Chuỗi cung ứng, UTH, Giáo trình, Quản	\N	19
216	2026-11-14 15:16:29.953+07	2026-11-14 15:16:29.953+07	978-604-0-20004-1	Kỹ thuật Khai thác và Điều độ Hoạt động Cảng Container Thông minh	NXB Giao thông Vận tải	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Kỹ thuật Khai thác và Điều độ Hoạt động Cảng Container Thông minh.	https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80	Tiếng Việt	385	Xuất bản lần đầu	280000	20000	Logistics & Chuỗi cung ứng, UTH, Giáo trình, Kỹ	\N	19
217	2026-11-14 15:16:29.957+07	2026-11-14 15:16:29.957+07	978-604-0-20005-8	Logistics Hàng hải: Quản lý Đội tàu và Nghiệp vụ Thuê tàu Chuyến	NXB Giao thông Vận tải	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Logistics Hàng hải: Quản lý Đội tàu và Nghiệp vụ Thuê tàu Chuyến.	https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&q=80	Tiếng Việt	396	Tái bản lần 3	265000	20000	Logistics & Chuỗi cung ứng, UTH, Giáo trình, Logistics	\N	19
218	2026-11-14 15:16:29.958+07	2026-11-14 15:16:29.958+07	978-604-0-20006-5	Tối ưu hóa Chi phí Logistics và Bài toán Định tuyến Đội xe VRP	NXB Giao thông Vận tải	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Tối ưu hóa Chi phí Logistics và Bài toán Định tuyến Đội xe VRP.	https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&q=80	Tiếng Việt	407	Xuất bản lần đầu	215000	20000	Logistics & Chuỗi cung ứng, UTH, Giáo trình, Tối	\N	19
219	2026-11-14 15:16:29.958+07	2026-11-14 15:16:29.958+07	978-604-0-20007-2	Hóa đơn Điện tử, Thủ tục Hải quan Một cửa và Incoterms 2020	NXB Giao thông Vận tải	2021	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Hóa đơn Điện tử, Thủ tục Hải quan Một cửa và Incoterms 2020.	https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&q=80	Tiếng Việt	418	Tái bản lần 2	170000	20000	Logistics & Chuỗi cung ứng, UTH, Giáo trình, Hóa	\N	19
220	2026-11-14 15:16:29.964+07	2026-11-14 15:16:29.964+07	978-604-0-20008-9	Logistics Chuỗi lạnh (Cold Chain) cho Nông sản và Dược phẩm Xuất khẩu	NXB Giao thông Vận tải	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Logistics Chuỗi lạnh (Cold Chain) cho Nông sản và Dược phẩm Xuất khẩu.	https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80	Tiếng Việt	429	Xuất bản lần đầu	230000	20000	Logistics & Chuỗi cung ứng, UTH, Giáo trình, Logistics	\N	19
221	2026-11-14 15:16:29.965+07	2026-11-14 15:16:29.965+07	978-604-0-20009-6	Logistics Đô thị và Bài toán Giao hàng Chặng cuối (Last-Mile)	NXB Giao thông Vận tải	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Logistics Đô thị và Bài toán Giao hàng Chặng cuối (Last-Mile).	https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80	Tiếng Việt	440	Tái bản lần 3	205000	20000	Logistics & Chuỗi cung ứng, UTH, Giáo trình, Logistics	\N	19
222	2026-11-14 15:16:29.965+07	2026-11-14 15:16:29.965+07	978-604-0-20010-2	Chuyển đổi số Chuỗi Cung ứng: Ứng dụng IoT, RFID và Blockchain	NXB Giao thông Vận tải	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Chuyển đổi số Chuỗi Cung ứng: Ứng dụng IoT, RFID và Blockchain.	https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&q=80	Tiếng Việt	451	Xuất bản lần đầu	295000	20000	Logistics & Chuỗi cung ứng, UTH, Giáo trình, Chuyển	\N	19
223	2026-11-14 15:16:29.965+07	2026-11-14 15:16:29.965+07	978-604-0-20011-9	Quản lý Rủi ro và Chiến lược Chuỗi Cung ứng Xanh Bền vững	NXB Giao thông Vận tải	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Quản lý Rủi ro và Chiến lược Chuỗi Cung ứng Xanh Bền vững.	https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&q=80	Tiếng Việt	462	Tái bản lần 2	210000	20000	Logistics & Chuỗi cung ứng, UTH, Giáo trình, Quản	\N	19
224	2026-11-14 15:16:29.965+07	2026-11-14 15:16:29.965+07	978-604-0-20012-6	Nghiệp vụ Mua hàng Quốc tế và Đàm phán Hợp đồng Cung ứng	NXB Giao thông Vận tải	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Nghiệp vụ Mua hàng Quốc tế và Đàm phán Hợp đồng Cung ứng.	https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&q=80	Tiếng Việt	473	Xuất bản lần đầu	180000	20000	Logistics & Chuỗi cung ứng, UTH, Giáo trình, Nghiệp	\N	19
225	2026-11-14 15:16:29.965+07	2026-11-14 15:16:29.965+07	978-013-2-35088-4	Clean Code: Mã sạch và Nghệ thuật Viết phần mềm Chuyên nghiệp	NXB Thông tin & Truyền thông	2021	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Clean Code: Mã sạch và Nghệ thuật Viết phần mềm Chuyên nghiệp.	https://images.unsplash.com/photo-1550439062-609e15737780?w=600&q=80	Tiếng Anh	484	Tái bản lần 3	320000	20000	Công nghệ thông tin, UTH, Giáo trình, Clean	\N	17
226	2026-11-14 15:16:29.965+07	2026-11-14 15:16:29.965+07	978-013-4-49416-6	Clean Architecture: Hướng dẫn của Nghệ nhân Phần mềm	Prentice Hall	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Clean Architecture: Hướng dẫn của Nghệ nhân Phần mềm.	https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80	Tiếng Anh	495	Xuất bản lần đầu	350000	20000	Công nghệ thông tin, UTH, Giáo trình, Clean	\N	17
227	2026-11-14 15:16:29.965+07	2026-11-14 15:16:29.965+07	978-020-1-63361-0	Design Patterns: Các mẫu Thiết kế Hướng đối tượng Tái sử dụng	NXB Thông tin & Truyền thông	2020	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Design Patterns: Các mẫu Thiết kế Hướng đối tượng Tái sử dụng.	https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80	Tiếng Việt	226	Tái bản lần 2	290000	20000	Công nghệ thông tin, UTH, Giáo trình, Design	\N	17
228	2026-11-14 15:16:29.965+07	2026-11-14 15:16:29.965+07	978-013-4-75759-9	Refactoring: Cải tiến và Tối ưu hóa Thiết kế Mã nguồn Hiện có	Prentice Hall	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Refactoring: Cải tiến và Tối ưu hóa Thiết kế Mã nguồn Hiện có.	https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&q=80	Tiếng Việt	237	Xuất bản lần đầu	310000	20000	Công nghệ thông tin, UTH, Giáo trình, Refactoring:	\N	17
229	2026-11-14 15:16:29.981+07	2026-11-14 15:16:29.981+07	978-604-0-30001-9	Giáo trình Cấu trúc Dữ liệu và Giải thuật Cơ bản đến Nâng cao	NXB Thông tin & Truyền thông	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Giáo trình Cấu trúc Dữ liệu và Giải thuật Cơ bản đến Nâng cao.	https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80	Tiếng Việt	248	Tái bản lần 3	185000	20000	Công nghệ thông tin, UTH, Giáo trình, Giáo	\N	17
230	2026-11-14 15:16:29.981+07	2026-11-14 15:16:29.981+07	978-099-9-99990-1	Machine Learning Yearning: Chiến lược Xây dựng Hệ thống Trí tuệ Nhân tạo	Prentice Hall	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Machine Learning Yearning: Chiến lược Xây dựng Hệ thống Trí tuệ Nhân tạo.	https://images.unsplash.com/photo-1550439062-609e15737780?w=600&q=80	Tiếng Anh	259	Xuất bản lần đầu	270000	20000	Công nghệ thông tin, UTH, Giáo trình, Machine	\N	17
231	2026-11-14 15:16:29.981+07	2026-11-14 15:16:29.981+07	978-604-0-30002-6	Deep Learning và Thị giác Máy tính trong Giao thông Thông minh	NXB Thông tin & Truyền thông	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Deep Learning và Thị giác Máy tính trong Giao thông Thông minh.	https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80	Tiếng Việt	270	Tái bản lần 2	310000	20000	Công nghệ thông tin, UTH, Giáo trình, Deep	\N	17
232	2026-11-14 15:16:29.981+07	2026-11-14 15:16:29.981+07	978-604-0-30003-3	Lập trình Ứng dụng Web Toàn diện với React, TypeScript và Django REST	Prentice Hall	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Lập trình Ứng dụng Web Toàn diện với React, TypeScript và Django REST.	https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80	Tiếng Việt	281	Xuất bản lần đầu	240000	20000	Công nghệ thông tin, UTH, Giáo trình, Lập	\N	17
233	2026-11-14 15:16:29.981+07	2026-11-14 15:16:29.981+07	978-604-0-30004-0	Hệ Quản trị Cơ sở Dữ liệu PostgreSQL: Thiết kế và Tối ưu Hiệu năng	NXB Thông tin & Truyền thông	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Hệ Quản trị Cơ sở Dữ liệu PostgreSQL: Thiết kế và Tối ưu Hiệu năng.	https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&q=80	Tiếng Việt	292	Tái bản lần 3	230000	20000	Công nghệ thông tin, UTH, Giáo trình, Hệ	\N	17
234	2026-11-14 15:16:29.981+07	2026-11-14 15:16:29.981+07	978-604-0-30005-7	An toàn Thông tin và Phòng thủ Hệ thống Mạng Doanh nghiệp	Prentice Hall	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về An toàn Thông tin và Phòng thủ Hệ thống Mạng Doanh nghiệp.	https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80	Tiếng Việt	303	Xuất bản lần đầu	225000	20000	Công nghệ thông tin, UTH, Giáo trình, An	\N	17
235	2026-11-14 15:16:29.981+07	2026-11-14 15:16:29.981+07	978-604-0-30006-4	Kiến trúc Microservices và Điện toán Đám mây AWS/GCP	NXB Thông tin & Truyền thông	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Kiến trúc Microservices và Điện toán Đám mây AWS/GCP.	https://images.unsplash.com/photo-1550439062-609e15737780?w=600&q=80	Tiếng Việt	314	Tái bản lần 2	330000	20000	Công nghệ thông tin, UTH, Giáo trình, Kiến	\N	17
236	2026-11-14 15:16:29.981+07	2026-11-14 15:16:29.981+07	978-604-0-30007-1	Mạng Máy tính và Các Giao thức Truyền thông Hiện đại	Prentice Hall	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Mạng Máy tính và Các Giao thức Truyền thông Hiện đại.	https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80	Tiếng Việt	325	Xuất bản lần đầu	280000	20000	Công nghệ thông tin, UTH, Giáo trình, Mạng	\N	17
237	2026-11-14 15:16:29.981+07	2026-11-14 15:16:29.981+07	978-032-1-12521-7	Domain-Driven Design: Xử lý Độ phức tạp nơi Trọng tâm Phần mềm	NXB Thông tin & Truyền thông	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Domain-Driven Design: Xử lý Độ phức tạp nơi Trọng tâm Phần mềm.	https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80	Tiếng Anh	336	Tái bản lần 3	340000	20000	Công nghệ thông tin, UTH, Giáo trình, Domain-Driven	\N	17
238	2026-11-14 15:16:29.996+07	2026-11-14 15:16:29.996+07	978-604-0-40001-8	Nguyên lý Kinh tế học Vận tải và Phân tích Đầu tư Hạ tầng	NXB Đại học Quốc gia TP.HCM	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Nguyên lý Kinh tế học Vận tải và Phân tích Đầu tư Hạ tầng.	https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80	Tiếng Việt	347	Xuất bản lần đầu	195000	20000	Kinh tế & Quản trị kinh doanh, UTH, Giáo trình, Nguyên	\N	20
239	2026-11-14 15:16:29.996+07	2026-11-14 15:16:29.996+07	978-604-0-40002-5	Marketing Căn bản: Quản trị Tiếp thị trong Kỷ nguyên Số 5.0	NXB Bách Khoa - Hà Nội	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Marketing Căn bản: Quản trị Tiếp thị trong Kỷ nguyên Số 5.0.	https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80	Tiếng Việt	358	Tái bản lần 2	210000	20000	Kinh tế & Quản trị kinh doanh, UTH, Giáo trình, Marketing	\N	20
240	2026-11-14 15:16:29.996+07	2026-11-14 15:16:29.996+07	978-604-0-40003-2	Quản trị Dự án Đầu tư Công trình Giao thông (PMBOK)	NXB Đại học Quốc gia TP.HCM	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Quản trị Dự án Đầu tư Công trình Giao thông (PMBOK).	https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80	Tiếng Việt	369	Xuất bản lần đầu	260000	20000	Kinh tế & Quản trị kinh doanh, UTH, Giáo trình, Quản	\N	20
241	2026-11-14 15:16:29.996+07	2026-11-14 15:16:29.996+07	978-604-0-40004-9	Kinh tế Vĩ mô và Dự báo Xu thế Thương mại Quốc tế	NXB Bách Khoa - Hà Nội	2021	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Kinh tế Vĩ mô và Dự báo Xu thế Thương mại Quốc tế.	https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80	Tiếng Việt	380	Tái bản lần 3	180000	20000	Kinh tế & Quản trị kinh doanh, UTH, Giáo trình, Kinh	\N	20
242	2026-11-14 15:16:29.996+07	2026-11-14 15:16:29.996+07	978-604-0-40005-6	Tài chính Doanh nghiệp và Định giá Tài sản Ngành Vận tải	NXB Đại học Quốc gia TP.HCM	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Tài chính Doanh nghiệp và Định giá Tài sản Ngành Vận tải.	https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80	Tiếng Việt	391	Xuất bản lần đầu	220000	20000	Kinh tế & Quản trị kinh doanh, UTH, Giáo trình, Tài	\N	20
243	2026-11-14 15:16:29.996+07	2026-11-14 15:16:29.996+07	978-604-0-40006-3	Hợp đồng Hợp tác Công - Tư (PPP) trong Phát triển Cơ sở Hạ tầng	NXB Bách Khoa - Hà Nội	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Hợp đồng Hợp tác Công - Tư (PPP) trong Phát triển Cơ sở Hạ tầng.	https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80	Tiếng Việt	402	Tái bản lần 2	275000	20000	Kinh tế & Quản trị kinh doanh, UTH, Giáo trình, Hợp	\N	20
244	2026-11-14 15:16:29.996+07	2026-11-14 15:16:29.996+07	978-604-0-40007-0	Quản trị Rủi ro Tín dụng và Bảo hiểm Vận tải Biển Quốc tế	NXB Đại học Quốc gia TP.HCM	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Quản trị Rủi ro Tín dụng và Bảo hiểm Vận tải Biển Quốc tế.	https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80	Tiếng Việt	413	Xuất bản lần đầu	205000	20000	Kinh tế & Quản trị kinh doanh, UTH, Giáo trình, Quản	\N	20
245	2026-11-14 15:16:29.996+07	2026-11-14 15:16:29.996+07	978-604-0-40008-7	Khởi nghiệp Đổi mới Sáng tạo và Xây dựng Mô hình Kinh doanh Tinh gọn	NXB Bách Khoa - Hà Nội	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Khởi nghiệp Đổi mới Sáng tạo và Xây dựng Mô hình Kinh doanh Tinh gọn.	https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80	Tiếng Việt	424	Tái bản lần 3	165000	20000	Kinh tế & Quản trị kinh doanh, UTH, Giáo trình, Khởi	\N	20
246	2026-11-14 15:16:30.012+07	2026-11-14 15:16:30.012+07	978-604-0-40009-4	Quản trị Nguồn Nhân lực trong Doanh nghiệp Vận tải và Logistics	NXB Đại học Quốc gia TP.HCM	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Quản trị Nguồn Nhân lực trong Doanh nghiệp Vận tải và Logistics.	https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80	Tiếng Việt	435	Xuất bản lần đầu	190000	20000	Kinh tế & Quản trị kinh doanh, UTH, Giáo trình, Quản	\N	20
247	2026-11-14 15:16:30.012+07	2026-11-14 15:16:30.012+07	978-604-0-40010-0	Đàm phán Thương mại Quốc tế và Hợp đồng Ngoại thương	NXB Bách Khoa - Hà Nội	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Đàm phán Thương mại Quốc tế và Hợp đồng Ngoại thương.	https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80	Tiếng Việt	446	Tái bản lần 2	215000	20000	Kinh tế & Quản trị kinh doanh, UTH, Giáo trình, Đàm	\N	20
248	2026-11-14 15:16:30.012+07	2026-11-14 15:16:30.012+07	978-604-0-50001-7	Cơ học Đất và Nền móng Công trình Cầu đường Đô thị	NXB Xây Dựng	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Cơ học Đất và Nền móng Công trình Cầu đường Đô thị.	https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&q=80	Tiếng Việt	457	Xuất bản lần đầu	230000	20000	Kỹ thuật Xây dựng công trình, UTH, Giáo trình, Cơ	\N	21
249	2026-11-14 15:16:30.012+07	2026-11-14 15:16:30.012+07	978-604-0-50002-4	Thi công Hầm đường bộ và Công trình Ngầm Giao thông Hiện đại	NXB Xây Dựng	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Thi công Hầm đường bộ và Công trình Ngầm Giao thông Hiện đại.	https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80	Tiếng Việt	468	Tái bản lần 3	310000	20000	Kỹ thuật Xây dựng công trình, UTH, Giáo trình, Thi	\N	21
250	2026-11-14 15:16:30.012+07	2026-11-14 15:16:30.012+07	978-604-0-50003-1	Kết cấu Thép và Cầu Thép Nhịp Lớn theo Tiêu chuẩn AASHTO	NXB Xây Dựng	2021	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Kết cấu Thép và Cầu Thép Nhịp Lớn theo Tiêu chuẩn AASHTO.	https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80	Tiếng Việt	479	Xuất bản lần đầu	250000	20000	Kỹ thuật Xây dựng công trình, UTH, Giáo trình, Kết	\N	21
251	2026-11-14 15:16:30.012+07	2026-11-14 15:16:30.012+07	978-604-0-50004-8	Vật liệu Xây dựng Tiên tiến và Bê tông Tính năng Siêu cao UHPC	NXB Xây Dựng	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Vật liệu Xây dựng Tiên tiến và Bê tông Tính năng Siêu cao UHPC.	https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=600&q=80	Tiếng Việt	490	Tái bản lần 2	280000	20000	Kỹ thuật Xây dựng công trình, UTH, Giáo trình, Vật	\N	21
252	2026-11-14 15:16:30.012+07	2026-11-14 15:16:30.012+07	978-604-0-50005-5	Mô hình Thông tin Công trình (BIM) trong Quản lý Dự án Giao thông	NXB Xây Dựng	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Mô hình Thông tin Công trình (BIM) trong Quản lý Dự án Giao thông.	https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&q=80	Tiếng Việt	221	Xuất bản lần đầu	340000	20000	Kỹ thuật Xây dựng công trình, UTH, Giáo trình, Mô	\N	21
253	2026-11-14 15:16:30.012+07	2026-11-14 15:16:30.012+07	978-604-0-50006-2	Thủy lực và Thủy văn Cầu cống: Tính toán Tiêu thoát nước Đô thị	NXB Xây Dựng	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Thủy lực và Thủy văn Cầu cống: Tính toán Tiêu thoát nước Đô thị.	https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80	Tiếng Việt	232	Tái bản lần 3	190000	20000	Kỹ thuật Xây dựng công trình, UTH, Giáo trình, Thủy	\N	21
254	2026-11-14 15:16:30.028+07	2026-11-14 15:16:30.028+07	978-604-0-50007-9	Kiểm toán Năng lượng và Thiết kế Công trình Xanh theo Chuẩn LEED	NXB Xây Dựng	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Kiểm toán Năng lượng và Thiết kế Công trình Xanh theo Chuẩn LEED.	https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80	Tiếng Việt	243	Xuất bản lần đầu	215000	20000	Kỹ thuật Xây dựng công trình, UTH, Giáo trình, Kiểm	\N	21
255	2026-11-14 15:16:30.03+07	2026-11-14 15:16:30.03+07	978-604-0-50008-6	Sức bền Vật liệu và Động lực học Công trình Xây dựng Cầu đường	NXB Xây Dựng	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Sức bền Vật liệu và Động lực học Công trình Xây dựng Cầu đường.	https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=600&q=80	Tiếng Việt	254	Tái bản lần 2	225000	20000	Kỹ thuật Xây dựng công trình, UTH, Giáo trình, Sức	\N	21
256	2026-11-14 15:16:30.03+07	2026-11-14 15:16:30.03+07	978-604-0-50009-3	Địa kỹ thuật Công trình và Xử lý Nền Đất yếu Vùng Đồng bằng Ven biển	NXB Xây Dựng	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Địa kỹ thuật Công trình và Xử lý Nền Đất yếu Vùng Đồng bằng Ven biển.	https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&q=80	Tiếng Việt	265	Xuất bản lần đầu	270000	20000	Kỹ thuật Xây dựng công trình, UTH, Giáo trình, Địa	\N	21
257	2026-11-14 15:16:30.037+07	2026-11-14 15:16:30.037+07	978-604-0-50010-9	Thiết kế Kết cấu Bê tông Cốt thép theo Tiêu chuẩn Eurocode & TCVN	NXB Xây Dựng	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Thiết kế Kết cấu Bê tông Cốt thép theo Tiêu chuẩn Eurocode & TCVN.	https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80	Tiếng Việt	276	Tái bản lần 3	295000	20000	Kỹ thuật Xây dựng công trình, UTH, Giáo trình, Thiết	\N	21
258	2026-11-14 15:16:30.039+07	2026-11-14 15:16:30.039+07	978-604-0-60001-6	Nguyên lý Động cơ Đốt trong và Hệ thống Truyền lực Ô tô	NXB Giáo Dục Việt Nam	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Nguyên lý Động cơ Đốt trong và Hệ thống Truyền lực Ô tô.	https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80	Tiếng Việt	287	Xuất bản lần đầu	220000	20000	Kỹ thuật Cơ khí & Động lực, UTH, Giáo trình, Nguyên	\N	22
259	2026-11-14 15:16:30.041+07	2026-11-14 15:16:30.041+07	978-604-0-60002-3	Công nghệ Xe điện (EV), Hệ thống Pin Lithium-Ion và Trạm Sạc	NXB Giáo Dục Việt Nam	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Công nghệ Xe điện (EV), Hệ thống Pin Lithium-Ion và Trạm Sạc.	https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&q=80	Tiếng Việt	298	Tái bản lần 2	290000	20000	Kỹ thuật Cơ khí & Động lực, UTH, Giáo trình, Công	\N	22
260	2026-11-14 15:16:30.043+07	2026-11-14 15:16:30.043+07	978-604-0-60003-0	Đầu máy Toa xe và Hệ thống Phanh Hãm Đoàn tàu Đường sắt Đô thị	NXB Giáo Dục Việt Nam	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Đầu máy Toa xe và Hệ thống Phanh Hãm Đoàn tàu Đường sắt Đô thị.	https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&q=80	Tiếng Việt	309	Xuất bản lần đầu	270000	20000	Kỹ thuật Cơ khí & Động lực, UTH, Giáo trình, Đầu	\N	22
261	2026-11-14 15:16:30.045+07	2026-11-14 15:16:30.045+07	978-604-0-60004-7	Chẩn đoán và Bảo dưỡng Kỹ thuật Ô tô Đời mới Điều khiển Điện tử	NXB Giáo Dục Việt Nam	2021	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Chẩn đoán và Bảo dưỡng Kỹ thuật Ô tô Đời mới Điều khiển Điện tử.	https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&q=80	Tiếng Việt	320	Tái bản lần 3	195000	20000	Kỹ thuật Cơ khí & Động lực, UTH, Giáo trình, Chẩn	\N	22
262	2026-11-14 15:16:30.047+07	2026-11-14 15:16:30.047+07	978-604-0-60005-4	Khí nén và Thủy lực Ứng dụng trong Thiết bị Cơ giới Xây dựng Nặng	NXB Giáo Dục Việt Nam	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Khí nén và Thủy lực Ứng dụng trong Thiết bị Cơ giới Xây dựng Nặng.	https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80	Tiếng Việt	331	Xuất bản lần đầu	210000	20000	Kỹ thuật Cơ khí & Động lực, UTH, Giáo trình, Khí	\N	22
264	2026-11-14 15:16:30.047+07	2026-11-14 15:16:30.047+07	978-604-0-60007-8	Công nghệ Chế tạo Máy và Gia công Cơ khí Chính xác CNC	NXB Giáo Dục Việt Nam	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Công nghệ Chế tạo Máy và Gia công Cơ khí Chính xác CNC.	https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&q=80	Tiếng Việt	353	Xuất bản lần đầu	250000	20000	Kỹ thuật Cơ khí & Động lực, UTH, Giáo trình, Công	\N	22
265	2026-11-14 15:16:30.047+07	2026-11-14 15:16:30.047+07	978-604-0-60008-5	Hệ thống Điện - Điện tử Điều khiển Thông minh trên Ô tô Hiện đại	NXB Giáo Dục Việt Nam	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Hệ thống Điện - Điện tử Điều khiển Thông minh trên Ô tô Hiện đại.	https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&q=80	Tiếng Việt	364	Tái bản lần 3	265000	20000	Kỹ thuật Cơ khí & Động lực, UTH, Giáo trình, Hệ	\N	22
266	2026-11-14 15:16:30.047+07	2026-11-14 15:16:30.047+07	978-604-0-60009-2	Độ tin cậy và Kỹ thuật An toàn Phương tiện Giao thông Cơ giới	NXB Giáo Dục Việt Nam	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Độ tin cậy và Kỹ thuật An toàn Phương tiện Giao thông Cơ giới.	https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80	Tiếng Việt	375	Xuất bản lần đầu	210000	20000	Kỹ thuật Cơ khí & Động lực, UTH, Giáo trình, Độ	\N	22
267	2026-11-14 15:16:30.059+07	2026-11-14 15:16:30.059+07	978-604-0-60010-8	Vật liệu Cơ khí Tiên tiến và Công nghệ Nhiệt luyện Xử lý Bề mặt	NXB Giáo Dục Việt Nam	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Vật liệu Cơ khí Tiên tiến và Công nghệ Nhiệt luyện Xử lý Bề mặt.	https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&q=80	Tiếng Việt	386	Tái bản lần 2	230000	20000	Kỹ thuật Cơ khí & Động lực, UTH, Giáo trình, Vật	\N	22
268	2026-11-14 15:16:30.059+07	2026-11-14 15:16:30.059+07	978-604-0-70001-5	Kỹ thuật Điều khiển Tự động và Hệ thống SCADA trong Giao thông	NXB Khoa học & Kỹ thuật	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Kỹ thuật Điều khiển Tự động và Hệ thống SCADA trong Giao thông.	https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80	Tiếng Việt	397	Xuất bản lần đầu	260000	20000	Kỹ thuật Điện - Điện tử, UTH, Giáo trình, Kỹ	\N	23
269	2026-11-14 15:16:30.059+07	2026-11-14 15:16:30.059+07	978-604-0-70002-2	Hệ thống Cung cấp Điện và Lưới điện Thông minh Smart Grid	NXB Khoa học & Kỹ thuật	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Hệ thống Cung cấp Điện và Lưới điện Thông minh Smart Grid.	https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80	Tiếng Việt	408	Tái bản lần 3	240000	20000	Kỹ thuật Điện - Điện tử, UTH, Giáo trình, Hệ	\N	23
270	2026-11-14 15:16:30.059+07	2026-11-14 15:16:30.059+07	978-604-0-70003-9	Điện tử Công suất và Biến tần trong Động cơ Kéo Đoàn tàu Metro	NXB Khoa học & Kỹ thuật	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Điện tử Công suất và Biến tần trong Động cơ Kéo Đoàn tàu Metro.	https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&q=80	Tiếng Việt	419	Xuất bản lần đầu	285000	20000	Kỹ thuật Điện - Điện tử, UTH, Giáo trình, Điện	2026-11-14 17:47:23.323+07	23
271	2026-11-14 15:16:30.059+07	2026-11-14 15:16:30.059+07	978-604-0-70004-6	Xử lý Tín hiệu Số (DSP) và Mạng Cảm biến Thông minh IoT	NXB Khoa học & Kỹ thuật	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Xử lý Tín hiệu Số (DSP) và Mạng Cảm biến Thông minh IoT.	https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80	Tiếng Việt	430	Tái bản lần 2	225000	20000	Kỹ thuật Điện - Điện tử, UTH, Giáo trình, Xử	2026-11-14 17:47:26.768+07	23
272	2026-11-14 15:16:30.059+07	2026-11-14 15:16:30.059+07	978-604-0-70005-3	Tín hiệu và Hệ thống Điều khiển Giám sát Giao thông Đường sắt ETCS	NXB Khoa học & Kỹ thuật	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Tín hiệu và Hệ thống Điều khiển Giám sát Giao thông Đường sắt ETCS.	https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80	Tiếng Việt	441	Xuất bản lần đầu	320000	20000	Kỹ thuật Điện - Điện tử, UTH, Giáo trình, Tín	\N	23
273	2026-11-14 15:16:30.059+07	2026-11-14 15:16:30.059+07	978-604-0-70006-0	Vi điều khiển và Hệ thống Nhúng Ứng dụng trong Giao thông và Ô tô	NXB Khoa học & Kỹ thuật	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Vi điều khiển và Hệ thống Nhúng Ứng dụng trong Giao thông và Ô tô.	https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80	Tiếng Việt	452	Tái bản lần 3	245000	20000	Kỹ thuật Điện - Điện tử, UTH, Giáo trình, Vi	\N	23
274	2026-11-14 15:16:30.073+07	2026-11-14 15:16:30.073+07	978-604-0-70007-7	Mạng Cảm biến Không dây và Điện toán Biên IoT Công nghiệp	NXB Khoa học & Kỹ thuật	2024	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Mạng Cảm biến Không dây và Điện toán Biên IoT Công nghiệp.	https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&q=80	Tiếng Việt	463	Xuất bản lần đầu	260000	20000	Kỹ thuật Điện - Điện tử, UTH, Giáo trình, Mạng	2026-11-14 17:47:20.472+07	23
275	2026-11-14 15:16:30.075+07	2026-11-14 15:16:30.075+07	978-604-0-70008-4	Kỹ thuật Đo lường Điện tử và Cảm biến Thông minh Công nghiệp	NXB Khoa học & Kỹ thuật	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Kỹ thuật Đo lường Điện tử và Cảm biến Thông minh Công nghiệp.	https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80	Tiếng Việt	474	Tái bản lần 2	215000	20000	Kỹ thuật Điện - Điện tử, UTH, Giáo trình, Kỹ	2026-11-14 17:47:14.067+07	23
276	2026-11-14 15:16:30.075+07	2026-11-14 15:16:30.075+07	978-604-0-80001-4	English for Maritime and Shipping Logistics (Tiếng Anh Hàng hải Quốc tế)	NXB Tổng hợp TP.HCM	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về English for Maritime and Shipping Logistics (Tiếng Anh Hàng hải Quốc tế).	https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80	Tiếng Anh	485	Xuất bản lần đầu	160000	20000	Ngoại ngữ & Kỹ năng mềm, UTH, Giáo trình, English	2026-11-14 17:47:05.379+07	24
277	2026-11-14 15:16:30.075+07	2026-11-14 15:16:30.075+07	978-604-0-80002-1	Kỹ năng Thuyết trình Chuyên nghiệp và Hùng biện trước Công chúng	NXB Tổng hợp TP.HCM	2021	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Kỹ năng Thuyết trình Chuyên nghiệp và Hùng biện trước Công chúng.	https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80	Tiếng Việt	496	Tái bản lần 3	120000	20000	Ngoại ngữ & Kỹ năng mềm, UTH, Giáo trình, Kỹ	\N	24
278	2026-11-14 15:16:30.075+07	2026-11-14 15:16:30.075+07	978-604-0-80003-8	English for Civil and Bridge Engineering (Tiếng Anh Kỹ thuật Cầu đường)	NXB Tổng hợp TP.HCM	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về English for Civil and Bridge Engineering (Tiếng Anh Kỹ thuật Cầu đường).	https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80	Tiếng Anh	227	Xuất bản lần đầu	150000	20000	Ngoại ngữ & Kỹ năng mềm, UTH, Giáo trình, English	\N	24
279	2026-11-14 15:16:30.075+07	2026-11-14 15:16:30.075+07	978-604-0-80004-5	Nghệ thuật Đàm phán và Giải quyết Xung đột trong Môi trường Đa văn hóa	NXB Tổng hợp TP.HCM	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Nghệ thuật Đàm phán và Giải quyết Xung đột trong Môi trường Đa văn hóa.	https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80	Tiếng Việt	238	Tái bản lần 2	140000	20000	Ngoại ngữ & Kỹ năng mềm, UTH, Giáo trình, Nghệ	\N	24
280	2026-11-14 15:16:30.075+07	2026-11-14 15:16:30.075+07	978-604-0-80005-2	Viết Báo cáo Kỹ thuật và Đồ án Tốt nghiệp Chuẩn Khoa học	NXB Tổng hợp TP.HCM	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Viết Báo cáo Kỹ thuật và Đồ án Tốt nghiệp Chuẩn Khoa học.	https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80	Tiếng Việt	249	Xuất bản lần đầu	110000	20000	Ngoại ngữ & Kỹ năng mềm, UTH, Giáo trình, Viết	\N	24
281	2026-11-14 15:16:30.075+07	2026-11-14 15:16:30.075+07	978-604-0-80006-9	English for Information Technology and Computer Science (Tiếng Anh CNTT)	NXB Tổng hợp TP.HCM	2023	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về English for Information Technology and Computer Science (Tiếng Anh CNTT).	https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80	Tiếng Anh	260	Tái bản lần 3	170000	20000	Ngoại ngữ & Kỹ năng mềm, UTH, Giáo trình, English	\N	24
282	2026-11-14 15:16:30.075+07	2026-11-14 15:16:30.075+07	978-604-0-80007-6	Kỹ năng Quản trị Thời gian và Làm việc Nhóm trong Dự án Kỹ thuật	NXB Tổng hợp TP.HCM	2022	Tài liệu giảng dạy và học tập chính thức tại Trường Đại học Giao thông vận tải TP.HCM (UTH). Bộ sách cung cấp kiến thức nền tảng và chuyên sâu về Kỹ năng Quản trị Thời gian và Làm việc Nhóm trong Dự án Kỹ thuật.	https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80	Tiếng Việt	271	Xuất bản lần đầu	135000	20000	Ngoại ngữ & Kỹ năng mềm, UTH, Giáo trình, Kỹ	\N	24
\.


--
-- Data for Name: books_authors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.books_authors (id, book_id, author_id) FROM stdin;
1	201	41
2	201	42
3	202	49
4	202	42
5	203	41
6	203	59
7	204	42
8	204	55
9	205	41
10	205	49
11	206	42
12	206	47
13	207	41
14	207	61
15	208	49
16	208	61
17	209	41
18	209	60
19	210	49
20	210	47
21	211	41
22	211	55
23	212	56
24	212	41
25	213	48
26	213	43
27	214	48
28	214	43
29	215	48
30	215	43
31	216	48
32	216	50
33	217	50
34	217	43
35	218	43
36	218	51
37	219	48
38	219	60
39	220	48
40	220	43
41	221	41
42	221	43
43	222	43
44	222	45
45	223	43
46	223	60
47	224	48
48	224	54
49	225	44
50	226	44
51	227	44
52	227	46
53	228	46
54	229	51
55	229	59
56	230	45
57	231	59
58	231	45
59	232	44
60	232	46
61	233	51
62	233	59
63	234	59
64	235	44
65	235	46
66	236	59
67	236	63
68	237	52
69	238	41
70	238	60
71	239	54
72	240	42
73	240	60
74	241	60
75	242	60
76	243	41
77	243	60
78	244	43
79	244	60
80	245	57
81	245	54
82	246	57
83	246	60
84	247	43
85	247	54
86	248	42
87	248	47
88	249	64
89	249	47
90	250	42
91	250	47
92	251	61
93	251	47
94	252	42
95	252	59
96	253	49
97	253	47
98	254	60
99	254	47
100	255	56
101	255	47
102	256	64
103	256	47
104	257	49
105	257	47
106	258	55
107	259	62
108	259	55
109	260	55
110	261	62
111	261	55
112	262	47
113	262	55
114	263	56
115	263	55
116	264	55
117	265	62
118	265	55
119	266	41
120	266	55
121	267	47
122	267	55
123	268	59
124	268	55
125	269	59
126	270	59
127	270	55
128	271	59
129	271	62
130	272	59
131	272	55
132	273	59
133	273	62
134	274	59
135	274	45
136	275	59
137	276	57
138	276	43
139	277	57
140	278	57
141	278	42
142	279	57
143	279	54
144	280	41
145	280	57
146	281	57
147	281	44
148	282	57
149	283	65
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, created_at, updated_at, code, name, description, display_order) FROM stdin;
17	2026-11-14 15:16:29.879+07	2026-11-14 15:16:29.879+07	CNTT	Công nghệ thông tin	Khoa học máy tính, kỹ thuật phần mềm, an toàn thông tin, mạng máy tính	1
18	2026-11-14 15:16:29.889+07	2026-11-14 15:16:29.889+07	GTVT	Kỹ thuật Giao thông vận tải	Quy hoạch giao thông, kỹ thuật hạ tầng đường sắt, đường bộ, hàng hải	2
19	2026-11-14 15:16:29.889+07	2026-11-14 15:16:29.889+07	LOG	Logistics & Chuỗi cung ứng	Quản trị chuỗi cung ứng, vận tải đa phương thức, kho bãi và giao nhận	3
20	2026-11-14 15:16:29.889+07	2026-11-14 15:16:29.889+07	KT	Kinh tế & Quản trị kinh doanh	Kinh tế vận tải, quản trị tài chính, thương mại quốc tế	4
21	2026-11-14 15:16:29.895+07	2026-11-14 15:16:29.895+07	XD	Kỹ thuật Xây dựng công trình	Xây dựng cầu đường, cảng, hầm và công trình ngầm	5
22	2026-11-14 15:16:29.895+07	2026-11-14 15:16:29.895+07	CK	Kỹ thuật Cơ khí & Động lực	Cơ khí ôtô, máy xây dựng, kỹ thuật đầu máy toa xe	6
23	2026-11-14 15:16:29.895+07	2026-11-14 15:16:29.895+07	DIEN	Kỹ thuật Điện - Điện tử	Hệ thống điện tử viễn thông, tự động hóa, điều khiển tín hiệu đường sắt	7
24	2026-11-14 15:16:29.895+07	2026-11-14 15:16:29.895+07	NN	Ngoại ngữ & Kỹ năng mềm	Tiếng Anh chuyên ngành hàng hải - logistics, kỹ năng thuyết trình, lãnh đạo	8
\.


--
-- Data for Name: copies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.copies (id, created_at, updated_at, barcode, shelf_location, status, reading_room_only, hold_expires_at, acquired_date, purchase_price, source, supplier, note, version, deleted_at, book_id, held_for_user_id, deaccession_batch_id) FROM stdin;
942	2026-11-14 15:16:30.354+07	2026-11-14 15:16:30.354+07	UTH-DIEN-000009	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-02 - Tầng 1	available	f	\N	2026-11-14	285000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	270	\N	\N
943	2026-11-14 15:16:30.354+07	2026-11-14 15:16:30.354+07	UTH-DIEN-000010	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-02 - Tầng 1	available	f	\N	2026-11-14	285000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	270	\N	\N
701	2026-11-14 15:16:30.091+07	2026-11-14 15:16:30.423+07	UTH-GTVT-000001	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-01 - Tầng 1	borrowed	t	\N	2026-11-14	180000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	201	\N	\N
702	2026-11-14 15:16:30.091+07	2026-11-14 15:16:30.423+07	UTH-GTVT-000002	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-01 - Tầng 1	borrowed	f	\N	2026-11-14	180000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	201	\N	\N
703	2026-11-14 15:16:30.091+07	2026-11-14 15:16:30.43+07	UTH-GTVT-000003	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-02 - Tầng 2	lost	f	\N	2026-11-14	195000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	202	\N	\N
704	2026-11-14 15:16:30.091+07	2026-11-14 15:16:30.43+07	UTH-GTVT-000004	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-02 - Tầng 2	borrowed	f	\N	2026-11-14	195000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	202	\N	\N
705	2026-11-14 15:16:30.091+07	2026-11-14 15:16:30.43+07	UTH-GTVT-000005	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-02 - Tầng 2	borrowed	f	\N	2026-11-14	195000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	202	\N	\N
706	2026-11-14 15:16:30.091+07	2026-11-14 15:16:30.43+07	UTH-GTVT-000006	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-03 - Tầng 3	borrowed	f	\N	2026-11-14	240000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	203	\N	\N
707	2026-11-14 15:16:30.091+07	2026-11-14 15:16:30.437+07	UTH-GTVT-000007	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-03 - Tầng 3	reserved_hold	f	2026-11-18 06:59:59.591+07	2026-11-14	240000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	203	9	\N
708	2026-11-14 15:16:30.091+07	2026-11-14 15:16:30.091+07	UTH-GTVT-000008	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-03 - Tầng 3	available	f	\N	2026-11-14	240000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	203	\N	\N
709	2026-11-14 15:16:30.091+07	2026-11-14 15:16:30.091+07	UTH-GTVT-000009	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-03 - Tầng 3	available	f	\N	2026-11-14	240000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	203	\N	\N
710	2026-11-14 15:16:30.091+07	2026-11-14 15:16:30.091+07	UTH-GTVT-000010	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-04 - Tầng 1	available	f	\N	2026-11-14	220000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	204	\N	\N
711	2026-11-14 15:16:30.091+07	2026-11-14 15:16:30.091+07	UTH-GTVT-000011	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-04 - Tầng 1	available	f	\N	2026-11-14	220000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	204	\N	\N
712	2026-11-14 15:16:30.091+07	2026-11-14 15:16:30.091+07	UTH-GTVT-000012	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-04 - Tầng 1	available	f	\N	2026-11-14	220000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	204	\N	\N
713	2026-11-14 15:16:30.091+07	2026-11-14 15:16:30.437+07	UTH-GTVT-000013	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-04 - Tầng 1	available	f	\N	2026-11-14	220000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	204	\N	\N
714	2026-11-14 15:16:30.091+07	2026-11-14 15:16:30.091+07	UTH-GTVT-000014	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-04 - Tầng 1	available	f	\N	2026-11-14	220000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	204	\N	\N
715	2026-11-14 15:16:30.107+07	2026-11-14 15:16:30.107+07	UTH-GTVT-000015	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-01 - Tầng 2	available	f	\N	2026-11-14	150000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	205	\N	\N
716	2026-11-14 15:16:30.107+07	2026-11-14 15:16:30.107+07	UTH-GTVT-000016	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-01 - Tầng 2	available	f	\N	2026-11-14	150000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	205	\N	\N
717	2026-11-14 15:16:30.107+07	2026-11-14 15:16:30.107+07	UTH-GTVT-000017	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-02 - Tầng 3	available	f	\N	2026-11-14	260000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	206	\N	\N
718	2026-11-14 15:16:30.107+07	2026-11-14 15:16:30.107+07	UTH-GTVT-000018	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-02 - Tầng 3	available	f	\N	2026-11-14	260000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	206	\N	\N
719	2026-11-14 15:16:30.107+07	2026-11-14 15:16:30.107+07	UTH-GTVT-000019	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-02 - Tầng 3	available	f	\N	2026-11-14	260000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	206	\N	\N
720	2026-11-14 15:16:30.107+07	2026-11-14 15:16:30.107+07	UTH-GTVT-000020	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-03 - Tầng 1	available	f	\N	2026-11-14	210000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	207	\N	\N
721	2026-11-14 15:16:30.107+07	2026-11-14 15:16:30.107+07	UTH-GTVT-000021	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-03 - Tầng 1	available	f	\N	2026-11-14	210000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	207	\N	\N
722	2026-11-14 15:16:30.107+07	2026-11-14 15:16:30.107+07	UTH-GTVT-000022	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-03 - Tầng 1	available	f	\N	2026-11-14	210000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	207	\N	\N
723	2026-11-14 15:16:30.107+07	2026-11-14 15:16:30.107+07	UTH-GTVT-000023	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-03 - Tầng 1	available	f	\N	2026-11-14	210000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	207	\N	\N
724	2026-11-14 15:16:30.107+07	2026-11-14 15:16:30.107+07	UTH-GTVT-000024	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-04 - Tầng 2	available	t	\N	2026-11-14	175000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	208	\N	\N
725	2026-11-14 15:16:30.107+07	2026-11-14 15:16:30.107+07	UTH-GTVT-000025	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-04 - Tầng 2	available	f	\N	2026-11-14	175000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	208	\N	\N
726	2026-11-14 15:16:30.107+07	2026-11-14 15:16:30.107+07	UTH-GTVT-000026	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-04 - Tầng 2	available	f	\N	2026-11-14	175000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	208	\N	\N
727	2026-11-14 15:16:30.107+07	2026-11-14 15:16:30.107+07	UTH-GTVT-000027	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-04 - Tầng 2	available	f	\N	2026-11-14	175000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	208	\N	\N
728	2026-11-14 15:16:30.107+07	2026-11-14 15:16:30.107+07	UTH-GTVT-000028	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-04 - Tầng 2	available	f	\N	2026-11-14	175000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	208	\N	\N
729	2026-11-14 15:16:30.122+07	2026-11-14 15:16:30.122+07	UTH-GTVT-000029	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-01 - Tầng 3	available	f	\N	2026-11-14	145000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	209	\N	\N
730	2026-11-14 15:16:30.122+07	2026-11-14 15:16:30.122+07	UTH-GTVT-000030	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-01 - Tầng 3	available	f	\N	2026-11-14	145000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	209	\N	\N
731	2026-11-14 15:16:30.122+07	2026-11-14 15:16:30.122+07	UTH-GTVT-000031	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-02 - Tầng 1	available	f	\N	2026-11-14	185000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	210	\N	\N
732	2026-11-14 15:16:30.122+07	2026-11-14 15:16:30.122+07	UTH-GTVT-000032	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-02 - Tầng 1	available	f	\N	2026-11-14	185000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	210	\N	\N
733	2026-11-14 15:16:30.122+07	2026-11-14 15:16:30.122+07	UTH-GTVT-000033	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-02 - Tầng 1	available	f	\N	2026-11-14	185000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	210	\N	\N
734	2026-11-14 15:16:30.122+07	2026-11-14 15:16:30.122+07	UTH-GTVT-000034	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-03 - Tầng 2	available	f	\N	2026-11-14	290000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	211	\N	\N
735	2026-11-14 15:16:30.122+07	2026-11-14 15:16:30.122+07	UTH-GTVT-000035	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-03 - Tầng 2	available	f	\N	2026-11-14	290000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	211	\N	\N
736	2026-11-14 15:16:30.122+07	2026-11-14 15:16:30.122+07	UTH-GTVT-000036	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-03 - Tầng 2	available	f	\N	2026-11-14	290000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	211	\N	\N
737	2026-11-14 15:16:30.122+07	2026-11-14 15:16:30.122+07	UTH-GTVT-000037	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-03 - Tầng 2	available	f	\N	2026-11-14	290000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	211	\N	\N
738	2026-11-14 15:16:30.122+07	2026-11-14 15:16:30.122+07	UTH-GTVT-000038	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-04 - Tầng 3	available	f	\N	2026-11-14	310000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	212	\N	\N
739	2026-11-14 15:16:30.122+07	2026-11-14 15:16:30.122+07	UTH-GTVT-000039	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-04 - Tầng 3	available	f	\N	2026-11-14	310000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	212	\N	\N
740	2026-11-14 15:16:30.122+07	2026-11-14 15:16:30.122+07	UTH-GTVT-000040	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-04 - Tầng 3	available	f	\N	2026-11-14	310000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	212	\N	\N
741	2026-11-14 15:16:30.122+07	2026-11-14 15:16:30.122+07	UTH-GTVT-000041	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-04 - Tầng 3	available	f	\N	2026-11-14	310000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	212	\N	\N
742	2026-11-14 15:16:30.122+07	2026-11-14 15:16:30.122+07	UTH-GTVT-000042	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-04 - Tầng 3	available	f	\N	2026-11-14	310000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	212	\N	\N
743	2026-11-14 15:16:30.138+07	2026-11-14 15:16:30.138+07	UTH-LOG-000001	Cơ sở 1 (Bình Thạnh) - Kệ LOG-01 - Tầng 1	available	f	\N	2026-11-14	250000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	213	\N	\N
744	2026-11-14 15:16:30.138+07	2026-11-14 15:16:30.138+07	UTH-LOG-000002	Cơ sở 1 (Bình Thạnh) - Kệ LOG-01 - Tầng 1	available	f	\N	2026-11-14	250000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	213	\N	\N
745	2026-11-14 15:16:30.138+07	2026-11-14 15:16:30.138+07	UTH-LOG-000003	Cơ sở 1 (Bình Thạnh) - Kệ LOG-02 - Tầng 2	available	f	\N	2026-11-14	220000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	214	\N	\N
746	2026-11-14 15:16:30.138+07	2026-11-14 15:16:30.138+07	UTH-LOG-000004	Cơ sở 1 (Bình Thạnh) - Kệ LOG-02 - Tầng 2	available	f	\N	2026-11-14	220000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	214	\N	\N
747	2026-11-14 15:16:30.138+07	2026-11-14 15:16:30.138+07	UTH-LOG-000005	Cơ sở 1 (Bình Thạnh) - Kệ LOG-02 - Tầng 2	available	f	\N	2026-11-14	220000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	214	\N	\N
748	2026-11-14 15:16:30.138+07	2026-11-14 15:16:30.138+07	UTH-LOG-000006	Cơ sở 1 (Bình Thạnh) - Kệ LOG-03 - Tầng 3	available	t	\N	2026-11-14	190000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	215	\N	\N
749	2026-11-14 15:16:30.138+07	2026-11-14 15:16:30.138+07	UTH-LOG-000007	Cơ sở 1 (Bình Thạnh) - Kệ LOG-03 - Tầng 3	available	f	\N	2026-11-14	190000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	215	\N	\N
750	2026-11-14 15:16:30.138+07	2026-11-14 15:16:30.138+07	UTH-LOG-000008	Cơ sở 1 (Bình Thạnh) - Kệ LOG-03 - Tầng 3	available	f	\N	2026-11-14	190000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	215	\N	\N
751	2026-11-14 15:16:30.138+07	2026-11-14 15:16:30.138+07	UTH-LOG-000009	Cơ sở 1 (Bình Thạnh) - Kệ LOG-03 - Tầng 3	available	f	\N	2026-11-14	190000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	215	\N	\N
752	2026-11-14 15:16:30.138+07	2026-11-14 15:16:30.138+07	UTH-LOG-000010	Cơ sở 1 (Bình Thạnh) - Kệ LOG-04 - Tầng 1	available	f	\N	2026-11-14	280000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	216	\N	\N
753	2026-11-14 15:16:30.138+07	2026-11-14 15:16:30.138+07	UTH-LOG-000011	Cơ sở 1 (Bình Thạnh) - Kệ LOG-04 - Tầng 1	available	f	\N	2026-11-14	280000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	216	\N	\N
754	2026-11-14 15:16:30.138+07	2026-11-14 15:16:30.138+07	UTH-LOG-000012	Cơ sở 1 (Bình Thạnh) - Kệ LOG-04 - Tầng 1	available	f	\N	2026-11-14	280000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	216	\N	\N
755	2026-11-14 15:16:30.138+07	2026-11-14 15:16:30.138+07	UTH-LOG-000013	Cơ sở 1 (Bình Thạnh) - Kệ LOG-04 - Tầng 1	available	f	\N	2026-11-14	280000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	216	\N	\N
756	2026-11-14 15:16:30.138+07	2026-11-14 15:16:30.138+07	UTH-LOG-000014	Cơ sở 1 (Bình Thạnh) - Kệ LOG-04 - Tầng 1	available	f	\N	2026-11-14	280000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	216	\N	\N
757	2026-11-14 15:16:30.138+07	2026-11-14 15:16:30.138+07	UTH-LOG-000015	Cơ sở 1 (Bình Thạnh) - Kệ LOG-01 - Tầng 2	available	f	\N	2026-11-14	265000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	217	\N	\N
758	2026-11-14 15:16:30.154+07	2026-11-14 15:16:30.154+07	UTH-LOG-000016	Cơ sở 1 (Bình Thạnh) - Kệ LOG-01 - Tầng 2	available	f	\N	2026-11-14	265000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	217	\N	\N
759	2026-11-14 15:16:30.154+07	2026-11-14 15:16:30.154+07	UTH-LOG-000017	Cơ sở 1 (Bình Thạnh) - Kệ LOG-02 - Tầng 3	available	f	\N	2026-11-14	215000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	218	\N	\N
760	2026-11-14 15:16:30.154+07	2026-11-14 15:16:30.154+07	UTH-LOG-000018	Cơ sở 1 (Bình Thạnh) - Kệ LOG-02 - Tầng 3	available	f	\N	2026-11-14	215000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	218	\N	\N
761	2026-11-14 15:16:30.154+07	2026-11-14 15:16:30.154+07	UTH-LOG-000019	Cơ sở 1 (Bình Thạnh) - Kệ LOG-02 - Tầng 3	available	f	\N	2026-11-14	215000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	218	\N	\N
762	2026-11-14 15:16:30.154+07	2026-11-14 15:16:30.154+07	UTH-LOG-000020	Cơ sở 1 (Bình Thạnh) - Kệ LOG-03 - Tầng 1	available	f	\N	2026-11-14	170000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	219	\N	\N
763	2026-11-14 15:16:30.154+07	2026-11-14 15:16:30.154+07	UTH-LOG-000021	Cơ sở 1 (Bình Thạnh) - Kệ LOG-03 - Tầng 1	available	f	\N	2026-11-14	170000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	219	\N	\N
764	2026-11-14 15:16:30.154+07	2026-11-14 15:16:30.154+07	UTH-LOG-000022	Cơ sở 1 (Bình Thạnh) - Kệ LOG-03 - Tầng 1	available	f	\N	2026-11-14	170000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	219	\N	\N
765	2026-11-14 15:16:30.154+07	2026-11-14 15:16:30.154+07	UTH-LOG-000023	Cơ sở 1 (Bình Thạnh) - Kệ LOG-03 - Tầng 1	available	f	\N	2026-11-14	170000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	219	\N	\N
766	2026-11-14 15:16:30.154+07	2026-11-14 15:16:30.154+07	UTH-LOG-000024	Cơ sở 1 (Bình Thạnh) - Kệ LOG-04 - Tầng 2	available	f	\N	2026-11-14	230000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	220	\N	\N
767	2026-11-14 15:16:30.154+07	2026-11-14 15:16:30.154+07	UTH-LOG-000025	Cơ sở 1 (Bình Thạnh) - Kệ LOG-04 - Tầng 2	damaged	f	\N	2026-11-14	230000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	220	\N	\N
768	2026-11-14 15:16:30.154+07	2026-11-14 15:16:30.154+07	UTH-LOG-000026	Cơ sở 1 (Bình Thạnh) - Kệ LOG-04 - Tầng 2	available	f	\N	2026-11-14	230000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	220	\N	\N
769	2026-11-14 15:16:30.154+07	2026-11-14 15:16:30.154+07	UTH-LOG-000027	Cơ sở 1 (Bình Thạnh) - Kệ LOG-04 - Tầng 2	available	f	\N	2026-11-14	230000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	220	\N	\N
770	2026-11-14 15:16:30.154+07	2026-11-14 15:16:30.154+07	UTH-LOG-000028	Cơ sở 1 (Bình Thạnh) - Kệ LOG-04 - Tầng 2	available	f	\N	2026-11-14	230000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	220	\N	\N
771	2026-11-14 15:16:30.154+07	2026-11-14 15:16:30.154+07	UTH-LOG-000029	Cơ sở 1 (Bình Thạnh) - Kệ LOG-01 - Tầng 3	available	f	\N	2026-11-14	205000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	221	\N	\N
772	2026-11-14 15:16:30.169+07	2026-11-14 15:16:30.169+07	UTH-LOG-000030	Cơ sở 1 (Bình Thạnh) - Kệ LOG-01 - Tầng 3	available	f	\N	2026-11-14	205000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	221	\N	\N
773	2026-11-14 15:16:30.169+07	2026-11-14 15:16:30.169+07	UTH-LOG-000031	Cơ sở 1 (Bình Thạnh) - Kệ LOG-02 - Tầng 1	available	t	\N	2026-11-14	295000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	222	\N	\N
774	2026-11-14 15:16:30.169+07	2026-11-14 15:16:30.169+07	UTH-LOG-000032	Cơ sở 1 (Bình Thạnh) - Kệ LOG-02 - Tầng 1	available	f	\N	2026-11-14	295000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	222	\N	\N
775	2026-11-14 15:16:30.169+07	2026-11-14 15:16:30.169+07	UTH-LOG-000033	Cơ sở 1 (Bình Thạnh) - Kệ LOG-02 - Tầng 1	available	f	\N	2026-11-14	295000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	222	\N	\N
776	2026-11-14 15:16:30.169+07	2026-11-14 15:16:30.169+07	UTH-LOG-000034	Cơ sở 1 (Bình Thạnh) - Kệ LOG-03 - Tầng 2	available	f	\N	2026-11-14	210000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	223	\N	\N
777	2026-11-14 15:16:30.169+07	2026-11-14 15:16:30.169+07	UTH-LOG-000035	Cơ sở 1 (Bình Thạnh) - Kệ LOG-03 - Tầng 2	available	f	\N	2026-11-14	210000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	223	\N	\N
778	2026-11-14 15:16:30.169+07	2026-11-14 15:16:30.169+07	UTH-LOG-000036	Cơ sở 1 (Bình Thạnh) - Kệ LOG-03 - Tầng 2	available	f	\N	2026-11-14	210000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	223	\N	\N
779	2026-11-14 15:16:30.169+07	2026-11-14 15:16:30.169+07	UTH-LOG-000037	Cơ sở 1 (Bình Thạnh) - Kệ LOG-03 - Tầng 2	available	f	\N	2026-11-14	210000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	223	\N	\N
780	2026-11-14 15:16:30.169+07	2026-11-14 15:16:30.169+07	UTH-LOG-000038	Cơ sở 1 (Bình Thạnh) - Kệ LOG-04 - Tầng 3	available	f	\N	2026-11-14	180000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	224	\N	\N
781	2026-11-14 15:16:30.169+07	2026-11-14 15:16:30.169+07	UTH-LOG-000039	Cơ sở 1 (Bình Thạnh) - Kệ LOG-04 - Tầng 3	available	f	\N	2026-11-14	180000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	224	\N	\N
782	2026-11-14 15:16:30.169+07	2026-11-14 15:16:30.169+07	UTH-LOG-000040	Cơ sở 1 (Bình Thạnh) - Kệ LOG-04 - Tầng 3	available	f	\N	2026-11-14	180000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	224	\N	\N
783	2026-11-14 15:16:30.169+07	2026-11-14 15:16:30.169+07	UTH-LOG-000041	Cơ sở 1 (Bình Thạnh) - Kệ LOG-04 - Tầng 3	available	f	\N	2026-11-14	180000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	224	\N	\N
784	2026-11-14 15:16:30.169+07	2026-11-14 15:16:30.169+07	UTH-LOG-000042	Cơ sở 1 (Bình Thạnh) - Kệ LOG-04 - Tầng 3	available	f	\N	2026-11-14	180000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	224	\N	\N
785	2026-11-14 15:16:30.185+07	2026-11-14 15:16:30.185+07	UTH-CNTT-000001	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-01 - Tầng 1	available	f	\N	2026-11-14	320000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	225	\N	\N
786	2026-11-14 15:16:30.186+07	2026-11-14 15:16:30.186+07	UTH-CNTT-000002	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-01 - Tầng 1	available	f	\N	2026-11-14	320000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	225	\N	\N
787	2026-11-14 15:16:30.188+07	2026-11-14 15:16:30.188+07	UTH-CNTT-000003	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-02 - Tầng 2	available	f	\N	2026-11-14	350000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	226	\N	\N
788	2026-11-14 15:16:30.19+07	2026-11-14 15:16:30.19+07	UTH-CNTT-000004	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-02 - Tầng 2	available	f	\N	2026-11-14	350000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	226	\N	\N
789	2026-11-14 15:16:30.191+07	2026-11-14 15:16:30.191+07	UTH-CNTT-000005	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-02 - Tầng 2	available	f	\N	2026-11-14	350000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	226	\N	\N
790	2026-11-14 15:16:30.191+07	2026-11-14 15:16:30.191+07	UTH-CNTT-000006	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-03 - Tầng 3	available	f	\N	2026-11-14	290000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	227	\N	\N
791	2026-11-14 15:16:30.191+07	2026-11-14 15:16:30.191+07	UTH-CNTT-000007	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-03 - Tầng 3	available	f	\N	2026-11-14	290000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	227	\N	\N
792	2026-11-14 15:16:30.191+07	2026-11-14 15:16:30.191+07	UTH-CNTT-000008	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-03 - Tầng 3	available	f	\N	2026-11-14	290000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	227	\N	\N
793	2026-11-14 15:16:30.191+07	2026-11-14 15:16:30.191+07	UTH-CNTT-000009	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-03 - Tầng 3	available	f	\N	2026-11-14	290000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	227	\N	\N
794	2026-11-14 15:16:30.191+07	2026-11-14 15:16:30.191+07	UTH-CNTT-000010	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-04 - Tầng 1	available	f	\N	2026-11-14	310000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	228	\N	\N
795	2026-11-14 15:16:30.191+07	2026-11-14 15:16:30.191+07	UTH-CNTT-000011	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-04 - Tầng 1	available	f	\N	2026-11-14	310000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	228	\N	\N
796	2026-11-14 15:16:30.2+07	2026-11-14 15:16:30.2+07	UTH-CNTT-000012	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-04 - Tầng 1	available	f	\N	2026-11-14	310000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	228	\N	\N
797	2026-11-14 15:16:30.201+07	2026-11-14 15:16:30.201+07	UTH-CNTT-000013	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-04 - Tầng 1	available	f	\N	2026-11-14	310000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	228	\N	\N
798	2026-11-14 15:16:30.202+07	2026-11-14 15:16:30.202+07	UTH-CNTT-000014	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-04 - Tầng 1	available	f	\N	2026-11-14	310000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	228	\N	\N
799	2026-11-14 15:16:30.204+07	2026-11-14 15:16:30.204+07	UTH-CNTT-000015	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-01 - Tầng 2	available	t	\N	2026-11-14	185000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	229	\N	\N
800	2026-11-14 15:16:30.205+07	2026-11-14 15:16:30.205+07	UTH-CNTT-000016	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-01 - Tầng 2	available	f	\N	2026-11-14	185000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	229	\N	\N
801	2026-11-14 15:16:30.207+07	2026-11-14 15:16:30.207+07	UTH-CNTT-000017	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-02 - Tầng 3	available	f	\N	2026-11-14	270000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	230	\N	\N
802	2026-11-14 15:16:30.207+07	2026-11-14 15:16:30.207+07	UTH-CNTT-000018	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-02 - Tầng 3	available	f	\N	2026-11-14	270000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	230	\N	\N
803	2026-11-14 15:16:30.208+07	2026-11-14 15:16:30.208+07	UTH-CNTT-000019	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-02 - Tầng 3	available	f	\N	2026-11-14	270000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	230	\N	\N
804	2026-11-14 15:16:30.21+07	2026-11-14 15:16:30.21+07	UTH-CNTT-000020	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-03 - Tầng 1	available	f	\N	2026-11-14	310000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	231	\N	\N
805	2026-11-14 15:16:30.211+07	2026-11-14 15:16:30.211+07	UTH-CNTT-000021	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-03 - Tầng 1	available	f	\N	2026-11-14	310000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	231	\N	\N
806	2026-11-14 15:16:30.212+07	2026-11-14 15:16:30.212+07	UTH-CNTT-000022	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-03 - Tầng 1	available	f	\N	2026-11-14	310000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	231	\N	\N
807	2026-11-14 15:16:30.212+07	2026-11-14 15:16:30.212+07	UTH-CNTT-000023	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-03 - Tầng 1	available	f	\N	2026-11-14	310000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	231	\N	\N
808	2026-11-14 15:16:30.213+07	2026-11-14 15:16:30.213+07	UTH-CNTT-000024	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-04 - Tầng 2	available	f	\N	2026-11-14	240000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	232	\N	\N
809	2026-11-14 15:16:30.213+07	2026-11-14 15:16:30.213+07	UTH-CNTT-000025	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-04 - Tầng 2	available	f	\N	2026-11-14	240000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	232	\N	\N
810	2026-11-14 15:16:30.213+07	2026-11-14 15:16:30.213+07	UTH-CNTT-000026	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-04 - Tầng 2	available	f	\N	2026-11-14	240000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	232	\N	\N
811	2026-11-14 15:16:30.213+07	2026-11-14 15:16:30.213+07	UTH-CNTT-000027	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-04 - Tầng 2	available	f	\N	2026-11-14	240000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	232	\N	\N
812	2026-11-14 15:16:30.213+07	2026-11-14 15:16:30.213+07	UTH-CNTT-000028	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-04 - Tầng 2	available	f	\N	2026-11-14	240000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	232	\N	\N
813	2026-11-14 15:16:30.213+07	2026-11-14 15:16:30.213+07	UTH-CNTT-000029	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-01 - Tầng 3	available	f	\N	2026-11-14	230000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	233	\N	\N
814	2026-11-14 15:16:30.213+07	2026-11-14 15:16:30.213+07	UTH-CNTT-000030	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-01 - Tầng 3	available	f	\N	2026-11-14	230000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	233	\N	\N
815	2026-11-14 15:16:30.213+07	2026-11-14 15:16:30.213+07	UTH-CNTT-000031	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-02 - Tầng 1	available	f	\N	2026-11-14	225000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	234	\N	\N
816	2026-11-14 15:16:30.213+07	2026-11-14 15:16:30.213+07	UTH-CNTT-000032	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-02 - Tầng 1	available	f	\N	2026-11-14	225000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	234	\N	\N
817	2026-11-14 15:16:30.213+07	2026-11-14 15:16:30.213+07	UTH-CNTT-000033	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-02 - Tầng 1	available	f	\N	2026-11-14	225000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	234	\N	\N
818	2026-11-14 15:16:30.213+07	2026-11-14 15:16:30.213+07	UTH-CNTT-000034	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-03 - Tầng 2	available	f	\N	2026-11-14	330000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	235	\N	\N
819	2026-11-14 15:16:30.213+07	2026-11-14 15:16:30.213+07	UTH-CNTT-000035	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-03 - Tầng 2	available	f	\N	2026-11-14	330000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	235	\N	\N
820	2026-11-14 15:16:30.213+07	2026-11-14 15:16:30.213+07	UTH-CNTT-000036	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-03 - Tầng 2	available	f	\N	2026-11-14	330000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	235	\N	\N
821	2026-11-14 15:16:30.213+07	2026-11-14 15:16:30.213+07	UTH-CNTT-000037	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-03 - Tầng 2	available	f	\N	2026-11-14	330000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	235	\N	\N
822	2026-11-14 15:16:30.229+07	2026-11-14 15:16:30.229+07	UTH-CNTT-000038	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-04 - Tầng 3	available	t	\N	2026-11-14	280000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	236	\N	\N
823	2026-11-14 15:16:30.229+07	2026-11-14 15:16:30.229+07	UTH-CNTT-000039	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-04 - Tầng 3	available	f	\N	2026-11-14	280000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	236	\N	\N
824	2026-11-14 15:16:30.229+07	2026-11-14 15:16:30.229+07	UTH-CNTT-000040	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-04 - Tầng 3	available	f	\N	2026-11-14	280000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	236	\N	\N
825	2026-11-14 15:16:30.229+07	2026-11-14 15:16:30.229+07	UTH-CNTT-000041	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-04 - Tầng 3	available	f	\N	2026-11-14	280000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	236	\N	\N
826	2026-11-14 15:16:30.229+07	2026-11-14 15:16:30.229+07	UTH-CNTT-000042	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-04 - Tầng 3	available	f	\N	2026-11-14	280000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	236	\N	\N
827	2026-11-14 15:16:30.229+07	2026-11-14 15:16:30.229+07	UTH-CNTT-000043	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-01 - Tầng 1	available	f	\N	2026-11-14	340000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	237	\N	\N
828	2026-11-14 15:16:30.229+07	2026-11-14 15:16:30.229+07	UTH-CNTT-000044	Cơ sở 1 (Bình Thạnh) - Kệ CNTT-01 - Tầng 1	available	f	\N	2026-11-14	340000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	237	\N	\N
829	2026-11-14 15:16:30.229+07	2026-11-14 15:16:30.229+07	UTH-KT-000001	Cơ sở 1 (Bình Thạnh) - Kệ KT-02 - Tầng 2	available	f	\N	2026-11-14	195000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	238	\N	\N
830	2026-11-14 15:16:30.229+07	2026-11-14 15:16:30.229+07	UTH-KT-000002	Cơ sở 1 (Bình Thạnh) - Kệ KT-02 - Tầng 2	available	f	\N	2026-11-14	195000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	238	\N	\N
831	2026-11-14 15:16:30.229+07	2026-11-14 15:16:30.229+07	UTH-KT-000003	Cơ sở 1 (Bình Thạnh) - Kệ KT-02 - Tầng 2	available	f	\N	2026-11-14	195000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	238	\N	\N
832	2026-11-14 15:16:30.229+07	2026-11-14 15:16:30.229+07	UTH-KT-000004	Cơ sở 1 (Bình Thạnh) - Kệ KT-03 - Tầng 3	available	f	\N	2026-11-14	210000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	239	\N	\N
833	2026-11-14 15:16:30.229+07	2026-11-14 15:16:30.229+07	UTH-KT-000005	Cơ sở 1 (Bình Thạnh) - Kệ KT-03 - Tầng 3	damaged	f	\N	2026-11-14	210000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	239	\N	\N
834	2026-11-14 15:16:30.229+07	2026-11-14 15:16:30.229+07	UTH-KT-000006	Cơ sở 1 (Bình Thạnh) - Kệ KT-03 - Tầng 3	available	f	\N	2026-11-14	210000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	239	\N	\N
835	2026-11-14 15:16:30.229+07	2026-11-14 15:16:30.229+07	UTH-KT-000007	Cơ sở 1 (Bình Thạnh) - Kệ KT-03 - Tầng 3	available	f	\N	2026-11-14	210000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	239	\N	\N
836	2026-11-14 15:16:30.245+07	2026-11-14 15:16:30.245+07	UTH-KT-000008	Cơ sở 1 (Bình Thạnh) - Kệ KT-04 - Tầng 1	available	f	\N	2026-11-14	260000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	240	\N	\N
837	2026-11-14 15:16:30.245+07	2026-11-14 15:16:30.245+07	UTH-KT-000009	Cơ sở 1 (Bình Thạnh) - Kệ KT-04 - Tầng 1	available	f	\N	2026-11-14	260000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	240	\N	\N
838	2026-11-14 15:16:30.245+07	2026-11-14 15:16:30.245+07	UTH-KT-000010	Cơ sở 1 (Bình Thạnh) - Kệ KT-04 - Tầng 1	available	f	\N	2026-11-14	260000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	240	\N	\N
839	2026-11-14 15:16:30.245+07	2026-11-14 15:16:30.245+07	UTH-KT-000011	Cơ sở 1 (Bình Thạnh) - Kệ KT-04 - Tầng 1	available	f	\N	2026-11-14	260000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	240	\N	\N
840	2026-11-14 15:16:30.245+07	2026-11-14 15:16:30.245+07	UTH-KT-000012	Cơ sở 1 (Bình Thạnh) - Kệ KT-04 - Tầng 1	available	f	\N	2026-11-14	260000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	240	\N	\N
841	2026-11-14 15:16:30.245+07	2026-11-14 15:16:30.245+07	UTH-KT-000013	Cơ sở 1 (Bình Thạnh) - Kệ KT-01 - Tầng 2	available	f	\N	2026-11-14	180000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	241	\N	\N
842	2026-11-14 15:16:30.245+07	2026-11-14 15:16:30.245+07	UTH-KT-000014	Cơ sở 1 (Bình Thạnh) - Kệ KT-01 - Tầng 2	available	f	\N	2026-11-14	180000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	241	\N	\N
843	2026-11-14 15:16:30.245+07	2026-11-14 15:16:30.245+07	UTH-KT-000015	Cơ sở 1 (Bình Thạnh) - Kệ KT-02 - Tầng 3	available	f	\N	2026-11-14	220000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	242	\N	\N
844	2026-11-14 15:16:30.253+07	2026-11-14 15:16:30.253+07	UTH-KT-000016	Cơ sở 1 (Bình Thạnh) - Kệ KT-02 - Tầng 3	available	f	\N	2026-11-14	220000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	242	\N	\N
845	2026-11-14 15:16:30.253+07	2026-11-14 15:16:30.253+07	UTH-KT-000017	Cơ sở 1 (Bình Thạnh) - Kệ KT-02 - Tầng 3	available	f	\N	2026-11-14	220000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	242	\N	\N
846	2026-11-14 15:16:30.253+07	2026-11-14 15:16:30.253+07	UTH-KT-000018	Cơ sở 1 (Bình Thạnh) - Kệ KT-03 - Tầng 1	available	t	\N	2026-11-14	275000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	243	\N	\N
847	2026-11-14 15:16:30.253+07	2026-11-14 15:16:30.253+07	UTH-KT-000019	Cơ sở 1 (Bình Thạnh) - Kệ KT-03 - Tầng 1	available	f	\N	2026-11-14	275000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	243	\N	\N
848	2026-11-14 15:16:30.253+07	2026-11-14 15:16:30.253+07	UTH-KT-000020	Cơ sở 1 (Bình Thạnh) - Kệ KT-03 - Tầng 1	available	f	\N	2026-11-14	275000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	243	\N	\N
849	2026-11-14 15:16:30.253+07	2026-11-14 15:16:30.253+07	UTH-KT-000021	Cơ sở 1 (Bình Thạnh) - Kệ KT-03 - Tầng 1	available	f	\N	2026-11-14	275000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	243	\N	\N
850	2026-11-14 15:16:30.261+07	2026-11-14 15:16:30.261+07	UTH-KT-000022	Cơ sở 1 (Bình Thạnh) - Kệ KT-04 - Tầng 2	available	f	\N	2026-11-14	205000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	244	\N	\N
851	2026-11-14 15:16:30.261+07	2026-11-14 15:16:30.261+07	UTH-KT-000023	Cơ sở 1 (Bình Thạnh) - Kệ KT-04 - Tầng 2	available	f	\N	2026-11-14	205000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	244	\N	\N
852	2026-11-14 15:16:30.261+07	2026-11-14 15:16:30.261+07	UTH-KT-000024	Cơ sở 1 (Bình Thạnh) - Kệ KT-04 - Tầng 2	available	f	\N	2026-11-14	205000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	244	\N	\N
853	2026-11-14 15:16:30.261+07	2026-11-14 15:16:30.261+07	UTH-KT-000025	Cơ sở 1 (Bình Thạnh) - Kệ KT-04 - Tầng 2	available	f	\N	2026-11-14	205000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	244	\N	\N
854	2026-11-14 15:16:30.261+07	2026-11-14 15:16:30.261+07	UTH-KT-000026	Cơ sở 1 (Bình Thạnh) - Kệ KT-04 - Tầng 2	available	f	\N	2026-11-14	205000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	244	\N	\N
855	2026-11-14 15:16:30.261+07	2026-11-14 15:16:30.261+07	UTH-KT-000027	Cơ sở 1 (Bình Thạnh) - Kệ KT-01 - Tầng 3	available	f	\N	2026-11-14	165000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	245	\N	\N
856	2026-11-14 15:16:30.261+07	2026-11-14 15:16:30.261+07	UTH-KT-000028	Cơ sở 1 (Bình Thạnh) - Kệ KT-01 - Tầng 3	available	f	\N	2026-11-14	165000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	245	\N	\N
857	2026-11-14 15:16:30.261+07	2026-11-14 15:16:30.261+07	UTH-KT-000029	Cơ sở 1 (Bình Thạnh) - Kệ KT-02 - Tầng 1	available	f	\N	2026-11-14	190000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	246	\N	\N
858	2026-11-14 15:16:30.261+07	2026-11-14 15:16:30.261+07	UTH-KT-000030	Cơ sở 1 (Bình Thạnh) - Kệ KT-02 - Tầng 1	available	f	\N	2026-11-14	190000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	246	\N	\N
859	2026-11-14 15:16:30.261+07	2026-11-14 15:16:30.261+07	UTH-KT-000031	Cơ sở 1 (Bình Thạnh) - Kệ KT-02 - Tầng 1	available	f	\N	2026-11-14	190000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	246	\N	\N
860	2026-11-14 15:16:30.261+07	2026-11-14 15:16:30.261+07	UTH-KT-000032	Cơ sở 1 (Bình Thạnh) - Kệ KT-03 - Tầng 2	available	f	\N	2026-11-14	215000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	247	\N	\N
861	2026-11-14 15:16:30.261+07	2026-11-14 15:16:30.261+07	UTH-KT-000033	Cơ sở 1 (Bình Thạnh) - Kệ KT-03 - Tầng 2	available	f	\N	2026-11-14	215000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	247	\N	\N
862	2026-11-14 15:16:30.261+07	2026-11-14 15:16:30.261+07	UTH-KT-000034	Cơ sở 1 (Bình Thạnh) - Kệ KT-03 - Tầng 2	available	f	\N	2026-11-14	215000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	247	\N	\N
863	2026-11-14 15:16:30.261+07	2026-11-14 15:16:30.261+07	UTH-KT-000035	Cơ sở 1 (Bình Thạnh) - Kệ KT-03 - Tầng 2	available	f	\N	2026-11-14	215000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	247	\N	\N
864	2026-11-14 15:16:30.261+07	2026-11-14 15:16:30.261+07	UTH-XD-000001	Cơ sở 1 (Bình Thạnh) - Kệ XD-04 - Tầng 3	available	f	\N	2026-11-14	230000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	248	\N	\N
865	2026-11-14 15:16:30.261+07	2026-11-14 15:16:30.261+07	UTH-XD-000002	Cơ sở 1 (Bình Thạnh) - Kệ XD-04 - Tầng 3	available	f	\N	2026-11-14	230000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	248	\N	\N
866	2026-11-14 15:16:30.276+07	2026-11-14 15:16:30.276+07	UTH-XD-000003	Cơ sở 1 (Bình Thạnh) - Kệ XD-04 - Tầng 3	available	f	\N	2026-11-14	230000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	248	\N	\N
867	2026-11-14 15:16:30.276+07	2026-11-14 15:16:30.276+07	UTH-XD-000004	Cơ sở 1 (Bình Thạnh) - Kệ XD-04 - Tầng 3	available	f	\N	2026-11-14	230000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	248	\N	\N
868	2026-11-14 15:16:30.276+07	2026-11-14 15:16:30.276+07	UTH-XD-000005	Cơ sở 1 (Bình Thạnh) - Kệ XD-04 - Tầng 3	available	f	\N	2026-11-14	230000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	248	\N	\N
869	2026-11-14 15:16:30.276+07	2026-11-14 15:16:30.276+07	UTH-XD-000006	Cơ sở 1 (Bình Thạnh) - Kệ XD-01 - Tầng 1	available	f	\N	2026-11-14	310000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	249	\N	\N
870	2026-11-14 15:16:30.276+07	2026-11-14 15:16:30.276+07	UTH-XD-000007	Cơ sở 1 (Bình Thạnh) - Kệ XD-01 - Tầng 1	available	f	\N	2026-11-14	310000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	249	\N	\N
871	2026-11-14 15:16:30.276+07	2026-11-14 15:16:30.276+07	UTH-XD-000008	Cơ sở 1 (Bình Thạnh) - Kệ XD-02 - Tầng 2	available	t	\N	2026-11-14	250000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	250	\N	\N
872	2026-11-14 15:16:30.283+07	2026-11-14 15:16:30.283+07	UTH-XD-000009	Cơ sở 1 (Bình Thạnh) - Kệ XD-02 - Tầng 2	available	f	\N	2026-11-14	250000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	250	\N	\N
873	2026-11-14 15:16:30.284+07	2026-11-14 15:16:30.284+07	UTH-XD-000010	Cơ sở 1 (Bình Thạnh) - Kệ XD-02 - Tầng 2	available	f	\N	2026-11-14	250000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	250	\N	\N
874	2026-11-14 15:16:30.286+07	2026-11-14 15:16:30.286+07	UTH-XD-000011	Cơ sở 1 (Bình Thạnh) - Kệ XD-03 - Tầng 3	available	f	\N	2026-11-14	280000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	251	\N	\N
875	2026-11-14 15:16:30.286+07	2026-11-14 15:16:30.286+07	UTH-XD-000012	Cơ sở 1 (Bình Thạnh) - Kệ XD-03 - Tầng 3	available	f	\N	2026-11-14	280000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	251	\N	\N
876	2026-11-14 15:16:30.286+07	2026-11-14 15:16:30.286+07	UTH-XD-000013	Cơ sở 1 (Bình Thạnh) - Kệ XD-03 - Tầng 3	available	f	\N	2026-11-14	280000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	251	\N	\N
877	2026-11-14 15:16:30.286+07	2026-11-14 15:16:30.286+07	UTH-XD-000014	Cơ sở 1 (Bình Thạnh) - Kệ XD-03 - Tầng 3	available	f	\N	2026-11-14	280000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	251	\N	\N
878	2026-11-14 15:16:30.291+07	2026-11-14 15:16:30.291+07	UTH-XD-000015	Cơ sở 1 (Bình Thạnh) - Kệ XD-04 - Tầng 1	available	f	\N	2026-11-14	340000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	252	\N	\N
879	2026-11-14 15:16:30.292+07	2026-11-14 15:16:30.292+07	UTH-XD-000016	Cơ sở 1 (Bình Thạnh) - Kệ XD-04 - Tầng 1	available	f	\N	2026-11-14	340000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	252	\N	\N
880	2026-11-14 15:16:30.293+07	2026-11-14 15:16:30.293+07	UTH-XD-000017	Cơ sở 1 (Bình Thạnh) - Kệ XD-04 - Tầng 1	available	f	\N	2026-11-14	340000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	252	\N	\N
881	2026-11-14 15:16:30.293+07	2026-11-14 15:16:30.293+07	UTH-XD-000018	Cơ sở 1 (Bình Thạnh) - Kệ XD-04 - Tầng 1	available	f	\N	2026-11-14	340000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	252	\N	\N
882	2026-11-14 15:16:30.293+07	2026-11-14 15:16:30.293+07	UTH-XD-000019	Cơ sở 1 (Bình Thạnh) - Kệ XD-04 - Tầng 1	available	f	\N	2026-11-14	340000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	252	\N	\N
883	2026-11-14 15:16:30.293+07	2026-11-14 15:16:30.293+07	UTH-XD-000020	Cơ sở 1 (Bình Thạnh) - Kệ XD-01 - Tầng 2	available	f	\N	2026-11-14	190000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	253	\N	\N
884	2026-11-14 15:16:30.297+07	2026-11-14 15:16:30.297+07	UTH-XD-000021	Cơ sở 1 (Bình Thạnh) - Kệ XD-01 - Tầng 2	available	f	\N	2026-11-14	190000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	253	\N	\N
885	2026-11-14 15:16:30.298+07	2026-11-14 15:16:30.298+07	UTH-XD-000022	Cơ sở 1 (Bình Thạnh) - Kệ XD-02 - Tầng 3	available	f	\N	2026-11-14	215000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	254	\N	\N
886	2026-11-14 15:16:30.3+07	2026-11-14 15:16:30.3+07	UTH-XD-000023	Cơ sở 1 (Bình Thạnh) - Kệ XD-02 - Tầng 3	available	f	\N	2026-11-14	215000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	254	\N	\N
887	2026-11-14 15:16:30.3+07	2026-11-14 15:16:30.3+07	UTH-XD-000024	Cơ sở 1 (Bình Thạnh) - Kệ XD-02 - Tầng 3	available	f	\N	2026-11-14	215000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	254	\N	\N
888	2026-11-14 15:16:30.3+07	2026-11-14 15:16:30.3+07	UTH-XD-000025	Cơ sở 1 (Bình Thạnh) - Kệ XD-03 - Tầng 1	available	f	\N	2026-11-14	225000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	255	\N	\N
889	2026-11-14 15:16:30.3+07	2026-11-14 15:16:30.3+07	UTH-XD-000026	Cơ sở 1 (Bình Thạnh) - Kệ XD-03 - Tầng 1	available	f	\N	2026-11-14	225000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	255	\N	\N
890	2026-11-14 15:16:30.304+07	2026-11-14 15:16:30.304+07	UTH-XD-000027	Cơ sở 1 (Bình Thạnh) - Kệ XD-03 - Tầng 1	available	f	\N	2026-11-14	225000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	255	\N	\N
891	2026-11-14 15:16:30.305+07	2026-11-14 15:16:30.305+07	UTH-XD-000028	Cơ sở 1 (Bình Thạnh) - Kệ XD-03 - Tầng 1	available	f	\N	2026-11-14	225000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	255	\N	\N
892	2026-11-14 15:16:30.307+07	2026-11-14 15:16:30.307+07	UTH-XD-000029	Cơ sở 1 (Bình Thạnh) - Kệ XD-04 - Tầng 2	available	f	\N	2026-11-14	270000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	256	\N	\N
893	2026-11-14 15:16:30.307+07	2026-11-14 15:16:30.307+07	UTH-XD-000030	Cơ sở 1 (Bình Thạnh) - Kệ XD-04 - Tầng 2	available	f	\N	2026-11-14	270000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	256	\N	\N
894	2026-11-14 15:16:30.307+07	2026-11-14 15:16:30.307+07	UTH-XD-000031	Cơ sở 1 (Bình Thạnh) - Kệ XD-04 - Tầng 2	available	f	\N	2026-11-14	270000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	256	\N	\N
895	2026-11-14 15:16:30.307+07	2026-11-14 15:16:30.307+07	UTH-XD-000032	Cơ sở 1 (Bình Thạnh) - Kệ XD-04 - Tầng 2	available	f	\N	2026-11-14	270000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	256	\N	\N
896	2026-11-14 15:16:30.307+07	2026-11-14 15:16:30.307+07	UTH-XD-000033	Cơ sở 1 (Bình Thạnh) - Kệ XD-04 - Tầng 2	available	f	\N	2026-11-14	270000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	256	\N	\N
897	2026-11-14 15:16:30.312+07	2026-11-14 15:16:30.312+07	UTH-XD-000034	Cơ sở 1 (Bình Thạnh) - Kệ XD-01 - Tầng 3	available	t	\N	2026-11-14	295000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	257	\N	\N
898	2026-11-14 15:16:30.313+07	2026-11-14 15:16:30.313+07	UTH-XD-000035	Cơ sở 1 (Bình Thạnh) - Kệ XD-01 - Tầng 3	available	f	\N	2026-11-14	295000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	257	\N	\N
899	2026-11-14 15:16:30.315+07	2026-11-14 15:16:30.315+07	UTH-CK-000001	Cơ sở 1 (Bình Thạnh) - Kệ CK-02 - Tầng 1	available	f	\N	2026-11-14	220000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	258	\N	\N
900	2026-11-14 15:16:30.315+07	2026-11-14 15:16:30.315+07	UTH-CK-000002	Cơ sở 1 (Bình Thạnh) - Kệ CK-02 - Tầng 1	damaged	f	\N	2026-11-14	220000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	258	\N	\N
901	2026-11-14 15:16:30.315+07	2026-11-14 15:16:30.315+07	UTH-CK-000003	Cơ sở 1 (Bình Thạnh) - Kệ CK-02 - Tầng 1	available	f	\N	2026-11-14	220000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	258	\N	\N
902	2026-11-14 15:16:30.315+07	2026-11-14 15:16:30.315+07	UTH-CK-000004	Cơ sở 1 (Bình Thạnh) - Kệ CK-03 - Tầng 2	available	f	\N	2026-11-14	290000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	259	\N	\N
903	2026-11-14 15:16:30.315+07	2026-11-14 15:16:30.315+07	UTH-CK-000005	Cơ sở 1 (Bình Thạnh) - Kệ CK-03 - Tầng 2	available	f	\N	2026-11-14	290000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	259	\N	\N
904	2026-11-14 15:16:30.315+07	2026-11-14 15:16:30.315+07	UTH-CK-000006	Cơ sở 1 (Bình Thạnh) - Kệ CK-03 - Tầng 2	available	f	\N	2026-11-14	290000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	259	\N	\N
905	2026-11-14 15:16:30.315+07	2026-11-14 15:16:30.315+07	UTH-CK-000007	Cơ sở 1 (Bình Thạnh) - Kệ CK-03 - Tầng 2	available	f	\N	2026-11-14	290000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	259	\N	\N
906	2026-11-14 15:16:30.325+07	2026-11-14 15:16:30.325+07	UTH-CK-000008	Cơ sở 1 (Bình Thạnh) - Kệ CK-04 - Tầng 3	available	f	\N	2026-11-14	270000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	260	\N	\N
907	2026-11-14 15:16:30.326+07	2026-11-14 15:16:30.326+07	UTH-CK-000009	Cơ sở 1 (Bình Thạnh) - Kệ CK-04 - Tầng 3	available	f	\N	2026-11-14	270000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	260	\N	\N
908	2026-11-14 15:16:30.327+07	2026-11-14 15:16:30.327+07	UTH-CK-000010	Cơ sở 1 (Bình Thạnh) - Kệ CK-04 - Tầng 3	available	f	\N	2026-11-14	270000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	260	\N	\N
909	2026-11-14 15:16:30.329+07	2026-11-14 15:16:30.329+07	UTH-CK-000011	Cơ sở 1 (Bình Thạnh) - Kệ CK-04 - Tầng 3	available	f	\N	2026-11-14	270000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	260	\N	\N
910	2026-11-14 15:16:30.329+07	2026-11-14 15:16:30.329+07	UTH-CK-000012	Cơ sở 1 (Bình Thạnh) - Kệ CK-04 - Tầng 3	available	f	\N	2026-11-14	270000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	260	\N	\N
911	2026-11-14 15:16:30.331+07	2026-11-14 15:16:30.331+07	UTH-CK-000013	Cơ sở 1 (Bình Thạnh) - Kệ CK-01 - Tầng 1	available	f	\N	2026-11-14	195000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	261	\N	\N
912	2026-11-14 15:16:30.332+07	2026-11-14 15:16:30.332+07	UTH-CK-000014	Cơ sở 1 (Bình Thạnh) - Kệ CK-01 - Tầng 1	available	f	\N	2026-11-14	195000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	261	\N	\N
913	2026-11-14 15:16:30.334+07	2026-11-14 15:16:30.334+07	UTH-CK-000015	Cơ sở 1 (Bình Thạnh) - Kệ CK-02 - Tầng 2	available	f	\N	2026-11-14	210000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	262	\N	\N
914	2026-11-14 15:16:30.335+07	2026-11-14 15:16:30.335+07	UTH-CK-000016	Cơ sở 1 (Bình Thạnh) - Kệ CK-02 - Tầng 2	available	f	\N	2026-11-14	210000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	262	\N	\N
915	2026-11-14 15:16:30.336+07	2026-11-14 15:16:30.336+07	UTH-CK-000017	Cơ sở 1 (Bình Thạnh) - Kệ CK-02 - Tầng 2	available	f	\N	2026-11-14	210000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	262	\N	\N
916	2026-11-14 15:16:30.337+07	2026-11-14 15:16:30.337+07	UTH-CK-000018	Cơ sở 1 (Bình Thạnh) - Kệ CK-03 - Tầng 3	available	f	\N	2026-11-14	235000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	263	\N	\N
917	2026-11-14 15:16:30.338+07	2026-11-14 15:16:30.338+07	UTH-CK-000019	Cơ sở 1 (Bình Thạnh) - Kệ CK-03 - Tầng 3	available	f	\N	2026-11-14	235000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	263	\N	\N
918	2026-11-14 15:16:30.338+07	2026-11-14 15:16:30.338+07	UTH-CK-000020	Cơ sở 1 (Bình Thạnh) - Kệ CK-03 - Tầng 3	available	f	\N	2026-11-14	235000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	263	\N	\N
919	2026-11-14 15:16:30.338+07	2026-11-14 15:16:30.338+07	UTH-CK-000021	Cơ sở 1 (Bình Thạnh) - Kệ CK-03 - Tầng 3	available	f	\N	2026-11-14	235000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	263	\N	\N
920	2026-11-14 15:16:30.338+07	2026-11-14 15:16:30.338+07	UTH-CK-000022	Cơ sở 1 (Bình Thạnh) - Kệ CK-04 - Tầng 1	available	t	\N	2026-11-14	250000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	264	\N	\N
921	2026-11-14 15:16:30.338+07	2026-11-14 15:16:30.338+07	UTH-CK-000023	Cơ sở 1 (Bình Thạnh) - Kệ CK-04 - Tầng 1	available	f	\N	2026-11-14	250000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	264	\N	\N
922	2026-11-14 15:16:30.338+07	2026-11-14 15:16:30.338+07	UTH-CK-000024	Cơ sở 1 (Bình Thạnh) - Kệ CK-04 - Tầng 1	available	f	\N	2026-11-14	250000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	264	\N	\N
923	2026-11-14 15:16:30.338+07	2026-11-14 15:16:30.338+07	UTH-CK-000025	Cơ sở 1 (Bình Thạnh) - Kệ CK-04 - Tầng 1	available	f	\N	2026-11-14	250000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	264	\N	\N
924	2026-11-14 15:16:30.338+07	2026-11-14 15:16:30.338+07	UTH-CK-000026	Cơ sở 1 (Bình Thạnh) - Kệ CK-04 - Tầng 1	available	f	\N	2026-11-14	250000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	264	\N	\N
925	2026-11-14 15:16:30.338+07	2026-11-14 15:16:30.338+07	UTH-CK-000027	Cơ sở 1 (Bình Thạnh) - Kệ CK-01 - Tầng 2	available	f	\N	2026-11-14	265000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	265	\N	\N
926	2026-11-14 15:16:30.338+07	2026-11-14 15:16:30.338+07	UTH-CK-000028	Cơ sở 1 (Bình Thạnh) - Kệ CK-01 - Tầng 2	available	f	\N	2026-11-14	265000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	265	\N	\N
927	2026-11-14 15:16:30.338+07	2026-11-14 15:16:30.338+07	UTH-CK-000029	Cơ sở 1 (Bình Thạnh) - Kệ CK-02 - Tầng 3	available	f	\N	2026-11-14	210000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	266	\N	\N
928	2026-11-14 15:16:30.338+07	2026-11-14 15:16:30.338+07	UTH-CK-000030	Cơ sở 1 (Bình Thạnh) - Kệ CK-02 - Tầng 3	available	f	\N	2026-11-14	210000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	266	\N	\N
929	2026-11-14 15:16:30.338+07	2026-11-14 15:16:30.338+07	UTH-CK-000031	Cơ sở 1 (Bình Thạnh) - Kệ CK-02 - Tầng 3	available	f	\N	2026-11-14	210000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	266	\N	\N
930	2026-11-14 15:16:30.338+07	2026-11-14 15:16:30.338+07	UTH-CK-000032	Cơ sở 1 (Bình Thạnh) - Kệ CK-03 - Tầng 1	available	f	\N	2026-11-14	230000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	267	\N	\N
931	2026-11-14 15:16:30.354+07	2026-11-14 15:16:30.354+07	UTH-CK-000033	Cơ sở 1 (Bình Thạnh) - Kệ CK-03 - Tầng 1	available	f	\N	2026-11-14	230000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	267	\N	\N
932	2026-11-14 15:16:30.354+07	2026-11-14 15:16:30.354+07	UTH-CK-000034	Cơ sở 1 (Bình Thạnh) - Kệ CK-03 - Tầng 1	available	f	\N	2026-11-14	230000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	267	\N	\N
933	2026-11-14 15:16:30.354+07	2026-11-14 15:16:30.354+07	UTH-CK-000035	Cơ sở 1 (Bình Thạnh) - Kệ CK-03 - Tầng 1	available	f	\N	2026-11-14	230000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	267	\N	\N
934	2026-11-14 15:16:30.354+07	2026-11-14 15:16:30.354+07	UTH-DIEN-000001	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-04 - Tầng 2	available	f	\N	2026-11-14	260000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	268	\N	\N
935	2026-11-14 15:16:30.354+07	2026-11-14 15:16:30.354+07	UTH-DIEN-000002	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-04 - Tầng 2	available	f	\N	2026-11-14	260000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	268	\N	\N
936	2026-11-14 15:16:30.354+07	2026-11-14 15:16:30.354+07	UTH-DIEN-000003	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-04 - Tầng 2	available	f	\N	2026-11-14	260000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	268	\N	\N
937	2026-11-14 15:16:30.354+07	2026-11-14 15:16:30.354+07	UTH-DIEN-000004	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-04 - Tầng 2	available	f	\N	2026-11-14	260000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	268	\N	\N
938	2026-11-14 15:16:30.354+07	2026-11-14 15:16:30.354+07	UTH-DIEN-000005	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-04 - Tầng 2	available	f	\N	2026-11-14	260000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	268	\N	\N
939	2026-11-14 15:16:30.354+07	2026-11-14 15:16:30.354+07	UTH-DIEN-000006	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-01 - Tầng 3	available	f	\N	2026-11-14	240000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	269	\N	\N
940	2026-11-14 15:16:30.354+07	2026-11-14 15:16:30.354+07	UTH-DIEN-000007	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-01 - Tầng 3	available	f	\N	2026-11-14	240000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	269	\N	\N
941	2026-11-14 15:16:30.354+07	2026-11-14 15:16:30.354+07	UTH-DIEN-000008	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-02 - Tầng 1	available	f	\N	2026-11-14	285000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	270	\N	\N
944	2026-11-14 15:16:30.354+07	2026-11-14 15:16:30.354+07	UTH-DIEN-000011	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-03 - Tầng 2	available	t	\N	2026-11-14	225000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	271	\N	\N
945	2026-11-14 15:16:30.37+07	2026-11-14 15:16:30.37+07	UTH-DIEN-000012	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-03 - Tầng 2	available	f	\N	2026-11-14	225000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	271	\N	\N
946	2026-11-14 15:16:30.37+07	2026-11-14 15:16:30.37+07	UTH-DIEN-000013	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-03 - Tầng 2	available	f	\N	2026-11-14	225000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	271	\N	\N
947	2026-11-14 15:16:30.37+07	2026-11-14 15:16:30.37+07	UTH-DIEN-000014	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-03 - Tầng 2	available	f	\N	2026-11-14	225000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	271	\N	\N
948	2026-11-14 15:16:30.37+07	2026-11-14 15:16:30.37+07	UTH-DIEN-000015	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-04 - Tầng 3	available	f	\N	2026-11-14	320000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	272	\N	\N
949	2026-11-14 15:16:30.37+07	2026-11-14 15:16:30.37+07	UTH-DIEN-000016	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-04 - Tầng 3	available	f	\N	2026-11-14	320000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	272	\N	\N
950	2026-11-14 15:16:30.37+07	2026-11-14 15:16:30.37+07	UTH-DIEN-000017	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-04 - Tầng 3	available	f	\N	2026-11-14	320000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	272	\N	\N
951	2026-11-14 15:16:30.37+07	2026-11-14 15:16:30.37+07	UTH-DIEN-000018	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-04 - Tầng 3	available	f	\N	2026-11-14	320000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	272	\N	\N
952	2026-11-14 15:16:30.37+07	2026-11-14 15:16:30.37+07	UTH-DIEN-000019	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-04 - Tầng 3	available	f	\N	2026-11-14	320000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	272	\N	\N
953	2026-11-14 15:16:30.37+07	2026-11-14 15:16:30.37+07	UTH-DIEN-000020	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-01 - Tầng 1	available	f	\N	2026-11-14	245000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	273	\N	\N
954	2026-11-14 15:16:30.37+07	2026-11-14 15:16:30.37+07	UTH-DIEN-000021	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-01 - Tầng 1	available	f	\N	2026-11-14	245000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	273	\N	\N
955	2026-11-14 15:16:30.37+07	2026-11-14 15:16:30.37+07	UTH-DIEN-000022	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-02 - Tầng 2	available	f	\N	2026-11-14	260000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	274	\N	\N
956	2026-11-14 15:16:30.37+07	2026-11-14 15:16:30.37+07	UTH-DIEN-000023	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-02 - Tầng 2	available	f	\N	2026-11-14	260000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	274	\N	\N
957	2026-11-14 15:16:30.37+07	2026-11-14 15:16:30.37+07	UTH-DIEN-000024	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-02 - Tầng 2	available	f	\N	2026-11-14	260000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	274	\N	\N
958	2026-11-14 15:16:30.37+07	2026-11-14 15:16:30.37+07	UTH-DIEN-000025	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-03 - Tầng 3	available	f	\N	2026-11-14	215000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	275	\N	\N
959	2026-11-14 15:16:30.385+07	2026-11-14 15:16:30.385+07	UTH-DIEN-000026	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-03 - Tầng 3	available	f	\N	2026-11-14	215000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	275	\N	\N
960	2026-11-14 15:16:30.385+07	2026-11-14 15:16:30.385+07	UTH-DIEN-000027	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-03 - Tầng 3	available	f	\N	2026-11-14	215000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	275	\N	\N
961	2026-11-14 15:16:30.389+07	2026-11-14 15:16:30.389+07	UTH-DIEN-000028	Cơ sở 1 (Bình Thạnh) - Kệ DIEN-03 - Tầng 3	available	f	\N	2026-11-14	215000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	275	\N	\N
962	2026-11-14 15:16:30.392+07	2026-11-14 15:16:30.392+07	UTH-NN-000001	Cơ sở 1 (Bình Thạnh) - Kệ NN-04 - Tầng 1	available	f	\N	2026-11-14	160000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	276	\N	\N
963	2026-11-14 15:16:30.392+07	2026-11-14 15:16:30.392+07	UTH-NN-000002	Cơ sở 1 (Bình Thạnh) - Kệ NN-04 - Tầng 1	available	f	\N	2026-11-14	160000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	276	\N	\N
964	2026-11-14 15:16:30.395+07	2026-11-14 15:16:30.395+07	UTH-NN-000003	Cơ sở 1 (Bình Thạnh) - Kệ NN-04 - Tầng 1	available	f	\N	2026-11-14	160000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	276	\N	\N
965	2026-11-14 15:16:30.396+07	2026-11-14 15:16:30.396+07	UTH-NN-000004	Cơ sở 1 (Bình Thạnh) - Kệ NN-04 - Tầng 1	available	f	\N	2026-11-14	160000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	276	\N	\N
966	2026-11-14 15:16:30.397+07	2026-11-14 15:16:30.397+07	UTH-NN-000005	Cơ sở 1 (Bình Thạnh) - Kệ NN-04 - Tầng 1	available	f	\N	2026-11-14	160000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	276	\N	\N
967	2026-11-14 15:16:30.397+07	2026-11-14 15:16:30.397+07	UTH-NN-000006	Cơ sở 1 (Bình Thạnh) - Kệ NN-01 - Tầng 2	available	f	\N	2026-11-14	120000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	277	\N	\N
968	2026-11-14 15:16:30.401+07	2026-11-14 15:16:30.401+07	UTH-NN-000007	Cơ sở 1 (Bình Thạnh) - Kệ NN-01 - Tầng 2	damaged	f	\N	2026-11-14	120000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	277	\N	\N
969	2026-11-14 15:16:30.403+07	2026-11-14 15:16:30.403+07	UTH-NN-000008	Cơ sở 1 (Bình Thạnh) - Kệ NN-02 - Tầng 3	available	t	\N	2026-11-14	150000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	278	\N	\N
970	2026-11-14 15:16:30.404+07	2026-11-14 15:16:30.404+07	UTH-NN-000009	Cơ sở 1 (Bình Thạnh) - Kệ NN-02 - Tầng 3	available	f	\N	2026-11-14	150000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	278	\N	\N
971	2026-11-14 15:16:30.404+07	2026-11-14 15:16:30.404+07	UTH-NN-000010	Cơ sở 1 (Bình Thạnh) - Kệ NN-02 - Tầng 3	available	f	\N	2026-11-14	150000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	278	\N	\N
972	2026-11-14 15:16:30.404+07	2026-11-14 15:16:30.404+07	UTH-NN-000011	Cơ sở 1 (Bình Thạnh) - Kệ NN-03 - Tầng 1	borrowed	f	\N	2026-11-14	140000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	279	\N	\N
973	2026-11-14 15:16:30.408+07	2026-11-14 15:16:30.408+07	UTH-NN-000012	Cơ sở 1 (Bình Thạnh) - Kệ NN-03 - Tầng 1	available	f	\N	2026-11-14	140000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	279	\N	\N
974	2026-11-14 15:16:30.41+07	2026-11-14 15:16:30.41+07	UTH-NN-000013	Cơ sở 1 (Bình Thạnh) - Kệ NN-03 - Tầng 1	available	f	\N	2026-11-14	140000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	279	\N	\N
975	2026-11-14 15:16:30.411+07	2026-11-14 15:16:30.411+07	UTH-NN-000014	Cơ sở 1 (Bình Thạnh) - Kệ NN-03 - Tầng 1	available	f	\N	2026-11-14	140000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	279	\N	\N
976	2026-11-14 15:16:30.411+07	2026-11-14 15:16:30.411+07	UTH-NN-000015	Cơ sở 1 (Bình Thạnh) - Kệ NN-04 - Tầng 2	borrowed	f	\N	2026-11-14	110000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	280	\N	\N
977	2026-11-14 15:16:30.411+07	2026-11-14 15:16:30.411+07	UTH-NN-000016	Cơ sở 1 (Bình Thạnh) - Kệ NN-04 - Tầng 2	available	f	\N	2026-11-14	110000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	280	\N	\N
978	2026-11-14 15:16:30.415+07	2026-11-14 15:16:30.415+07	UTH-NN-000017	Cơ sở 1 (Bình Thạnh) - Kệ NN-04 - Tầng 2	available	f	\N	2026-11-14	110000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	280	\N	\N
979	2026-11-14 15:16:30.416+07	2026-11-14 15:16:30.416+07	UTH-NN-000018	Cơ sở 1 (Bình Thạnh) - Kệ NN-04 - Tầng 2	available	f	\N	2026-11-14	110000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	280	\N	\N
980	2026-11-14 15:16:30.417+07	2026-11-14 15:16:30.417+07	UTH-NN-000019	Cơ sở 1 (Bình Thạnh) - Kệ NN-04 - Tầng 2	available	f	\N	2026-11-14	110000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	280	\N	\N
981	2026-11-14 15:16:30.419+07	2026-11-14 15:16:30.419+07	UTH-NN-000020	Cơ sở 1 (Bình Thạnh) - Kệ NN-01 - Tầng 3	available	f	\N	2026-11-14	170000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	281	\N	\N
982	2026-11-14 15:16:30.419+07	2026-11-14 15:16:30.419+07	UTH-NN-000021	Cơ sở 1 (Bình Thạnh) - Kệ NN-01 - Tầng 3	available	f	\N	2026-11-14	170000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	281	\N	\N
983	2026-11-14 15:16:30.422+07	2026-11-14 15:16:30.423+07	UTH-NN-000022	Cơ sở 1 (Bình Thạnh) - Kệ NN-02 - Tầng 1	available	f	\N	2026-11-14	135000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	\N	1	\N	282	\N	\N
984	2026-11-14 15:16:30.423+07	2026-11-14 15:16:30.423+07	UTH-NN-000023	Cơ sở 1 (Bình Thạnh) - Kệ NN-02 - Tầng 1	withdrawn	f	\N	2026-11-14	135000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	[Thanh lý bởi admin]	1	\N	282	\N	\N
985	2026-11-14 15:16:30.423+07	2026-11-14 15:16:30.423+07	UTH-NN-000024	Cơ sở 1 (Bình Thạnh) - Kệ NN-02 - Tầng 1	withdrawn	f	\N	2026-11-14	135000	Ngân sách Nhà nước	Công ty Phát hành sách FAHASA TP.HCM	[Thanh lý bởi admin]	1	\N	282	\N	\N
986	2026-11-14 17:44:06.348+07	2026-11-14 17:44:06.348+07	UTH-CNTT-000045	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-01 - Tầng 2	reserved_hold	f	2026-11-17 23:59:59.999+07	2026-11-14	120000	Mua mới	\N	\N	1	\N	283	2	\N
987	2026-11-14 17:44:06.348+07	2026-11-14 22:21:38.037+07	UTH-CNTT-000046	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-01 - Tầng 2	borrowed	f	\N	2026-11-14	120000	Mua mới	\N	\N	1	\N	283	\N	\N
988	2026-11-14 17:44:06.348+07	2026-11-14 22:21:38.023+07	UTH-CNTT-000047	Cơ sở 1 (Bình Thạnh) - Kệ GTVT-01 - Tầng 2	reserved_hold	f	2026-11-18 23:59:59.999+07	2026-11-14	120000	Mua mới	\N	\N	1	\N	283	1	\N
\.


--
-- Data for Name: deaccession_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deaccession_batches (id, created_at, updated_at, code, decision_number, decision_date, reason, status, committee, total_copies, total_value, note, approved_at, approved_by_id, created_by_id, bgh_decision_number, bgh_decision_date, bgh_approver_name, disposal_method, approval_note) FROM stdin;
\.


--
-- Data for Name: digital_approval_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.digital_approval_logs (id, created_at, updated_at, action, note, actor_id, document_id) FROM stdin;
\.


--
-- Data for Name: digital_document_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.digital_document_versions (id, created_at, updated_at, version_number, file, file_size_bytes, file_hash_sha256, page_count, change_log, is_current, document_id, uploaded_by_id) FROM stdin;
\.


--
-- Data for Name: digital_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.digital_documents (id, created_at, updated_at, title, document_type, status, cover_image, abstract, keywords, language, year, department, major, author_names, advisor_names, publisher, isbn, source_license, metadata, access_scope, allowed_departments, allowed_majors, access_start_date, access_end_date, require_active_card, allow_download, allow_print, campus_only, submitted_at, approved_at, rejection_reason, disable_reason, total_views, total_reading_seconds, current_version_number, approved_by_id, catalog_book_id, created_by_id) FROM stdin;
\.


--
-- Data for Name: digital_documents_allowed_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.digital_documents_allowed_users (id, digitaldocument_id, user_id) FROM stdin;
\.


--
-- Data for Name: digital_reading_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.digital_reading_sessions (id, created_at, updated_at, session_id, session_code, user_full_name, user_code, user_department, user_major, ip_address, user_agent, current_page, max_page_reached, total_seconds_spent, last_active_at, expires_at, status, document_id, user_id, version_id) FROM stdin;
\.


--
-- Data for Name: digital_resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.digital_resources (id, created_at, updated_at, title, file, file_size_bytes, page_count, allow_download, access_level, view_count, description, is_active, book_id, created_by_id) FROM stdin;
\.


--
-- Data for Name: django_content_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_content_type (id, app_label, model) FROM stdin;
1	auth	permission
2	auth	group
3	contenttypes	contenttype
4	sessions	session
5	core	holiday
6	core	policy
7	core	systemconfig
8	accounts	user
9	accounts	passwordresettoken
10	accounts	refreshtoken
11	catalog	author
12	catalog	category
13	catalog	book
14	catalog	barcodesequence
15	catalog	copy
16	circulation	loan
17	reservations	reservation
18	fines	fine
19	fines	finepayment
20	suggestions	suggestion
21	notifications	notification
22	audit	auditlog
23	assistant	assistantconversation
24	assistant	assistantmemoryentry
25	assistant	assistantmessage
26	accounts	studentroster
27	accounts	paymenttransaction
28	catalog	deaccessionbatch
29	catalog	digitalresource
30	catalog	readingsession
31	suggestions	suggestionvote
32	suggestions	suggestioncampaign
33	digital_library	digitaldocument
34	digital_library	approvallog
35	digital_library	digitaldocumentversion
36	digital_library	digitalreadingsession
\.


--
-- Data for Name: django_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_migrations (id, app, name, applied) FROM stdin;
1	contenttypes	0001_initial	2026-11-16 09:15:24.84537+07
2	contenttypes	0002_remove_content_type_name	2026-11-16 09:15:24.858706+07
3	auth	0001_initial	2026-11-16 09:15:24.887207+07
4	auth	0002_alter_permission_name_max_length	2026-11-16 09:15:24.892024+07
5	auth	0003_alter_user_email_max_length	2026-11-16 09:15:24.895362+07
6	auth	0004_alter_user_username_opts	2026-11-16 09:15:24.895362+07
7	auth	0005_alter_user_last_login_null	2026-11-16 09:15:24.900415+07
8	auth	0006_require_contenttypes_0002	2026-11-16 09:15:24.901423+07
9	auth	0007_alter_validators_add_error_messages	2026-11-16 09:15:24.903423+07
10	auth	0008_alter_user_username_max_length	2026-11-16 09:15:24.905604+07
11	auth	0009_alter_user_last_name_max_length	2026-11-16 09:15:24.90973+07
12	auth	0010_alter_group_name_max_length	2026-11-16 09:15:24.912307+07
13	auth	0011_update_proxy_permissions	2026-11-16 09:15:24.917074+07
14	auth	0012_alter_user_first_name_max_length	2026-11-16 09:15:24.919587+07
15	accounts	0001_initial	2026-11-16 09:15:25.004496+07
16	audit	0001_initial	2026-11-16 09:15:25.027042+07
17	catalog	0001_initial	2026-11-16 09:15:25.135254+07
18	circulation	0001_initial	2026-11-16 09:15:25.17678+07
19	core	0001_initial	2026-11-16 09:15:25.192201+07
20	core	0002_enable_extensions	2026-11-16 09:15:25.19644+07
21	fines	0001_initial	2026-11-16 09:15:25.317717+07
22	notifications	0001_initial	2026-11-16 09:15:25.345255+07
23	reservations	0001_initial	2026-11-16 09:15:25.376125+07
24	sessions	0001_initial	2026-11-16 09:15:25.383696+07
25	suggestions	0001_initial	2026-11-16 09:15:25.411577+07
26	assistant	0001_initial	2026-11-17 13:16:14.809128+07
27	accounts	0002_alter_user_lock_reason_alter_user_role_studentroster	2026-11-23 09:33:18.765319+07
28	accounts	0003_studentroster_class_name_paymenttransaction	2026-11-23 09:33:18.814677+07
29	accounts	0004_studentroster_avatar	2026-11-23 09:33:18.826371+07
30	catalog	0002_deaccessionbatch_copy_deaccession_batch_and_more	2026-11-23 09:33:18.91241+07
31	catalog	0003_deaccessionbatch_bgh_decision_date_and_more	2026-11-23 09:33:18.978545+07
32	catalog	0004_digitalresource_readingsession	2026-11-23 09:33:19.035333+07
33	digital_library	0001_initial	2026-11-23 09:33:19.287046+07
34	notifications	0002_alter_notification_type	2026-11-23 09:33:19.35664+07
35	suggestions	0002_suggestionvote_suggestion_department_and_more	2026-11-23 09:33:19.52433+07
\.


--
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_session (session_key, session_data, expire_date) FROM stdin;
\.


--
-- Data for Name: fine_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fine_payments (id, created_at, updated_at, amount, collected_at, note, collected_by_id, fine_id) FROM stdin;
1	2026-11-14 15:53:17.132+07	2026-11-14 15:53:17.132+07	14000	2026-11-14 15:53:17.132+07		1	10
2	2026-11-14 17:46:46.554+07	2026-11-14 17:46:46.554+07	10000	2026-11-14 17:46:46.554+07		1	11
\.


--
-- Data for Name: fines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fines (id, created_at, updated_at, type, amount, paid_amount, status, damage_level, note, waive_reason, loan_id, user_id, waived_by_id) FROM stdin;
10	2026-11-14 15:16:30.437+07	2026-11-14 15:16:30.437+07	overdue	14000	14000	paid	\N	Phạt trễ hạn 7 ngày sách Kỹ thuật Thiết kế Đường cao tốc	\N	\N	7	\N
11	2026-11-14 15:16:30.437+07	2026-11-14 15:16:30.437+07	overdue	20000	20000	paid	\N	Phạt trễ 10 ngày sách Quản trị Chuỗi Cung ứng (đã nộp 10.000đ)	\N	\N	8	\N
12	2026-11-15 12:27:42.756+07	2026-11-15 12:27:42.756+07	overdue	2000	0	unpaid	\N	Phạt trễ hạn 1 ngày tính đến thời điểm báo mất	\N	15	4	\N
13	2026-11-15 12:27:42.764+07	2026-11-15 12:27:42.764+07	lost	215000	0	unpaid	\N	Đền bù mất sách (195,000đ) + Phí xử lý (20,000đ)	\N	15	4	\N
\.


--
-- Data for Name: holidays; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.holidays (id, created_at, updated_at, date, name, repeat_annually) FROM stdin;
\.


--
-- Data for Name: loans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loans (id, created_at, updated_at, borrowed_at, due_at, returned_at, renewal_count, status, lost_at, return_condition, note, fine_per_day_snapshot, loan_days_snapshot, renewal_limit_snapshot, book_price_snapshot, processing_fee_snapshot, policy_id_snapshot, last_overdue_notification_date, due_soon_notified, book_id, copy_id, created_by_id, handled_by_id, user_id) FROM stdin;
13	2026-11-14 15:16:30.423+07	2026-11-14 15:16:30.423+07	2026-11-05 15:16:27.591+07	2026-11-20 06:59:59.591+07	\N	0	active	\N	normal	\N	2000	14	1	180000	20000	5	\N	f	201	701	1	\N	2
14	2026-11-14 15:16:30.429+07	2026-11-14 15:16:30.429+07	2026-11-01 15:16:27.591+07	2026-11-16 06:59:59.591+07	\N	0	active	\N	normal	\N	2000	14	1	180000	20000	5	\N	f	201	702	1	\N	3
15	2026-11-14 15:16:30.43+07	2026-11-15 12:27:42.751+07	2026-10-30 15:16:27.591+07	2026-11-14 06:59:59.591+07	\N	0	lost	2026-11-15 12:27:42.744+07	lost		2000	14	1	195000	20000	5	\N	f	202	703	1	1	4
16	2026-11-14 15:16:30.43+07	2026-11-14 15:16:30.43+07	2026-10-24 15:16:27.591+07	2026-11-08 06:59:59.591+07	\N	0	active	\N	normal	\N	2000	14	1	195000	20000	5	\N	f	202	704	1	\N	5
17	2026-11-14 15:16:30.43+07	2026-11-14 15:16:30.43+07	2026-09-30 15:16:27.591+07	2026-10-15 06:59:59.591+07	\N	0	active	\N	normal	\N	2000	14	1	195000	20000	5	\N	f	202	705	1	\N	6
18	2026-11-14 15:16:30.437+07	2026-11-14 15:16:30.437+07	2026-11-04 15:16:27.591+07	2026-12-05 06:59:59.591+07	\N	0	active	\N	normal	\N	2000	30	1	240000	20000	6	\N	f	203	706	1	\N	22
20	2026-11-14 22:25:14.625+07	2026-11-14 22:25:14.625+07	2026-11-14 22:25:14.625+07	2026-11-28 23:59:59.999+07	\N	0	active	\N	normal	\N	2000	14	1	120000	20000	5	\N	f	283	987	1	\N	28
21	2026-11-16 12:35:47.764+07	2026-11-16 12:35:47.764+07	2026-11-16 12:35:47.764+07	2026-12-23 23:59:59.999+07	\N	1	active	\N	normal	\N	2000	30	1	140000	20000	6	\N	f	279	972	1	\N	22
22	2026-11-17 15:22:26.009+07	2026-11-17 15:22:26.009+07	2026-11-17 15:22:26.008+07	2026-12-08 23:59:59.999+07	\N	1	active	\N	normal	\N	2000	14	1	110000	20000	5	\N	f	280	976	1	\N	29
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, created_at, updated_at, type, channel, content, link, is_read, dedupe_key, sent_at, user_id) FROM stdin;
11	2026-11-14 15:16:30.451+07	2026-11-14 15:16:30.451+07	due_soon	in_app	Sách "Quy hoạch và Quản lý Giao thông Đô thị Hiện đại" của bạn sẽ đến hạn trả vào ngày 19/11/2026. Vui lòng trả sách hoặc gia hạn đúng hạn.	/loans	t	due_soon_demo_56	2026-11-14 15:16:30.451+07	2
12	2026-11-14 15:16:30.451+07	2026-11-14 15:16:30.451+07	reservation_ready	in_app	Sách "Hệ thống Giao thông Thông minh (ITS) trong Đô thị Hiện đại" bạn đặt trước đã sẵn sàng tại quầy A. Vui lòng đến nhận trước 23:59 ngày 17/11/2026.	/reservations	f	res_ready_demo_63	2026-11-14 15:16:30.451+07	9
14	2026-11-14 17:44:37.613+07	2026-11-14 17:44:37.613+07	reservation_ready	in_app	Giữ chỗ thành công! Sách "Githup" đã được giữ cho bạn tại quầy A. Vui lòng đến nhận trước 23:59 ngày 17/11/2026.	/reservations	t	\N	2026-11-14 17:44:37.613+07	2
15	2026-11-14 21:45:34.254+07	2026-11-14 21:45:34.254+07	reservation_ready	in_app	Giữ chỗ thành công! Sách "Githup" đã được giữ cho bạn tại quầy A. Vui lòng đến nhận trước 23:59 ngày 17/11/2026.	/reservations	t	\N	2026-11-14 21:45:34.254+07	28
16	2026-11-14 22:34:20.3+07	2026-11-14 22:34:20.3+07	reservation_ready	in_app	Giữ chỗ thành công! Sách "Lập trình Ứng dụng Web Toàn diện với React, TypeScript và Django REST" đã được giữ cho bạn tại quầy A. Vui lòng đến nhận trước 23:59 ngày 17/11/2026.	/reservations	t	\N	2026-11-14 22:34:20.3+07	28
17	2026-11-14 23:39:53.066+07	2026-11-14 23:39:53.066+07	suggestion_result	in_app	Đề xuất sách 'Vũ đẹp tria' của bạn đã được duyệt. Đã duyệt mua tài liệu phục vụ đào tạo.	/patron/suggestions	t	\N	2026-11-14 23:39:53.066+07	28
18	2026-11-15 00:19:12.761+07	2026-11-15 00:19:12.761+07	suggestion_result	in_app	Đề xuất sách 'Bay Bỏng' của bạn đã được duyệt. Đã duyệt mua tài liệu phục vụ đào tạo.	/patron/suggestions	t	\N	2026-11-15 00:19:12.761+07	28
19	2026-11-15 00:19:20.332+07	2026-11-15 00:19:20.332+07	suggestion_result	in_app	Đề xuất sách 'Kỹ thuật Xây dựng Cầu dây văng Khẩu độ Lớn trên thế giới' của bạn đã bị từ chối. Lý do: Hiện thư viện đã có tài liệu tương đương hoặc chưa phù hợp kế hoạch mua sắm đợt này.	/patron/suggestions	t	\N	2026-11-15 00:19:20.332+07	2
51	2026-11-15 08:37:23.894+07	2026-11-15 08:37:23.894+07	reservation_ready	in_app	Giữ chỗ thành công! Sách "Kỹ năng Thuyết trình Chuyên nghiệp và Hùng biện trước Công chúng" đã được giữ cho bạn tại quầy A. Vui lòng đến nhận trước 23:59 ngày 18/11/2026.	/reservations	t	\N	2026-11-15 08:37:23.894+07	28
52	2026-11-15 08:39:39.766+07	2026-11-15 08:39:39.766+07	reservation_ready	in_app	Giữ chỗ thành công! Sách "English for Information Technology and Computer Science (Tiếng Anh CNTT)" đã được giữ cho bạn tại quầy A. Vui lòng đến nhận trước 23:59 ngày 18/11/2026.	/reservations	t	\N	2026-11-15 08:39:39.766+07	28
53	2026-11-15 09:08:52.248+07	2026-11-15 09:08:52.248+07	reservation_ready	in_app	Giữ chỗ thành công! Sách "Hệ thống Cung cấp Điện và Lưới điện Thông minh Smart Grid" đã được giữ cho bạn tại quầy A. Vui lòng đến nhận trước 23:59 ngày 18/11/2026.	/reservations	t	\N	2026-11-15 09:08:52.248+07	28
54	2026-11-15 09:13:05.126+07	2026-11-15 09:13:05.126+07	overdue	in_app	Tài khoản của bạn đã bị khóa chức năng đặt trước/giữ chỗ 30 ngày do có 3 lần không đến nhận sách đúng hẹn.	/reservations	t	\N	2026-11-15 09:13:05.126+07	28
55	2026-11-15 09:13:15.465+07	2026-11-15 09:13:15.465+07	overdue	in_app	Tài khoản của bạn đã bị khóa chức năng đặt trước/giữ chỗ 30 ngày do có 4 lần không đến nhận sách đúng hẹn.	/reservations	t	\N	2026-11-15 09:13:15.465+07	28
56	2026-11-15 09:20:52.983+07	2026-11-15 09:20:52.983+07	suggestion_result	in_app	Đề xuất sách '1222' của bạn đã bị từ chối. Lý do: Hiện thư viện đã có tài liệu tương đương hoặc chưa phù hợp kế hoạch mua sắm đợt này.	/patron/suggestions	t	\N	2026-11-15 09:20:52.983+07	28
57	2026-11-15 09:26:06.994+07	2026-11-15 09:26:06.994+07	reservation_ready	in_app	Hiện có 4 sách giữ chỗ sẵn sàng tại quầy lưu thông đang chờ bạn đọc đến nhận.	/admin/reservations	t	admin_ready_res_55_20261115_4	2026-11-15 09:26:06.994+07	1
58	2026-11-15 09:26:07.009+07	2026-11-15 09:26:07.009+07	overdue	in_app	Hệ thống ghi nhận 3 lượt mượn sách quá hạn cần đôn đốc bạn đọc hoàn trả.	/admin/loans	t	admin_overdue_loans_55_20261115_3	2026-11-15 09:26:07.009+07	1
59	2026-11-15 09:33:35.804+07	2026-11-15 09:33:35.804+07	suggestion_result	in_app	Có 1 đề xuất mua giáo trình/tài liệu mới từ bạn đọc đang chờ Ban thư viện phê duyệt.	/admin/suggestions	t	admin_pending_sugg_55_20261115_1	2026-11-15 09:33:35.804+07	1
60	2026-11-15 09:40:07.629+07	2026-11-15 09:40:07.629+07	reservation_ready	in_app	Giữ chỗ thành công! Sách "Githup" đã được giữ cho bạn tại quầy A. Vui lòng đến nhận trước 23:59 ngày 18/11/2026.	/reservations	t	\N	2026-11-15 09:40:07.629+07	1
61	2026-11-15 09:40:08.867+07	2026-11-15 09:40:08.867+07	reservation_ready	in_app	Hiện có 5 sách giữ chỗ sẵn sàng tại quầy lưu thông đang chờ bạn đọc đến nhận.	/admin/reservations	t	admin_ready_res_55_20261115_5	2026-11-15 09:40:08.867+07	1
62	2026-11-15 12:27:19.584+07	2026-11-15 12:27:19.584+07	suggestion_result	in_app	Đề xuất sách 'ưee' của bạn đã bị từ chối. Lý do: Hiện thư viện đã có tài liệu tương đương hoặc chưa phù hợp kế hoạch mua sắm đợt này.	/patron/suggestions	f	\N	2026-11-15 12:27:19.584+07	28
63	2026-11-15 12:27:46.825+07	2026-11-15 12:27:46.825+07	overdue	in_app	Hệ thống ghi nhận 2 lượt mượn sách quá hạn cần đôn đốc bạn đọc hoàn trả.	/admin/loans	t	admin_overdue_loans_55_20261115_2	2026-11-15 12:27:46.825+07	1
64	2026-11-16 09:23:58.541+07	2026-11-16 09:23:58.541+07	reservation_ready	in_app	Hiện có 4 sách giữ chỗ sẵn sàng tại quầy lưu thông đang chờ bạn đọc đến nhận.	/admin/reservations	f	admin_ready_res_1_20261116_4	2026-11-16 09:23:58.541+07	1
65	2026-11-16 09:23:58.547+07	2026-11-16 09:23:58.547+07	overdue	in_app	Hệ thống ghi nhận 3 lượt mượn sách quá hạn cần đôn đốc bạn đọc hoàn trả.	/admin/loans	t	admin_overdue_loans_1_20261116_3	2026-11-16 09:23:58.547+07	1
67	2026-11-16 10:58:16.741+07	2026-11-16 10:58:16.741+07	overdue	in_app	⚠️ [Nhắc nhở từ Thư viện UTH]: Bạn đang mượn cuốn "Thiết kế Hình học Đường ô tô và Nút giao thông Hiện đại" (Mã vạch: UTH-GTVT-000002) đã quá hạn 1 ngày. Vui lòng đến Quầy lưu thông hoàn trả tài liệu để tránh phát sinh thêm phí phạt trễ hạn (2.000đ/ngày).	/loans	f	manual_ai_overdue_14_20261116_000000	2026-11-16 10:58:16.741+07	3
69	2026-11-16 11:47:47.799+07	2026-11-16 11:47:47.799+07	overdue	in_app	⚠️ [Nhắc nhở từ Thư viện UTH]: Bạn đang mượn cuốn "Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức" (Mã vạch: UTH-GTVT-000004) đã quá hạn 8 ngày. Vui lòng đến Quầy lưu thông hoàn trả tài liệu để tránh phát sinh thêm phí phạt trễ hạn (2.000đ/ngày).	/loans	f	manual_ai_overdue_16_20261116_000000	2026-11-16 11:47:47.799+07	5
70	2026-11-16 11:47:48.346+07	2026-11-16 11:47:48.346+07	overdue	in_app	⚠️ [Nhắc nhở từ Thư viện UTH]: Bạn đang mượn cuốn "Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức" (Mã vạch: UTH-GTVT-000005) đã quá hạn 32 ngày. Vui lòng đến Quầy lưu thông hoàn trả tài liệu để tránh phát sinh thêm phí phạt trễ hạn (2.000đ/ngày).	/loans	f	manual_ai_overdue_17_20261116_000000	2026-11-16 11:47:48.346+07	6
13	2026-11-14 15:50:51.628+07	2026-11-14 15:50:51.628+07	reservation_ready	in_app	Giữ chỗ thành công! Sách "Nghệ thuật Đàm phán và Giải quyết Xung đột trong Môi trường Đa văn hóa" đã được giữ cho bạn tại quầy A. Vui lòng đến nhận trước 23:59 ngày 17/11/2026.	/reservations	t	\N	2026-11-14 15:50:51.628+07	22
107	2026-11-16 12:35:47.892+07	2026-11-16 12:35:47.892+07	reservation_ready	in_app	Hiện có 3 sách giữ chỗ sẵn sàng tại quầy lưu thông đang chờ bạn đọc đến nhận.	/admin/reservations	f	admin_ready_res_1_20261116_3	2026-11-16 12:35:47.892+07	1
112	2026-11-17 00:40:58.766+07	2026-11-17 00:40:58.766+07	reservation_ready	in_app	Hiện có 3 sách giữ chỗ sẵn sàng tại quầy lưu thông đang chờ bạn đọc đến nhận.	/admin/reservations	f	admin_ready_res_1_20261117_3	2026-11-17 00:40:58.766+07	1
113	2026-11-17 00:40:58.788+07	2026-11-17 00:40:58.789+07	overdue	in_app	Hệ thống ghi nhận 3 lượt mượn sách quá hạn cần đôn đốc bạn đọc hoàn trả.	/admin/loans	f	admin_overdue_loans_1_20261117_3	2026-11-17 00:40:58.789+07	1
115	2026-11-17 15:21:32.535+07	2026-11-17 15:21:32.535+07	reservation_ready	in_app	Giữ chỗ thành công! Sách "Viết Báo cáo Kỹ thuật và Đồ án Tốt nghiệp Chuẩn Khoa học" đã được giữ cho bạn tại quầy A. Vui lòng đến nhận trước 23:59 ngày 20/11/2026.	/reservations	t	\N	2026-11-17 15:21:32.535+07	29
116	2026-11-17 15:22:15.526+07	2026-11-17 15:22:15.526+07	reservation_ready	in_app	Hiện có 4 sách giữ chỗ sẵn sàng tại quầy lưu thông đang chờ bạn đọc đến nhận.	/admin/reservations	f	admin_ready_res_1_20261117_4	2026-11-17 15:22:15.526+07	1
118	2026-11-17 22:05:31.242+07	2026-11-17 22:05:31.242+07	overdue	in_app	⚠️ [Nhắc nhở từ Thư viện UTH]: Bạn đang mượn cuốn "Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức" (Mã vạch: UTH-GTVT-000004) đã quá hạn 9 ngày. Vui lòng đến Quầy lưu thông hoàn trả tài liệu để tránh phát sinh thêm phí phạt trễ hạn (2.000đ/ngày).	/loans	f	manual_ai_overdue_16_20261117_000000	2026-11-17 22:05:31.242+07	5
119	2026-11-17 22:05:31.243+07	2026-11-17 22:05:31.243+07	overdue	in_app	⚠️ [Nhắc nhở từ Thư viện UTH]: Bạn đang mượn cuốn "Thiết kế Hình học Đường ô tô và Nút giao thông Hiện đại" (Mã vạch: UTH-GTVT-000002) đã quá hạn 1 ngày. Vui lòng đến Quầy lưu thông hoàn trả tài liệu để tránh phát sinh thêm phí phạt trễ hạn (2.000đ/ngày).	/loans	f	manual_ai_overdue_14_20261117_000000	2026-11-17 22:05:31.243+07	3
120	2026-11-17 22:05:31.243+07	2026-11-17 22:05:31.243+07	overdue	in_app	⚠️ [Nhắc nhở từ Thư viện UTH]: Bạn đang mượn cuốn "Kỹ thuật Thiết kế Đường cao tốc và Nút giao Khác mức" (Mã vạch: UTH-GTVT-000005) đã quá hạn 33 ngày. Vui lòng đến Quầy lưu thông hoàn trả tài liệu để tránh phát sinh thêm phí phạt trễ hạn (2.000đ/ngày).	/loans	f	manual_ai_overdue_17_20261117_000000	2026-11-17 22:05:31.243+07	6
124	2026-11-18 01:39:54.156+07	2026-11-18 01:39:54.156+07	reservation_ready	in_app	Hiện có 3 sách giữ chỗ sẵn sàng tại quầy lưu thông đang chờ bạn đọc đến nhận.	/admin/reservations	f	admin_ready_res_1_20261118_3	2026-11-18 01:39:54.156+07	1
126	2026-11-18 01:39:54.169+07	2026-11-18 01:39:54.169+07	overdue	in_app	Hệ thống ghi nhận 3 lượt mượn sách quá hạn cần đôn đốc bạn đọc hoàn trả.	/admin/loans	f	admin_overdue_loans_1_20261118_3	2026-11-18 01:39:54.169+07	1
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, created_at, updated_at, token_hash, expires_at, used_at, user_id) FROM stdin;
\.


--
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_transactions (id, created_at, updated_at, transaction_code, receipt_code, transaction_type, student_code, payer_name, amount, payment_method, status, collected_at, note, collected_by_id, user_id) FROM stdin;
\.


--
-- Data for Name: policies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.policies (id, created_at, updated_at, role, is_current, max_loans, loan_days, renewal_limit, renewal_days, fine_per_day, hold_days, max_reservations_pending, max_ready_reservations, damage_light_pct, damage_medium_pct, damage_heavy_pct, reading_room_hours, reading_room_grace_minutes, reading_room_overstay_lock_days, reading_room_max_per_day) FROM stdin;
5	2026-11-14 15:16:27.611+07	2026-11-14 15:16:27.611+07	student	t	5	14	1	7	2000	3	3	3	20	50	80	2	30	7	2
6	2026-11-14 15:16:27.611+07	2026-11-14 15:16:27.611+07	lecturer	t	10	30	1	7	2000	3	5	5	20	50	80	2	30	7	2
7	2026-11-15 09:40:07.619+07	2026-11-15 09:40:07.619+07	admin	t	5	14	1	7	2000	3	3	3	20	50	80	2	30	7	2
\.


--
-- Data for Name: reading_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reading_sessions (id, created_at, updated_at, current_page, max_page_reached, total_seconds_spent, last_accessed, digital_resource_id, user_id) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, created_at, updated_at, token_hash, family_id, expires_at, idle_expires_at, last_used_at, revoked_at, user_agent, ip, user_id) FROM stdin;
614	2026-11-23 11:47:53.37088+07	2026-11-23 11:47:53.37088+07	96fb02568d6e4b18b26ffe6285bd618b7766036915e0828ce3026f248622492d	7c388a08-7686-4374-9a5e-2dafad17d928	2026-12-23 11:47:53.37088+07	2026-11-25 11:47:53.37088+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36 Edg/158.0.0.0	127.0.0.1	29
55	2026-11-14 15:28:55.045+07	2026-11-14 15:28:55.045+07	6afae59352459050884679439f5fd37f43385b09807fa1cdbca2945541e0568a	c275b287-6d1d-47eb-a8c5-17016380cf1c	2026-11-21 15:28:55.045+07	2026-11-14 23:28:55.045+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
293	2026-11-15 00:19:34.498+07	2026-11-15 00:19:34.498+07	152c7d62e75affc86806f7737619d4be31b1369a6c4b288cf212a7086f63d0b1	b4105475-3a74-42af-b454-73e0a6f0c85e	2026-11-22 00:19:34.498+07	2026-11-15 08:19:34.498+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
399	2026-11-15 12:24:11.879+07	2026-11-15 12:24:11.879+07	b9b18dad714b79803f4faf1c8d7ee1fbb74308991aa7efee9be8871f08ebbe1e	66422a96-bb72-48c9-b166-b16439b9a415	2026-11-22 12:24:11.877+07	2026-11-15 20:24:11.877+07	2026-11-15 12:26:34.198+07	2026-11-15 12:26:34.207+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
424	2026-11-16 09:49:07.492+07	2026-11-16 09:49:07.492+07	76fda21e994836c6aae6b23e1b3ea5cde507db6c584dff7556abb2a8bcbdbdd7	7129ef92-c707-4cd1-a2c9-702a497280fb	2026-11-23 09:49:07.492+07	2026-11-16 17:49:07.492+07	\N	2026-11-16 09:56:05.794+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
420	2026-11-16 09:33:08.571+07	2026-11-16 09:33:08.571+07	6c84d1999b5048f218ff4bbe8dcf8a21a68d4385caed590f6674bf020fa31744	7129ef92-c707-4cd1-a2c9-702a497280fb	2026-11-23 09:33:08.571+07	2026-11-16 17:33:08.571+07	2026-11-16 09:33:30.5+07	2026-11-16 09:56:05.794+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
422	2026-11-16 09:33:30.5+07	2026-11-16 09:33:30.5+07	c64d2d83ef852d34d6f123b1451d75bafd1407c0ea50d692334bf013d08cffb3	7129ef92-c707-4cd1-a2c9-702a497280fb	2026-11-23 09:33:30.5+07	2026-11-16 17:33:30.5+07	\N	2026-11-16 09:56:05.794+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
421	2026-11-16 09:33:30.5+07	2026-11-16 09:33:30.5+07	a6b7377b07c301e8ba48b848780fd3d4bd32569b20736421b87183f883e946c6	7129ef92-c707-4cd1-a2c9-702a497280fb	2026-11-23 09:33:30.5+07	2026-11-16 17:33:30.5+07	2026-11-16 09:49:07.487+07	2026-11-16 09:56:05.794+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
423	2026-11-16 09:49:07.493+07	2026-11-16 09:49:07.493+07	945c9c20998650f8d3c1144a9c5543df9ef95a692388399d9340c9631ff7101f	7129ef92-c707-4cd1-a2c9-702a497280fb	2026-11-23 09:49:07.493+07	2026-11-16 17:49:07.493+07	2026-11-16 09:49:11.84+07	2026-11-16 09:56:05.794+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
425	2026-11-16 09:49:11.842+07	2026-11-16 09:49:11.842+07	cf3e07c1d39d1452efefbecff4a428027ad9c680ed7dc40c793fcb86d02b2eb5	7129ef92-c707-4cd1-a2c9-702a497280fb	2026-11-23 09:49:11.842+07	2026-11-16 17:49:11.842+07	\N	2026-11-16 09:56:05.794+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
435	2026-11-16 10:17:48.268+07	2026-11-16 10:17:48.268+07	060512be4e4110c381f76587d8cd7c808c557ca0dc727dad4b99823930a5a9d6	73d24c55-99c4-48f4-83bf-a1fb1dfb958c	2026-11-23 10:17:48.267+07	2026-11-16 18:17:48.267+07	2026-11-16 10:25:59.289+07	2026-11-16 10:25:59.296+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
436	2026-11-16 10:25:59.294+07	2026-11-16 10:25:59.294+07	78f85cb1e87e0ad027df6e2282a9e76b4d3d122232d728da14fb6dc0e15028b4	73d24c55-99c4-48f4-83bf-a1fb1dfb958c	2026-11-23 10:25:59.294+07	2026-11-16 18:25:59.294+07	\N	2026-11-16 10:25:59.296+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
437	2026-11-16 10:26:01.671+07	2026-11-16 10:26:01.671+07	f792d02512d6c8681c231b7a6c8c7851be7591609074602ce7fcf4e86795d0c0	77b91e2e-92cc-49e8-a375-98a65267dc5f	2026-11-23 10:26:01.671+07	2026-11-16 18:26:01.671+07	2026-11-16 10:32:40.927+07	2026-11-16 10:37:26.198+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
457	2026-11-16 11:36:41.653+07	2026-11-16 11:36:41.653+07	3e3d526e546c65340bf7ea708a0a1a5d8a9589ae99738bbe6c5633f8438c4c61	9b4e1e5f-3db0-49df-ad0e-662a46a6e38e	2026-11-23 11:36:41.653+07	2026-11-16 19:36:41.653+07	2026-11-16 11:36:42.248+07	2026-11-16 11:36:42.935+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
463	2026-11-16 11:36:45.313+07	2026-11-16 11:36:45.313+07	ed8a480e4840ec0eaaba0b06743a6b0eef182052f6009927df8d6d567acf25bb	5b5c10fb-74e4-46cb-9c72-9fbeafa20663	2026-11-23 11:36:45.313+07	2026-11-16 19:36:45.313+07	2026-11-16 11:37:29.403+07	2026-11-16 12:14:22.002+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
470	2026-11-16 11:59:59.205+07	2026-11-16 11:59:59.205+07	556c113cf28f6a426a8775944172b162c9d03575e59790614a02e1578d48b87f	5b5c10fb-74e4-46cb-9c72-9fbeafa20663	2026-11-23 11:59:59.205+07	2026-11-16 19:59:59.205+07	\N	2026-11-16 12:14:22.002+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
438	2026-11-16 10:32:40.93+07	2026-11-16 10:32:40.93+07	57e00c868ba996cb391917a02ea5c9e7461dc560635d04dbaf08036f6d45788c	77b91e2e-92cc-49e8-a375-98a65267dc5f	2026-11-23 10:32:40.93+07	2026-11-16 18:32:40.93+07	\N	2026-11-16 10:37:26.198+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
510	2026-11-16 22:32:44.083+07	2026-11-16 22:32:44.083+07	95090fcdc93e1c33cc4f4fb182b638d79d8d572c7ee211ebc4d6f612ac0c9a05	6e04d7c7-28a6-4860-9ef7-394000a59467	2026-11-23 22:32:44.083+07	2026-11-17 06:32:44.083+07	\N	2026-11-16 22:36:45.731+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
516	2026-11-16 22:38:48.531+07	2026-11-16 22:38:48.531+07	2f7902a7c627d841da98f7d3677f5a9e068c3b28b3bc636e4b01e45fad347822	4e14a914-30b0-42a5-8dab-3aa9e8a33fd1	2026-11-23 22:38:48.53+07	2026-11-17 06:38:48.53+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
521	2026-11-16 22:49:02.749+07	2026-11-16 22:49:02.749+07	425fc9fa978f943c4988e2fa507e492ac9ae880e9a5ff5d7de050050cb48c35a	31b27bc0-0951-43ec-b463-22454403ff5a	2026-11-23 22:49:02.749+07	2026-11-17 06:49:02.749+07	\N	2026-11-17 00:35:06.638+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
525	2026-11-17 00:35:23.265+07	2026-11-17 00:35:23.265+07	3ca1fe63f59da9f35e02a89bf8b93f76ed0d5e3788db6a594d54c0368726f9c4	74ca270c-9cc2-45fe-9943-cdb904f85d6a	2026-11-24 00:35:23.265+07	2026-11-17 08:35:23.265+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
529	2026-11-17 00:45:46.485+07	2026-11-17 00:45:46.485+07	10d656718e63062f16728b88840ac9b55393a02d62c44fa76df0a68a74cf30c7	138743de-6a64-4a53-8c17-2fe62493e998	2026-11-24 00:45:46.485+07	2026-11-17 08:45:46.485+07	\N	2026-11-17 00:50:16.142+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
533	2026-11-17 00:51:08.297+07	2026-11-17 00:51:08.297+07	1b95d0ee02264b632e017c86b84737db4a3e17e10973bf7e70c31433cec8a2cb	cd1650eb-c528-4ce0-a04f-066b10f4fda8	2026-11-24 00:51:08.297+07	2026-11-17 08:51:08.297+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
536	2026-11-17 00:58:29.359+07	2026-11-17 00:58:29.359+07	9a35a3098de5d859fc5dded4b6011462cc7d3141ed3516991514343533e1e891	ae662001-ef89-418e-b506-f19a41889196	2026-11-24 00:58:29.359+07	2026-11-17 08:58:29.359+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
539	2026-11-17 01:00:00.345+07	2026-11-17 01:00:00.345+07	c9528120e12d69cbc5e52aa13753b45ba899a9e8e2348eb8f9c32612056c4000	d9d50d3b-c65f-418d-8fbf-81bc16acf69f	2026-11-24 01:00:00.345+07	2026-11-17 09:00:00.345+07	2026-11-17 01:00:09.603+07	2026-11-17 01:00:09.603+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
543	2026-11-17 01:02:43.566+07	2026-11-17 01:02:43.566+07	a3987304db89d759ad6f14471538dd261d33fbfe165fd4941f2248d088123fe4	d9d50d3b-c65f-418d-8fbf-81bc16acf69f	2026-11-24 01:02:43.566+07	2026-11-17 09:02:43.566+07	2026-11-17 01:10:06.359+07	2026-11-17 01:10:06.359+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
552	2026-11-17 13:45:09.813+07	2026-11-17 13:45:09.813+07	556facebd384d7c4bf22d5b0a0cc19044dd45fadfc46c565702ab8c72ddcb6a6	5919f069-0d9d-4196-8828-584ed8d5e90f	2026-11-24 13:45:09.813+07	2026-11-17 21:45:09.813+07	\N	2026-11-17 13:45:09.906+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
553	2026-11-17 13:45:17.275+07	2026-11-17 13:45:17.275+07	4546e8f3621f7a3b9594ea10aa29f96f462c41ff1d30a07f5466805557c88769	544302f5-a439-4421-ba62-2ac343ecf3c6	2026-11-24 13:45:17.275+07	2026-11-17 21:45:17.275+07	2026-11-17 13:46:32.557+07	2026-11-17 13:46:32.557+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
554	2026-11-17 13:46:32.558+07	2026-11-17 13:46:32.558+07	1584aa4c28d8ed51115e9c0adfcc7efdb952a701d1dfc39a17250c3967bfb10a	544302f5-a439-4421-ba62-2ac343ecf3c6	2026-11-24 13:46:32.558+07	2026-11-17 21:46:32.558+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
555	2026-11-17 13:46:32.559+07	2026-11-17 13:46:32.559+07	d211aed8c8f0d46eacf5a69e3de0299240a1085d3f05adba587cb4c4e4199508	544302f5-a439-4421-ba62-2ac343ecf3c6	2026-11-24 13:46:32.559+07	2026-11-17 21:46:32.559+07	2026-11-17 13:51:15.399+07	2026-11-17 13:51:15.399+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
556	2026-11-17 13:51:15.4+07	2026-11-17 13:51:15.4+07	3d76088dfe5fdd5a78c1ced897a161cb3b482c8a2d4aca43d13ca47d1cc479e4	544302f5-a439-4421-ba62-2ac343ecf3c6	2026-11-24 13:51:15.4+07	2026-11-17 21:51:15.4+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
557	2026-11-17 13:51:15.402+07	2026-11-17 13:51:15.402+07	ebcc56ad649da305309c862cbacd067a4d16871af4a71f7dbe736ca266b6e4c8	544302f5-a439-4421-ba62-2ac343ecf3c6	2026-11-24 13:51:15.402+07	2026-11-17 21:51:15.402+07	2026-11-17 14:06:33.361+07	2026-11-17 14:06:33.361+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
558	2026-11-17 14:06:33.363+07	2026-11-17 14:06:33.363+07	dfc5956a2a8ea11a07a2b0643df5d5bb31580615a06f1c502f0261527424e64d	544302f5-a439-4421-ba62-2ac343ecf3c6	2026-11-24 14:06:33.363+07	2026-11-17 22:06:33.363+07	2026-11-17 14:19:25.339+07	2026-11-17 14:19:25.339+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
559	2026-11-17 14:19:25.34+07	2026-11-17 14:19:25.34+07	1f8ff192e1f5883cf4d32eb76a203ed51cd972ce72837ef69ac2409b7c744e50	544302f5-a439-4421-ba62-2ac343ecf3c6	2026-11-24 14:19:25.34+07	2026-11-17 22:19:25.34+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
560	2026-11-17 14:19:25.342+07	2026-11-17 14:19:25.342+07	83c035d111282be7b378ad04e0a7a479d2ff8ba32533f42c2d298cb8a3a1cb12	544302f5-a439-4421-ba62-2ac343ecf3c6	2026-11-24 14:19:25.342+07	2026-11-17 22:19:25.342+07	2026-11-17 14:24:49.63+07	2026-11-17 14:24:49.63+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
561	2026-11-17 14:24:49.632+07	2026-11-17 14:24:49.632+07	e14983d8c91e2aef737d30887d05a020a1d367ee84b088cb798eb6319572f943	544302f5-a439-4421-ba62-2ac343ecf3c6	2026-11-24 14:24:49.632+07	2026-11-17 22:24:49.632+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
567	2026-11-17 15:22:15.377+07	2026-11-17 15:22:15.377+07	55e2c755e4f02ef4bf838000b1cc5315c09f986ac5e03d2c0874adc287a4228e	b536cef0-9c60-458b-a53a-47e6bf88cc1b	2026-11-24 15:22:15.377+07	2026-11-17 23:22:15.377+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
568	2026-11-17 20:47:02.831+07	2026-11-17 20:47:02.831+07	b4c4c967cf4c7c89742c9c73ced028150c48f61f735eec86b281060c18a64274	9c6a1a4d-6b35-47ba-9748-57f5abbd1160	2026-11-24 20:47:02.831+07	2026-11-18 04:47:02.831+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
569	2026-11-17 20:47:02.834+07	2026-11-17 20:47:02.834+07	f13728f43f8a1ff3ed74221caa0fca9cdc78a305334039791d55b26722fb9684	9c6a1a4d-6b35-47ba-9748-57f5abbd1160	2026-11-24 20:47:02.834+07	2026-11-18 04:47:02.834+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
570	2026-11-17 20:47:09.286+07	2026-11-17 20:47:09.286+07	280bd9e4c92761b267a1caefc37c22277eddedbc8ab62b4448f817e6e7d404c6	0e25c69f-db7c-4641-9758-dc74e6a4350f	2026-11-24 20:47:09.285+07	2026-11-18 04:47:09.285+07	2026-11-17 20:54:19.207+07	2026-11-17 20:54:19.207+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
571	2026-11-17 20:54:19.21+07	2026-11-17 20:54:19.21+07	649b8fbc7acd873c4dfacdf667fe1f8a095ccd9ac1100d1e9fc1d70bdeebce73	0e25c69f-db7c-4641-9758-dc74e6a4350f	2026-11-24 20:54:19.209+07	2026-11-18 04:54:19.209+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
572	2026-11-17 20:54:19.211+07	2026-11-17 20:54:19.211+07	52907593e52d0209a5870e15197e9ff3070fd6bcbc8b6233c86479bac74b79d3	0e25c69f-db7c-4641-9758-dc74e6a4350f	2026-11-24 20:54:19.21+07	2026-11-18 04:54:19.21+07	2026-11-17 20:55:58.595+07	2026-11-17 20:55:58.595+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
573	2026-11-17 20:55:58.596+07	2026-11-17 20:55:58.596+07	29fe3064e4bc13b14ebe69688a8b0283ad6d548bdc7c8f2e57f5149ebc59c7c7	0e25c69f-db7c-4641-9758-dc74e6a4350f	2026-11-24 20:55:58.596+07	2026-11-18 04:55:58.596+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
574	2026-11-17 20:55:58.597+07	2026-11-17 20:55:58.597+07	c4ceed7aaa96d6e3c44faa93a50a6b6812e764ecf7f486d0a587dfbac931c93a	0e25c69f-db7c-4641-9758-dc74e6a4350f	2026-11-24 20:55:58.597+07	2026-11-18 04:55:58.597+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
575	2026-11-17 20:56:26.903+07	2026-11-17 20:56:26.903+07	bc96f6425996cb632fc598ee355a4b2f7d51a7cd1b9c9136f5356754fcb4eca2	f6f8890f-c332-4e08-bd2f-11572c237811	2026-11-24 20:56:26.902+07	2026-11-18 04:56:26.902+07	2026-11-17 21:11:33.379+07	2026-11-17 21:55:46.561+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
576	2026-11-17 21:11:33.382+07	2026-11-17 21:11:33.382+07	d8da989a438d9a7ae6b1be14d3d0752696074bf74626729fe7c4fc6fa5067de4	f6f8890f-c332-4e08-bd2f-11572c237811	2026-11-24 21:11:33.382+07	2026-11-18 05:11:33.382+07	2026-11-17 21:26:33.352+07	2026-11-17 21:55:46.561+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
577	2026-11-17 21:26:33.355+07	2026-11-17 21:26:33.355+07	343034df2596c73e14c7fb960d4d2323574c1c6cd45e4fe2a4e31ae6443abbc1	f6f8890f-c332-4e08-bd2f-11572c237811	2026-11-24 21:26:33.354+07	2026-11-18 05:26:33.354+07	2026-11-17 21:55:46.353+07	2026-11-17 21:55:46.561+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
578	2026-11-17 21:55:46.361+07	2026-11-17 21:55:46.361+07	007ec98d983a37d7d8358848c6e1686bc85587767863885e88fb401e614b67db	f6f8890f-c332-4e08-bd2f-11572c237811	2026-11-24 21:55:46.36+07	2026-11-18 05:55:46.36+07	\N	2026-11-17 21:55:46.561+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
579	2026-11-17 21:55:55.826+07	2026-11-17 21:55:55.826+07	07111379cdd893b1746f8a3a673e988b455c471c02d28763a068637c26738b73	27fe7782-0fbb-44ab-a098-eff7d52b654e	2026-11-24 21:55:55.826+07	2026-11-18 05:55:55.826+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
580	2026-11-17 22:05:13.802+07	2026-11-17 22:05:13.802+07	fae6f4fdae09ce2300009ff683f82879312de35a7d8422f24f058ea8a5c2182b	d9b03928-95dc-4bc0-a551-282c32ec9848	2026-11-24 22:05:13.802+07	2026-11-18 06:05:13.802+07	2026-11-17 22:24:43.009+07	2026-11-17 22:24:43.445+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
581	2026-11-17 22:24:43.04+07	2026-11-17 22:24:43.04+07	4167c2dadfd6847ec4880c5a9265ce6b3eb0831339904513d598b537c2ca0283	d9b03928-95dc-4bc0-a551-282c32ec9848	2026-11-24 22:24:43.039+07	2026-11-18 06:24:43.039+07	\N	2026-11-17 22:24:43.445+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
582	2026-11-17 22:24:51.857+07	2026-11-17 22:24:51.857+07	dde93045af02c29ad64e2a2a893c69a41312b900f078630ba5f142face7824b9	542b3665-0fdc-4997-8d48-97c379e9ba32	2026-11-24 22:24:51.857+07	2026-11-18 06:24:51.857+07	2026-11-17 23:06:02.917+07	2026-11-17 23:06:02.917+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
583	2026-11-17 23:06:02.922+07	2026-11-17 23:06:02.922+07	986bcd5a0a8f172defbba4292fbc16ffc621ff9e2bae6dfc06bc15a86da115a8	542b3665-0fdc-4997-8d48-97c379e9ba32	2026-11-24 23:06:02.922+07	2026-11-18 07:06:02.922+07	2026-11-17 23:06:04.242+07	2026-11-17 23:06:04.242+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
584	2026-11-17 23:06:02.921+07	2026-11-17 23:06:02.921+07	b87a35698bb11dcdd486ff003867fe2a44a6410a2b0e4df646e70dedecd65078	542b3665-0fdc-4997-8d48-97c379e9ba32	2026-11-24 23:06:02.921+07	2026-11-18 07:06:02.921+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
585	2026-11-17 23:06:04.244+07	2026-11-17 23:06:04.244+07	311ede97b49623772e99482d2f0c8bd9cd84c88efa08ef510c79fc6c1e65ed82	542b3665-0fdc-4997-8d48-97c379e9ba32	2026-11-24 23:06:04.244+07	2026-11-18 07:06:04.244+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
586	2026-11-17 23:06:04.246+07	2026-11-17 23:06:04.246+07	8ba38e107317d767ae4965a151db48b455b4e2309ee78eaff90db2f0f3da093e	542b3665-0fdc-4997-8d48-97c379e9ba32	2026-11-24 23:06:04.246+07	2026-11-18 07:06:04.246+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
587	2026-11-17 23:06:12.436+07	2026-11-17 23:06:12.436+07	5fe6421852f46aed7d9aadfd6a43f429f23b86a14351e668df68c65bbb897a42	2b25b2a4-4621-455e-a4f7-7e4a1d35c972	2026-11-24 23:06:12.435+07	2026-11-18 07:06:12.435+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
588	2026-11-17 23:09:47.187+07	2026-11-17 23:09:47.187+07	020622f8b5d2edeeed4fcc9fdbdf81e298e3b7f9cb7233504c205dd0e6775f0d	aaa4d347-e1a4-4cd1-b846-b21de953c412	2026-11-24 23:09:47.187+07	2026-11-18 07:09:47.187+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
589	2026-11-17 23:11:13.924+07	2026-11-17 23:11:13.924+07	a70bc337fff1b5286346fa88b4fea84764311e4e1298afec5c872360a2cdf278	4395ae50-27c4-490e-886e-b24f233266c8	2026-11-24 23:11:13.924+07	2026-11-18 07:11:13.924+07	2026-11-17 23:26:13.543+07	2026-11-17 23:26:13.543+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
592	2026-11-18 01:30:40.664+07	2026-11-18 01:30:40.664+07	e316b013ff2705a86e9537f3ed068d1469608534a02df8ca2e4c57125d433ae5	4395ae50-27c4-490e-886e-b24f233266c8	2026-11-25 01:30:40.664+07	2026-11-18 09:30:40.664+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
593	2026-11-18 01:30:53.791+07	2026-11-18 01:30:53.791+07	15fc3e59848531ba73d2e4e1d95f75cc0c68994559c18d7015e4c37af1f7d38d	48fb2444-5c38-48e8-b23a-3337423d01b0	2026-11-25 01:30:53.791+07	2026-11-18 09:30:53.791+07	2026-11-18 01:31:06.962+07	2026-11-18 01:31:06.962+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
594	2026-11-18 01:31:06.963+07	2026-11-18 01:31:06.963+07	40c8d8cf7e6f72fec815f20d1d85ac2ac977c258307a34f307cf1f9f42ed9cd6	48fb2444-5c38-48e8-b23a-3337423d01b0	2026-11-25 01:31:06.963+07	2026-11-18 09:31:06.963+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
595	2026-11-18 01:31:06.964+07	2026-11-18 01:31:06.964+07	ac402ba7a6bd3f11393ae400d917eb4ef39a23c3a5912f9f3b7828575134bba4	48fb2444-5c38-48e8-b23a-3337423d01b0	2026-11-25 01:31:06.964+07	2026-11-18 09:31:06.964+07	2026-11-18 01:32:31.301+07	2026-11-18 01:32:31.301+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
596	2026-11-18 01:32:31.303+07	2026-11-18 01:32:31.303+07	03ecc8bae2f52ab7448059e56c96baf5d375bd511ee1380fb4abb0cc8ecaeff4	48fb2444-5c38-48e8-b23a-3337423d01b0	2026-11-25 01:32:31.303+07	2026-11-18 09:32:31.303+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
597	2026-11-18 01:32:31.304+07	2026-11-18 01:32:31.304+07	502c7a9b3c50e6a857d11f65ba299b354e0231259777878263b8e028345f7466	48fb2444-5c38-48e8-b23a-3337423d01b0	2026-11-25 01:32:31.304+07	2026-11-18 09:32:31.304+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
613	2026-11-23 09:47:20.754+07	2026-11-23 09:47:20.754+07	b142732283de7910fdeceff5ff94e459012ae40b60dc71f1f948cc16a172abf5	7c388a08-7686-4374-9a5e-2dafad17d928	2026-12-23 09:47:20.754+07	2026-11-25 09:47:20.754+07	2026-11-23 11:47:53.36337+07	2026-11-23 11:47:53.36337+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36 Edg/158.0.0.0	127.0.0.1	29
53	2026-11-14 15:25:07.005+07	2026-11-14 15:25:07.005+07	2d2855412738877dbbc9643ef329e71d95dba26b56155855d4297366da23f9b6	8d15ea60-d606-48b2-9f23-80317e03f9c8	2026-11-21 15:25:07.003+07	2026-11-14 23:25:07.003+07	2026-11-14 15:26:09.129+07	2026-11-14 15:26:09.171+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
54	2026-11-14 15:26:09.136+07	2026-11-14 15:26:09.136+07	91db0223cf422d3659c6ca75f8387d34d31ebdf3eddd19d08d9c6a7af073f642	8d15ea60-d606-48b2-9f23-80317e03f9c8	2026-11-21 15:26:09.135+07	2026-11-14 23:26:09.135+07	\N	2026-11-14 15:26:09.171+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
56	2026-11-14 15:29:19.691+07	2026-11-14 15:29:19.691+07	930adf7e67f636b29deff19f7b051d9bbaea99096cfd6831fd102fa413a95c65	0f11a641-9df8-4450-a57d-97e493c89452	2026-11-21 15:29:19.691+07	2026-11-14 23:29:19.691+07	2026-11-14 15:32:25.146+07	2026-11-14 15:46:14.504+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
57	2026-11-14 15:32:25.146+07	2026-11-14 15:32:25.146+07	e51d81df4d6c3859fd2c047cf3893aa7328857c6d37be7a84e49f45af483048d	0f11a641-9df8-4450-a57d-97e493c89452	2026-11-21 15:32:25.146+07	2026-11-14 23:32:25.146+07	\N	2026-11-14 15:46:14.504+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
58	2026-11-14 15:32:25.151+07	2026-11-14 15:32:25.151+07	9b3734398484b41bd9ea97589941006caaddb5eabaccf21b144f78c1293d9a2a	0f11a641-9df8-4450-a57d-97e493c89452	2026-11-21 15:32:25.146+07	2026-11-14 23:32:25.146+07	2026-11-14 15:33:15.173+07	2026-11-14 15:46:14.504+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
59	2026-11-14 15:33:15.173+07	2026-11-14 15:33:15.173+07	99d13d2596e719d45aa56eda1a8188275e6c3202fb37f9c3c59514f0bd58adc3	0f11a641-9df8-4450-a57d-97e493c89452	2026-11-21 15:33:15.173+07	2026-11-14 23:33:15.173+07	\N	2026-11-14 15:46:14.504+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
60	2026-11-14 15:33:15.173+07	2026-11-14 15:33:15.173+07	ddc3f0e1e44ac8edc65611b0db6f26770df270dc205fcd827fd487cc5bee08c4	0f11a641-9df8-4450-a57d-97e493c89452	2026-11-21 15:33:15.173+07	2026-11-14 23:33:15.173+07	2026-11-14 15:46:12.376+07	2026-11-14 15:46:14.504+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
61	2026-11-14 15:46:12.382+07	2026-11-14 15:46:12.382+07	2989d1d381f2f30bb8b26b4235ad8a13e711245772c3b880c59a70f3cb539082	0f11a641-9df8-4450-a57d-97e493c89452	2026-11-21 15:46:12.381+07	2026-11-14 23:46:12.381+07	\N	2026-11-14 15:46:14.504+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
62	2026-11-14 15:46:12.384+07	2026-11-14 15:46:12.384+07	7206a4490d37f4860f767c7a93db0257632adf01b648bc12a6e1bcaffbe8a2d5	0f11a641-9df8-4450-a57d-97e493c89452	2026-11-21 15:46:12.383+07	2026-11-14 23:46:12.383+07	2026-11-14 15:46:14.483+07	2026-11-14 15:46:14.504+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
63	2026-11-14 15:46:14.49+07	2026-11-14 15:46:14.49+07	c1d3a2e7e23ab65d1cee795cb9e64bb64425a6545265101aa466a91820b06456	0f11a641-9df8-4450-a57d-97e493c89452	2026-11-21 15:46:14.49+07	2026-11-14 23:46:14.49+07	\N	2026-11-14 15:46:14.504+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
64	2026-11-14 15:46:17.671+07	2026-11-14 15:46:17.671+07	084f96ffee2fe1b4cd475f9c195f06f7370be29ed491901166c7cabec7b984fc	7713052b-0ba5-412f-ac86-131b64449f3f	2026-11-21 15:46:17.671+07	2026-11-14 23:46:17.671+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
65	2026-11-14 15:50:41.582+07	2026-11-14 15:50:41.582+07	c147a4186733dc13a3070ca17a627f7cdc9d83cbfd18e01d3ac1a224a677326f	74010df4-e0e9-41f1-9f09-e3ffdf6b34ce	2026-11-21 15:50:41.578+07	2026-11-14 23:50:41.578+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
66	2026-11-14 15:51:10.238+07	2026-11-14 15:51:10.238+07	46f49b315f95af71a4d06ed8bc8dfdb2e2834992db8f72981e24e8824fc324d2	d38b7fd9-bc4e-415d-b514-1ea300e7bba6	2026-11-21 15:51:10.238+07	2026-11-14 23:51:10.238+07	2026-11-14 16:06:30.538+07	2026-11-14 16:06:41.74+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
67	2026-11-14 16:06:30.538+07	2026-11-14 16:06:30.538+07	746549a50c697bb5870156059d1d0eac01d05b675acfd52c2812f572726abf60	d38b7fd9-bc4e-415d-b514-1ea300e7bba6	2026-11-21 16:06:30.538+07	2026-11-15 00:06:30.538+07	\N	2026-11-14 16:06:41.74+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
68	2026-11-14 16:06:30.538+07	2026-11-14 16:06:30.538+07	982be1bbfa6e475252da07ac922c64032ad2557b286b16d4dc127a1120ea1136	d38b7fd9-bc4e-415d-b514-1ea300e7bba6	2026-11-21 16:06:30.538+07	2026-11-15 00:06:30.538+07	2026-11-14 16:06:40.669+07	2026-11-14 16:06:41.74+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
69	2026-11-14 16:06:40.669+07	2026-11-14 16:06:40.669+07	e9723eb508856f975b00d0ebec190cf752ca548848e26d7dc9bc29f0f0f7dba3	d38b7fd9-bc4e-415d-b514-1ea300e7bba6	2026-11-21 16:06:40.669+07	2026-11-15 00:06:40.669+07	\N	2026-11-14 16:06:41.74+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
70	2026-11-14 16:06:44.86+07	2026-11-14 16:06:44.86+07	56d9fcb028b279d35aef1a13793dea2026054d85633126ff59bec9e2b2916058	0c98c1b3-088c-458f-8466-3c9ddbcb508e	2026-11-21 16:06:44.857+07	2026-11-15 00:06:44.857+07	2026-11-14 17:04:07.045+07	2026-11-14 17:04:07.045+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
100	2026-11-14 17:04:07.063+07	2026-11-14 17:04:07.063+07	6eea5ff77b12f58988437dc18bafc797b0b47ae3b756580f1de254f60d5d5ae2	0c98c1b3-088c-458f-8466-3c9ddbcb508e	2026-11-21 17:04:07.063+07	2026-11-15 01:04:07.063+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
101	2026-11-14 17:04:07.068+07	2026-11-14 17:04:07.068+07	695f949b950571bf6f050e76e63ceccb70c4b9c36235cb2ebce57a514015ba9c	0c98c1b3-088c-458f-8466-3c9ddbcb508e	2026-11-21 17:04:07.068+07	2026-11-15 01:04:07.068+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
102	2026-11-14 17:04:10.961+07	2026-11-14 17:04:10.961+07	72aaae5ce7c74c72241d6140b5b08b42f90973a22eb7699f84d7c1f25d24db31	c218def8-2c3a-4f56-9475-5f3979a93036	2026-11-21 17:04:10.961+07	2026-11-15 01:04:10.961+07	2026-11-14 17:10:24.055+07	2026-11-14 17:17:17.032+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
103	2026-11-14 17:10:24.056+07	2026-11-14 17:10:24.056+07	ba3f02ea7b184cd5081c2e73006f23b56e6a9ca2375ef1d9a5d971204aea7169	c218def8-2c3a-4f56-9475-5f3979a93036	2026-11-21 17:10:24.056+07	2026-11-15 01:10:24.056+07	2026-11-14 17:17:12.252+07	2026-11-14 17:17:17.032+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
104	2026-11-14 17:10:24.056+07	2026-11-14 17:10:24.056+07	16ea4793d2058495db2fa06f09f7098769e13bb1dc5890ccbd92f77e55a52f49	c218def8-2c3a-4f56-9475-5f3979a93036	2026-11-21 17:10:24.056+07	2026-11-15 01:10:24.056+07	\N	2026-11-14 17:17:17.032+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
105	2026-11-14 17:17:12.255+07	2026-11-14 17:17:12.255+07	c9921ecf7d6836ab708ea201381b560607c62c78b3e343872f69a9a24a4d413e	c218def8-2c3a-4f56-9475-5f3979a93036	2026-11-21 17:17:12.255+07	2026-11-15 01:17:12.255+07	\N	2026-11-14 17:17:17.032+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
106	2026-11-14 17:17:12.257+07	2026-11-14 17:17:12.257+07	4167c929fd33901fbe9972fb01dc8a4e458dccffcfded75475869ab0263455a1	c218def8-2c3a-4f56-9475-5f3979a93036	2026-11-21 17:17:12.255+07	2026-11-15 01:17:12.255+07	2026-11-14 17:17:17.028+07	2026-11-14 17:17:17.032+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
107	2026-11-14 17:17:17.031+07	2026-11-14 17:17:17.031+07	59f11daa2e93a8382e03ce7d0e13784fcf72a2aa549b66c5f0d74c4615a6badd	c218def8-2c3a-4f56-9475-5f3979a93036	2026-11-21 17:17:17.031+07	2026-11-15 01:17:17.031+07	\N	2026-11-14 17:17:17.032+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
108	2026-11-14 17:17:26.335+07	2026-11-14 17:17:26.335+07	18c18c6271a63129da3b0a5228b925212d846f63e2ccacf484d24cbb0e71f7ab	2bf33a8f-8666-4a70-a935-0e129ca95799	2026-11-21 17:17:26.335+07	2026-11-15 01:17:26.335+07	2026-11-14 17:24:40.622+07	2026-11-14 17:24:42.58+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
109	2026-11-14 17:24:40.63+07	2026-11-14 17:24:40.63+07	2e2d398c4eff8e864b062591c8b9739eb6c3abb5887017e9dd04d3efd2354cdc	2bf33a8f-8666-4a70-a935-0e129ca95799	2026-11-21 17:24:40.627+07	2026-11-15 01:24:40.627+07	2026-11-14 17:24:41.792+07	2026-11-14 17:24:42.58+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
110	2026-11-14 17:24:40.637+07	2026-11-14 17:24:40.637+07	35589f28f8c6b509724010b4f728b978cd2d365e0564cb39ba1b1152d1623653	2bf33a8f-8666-4a70-a935-0e129ca95799	2026-11-21 17:24:40.637+07	2026-11-15 01:24:40.637+07	\N	2026-11-14 17:24:42.58+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
111	2026-11-14 17:24:41.802+07	2026-11-14 17:24:41.802+07	935a89adc063c80dd07cd5d9f4252cb16235cc68d21beeea93ed5580172cc678	2bf33a8f-8666-4a70-a935-0e129ca95799	2026-11-21 17:24:41.801+07	2026-11-15 01:24:41.801+07	\N	2026-11-14 17:24:42.58+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
112	2026-11-14 17:24:48.423+07	2026-11-14 17:24:48.423+07	7e6419ce15557f3fa817502815b91a12dc9eaae0d0365c8642bf6ebee2b098a7	486ded9a-18ed-4ce8-b81a-1ead8dc86626	2026-11-21 17:24:48.423+07	2026-11-15 01:24:48.423+07	2026-11-14 17:32:18.996+07	2026-11-14 17:32:18.996+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
113	2026-11-14 17:32:18.996+07	2026-11-14 17:32:18.996+07	ab27bed7397d59a13546d5f606828b68c15e051f61c10ed9ba910255aaaf3028	486ded9a-18ed-4ce8-b81a-1ead8dc86626	2026-11-21 17:32:18.996+07	2026-11-15 01:32:18.996+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
114	2026-11-14 17:32:18.996+07	2026-11-14 17:32:18.996+07	15c699c1e9afb0b6b1e0652493b1359874a96ed566325257b0790f1137944a48	486ded9a-18ed-4ce8-b81a-1ead8dc86626	2026-11-21 17:32:18.996+07	2026-11-15 01:32:18.996+07	2026-11-14 17:32:21.406+07	2026-11-14 17:32:21.406+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
115	2026-11-14 17:32:21.406+07	2026-11-14 17:32:21.406+07	2a284d5d6ea24aab162342071ac9a77f496a41ea47558778152219d00526e24c	486ded9a-18ed-4ce8-b81a-1ead8dc86626	2026-11-21 17:32:21.406+07	2026-11-15 01:32:21.406+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
116	2026-11-14 17:32:21.406+07	2026-11-14 17:32:21.406+07	19e135aacc6b045f789604d959156eb729583ee96a633c43bcea8700dc123025	486ded9a-18ed-4ce8-b81a-1ead8dc86626	2026-11-21 17:32:21.406+07	2026-11-15 01:32:21.406+07	2026-11-14 17:37:26.596+07	2026-11-14 17:37:26.596+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
117	2026-11-14 17:37:26.596+07	2026-11-14 17:37:26.596+07	130c08844a0a30fd173b29631f8dcbc5bed587db426f356ae5ee4b29f86d7691	486ded9a-18ed-4ce8-b81a-1ead8dc86626	2026-11-21 17:37:26.596+07	2026-11-15 01:37:26.596+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
118	2026-11-14 17:37:26.596+07	2026-11-14 17:37:26.596+07	074a86ec9163be7e5e6d561b3680b5a1a9b0e666bba395040d872484f4be21eb	486ded9a-18ed-4ce8-b81a-1ead8dc86626	2026-11-21 17:37:26.596+07	2026-11-15 01:37:26.596+07	2026-11-14 17:42:41.577+07	2026-11-14 17:42:41.577+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
119	2026-11-14 17:42:41.581+07	2026-11-14 17:42:41.581+07	2179b9a2cffde1520f4e2b0c4f5e77c10c95a0086e50cc7e1ab046dd3924a131	486ded9a-18ed-4ce8-b81a-1ead8dc86626	2026-11-21 17:42:41.58+07	2026-11-15 01:42:41.58+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
120	2026-11-14 17:42:41.582+07	2026-11-14 17:42:41.582+07	80d98cf983b87790b941c85c1fab96e25562f9f4fc83356c155ae9cf2c68c6aa	486ded9a-18ed-4ce8-b81a-1ead8dc86626	2026-11-21 17:42:41.582+07	2026-11-15 01:42:41.582+07	2026-11-14 17:44:13.768+07	2026-11-14 17:44:13.768+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
121	2026-11-14 17:44:13.771+07	2026-11-14 17:44:13.771+07	977f1d5479a1e771c58b463294e804eb882f1287f59e01ca1e2bf929f8878cc0	486ded9a-18ed-4ce8-b81a-1ead8dc86626	2026-11-21 17:44:13.771+07	2026-11-15 01:44:13.771+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
122	2026-11-14 17:44:13.773+07	2026-11-14 17:44:13.773+07	bc18ff6f4b5b4d57d2bd4ff05c02dd3199e9811bf663c4903ca4e6ee093e30ca	486ded9a-18ed-4ce8-b81a-1ead8dc86626	2026-11-21 17:44:13.773+07	2026-11-15 01:44:13.773+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
123	2026-11-14 17:44:19.146+07	2026-11-14 17:44:19.146+07	2a242ecb78616e053e552976f0cbe6eb8a3fe3547850aa67ac2a91278cd2ba1c	16b655d1-3d2b-4d15-9aa4-85d55d7c3031	2026-11-21 17:44:19.146+07	2026-11-15 01:44:19.146+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
124	2026-11-14 17:45:05.994+07	2026-11-14 17:45:05.994+07	23e18d23d8f67d40427642a4c51c7c518e0e1f3039d119290c4056d551715f23	85d56497-3d66-4ad4-afc3-ea9fb6e940f5	2026-11-21 17:45:05.994+07	2026-11-15 01:45:05.994+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
125	2026-11-14 17:48:12.253+07	2026-11-14 17:48:12.253+07	bf328651e1699d95102676b45870f101fa552874e40b8366d3675971cafacbed	648a29f7-ba13-4285-97a1-630000741677	2026-11-21 17:48:12.253+07	2026-11-15 01:48:12.253+07	2026-11-14 17:59:51.461+07	2026-11-14 17:59:51.461+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
126	2026-11-14 17:59:51.467+07	2026-11-14 17:59:51.467+07	97160ed63048c5dbd7a28eb61f459b8c3789a51276345c5ea12e071cb0812203	648a29f7-ba13-4285-97a1-630000741677	2026-11-21 17:59:51.467+07	2026-11-15 01:59:51.467+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
127	2026-11-14 17:59:51.467+07	2026-11-14 17:59:51.467+07	498eb23a4a0606445a3d5c1351ac80ee7488a08a149579efa3577ea1bb78352a	648a29f7-ba13-4285-97a1-630000741677	2026-11-21 17:59:51.467+07	2026-11-15 01:59:51.467+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
128	2026-11-14 17:59:57.806+07	2026-11-14 17:59:57.806+07	8d114b3067a911e620ffbf94ba32c8c3f1cf90578eb75be53fd8cd690ea81fcf	aa13cb75-d963-4b1b-b33f-10b44c3824f2	2026-11-21 17:59:57.806+07	2026-11-15 01:59:57.806+07	2026-11-14 18:04:36.108+07	2026-11-14 18:04:36.108+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
129	2026-11-14 18:04:36.108+07	2026-11-14 18:04:36.108+07	077466d0478c366e550015e7c33795581268c33c0864cf838e1aaff8b130e6c2	aa13cb75-d963-4b1b-b33f-10b44c3824f2	2026-11-21 18:04:36.108+07	2026-11-15 02:04:36.108+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
130	2026-11-14 18:04:36.114+07	2026-11-14 18:04:36.114+07	9e0378ee3a2e28db8f913c52764a68635e755c77f65d4249b91cc2782c09296f	aa13cb75-d963-4b1b-b33f-10b44c3824f2	2026-11-21 18:04:36.114+07	2026-11-15 02:04:36.114+07	2026-11-14 18:26:07.473+07	2026-11-14 18:26:07.473+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
131	2026-11-14 18:26:07.479+07	2026-11-14 18:26:07.479+07	6e540e9209e1453b8d83d4e18302af77589560c402907a24598edd52ff42f02b	aa13cb75-d963-4b1b-b33f-10b44c3824f2	2026-11-21 18:26:07.479+07	2026-11-15 02:26:07.479+07	2026-11-14 18:26:08.639+07	2026-11-14 18:26:08.639+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
132	2026-11-14 18:26:07.479+07	2026-11-14 18:26:07.479+07	4aef6c38a2da0cde0009ed0d5d5ab6cfdd48d5a2b75301997a24d30722e5a436	aa13cb75-d963-4b1b-b33f-10b44c3824f2	2026-11-21 18:26:07.479+07	2026-11-15 02:26:07.479+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
133	2026-11-14 18:26:08.645+07	2026-11-14 18:26:08.645+07	3abe15dacc3986d30f7e2d79abc1f292f7137a3a41fa9d30410ad0fc724f1671	aa13cb75-d963-4b1b-b33f-10b44c3824f2	2026-11-21 18:26:08.645+07	2026-11-15 02:26:08.645+07	2026-11-14 18:29:11.773+07	2026-11-14 18:29:11.773+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
134	2026-11-14 18:26:08.645+07	2026-11-14 18:26:08.645+07	dfa218788a696d82f93575477b9dc270e7314689ace54752554ca3485386ed0c	aa13cb75-d963-4b1b-b33f-10b44c3824f2	2026-11-21 18:26:08.645+07	2026-11-15 02:26:08.645+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
135	2026-11-14 18:29:11.774+07	2026-11-14 18:29:11.774+07	b414b93f8047789c057654b1694ab2939d60446f41d80a604682207d36198278	aa13cb75-d963-4b1b-b33f-10b44c3824f2	2026-11-21 18:29:11.774+07	2026-11-15 02:29:11.774+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
136	2026-11-14 18:29:11.776+07	2026-11-14 18:29:11.776+07	da4c0a40b356b2f07c098777ec8cec6075d1596b82ba766e341658bcbc5cf68f	aa13cb75-d963-4b1b-b33f-10b44c3824f2	2026-11-21 18:29:11.776+07	2026-11-15 02:29:11.776+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
137	2026-11-14 18:30:08.801+07	2026-11-14 18:30:08.801+07	987a92004eda60ed61475a311a2460a0df17a1d2820594e7777d94b34f85b287	15e48d6e-f01c-41d9-849a-11bd7906b6c6	2026-11-21 18:30:08.801+07	2026-11-15 02:30:08.801+07	2026-11-14 18:30:32.247+07	2026-11-14 18:30:32.247+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
138	2026-11-14 18:30:32.248+07	2026-11-14 18:30:32.248+07	698c41e9f445e76db4a46e3919d23b03a04e47e66984d195cbd186d2a7ec376e	15e48d6e-f01c-41d9-849a-11bd7906b6c6	2026-11-21 18:30:32.248+07	2026-11-15 02:30:32.248+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
139	2026-11-14 18:30:32.248+07	2026-11-14 18:30:32.248+07	858d164244c69ed0ac1b8bdc5aa701e10a4fca0ad219a5c6a8f9c868ad2b8182	15e48d6e-f01c-41d9-849a-11bd7906b6c6	2026-11-21 18:30:32.248+07	2026-11-15 02:30:32.248+07	2026-11-14 18:30:56.925+07	2026-11-14 18:30:56.925+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
140	2026-11-14 18:30:56.925+07	2026-11-14 18:30:56.925+07	71e540a7aefd723612df170554eaaa2cbc5012bbc65b889c39f41c304c338e7d	15e48d6e-f01c-41d9-849a-11bd7906b6c6	2026-11-21 18:30:56.925+07	2026-11-15 02:30:56.925+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
141	2026-11-14 18:30:56.925+07	2026-11-14 18:30:56.925+07	ef944247c7c1c85afc3a9d7afd2f7016084b06b2fb3ecdeb5b779cc8151e85da	15e48d6e-f01c-41d9-849a-11bd7906b6c6	2026-11-21 18:30:56.925+07	2026-11-15 02:30:56.925+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
142	2026-11-14 18:31:05.528+07	2026-11-14 18:31:05.528+07	7fc3984eedb5c82f08939c231951763e0a4f557926d1d757c6f719af467fcbf4	577e5745-d42b-4579-8fef-951359343b42	2026-11-21 18:31:05.528+07	2026-11-15 02:31:05.528+07	2026-11-14 18:34:41.86+07	2026-11-14 18:34:41.86+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
143	2026-11-14 18:34:41.86+07	2026-11-14 18:34:41.86+07	470ebda09e5e8265b51d4cbf0e6e7052ea241aca5c6632683421628bbd8b1c36	577e5745-d42b-4579-8fef-951359343b42	2026-11-21 18:34:41.86+07	2026-11-15 02:34:41.86+07	2026-11-14 18:35:21.56+07	2026-11-14 18:35:21.56+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
144	2026-11-14 18:34:41.86+07	2026-11-14 18:34:41.86+07	d2d2ef136a1790cc8dc955f2fb5afc7d1241bfd358cd1f11debd2b6ec8f478fc	577e5745-d42b-4579-8fef-951359343b42	2026-11-21 18:34:41.86+07	2026-11-15 02:34:41.86+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
145	2026-11-14 18:35:21.562+07	2026-11-14 18:35:21.562+07	fc57bc445e54d145b74745b9a48ea1ad706c2a7587075cdb6be57b0faa484f0d	577e5745-d42b-4579-8fef-951359343b42	2026-11-21 18:35:21.562+07	2026-11-15 02:35:21.562+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
146	2026-11-14 18:35:21.563+07	2026-11-14 18:35:21.563+07	4357511de577bf95155299b19771e538678e4f2c563a69e466f9463090fddc4e	577e5745-d42b-4579-8fef-951359343b42	2026-11-21 18:35:21.562+07	2026-11-15 02:35:21.562+07	2026-11-14 18:35:21.842+07	2026-11-14 18:35:21.842+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
147	2026-11-14 18:35:21.845+07	2026-11-14 18:35:21.845+07	777edd3f351a8c1208d0edcff17d5ba2a86e77b67a2eb18ddae91cc8965195d6	577e5745-d42b-4579-8fef-951359343b42	2026-11-21 18:35:21.844+07	2026-11-15 02:35:21.844+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
148	2026-11-14 18:35:21.845+07	2026-11-14 18:35:21.845+07	a137f92fd3243aea397c050e745d3182878e16104c726d647bb839646b0af224	577e5745-d42b-4579-8fef-951359343b42	2026-11-21 18:35:21.845+07	2026-11-15 02:35:21.845+07	2026-11-14 18:35:47.583+07	2026-11-14 18:35:47.583+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
149	2026-11-14 18:35:47.585+07	2026-11-14 18:35:47.585+07	ad5559fd09a5e78add13d268386d1cdaca8b78dfd88d5035a91d778fd2d60e62	577e5745-d42b-4579-8fef-951359343b42	2026-11-21 18:35:47.584+07	2026-11-15 02:35:47.584+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
150	2026-11-14 18:35:47.588+07	2026-11-14 18:35:47.588+07	4b8547cad57fc202bf68a003ceb769faf2ec9436b0fe049ad4e4af846aefc62a	577e5745-d42b-4579-8fef-951359343b42	2026-11-21 18:35:47.587+07	2026-11-15 02:35:47.587+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
151	2026-11-14 18:52:29.951+07	2026-11-14 18:52:29.951+07	7a53d638dbc2ea382235bb685133dbbf272af00af3d47c0c80440aaf1201f297	9d9f39e4-3e7a-404a-964a-47265ef209c5	2026-11-21 18:52:29.951+07	2026-11-15 02:52:29.951+07	2026-11-14 19:05:42.466+07	2026-11-14 19:05:54.467+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
152	2026-11-14 19:05:42.47+07	2026-11-14 19:05:42.47+07	2208b9bc7e4b6ce7bedc278e8476a27616b98d91e0c0c0031c1a748bf0833151	9d9f39e4-3e7a-404a-964a-47265ef209c5	2026-11-21 19:05:42.47+07	2026-11-15 03:05:42.47+07	\N	2026-11-14 19:05:54.467+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
153	2026-11-14 19:05:42.47+07	2026-11-14 19:05:42.47+07	807b56400f9bfcedc986aa5b7d6cafc8bccedefaa311a894758ba7ab1bc61250	9d9f39e4-3e7a-404a-964a-47265ef209c5	2026-11-21 19:05:42.47+07	2026-11-15 03:05:42.47+07	2026-11-14 19:05:46.459+07	2026-11-14 19:05:54.467+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
154	2026-11-14 19:05:46.459+07	2026-11-14 19:05:46.459+07	eab430d21a6fe9bdc2da0c2ddf559591d7548842f12fa556f457888b78a1f245	9d9f39e4-3e7a-404a-964a-47265ef209c5	2026-11-21 19:05:46.459+07	2026-11-15 03:05:46.459+07	\N	2026-11-14 19:05:54.467+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
155	2026-11-14 19:05:46.459+07	2026-11-14 19:05:46.459+07	5dad845aa0fd62140d584c8575d7411faa6ae6cbf6720e003928fe883464ec89	9d9f39e4-3e7a-404a-964a-47265ef209c5	2026-11-21 19:05:46.459+07	2026-11-15 03:05:46.459+07	2026-11-14 19:05:47.507+07	2026-11-14 19:05:54.467+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
156	2026-11-14 19:05:47.509+07	2026-11-14 19:05:47.509+07	0a0fcea6e6c1d176cfc5ce01e6c66e8ce7c4e438c44336c727823c4ea542877b	9d9f39e4-3e7a-404a-964a-47265ef209c5	2026-11-21 19:05:47.507+07	2026-11-15 03:05:47.507+07	\N	2026-11-14 19:05:54.467+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
157	2026-11-14 19:05:47.509+07	2026-11-14 19:05:47.509+07	c7c83b782069eb955704c1d2a285ae723a219d2f9336d630d6e208a8f5012714	9d9f39e4-3e7a-404a-964a-47265ef209c5	2026-11-21 19:05:47.509+07	2026-11-15 03:05:47.509+07	2026-11-14 19:05:54.467+07	2026-11-14 19:05:54.467+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
158	2026-11-14 19:05:54.467+07	2026-11-14 19:05:54.467+07	2987394684cac33404c35396020975f65f168ca2969f4da04e3dfb15923531e4	9d9f39e4-3e7a-404a-964a-47265ef209c5	2026-11-21 19:05:54.467+07	2026-11-15 03:05:54.467+07	\N	2026-11-14 19:05:54.467+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
159	2026-11-14 19:05:58.519+07	2026-11-14 19:05:58.519+07	afb62bb63e2c517c30052e8fc4eb6f719a6e563552a434f0c7569fab96978c7a	860ac4d8-cc0a-4a4f-9993-f457b35a961e	2026-11-21 19:05:58.519+07	2026-11-15 03:05:58.519+07	2026-11-14 19:06:52.358+07	2026-11-14 19:06:53.498+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
160	2026-11-14 19:06:52.358+07	2026-11-14 19:06:52.358+07	66c50729cdb47e08b7bce35f43b5fc21596991ad906dc0d8cd6c20db6433d3de	860ac4d8-cc0a-4a4f-9993-f457b35a961e	2026-11-21 19:06:52.358+07	2026-11-15 03:06:52.358+07	\N	2026-11-14 19:06:53.498+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
161	2026-11-14 19:06:56.703+07	2026-11-14 19:06:56.703+07	932b97c693c49448315a196f17ec4cd85f2f6e25e9edba5c75001bfe06ad91d6	cae51052-0095-4a9b-8ce8-567a766d47dc	2026-11-21 19:06:56.702+07	2026-11-15 03:06:56.702+07	2026-11-14 19:10:12.202+07	2026-11-14 19:10:12.209+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
162	2026-11-14 19:10:12.208+07	2026-11-14 19:10:12.208+07	219a5083e86f381fafc2e09317eb402cfe9558bc2d90d36b940bf115e6ddc112	cae51052-0095-4a9b-8ce8-567a766d47dc	2026-11-21 19:10:12.208+07	2026-11-15 03:10:12.208+07	\N	2026-11-14 19:10:12.209+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
163	2026-11-14 19:10:19.228+07	2026-11-14 19:10:19.228+07	f9bc7e2bd22aa61a080874e481d610009fb141c2e4ea39a501cc00ef69194ef4	a590effa-e22c-4f8f-83f1-e2798104ccfe	2026-11-21 19:10:19.228+07	2026-11-15 03:10:19.228+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
164	2026-11-14 19:10:25.893+07	2026-11-14 19:10:25.893+07	159dfce1012cfe3715193abaa8e742f376e436a0c1d974fb8af9a1be9b6c9e98	a8820d03-a6d4-4336-9512-048ff637cc1f	2026-11-21 19:10:25.893+07	2026-11-15 03:10:25.893+07	2026-11-14 19:32:43.55+07	2026-11-14 19:38:47.953+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
165	2026-11-14 19:32:43.56+07	2026-11-14 19:32:43.56+07	343273fbc5440aa2444a9081dfc60d68d2ceafe07869ec526fa84e6aed7abb8a	a8820d03-a6d4-4336-9512-048ff637cc1f	2026-11-21 19:32:43.56+07	2026-11-15 03:32:43.56+07	\N	2026-11-14 19:38:47.953+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
166	2026-11-14 19:32:43.56+07	2026-11-14 19:32:43.56+07	daef5ac41326dc541290e6f51517e97e56514cd7df8de43901c20d568c284bf9	a8820d03-a6d4-4336-9512-048ff637cc1f	2026-11-21 19:32:43.558+07	2026-11-15 03:32:43.558+07	2026-11-14 19:32:45.007+07	2026-11-14 19:38:47.953+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
167	2026-11-14 19:32:45.007+07	2026-11-14 19:32:45.007+07	41c565128344fc39f1c53dc236c35d228edf99b86d4195ae98de7f0ff6bbe3bd	a8820d03-a6d4-4336-9512-048ff637cc1f	2026-11-21 19:32:45.007+07	2026-11-15 03:32:45.007+07	\N	2026-11-14 19:38:47.953+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
168	2026-11-14 19:32:51.381+07	2026-11-14 19:32:51.381+07	ec0751171dcc816cf14ad1818be8c39a31223aef1ff0590761bf5befd7ef4ba0	e234f261-2090-4cf8-a49c-37c3889e00fa	2026-11-21 19:32:51.381+07	2026-11-15 03:32:51.381+07	2026-11-14 19:45:45.432+07	2026-11-14 20:18:40.095+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
169	2026-11-14 19:38:50.507+07	2026-11-14 19:38:50.507+07	31180975a61c758c9cb5919516c999dc20cf8992e49fc1f96e7d44666111c12b	5bbb03f0-bc7f-4516-98c1-b96cb6797fa7	2026-11-21 19:38:50.507+07	2026-11-15 03:38:50.507+07	2026-11-14 19:45:32.68+07	2026-11-14 19:45:32.68+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
170	2026-11-14 19:45:32.687+07	2026-11-14 19:45:32.687+07	e27ddd54e594f9392013ad96ca4947a95843c588ff6815b203f45b832981e5c4	5bbb03f0-bc7f-4516-98c1-b96cb6797fa7	2026-11-21 19:45:32.687+07	2026-11-15 03:45:32.687+07	2026-11-14 20:02:50.177+07	2026-11-14 20:02:50.177+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
171	2026-11-14 19:45:32.687+07	2026-11-14 19:45:32.687+07	a9dba2bc4775432b1846e5b6c525720727934a65c5d310ae3b400b7a4c850f05	5bbb03f0-bc7f-4516-98c1-b96cb6797fa7	2026-11-21 19:45:32.687+07	2026-11-15 03:45:32.687+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
172	2026-11-14 19:45:45.434+07	2026-11-14 19:45:45.434+07	6872c7b9defb667fe7f8efc8e39e1b6c4af5cfcb4e21df6ad9e5a3cb56602a32	e234f261-2090-4cf8-a49c-37c3889e00fa	2026-11-21 19:45:45.434+07	2026-11-15 03:45:45.434+07	\N	2026-11-14 20:18:40.095+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
173	2026-11-14 19:45:45.434+07	2026-11-14 19:45:45.434+07	2b02013d6c5faa73957e59339ba62741867eee6a09f1516611ba7f89cc69758e	e234f261-2090-4cf8-a49c-37c3889e00fa	2026-11-21 19:45:45.434+07	2026-11-15 03:45:45.434+07	2026-11-14 19:46:40.07+07	2026-11-14 20:18:40.095+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
174	2026-11-14 19:46:40.07+07	2026-11-14 19:46:40.07+07	6b2f4fabf61800ec3d22e2b4549b439e4c643b19c22c37187f74fd10f492fe48	e234f261-2090-4cf8-a49c-37c3889e00fa	2026-11-21 19:46:40.07+07	2026-11-15 03:46:40.07+07	\N	2026-11-14 20:18:40.095+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
175	2026-11-14 19:46:40.07+07	2026-11-14 19:46:40.07+07	c1f0da45c7e6adaa736d6446a0f838e40fc9f406c2b3dbbbc4a5bc7019adbb40	e234f261-2090-4cf8-a49c-37c3889e00fa	2026-11-21 19:46:40.07+07	2026-11-15 03:46:40.07+07	2026-11-14 19:46:57.913+07	2026-11-14 20:18:40.095+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
176	2026-11-14 19:46:57.913+07	2026-11-14 19:46:57.913+07	7ba238350e39d284a9597e2f46326e6afc40d87b201ac040db8dbb8a473d6c63	e234f261-2090-4cf8-a49c-37c3889e00fa	2026-11-21 19:46:57.913+07	2026-11-15 03:46:57.913+07	\N	2026-11-14 20:18:40.095+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
177	2026-11-14 19:46:57.929+07	2026-11-14 19:46:57.929+07	c8b20186be53ffed906791f2094cd23d85eec1f86ad8b5a676091ace24a5a2e6	e234f261-2090-4cf8-a49c-37c3889e00fa	2026-11-21 19:46:57.929+07	2026-11-15 03:46:57.929+07	2026-11-14 19:47:19.722+07	2026-11-14 20:18:40.095+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
178	2026-11-14 19:47:19.738+07	2026-11-14 19:47:19.738+07	6361977a7bcf8ab28e2f9ce6a958adfda0496606166c12c4d4c130c85924521a	e234f261-2090-4cf8-a49c-37c3889e00fa	2026-11-21 19:47:19.738+07	2026-11-15 03:47:19.738+07	\N	2026-11-14 20:18:40.095+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
179	2026-11-14 19:47:19.738+07	2026-11-14 19:47:19.738+07	ba91d8f34b65616679aeeec35e937ace3b23c22b18b9d73d4c90638bebf5ba74	e234f261-2090-4cf8-a49c-37c3889e00fa	2026-11-21 19:47:19.738+07	2026-11-15 03:47:19.738+07	2026-11-14 19:49:22.453+07	2026-11-14 20:18:40.095+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
180	2026-11-14 19:49:22.455+07	2026-11-14 19:49:22.455+07	0aa44c360d7dd679815257ed2c706036c3eb72d8e3069d353c1dabc98332dc86	e234f261-2090-4cf8-a49c-37c3889e00fa	2026-11-21 19:49:22.455+07	2026-11-15 03:49:22.455+07	\N	2026-11-14 20:18:40.095+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
181	2026-11-14 19:49:22.455+07	2026-11-14 19:49:22.455+07	3ebd19e890b89107045c863cabdba474e120f187952d29e50ae8b20344b4e918	e234f261-2090-4cf8-a49c-37c3889e00fa	2026-11-21 19:49:22.455+07	2026-11-15 03:49:22.455+07	2026-11-14 19:55:33.735+07	2026-11-14 20:18:40.095+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
182	2026-11-14 19:55:33.738+07	2026-11-14 19:55:33.738+07	f175cbbb2ef33e16254cd9c0f6aa14d47596a3c324f436aacbb478bb9e1cf457	e234f261-2090-4cf8-a49c-37c3889e00fa	2026-11-21 19:55:33.738+07	2026-11-15 03:55:33.738+07	2026-11-14 19:55:53.291+07	2026-11-14 20:18:40.095+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
183	2026-11-14 19:55:33.739+07	2026-11-14 19:55:33.739+07	77728cb9f531d752a9d074e53ab02c14b7d1df30871258e004b9cad34601f23a	e234f261-2090-4cf8-a49c-37c3889e00fa	2026-11-21 19:55:33.739+07	2026-11-15 03:55:33.739+07	\N	2026-11-14 20:18:40.095+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
184	2026-11-14 19:55:53.291+07	2026-11-14 19:55:53.291+07	ec1e49ed6b0c38cc452dc740a65ee0ecc47f9302db2f179afde92036f7ba7f7e	e234f261-2090-4cf8-a49c-37c3889e00fa	2026-11-21 19:55:53.291+07	2026-11-15 03:55:53.291+07	\N	2026-11-14 20:18:40.095+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
185	2026-11-14 19:55:53.291+07	2026-11-14 19:55:53.291+07	31be65292a7b454469cefda0c88820d54c12b40f8b7bdd889dfea26c49af0d70	e234f261-2090-4cf8-a49c-37c3889e00fa	2026-11-21 19:55:53.291+07	2026-11-15 03:55:53.291+07	2026-11-14 20:18:40.084+07	2026-11-14 20:18:40.095+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
186	2026-11-14 20:02:50.179+07	2026-11-14 20:02:50.179+07	1a115fb619b556e7feae80359ae91b20cf42cab51442eb95fe611e35ab13b531	5bbb03f0-bc7f-4516-98c1-b96cb6797fa7	2026-11-21 20:02:50.179+07	2026-11-15 04:02:50.179+07	2026-11-14 20:13:28.468+07	2026-11-14 20:13:28.468+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
187	2026-11-14 20:13:28.471+07	2026-11-14 20:13:28.471+07	758246485148303bbdb86ec720f4e9cfeebe34cc38dbad83ee0ce74b5c11a4b5	5bbb03f0-bc7f-4516-98c1-b96cb6797fa7	2026-11-21 20:13:28.471+07	2026-11-15 04:13:28.471+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
188	2026-11-14 20:13:28.471+07	2026-11-14 20:13:28.471+07	e705252ece8837662a3a3eda535d622e77f6a103cfbb69a93f7deafc254649d8	5bbb03f0-bc7f-4516-98c1-b96cb6797fa7	2026-11-21 20:13:28.471+07	2026-11-15 04:13:28.471+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
189	2026-11-14 20:17:58.949+07	2026-11-14 20:17:58.949+07	778e9d60a252b00a244ef393db81d660d3a3db2ecfb3382c750db2e8719e8139	4c3936f2-5fb7-4692-aa84-bd93ecac649b	2026-11-21 20:17:58.949+07	2026-11-15 04:17:58.949+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
190	2026-11-14 20:18:40.088+07	2026-11-14 20:18:40.089+07	7f3e2e376e186c2e4baefed35efc88e7a0bdb2b3a96bac37ab14d8eedbd0168e	e234f261-2090-4cf8-a49c-37c3889e00fa	2026-11-21 20:18:40.088+07	2026-11-15 04:18:40.088+07	\N	2026-11-14 20:18:40.095+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
191	2026-11-14 20:18:55.955+07	2026-11-14 20:18:55.955+07	30fb774cb8dc765d514ab95b2ae375f678dd73d52ce06a26e16ef8187bcd965f	717c0dc4-8637-4d9f-9719-07344891f216	2026-11-21 20:18:55.954+07	2026-11-15 04:18:55.954+07	2026-11-14 20:19:14.031+07	2026-11-14 20:19:14.144+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
192	2026-11-14 20:19:14.031+07	2026-11-14 20:19:14.031+07	fdd7bbb48ee96af49290023a49c8071029f3697d0bd1c0f678d40fc1a77aaf4e	717c0dc4-8637-4d9f-9719-07344891f216	2026-11-21 20:19:14.031+07	2026-11-15 04:19:14.031+07	\N	2026-11-14 20:19:14.144+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
193	2026-11-14 20:19:23.147+07	2026-11-14 20:19:23.147+07	6a5919be2850d53b07d98f017732c58a0d44e21847e2a91759a0037d9708bc0e	7a3ca7c0-d132-4a8b-91b7-017a4c56bc9c	2026-11-21 20:19:23.147+07	2026-11-15 04:19:23.147+07	2026-11-14 20:20:10.625+07	2026-11-14 20:20:10.635+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
194	2026-11-14 20:20:10.625+07	2026-11-14 20:20:10.625+07	4f765a7ff3700fd9053fc1ff814f0b530b1964ee0f6e3ed60aa56de90497ea10	7a3ca7c0-d132-4a8b-91b7-017a4c56bc9c	2026-11-21 20:20:10.625+07	2026-11-15 04:20:10.625+07	\N	2026-11-14 20:20:10.635+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
195	2026-11-14 20:20:17.216+07	2026-11-14 20:20:17.216+07	01f9cfd146aa84736a8e25e744ca176cb3532497a3cfca227276d6ae44345203	295f3053-8912-44b2-b03a-2e7478781adf	2026-11-21 20:20:17.216+07	2026-11-15 04:20:17.216+07	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	2
196	2026-11-14 20:22:51.866+07	2026-11-14 20:22:51.866+07	eadbc255a7f9217db6184b4b8fad4af37a24d6f6e42919e82348a63f1953db7e	d744efe4-1f6d-419e-99a8-bfa87349a0ae	2026-11-21 20:22:51.866+07	2026-11-15 04:22:51.866+07	2026-11-14 20:23:32.749+07	2026-11-14 20:28:04.504+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
197	2026-11-14 20:23:32.749+07	2026-11-14 20:23:32.749+07	d18ca0c78124d36afeddb91e790a40b013213978a178761ad4c5a398a9f3174b	d744efe4-1f6d-419e-99a8-bfa87349a0ae	2026-11-21 20:23:32.749+07	2026-11-15 04:23:32.749+07	2026-11-14 20:28:04.492+07	2026-11-14 20:28:04.504+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
198	2026-11-14 20:23:32.752+07	2026-11-14 20:23:32.752+07	3aee8a48c69d10c19aeeee7a6ca8fa9db0d5c85ec93aab54df923745215067ae	d744efe4-1f6d-419e-99a8-bfa87349a0ae	2026-11-21 20:23:32.752+07	2026-11-15 04:23:32.752+07	\N	2026-11-14 20:28:04.504+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
199	2026-11-14 20:27:29.242+07	2026-11-14 20:27:29.242+07	606efad0fdf729d20bc643c62290865d08e067b8f35d9a219fe0f2168ce6d709	9467fed1-34e2-4536-8c7f-6545045e566d	2026-11-21 20:27:29.242+07	2026-11-15 04:27:29.242+07	2026-11-14 20:53:16.274+07	2026-11-14 20:53:16.274+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
200	2026-11-14 20:28:04.496+07	2026-11-14 20:28:04.496+07	8c40bf61908a72939486ad2331de8594cccbf0a04313ef8ac2d35d0bc24bcb44	d744efe4-1f6d-419e-99a8-bfa87349a0ae	2026-11-21 20:28:04.496+07	2026-11-15 04:28:04.496+07	\N	2026-11-14 20:28:04.504+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
201	2026-11-14 20:28:08.463+07	2026-11-14 20:28:08.463+07	5b0cb142219ab955a835145ad46ffad7ffab97fbcb3dbad96d511e418efdfe2e	8f179517-bddf-48c4-addc-1f3d529406ec	2026-11-21 20:28:08.463+07	2026-11-15 04:28:08.463+07	2026-11-14 20:28:28.692+07	2026-11-14 20:52:57.401+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
202	2026-11-14 20:28:28.692+07	2026-11-14 20:28:28.692+07	071b669666072c210f388f64167678bdaff234947e9b1ef2357d2723aa9493f4	8f179517-bddf-48c4-addc-1f3d529406ec	2026-11-21 20:28:28.692+07	2026-11-15 04:28:28.692+07	\N	2026-11-14 20:52:57.401+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
203	2026-11-14 20:28:28.692+07	2026-11-14 20:28:28.692+07	2a9ea2b25baf122acf0159e463b6cc4ec45f0412b0f5d93bddac1557095f5283	8f179517-bddf-48c4-addc-1f3d529406ec	2026-11-21 20:28:28.692+07	2026-11-15 04:28:28.692+07	2026-11-14 20:29:10.001+07	2026-11-14 20:52:57.401+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
204	2026-11-14 20:29:10.001+07	2026-11-14 20:29:10.001+07	64eb64302e8a115c051764c256e4cd07408658ae1f2aea47077a768490ce289c	8f179517-bddf-48c4-addc-1f3d529406ec	2026-11-21 20:29:10.001+07	2026-11-15 04:29:10.001+07	\N	2026-11-14 20:52:57.401+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
205	2026-11-14 20:29:10.002+07	2026-11-14 20:29:10.002+07	aa4a83517dae70dcd8a1e868430fdf551cf246b68ed79c2b0e0e69c7c73b45c3	8f179517-bddf-48c4-addc-1f3d529406ec	2026-11-21 20:29:10.002+07	2026-11-15 04:29:10.002+07	2026-11-14 20:30:30.973+07	2026-11-14 20:52:57.401+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
206	2026-11-14 20:30:30.973+07	2026-11-14 20:30:30.973+07	cb2e978b560219803e6c223f32f34782f69502d221ee5c0da8ca7ce2a0a821a9	8f179517-bddf-48c4-addc-1f3d529406ec	2026-11-21 20:30:30.973+07	2026-11-15 04:30:30.973+07	\N	2026-11-14 20:52:57.401+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
207	2026-11-14 20:30:30.973+07	2026-11-14 20:30:30.973+07	b0d12bac43e8d8b8ef791fe27a584f815094b2fb4b78b6ad805784c2070f76df	8f179517-bddf-48c4-addc-1f3d529406ec	2026-11-21 20:30:30.973+07	2026-11-15 04:30:30.973+07	2026-11-14 20:30:44.203+07	2026-11-14 20:52:57.401+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
208	2026-11-14 20:30:44.203+07	2026-11-14 20:30:44.203+07	867ac4118bfefba701f3f2e7afb1ddf0c8016d664bbd3597ad51f802a6ca7206	8f179517-bddf-48c4-addc-1f3d529406ec	2026-11-21 20:30:44.203+07	2026-11-15 04:30:44.203+07	\N	2026-11-14 20:52:57.401+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
209	2026-11-14 20:30:44.203+07	2026-11-14 20:30:44.203+07	8c4f83c2fb99c2e9e3031784b4256eb5c2353c1d6c5baa4513e1833e2882ae94	8f179517-bddf-48c4-addc-1f3d529406ec	2026-11-21 20:30:44.203+07	2026-11-15 04:30:44.203+07	2026-11-14 20:31:05.701+07	2026-11-14 20:52:57.401+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
210	2026-11-14 20:31:05.701+07	2026-11-14 20:31:05.701+07	01e906924a5e1fdb5b0dab299e5571b23718da1e495e7a7356fd7a1bd9ad0f21	8f179517-bddf-48c4-addc-1f3d529406ec	2026-11-21 20:31:05.701+07	2026-11-15 04:31:05.701+07	2026-11-14 20:31:31.012+07	2026-11-14 20:52:57.401+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
211	2026-11-14 20:31:05.701+07	2026-11-14 20:31:05.701+07	cab498e8cfa27f70d012b44b3401147b8cd9c677998621738a95753d050f362a	8f179517-bddf-48c4-addc-1f3d529406ec	2026-11-21 20:31:05.701+07	2026-11-15 04:31:05.701+07	\N	2026-11-14 20:52:57.401+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
212	2026-11-14 20:31:31.012+07	2026-11-14 20:31:31.012+07	8a43793cb0f6aa6d8a780c3efd3bda41e513cd55e2efae1d8272c4fe860d23c1	8f179517-bddf-48c4-addc-1f3d529406ec	2026-11-21 20:31:31.012+07	2026-11-15 04:31:31.012+07	\N	2026-11-14 20:52:57.401+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
213	2026-11-14 20:34:20.348+07	2026-11-14 20:34:20.348+07	26aac614ee9f6b55bde8c14838c9f25f1c2dbba992d307a063be81ba2a07dc2c	b3496a06-9d44-452e-b2b8-65a7cb17d923	2026-11-21 20:34:20.347+07	2026-11-15 04:34:20.347+07	\N	\N	Python-urllib/3.11	127.0.0.1	1
214	2026-11-14 20:34:40.253+07	2026-11-14 20:34:40.253+07	509a7a5eced54d70cfa5231f7c4e1bb52bcb89307269ba59508f713ac6341b5b	8f3394e3-1654-47af-8240-8263210cf95a	2026-11-21 20:34:40.253+07	2026-11-15 04:34:40.253+07	\N	\N	Python-urllib/3.11	127.0.0.1	1
215	2026-11-14 20:44:09.917+07	2026-11-14 20:44:09.917+07	daf4838fe30d7763a992f2594ddc9fdd52e96ee4bfdb4faa56c40fc3bc3a1ff3	84f4148c-6c3f-43d0-8540-2cb5dcffea9f	2026-11-21 20:44:09.916+07	2026-11-15 04:44:09.916+07	\N	\N	Python-urllib/3.11	127.0.0.1	1
216	2026-11-14 20:44:30.643+07	2026-11-14 20:44:30.643+07	74f71617aec56717ab650d0b26f35b7b9a57b1b9ef6ca025f3869db685835518	c927a034-7b4a-44cb-aba7-c7729f7856b6	2026-11-21 20:44:30.643+07	2026-11-15 04:44:30.643+07	\N	\N	Python-urllib/3.11	127.0.0.1	1
217	2026-11-14 20:44:30.912+07	2026-11-14 20:44:30.912+07	86aec235f999abb0be76dd7972abc791bec708a638d24a80b798450f3f317c9b	7314f5d2-d578-41f1-99cf-55ef1dd5bef2	2026-11-21 20:44:30.912+07	2026-11-15 04:44:30.912+07	\N	\N	Python-urllib/3.11	127.0.0.1	2
218	2026-11-14 20:45:51.778+07	2026-11-14 20:45:51.778+07	fb2a7450425dbc2265be000cbcebba6624038dc7f08e74713928f85a69e056e5	622ef603-8188-4d20-9a55-9a43c9100646	2026-11-21 20:45:51.778+07	2026-11-15 04:45:51.778+07	\N	\N	Python-urllib/3.11	127.0.0.1	1
219	2026-11-14 20:46:25.303+07	2026-11-14 20:46:25.303+07	b254703fff2f18c9ff31e95e0bae87c4ba3e0271d624c8f0e5ee355b442b5abd	af7835db-1dfb-4f2c-ba05-54c0fa9446db	2026-11-21 20:46:25.303+07	2026-11-15 04:46:25.303+07	\N	\N	Python-urllib/3.11	127.0.0.1	1
220	2026-11-14 20:53:00.629+07	2026-11-14 20:53:00.629+07	e6dbb62214ad5f7bc4437577514fd1865f32928b2e43fb8a9e3a37d8be2659b2	f799d061-db84-4b47-825c-e42cafc40df3	2026-11-21 20:53:00.628+07	2026-11-15 04:53:00.628+07	2026-11-14 20:53:29.739+07	2026-11-14 21:04:47.157+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
221	2026-11-14 20:53:16.274+07	2026-11-14 20:53:16.274+07	6ca26eeb4df68c2831bdd62678a772f800c77a7db0f6eb909b03e79e787df315	9467fed1-34e2-4536-8c7f-6545045e566d	2026-11-21 20:53:16.274+07	2026-11-15 04:53:16.274+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
222	2026-11-14 20:53:16.274+07	2026-11-14 20:53:16.274+07	aae52d95342d63d583a2ae94ecebb587683a2abff0242b5fde64a00342cfe714	9467fed1-34e2-4536-8c7f-6545045e566d	2026-11-21 20:53:16.274+07	2026-11-15 04:53:16.274+07	2026-11-14 21:08:35.422+07	2026-11-14 21:08:35.422+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
223	2026-11-14 20:53:29.74+07	2026-11-14 20:53:29.74+07	f6ead3fbe1386634775ae47b60cff55e2070a097b75c197c271750a392a9b839	f799d061-db84-4b47-825c-e42cafc40df3	2026-11-21 20:53:29.74+07	2026-11-15 04:53:29.74+07	\N	2026-11-14 21:04:47.157+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
224	2026-11-14 20:53:29.74+07	2026-11-14 20:53:29.74+07	d615bc404365b0dfaf97e6b4329694c9b067006f165d85c933f41274741ef7ec	f799d061-db84-4b47-825c-e42cafc40df3	2026-11-21 20:53:29.74+07	2026-11-15 04:53:29.74+07	2026-11-14 20:53:49.301+07	2026-11-14 21:04:47.157+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
225	2026-11-14 20:53:49.304+07	2026-11-14 20:53:49.304+07	39d226697bac77c7a5e38df931239e1cd2e77109b307720c7080a89684184ee6	f799d061-db84-4b47-825c-e42cafc40df3	2026-11-21 20:53:49.304+07	2026-11-15 04:53:49.304+07	\N	2026-11-14 21:04:47.157+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
226	2026-11-14 20:53:49.304+07	2026-11-14 20:53:49.304+07	2c69db8f7de4ee6ed3450ac0205248ef3efcf523d45a0e7190ace2a4b320f3ea	f799d061-db84-4b47-825c-e42cafc40df3	2026-11-21 20:53:49.304+07	2026-11-15 04:53:49.304+07	2026-11-14 20:54:11.517+07	2026-11-14 21:04:47.157+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
227	2026-11-14 20:54:11.517+07	2026-11-14 20:54:11.517+07	1b0057b0e7781e931bfb07342aaddeb99bf339b2337acec49ec1a2f4a491fae9	f799d061-db84-4b47-825c-e42cafc40df3	2026-11-21 20:54:11.517+07	2026-11-15 04:54:11.517+07	\N	2026-11-14 21:04:47.157+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
228	2026-11-14 20:54:11.517+07	2026-11-14 20:54:11.517+07	a990a9aa75bd1697878273bf5a60c9b72aa09f5a77c3840ef2ee95a6b545736f	f799d061-db84-4b47-825c-e42cafc40df3	2026-11-21 20:54:11.517+07	2026-11-15 04:54:11.517+07	2026-11-14 21:04:47.128+07	2026-11-14 21:04:47.157+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
229	2026-11-14 21:04:47.15+07	2026-11-14 21:04:47.15+07	02671d2b8329351f86a78c48c99127d1444673291e308041e0dd6f735bee1b75	f799d061-db84-4b47-825c-e42cafc40df3	2026-11-21 21:04:47.15+07	2026-11-15 05:04:47.15+07	\N	2026-11-14 21:04:47.157+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
230	2026-11-14 21:05:00.495+07	2026-11-14 21:05:00.495+07	39c9756700870796354bcc3d60a3a69fbb5cce4d76b0e6642c147cbb7ec2285c	0d57ddea-eb17-41fb-a90d-657af9515c65	2026-11-21 21:05:00.495+07	2026-11-15 05:05:00.495+07	2026-11-14 21:05:35.03+07	2026-11-14 21:05:35.044+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
231	2026-11-14 21:05:35.03+07	2026-11-14 21:05:35.03+07	a91015b89cf0ea810a49c72edc3fa6ae0442581da001c649312ef760a5797443	0d57ddea-eb17-41fb-a90d-657af9515c65	2026-11-21 21:05:35.03+07	2026-11-15 05:05:35.03+07	\N	2026-11-14 21:05:35.044+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
232	2026-11-14 21:05:41.06+07	2026-11-14 21:05:41.06+07	3fa6eba58e7f01a964fd16960b36a71215ee507b988a5d7bf76c0f810f73fb90	51cc09f8-5f81-44df-b70f-2b23a78d7ea3	2026-11-21 21:05:41.06+07	2026-11-15 05:05:41.06+07	2026-11-14 21:47:17.512+07	2026-11-14 22:06:38.445+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
233	2026-11-14 21:08:35.428+07	2026-11-14 21:08:35.428+07	7e01e302ce926383fafe64d775c1b5941538bdeed148a1cd117b98dcd279221d	9467fed1-34e2-4536-8c7f-6545045e566d	2026-11-21 21:08:35.427+07	2026-11-15 05:08:35.427+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
234	2026-11-14 21:08:35.429+07	2026-11-14 21:08:35.429+07	01bef37e054a96cb56575ac6090e925719c62630508065b7e71df2e1c76fbf53	9467fed1-34e2-4536-8c7f-6545045e566d	2026-11-21 21:08:35.429+07	2026-11-15 05:08:35.429+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
235	2026-11-14 21:10:03.836+07	2026-11-14 21:10:03.836+07	1e9d49831ecdae5d6b1900a7c288a2b7c9e60c15926141499fa332b9175f5cb3	d6497959-f299-4b84-8348-d2de44a30ac8	2026-11-21 21:10:03.836+07	2026-11-15 05:10:03.836+07	2026-11-14 21:27:39.928+07	2026-11-14 21:27:39.928+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
236	2026-11-14 21:27:39.931+07	2026-11-14 21:27:39.931+07	de1bc1247d237e3bd7a4ebfcfec3cd488635e6ac27144b357b04f3032d14b2aa	d6497959-f299-4b84-8348-d2de44a30ac8	2026-11-21 21:27:39.928+07	2026-11-15 05:27:39.928+07	2026-11-14 21:43:21.619+07	2026-11-14 21:43:21.619+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
237	2026-11-14 21:27:39.935+07	2026-11-14 21:27:39.935+07	4d3793c63d7478d96f9ea9b17bd316e13d2a0427935e6f6fd1e11c5e09df7ff2	d6497959-f299-4b84-8348-d2de44a30ac8	2026-11-21 21:27:39.934+07	2026-11-15 05:27:39.934+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
238	2026-11-14 21:43:21.625+07	2026-11-14 21:43:21.625+07	d1976c5d9a32ad61721c6db589d1c51493aad6de695bba2d8ec2f3aaa3e7fbb7	d6497959-f299-4b84-8348-d2de44a30ac8	2026-11-21 21:43:21.625+07	2026-11-15 05:43:21.625+07	2026-11-14 21:44:25.816+07	2026-11-14 21:44:25.816+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
239	2026-11-14 21:43:21.632+07	2026-11-14 21:43:21.632+07	e07d75160518d309362c7bbe33345c7041108168280a7f4225d81d1840611221	d6497959-f299-4b84-8348-d2de44a30ac8	2026-11-21 21:43:21.631+07	2026-11-15 05:43:21.631+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
240	2026-11-14 21:44:25.818+07	2026-11-14 21:44:25.818+07	86d522c8e40ea001a8e76da85485a70dd5b2ca2cf2d752b3bbf1035a5a3decb1	d6497959-f299-4b84-8348-d2de44a30ac8	2026-11-21 21:44:25.817+07	2026-11-15 05:44:25.817+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
241	2026-11-14 21:44:25.819+07	2026-11-14 21:44:25.819+07	04415d865af5a1837bc38df6bc370365ebf044704467cb319bef1a04d30600db	d6497959-f299-4b84-8348-d2de44a30ac8	2026-11-21 21:44:25.819+07	2026-11-15 05:44:25.819+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
242	2026-11-14 21:44:49.61+07	2026-11-14 21:44:49.61+07	87f6b6264717bde9853b70bdf582f8872468fbcc111e0bcb1f743af41fe90903	4d204cdd-7f3a-423d-879f-b9d542eb433e	2026-11-21 21:44:49.61+07	2026-11-15 05:44:49.61+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
243	2026-11-14 21:45:50.196+07	2026-11-14 21:45:50.196+07	aa5fa9e865958805b422b4850dbb714a2942b2df4d9699388d98449334d8a900	559f4542-1d4a-447a-a4a3-b0ee68af3468	2026-11-21 21:45:50.196+07	2026-11-15 05:45:50.196+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
244	2026-11-14 21:46:29.662+07	2026-11-14 21:46:29.662+07	53a8b587e086a84dc5b4c2feab5598c838bb4c9b4d086bc3cd266ba51f12f099	263e6512-05f7-41ab-922d-5f51656ca9ae	2026-11-21 21:46:29.662+07	2026-11-15 05:46:29.662+07	2026-11-14 21:53:26.225+07	2026-11-14 21:53:26.225+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
245	2026-11-14 21:47:17.523+07	2026-11-14 21:47:17.523+07	13af01b87ed994f77b874ad7e11b36f0cc3fd336140ec2b358f225b7b265c886	51cc09f8-5f81-44df-b70f-2b23a78d7ea3	2026-11-21 21:47:17.523+07	2026-11-15 05:47:17.523+07	\N	2026-11-14 22:06:38.445+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
246	2026-11-14 21:47:17.523+07	2026-11-14 21:47:17.523+07	6fb0d1cc96badc038c5e264cc8e0fae796688005e307f5cc2c9e08bb56124711	51cc09f8-5f81-44df-b70f-2b23a78d7ea3	2026-11-21 21:47:17.523+07	2026-11-15 05:47:17.523+07	2026-11-14 22:06:38.44+07	2026-11-14 22:06:38.445+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
247	2026-11-14 21:53:26.253+07	2026-11-14 21:53:26.253+07	b560004054c0eea0536881dcdab9f731039295bef286bccf47a322734214d5af	263e6512-05f7-41ab-922d-5f51656ca9ae	2026-11-21 21:53:26.252+07	2026-11-15 05:53:26.252+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
248	2026-11-14 21:53:26.254+07	2026-11-14 21:53:26.254+07	ad50a04139366d2b1a6339cca15c396c14c677f816a558037451c4febd2685ba	263e6512-05f7-41ab-922d-5f51656ca9ae	2026-11-21 21:53:26.254+07	2026-11-15 05:53:26.254+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
249	2026-11-14 21:53:39.695+07	2026-11-14 21:53:39.695+07	2652e7f17f2f03f9c4066a20eebfc60eefd90610fce8adaacd9bd5ea258e7c71	a1fda8d0-b083-47df-91e5-311724c7a81f	2026-11-21 21:53:39.695+07	2026-11-15 05:53:39.695+07	2026-11-14 22:06:06.177+07	2026-11-14 22:06:06.177+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
250	2026-11-14 22:06:06.183+07	2026-11-14 22:06:06.183+07	f7c1745f2b989133e81f1466b37386080b0133120360bddaab0785d141080067	a1fda8d0-b083-47df-91e5-311724c7a81f	2026-11-21 22:06:06.183+07	2026-11-15 06:06:06.183+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
251	2026-11-14 22:06:06.183+07	2026-11-14 22:06:06.183+07	1ce5a4fef3ce6b4856f1e8e77cc8d4deb2b89ee01efd603f9962fb692adaf1ff	a1fda8d0-b083-47df-91e5-311724c7a81f	2026-11-21 22:06:06.183+07	2026-11-15 06:06:06.183+07	2026-11-14 22:07:10.231+07	2026-11-14 22:07:10.231+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
252	2026-11-14 22:06:38.442+07	2026-11-14 22:06:38.442+07	c1996cc46a1a94ef279416441566e45dfc88e984b5c3f9ce5fa3f41c21c4ce87	51cc09f8-5f81-44df-b70f-2b23a78d7ea3	2026-11-21 22:06:38.442+07	2026-11-15 06:06:38.442+07	\N	2026-11-14 22:06:38.445+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
253	2026-11-14 22:06:52.815+07	2026-11-14 22:06:52.815+07	6e0e9ec8211c90f7e20d17fa8d84ea07a856516bc038e935653d533cd94723c6	acc5ba0f-b79a-454b-a449-3a5ac41da793	2026-11-21 22:06:52.815+07	2026-11-15 06:06:52.815+07	2026-11-14 22:23:37.903+07	2026-11-15 11:55:45.109+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
254	2026-11-14 22:07:10.231+07	2026-11-14 22:07:10.231+07	69787fdcaf5524aa4b0cb3971249ece7730aa6c22ec33fe0792e8f966f6d2fc7	a1fda8d0-b083-47df-91e5-311724c7a81f	2026-11-21 22:07:10.231+07	2026-11-15 06:07:10.231+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
255	2026-11-14 22:07:10.231+07	2026-11-14 22:07:10.231+07	d5301242b6d537f5ba77d20d3b630af5770e61d7f515da7519c98fffaa2f177f	a1fda8d0-b083-47df-91e5-311724c7a81f	2026-11-21 22:07:10.231+07	2026-11-15 06:07:10.231+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
256	2026-11-14 22:08:08.988+07	2026-11-14 22:08:08.988+07	3649f25fa66cf224be337634f817e962337fde18fd2187bbc3143a878f460b25	c61306d8-50d7-4cbd-866b-ae7ee49c526d	2026-11-21 22:08:08.988+07	2026-11-15 06:08:08.988+07	2026-11-14 22:08:53.433+07	2026-11-14 22:23:24.267+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
257	2026-11-14 22:08:53.441+07	2026-11-14 22:08:53.441+07	3cd6a1197a1dfff72f385f52dacd281731feea6a0eef1c3ca39e7d8d4c25443a	c61306d8-50d7-4cbd-866b-ae7ee49c526d	2026-11-21 22:08:53.441+07	2026-11-15 06:08:53.441+07	2026-11-14 22:08:55.622+07	2026-11-14 22:23:24.267+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
258	2026-11-14 22:08:55.624+07	2026-11-14 22:08:55.624+07	52e4cf562173dbf0a3c6e0d91559570dfd3b45a736b71a2ac9a9cc9cfbb19cd4	c61306d8-50d7-4cbd-866b-ae7ee49c526d	2026-11-21 22:08:55.623+07	2026-11-15 06:08:55.623+07	2026-11-14 22:08:57.806+07	2026-11-14 22:23:24.267+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
259	2026-11-14 22:08:57.82+07	2026-11-14 22:08:57.82+07	06856d8d6f63cac2b0d268770db5a09ba410e52bb64e3567eca683a5816908b7	c61306d8-50d7-4cbd-866b-ae7ee49c526d	2026-11-21 22:08:57.818+07	2026-11-15 06:08:57.818+07	\N	2026-11-14 22:23:24.267+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
260	2026-11-14 22:23:37.903+07	2026-11-14 22:23:37.903+07	18e36f60ad90a2b924f91f7944dc0477bab837e844443515a8eaaebcffa0defe	acc5ba0f-b79a-454b-a449-3a5ac41da793	2026-11-21 22:23:37.903+07	2026-11-15 06:23:37.903+07	\N	2026-11-15 11:55:45.109+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
261	2026-11-14 22:23:37.903+07	2026-11-14 22:23:37.903+07	2fad5bce3d7282f9e6e7e77107f98f796a28637e390111399cbb5012056191a0	acc5ba0f-b79a-454b-a449-3a5ac41da793	2026-11-21 22:23:37.903+07	2026-11-15 06:23:37.903+07	\N	2026-11-15 11:55:45.109+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	1
262	2026-11-14 22:23:55.78+07	2026-11-14 22:23:55.78+07	052ffa2d0d7bbdb8a0c09009323733f5c9b39c0968d14ce1aba48ddff0b37956	6f3d8b31-5ae6-47a6-894f-984bb4370f68	2026-11-21 22:23:55.78+07	2026-11-15 06:23:55.78+07	2026-11-14 22:24:03.274+07	2026-11-14 22:24:03.281+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
263	2026-11-14 22:24:03.279+07	2026-11-14 22:24:03.279+07	f99f4ec073a4997567ca60e929d95b9c0f1a6b406f580f4813de8ce76dee2486	6f3d8b31-5ae6-47a6-894f-984bb4370f68	2026-11-21 22:24:03.278+07	2026-11-15 06:24:03.278+07	\N	2026-11-14 22:24:03.281+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
264	2026-11-14 22:24:31.521+07	2026-11-14 22:24:31.521+07	1dd5b3d00a780e49eaf180825c95e30b9fa7bd355ff43bcdcdb307871e888b6f	ff851fa1-4f01-415f-b752-95274dfa2ddd	2026-11-21 22:24:31.521+07	2026-11-15 06:24:31.521+07	2026-11-14 22:30:56.452+07	2026-11-14 22:57:35.574+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
265	2026-11-14 22:30:56.458+07	2026-11-14 22:30:56.458+07	e06e25d9e49766d62ca4bc27c67a23d1845b77d8eb6c2f81795ffa9588599e36	ff851fa1-4f01-415f-b752-95274dfa2ddd	2026-11-21 22:30:56.458+07	2026-11-15 06:30:56.458+07	\N	2026-11-14 22:57:35.574+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
266	2026-11-14 22:30:56.458+07	2026-11-14 22:30:56.458+07	0cc4d8c1ff0cec3a9ccdb04d59333049a6b9385d1c84cdfbaf7c991f287a7181	ff851fa1-4f01-415f-b752-95274dfa2ddd	2026-11-21 22:30:56.458+07	2026-11-15 06:30:56.458+07	2026-11-14 22:33:22.349+07	2026-11-14 22:57:35.574+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
267	2026-11-14 22:33:22.351+07	2026-11-14 22:33:22.351+07	f40ac9f68dd2d432c42772c264789484273a80d4fcf721dc5338f625d0fafbe4	ff851fa1-4f01-415f-b752-95274dfa2ddd	2026-11-21 22:33:22.351+07	2026-11-15 06:33:22.351+07	\N	2026-11-14 22:57:35.574+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
268	2026-11-14 22:33:22.351+07	2026-11-14 22:33:22.351+07	dfa5fff5054399aa84268330f3980425da55dc80bbaf06cea6da49359c7b6818	ff851fa1-4f01-415f-b752-95274dfa2ddd	2026-11-21 22:33:22.351+07	2026-11-15 06:33:22.351+07	2026-11-14 22:54:15.648+07	2026-11-14 22:57:35.574+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
269	2026-11-14 22:33:55.321+07	2026-11-14 22:33:55.321+07	f16009be747ae4d2caefb4707bb19e7805f8f59f5540915a7e4d9b28f78d0e34	2b099d83-aa12-4f4c-878e-a55da16c658b	2026-11-21 22:33:55.321+07	2026-11-15 06:33:55.321+07	2026-11-14 22:34:05.697+07	2026-11-14 23:35:51.413+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
270	2026-11-14 22:34:05.697+07	2026-11-14 22:34:05.697+07	414e0cfd525c13d24b39e1f6b93c3b8e8c7debc5c13edcc39e0d4c4dadcea9ed	2b099d83-aa12-4f4c-878e-a55da16c658b	2026-11-21 22:34:05.697+07	2026-11-15 06:34:05.697+07	\N	2026-11-14 23:35:51.413+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
271	2026-11-14 22:34:05.697+07	2026-11-14 22:34:05.697+07	49a47da1a3dc9e2f0134cb6b69bc32ddb6fad27d3932669a3468cd7bb86ae5df	2b099d83-aa12-4f4c-878e-a55da16c658b	2026-11-21 22:34:05.697+07	2026-11-15 06:34:05.697+07	2026-11-14 22:54:15.648+07	2026-11-14 23:35:51.413+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
272	2026-11-14 22:54:15.655+07	2026-11-14 22:54:15.655+07	42efe31ea953af8a2811483599ee7ad98c71a01de959fb770bbdaea994a71d80	2b099d83-aa12-4f4c-878e-a55da16c658b	2026-11-21 22:54:15.655+07	2026-11-15 06:54:15.655+07	\N	2026-11-14 23:35:51.413+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
273	2026-11-14 22:54:15.655+07	2026-11-14 22:54:15.655+07	e7c632d54293b9d9c44ec94ab79dc6b8d60a122ee85e2ec45f6b0388dda0acd0	2b099d83-aa12-4f4c-878e-a55da16c658b	2026-11-21 22:54:15.655+07	2026-11-15 06:54:15.655+07	2026-11-14 22:54:26.897+07	2026-11-14 23:35:51.413+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
274	2026-11-14 22:54:15.655+07	2026-11-14 22:54:15.655+07	2e9879adf528de040305c65d3a2419ec8f93c34e21864f610c08a276cbc8a3c1	ff851fa1-4f01-415f-b752-95274dfa2ddd	2026-11-21 22:54:15.655+07	2026-11-15 06:54:15.655+07	\N	2026-11-14 22:57:35.574+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
275	2026-11-14 22:54:26.9+07	2026-11-14 22:54:26.9+07	3dccee229131704e5b4522a8be3a7cfa3ba0f1e41672038b37615804deaf43c3	2b099d83-aa12-4f4c-878e-a55da16c658b	2026-11-21 22:54:26.9+07	2026-11-15 06:54:26.9+07	2026-11-14 23:35:50.737+07	2026-11-14 23:35:51.413+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
276	2026-11-14 22:54:26.901+07	2026-11-14 22:54:26.901+07	30d1f4b90b32094b28a9abcef0aaae35f3dcac62a1fa69199d9a069e3eac53b9	2b099d83-aa12-4f4c-878e-a55da16c658b	2026-11-21 22:54:26.901+07	2026-11-15 06:54:26.901+07	\N	2026-11-14 23:35:51.413+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
277	2026-11-14 22:57:38.228+07	2026-11-14 22:57:38.228+07	566555499112eba016c5fec208a3587ef649c0b259ad7c4138f2cb8093de329d	bd81fc33-c410-4d95-8b46-d77ff388cdc9	2026-11-21 22:57:38.227+07	2026-11-15 06:57:38.227+07	2026-11-14 23:12:44.666+07	2026-11-14 23:37:17.739+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
278	2026-11-14 23:12:44.68+07	2026-11-14 23:12:44.68+07	d48ebd1510a814e57c09244eb012926d144c2e7742af365c95a2b9c8b093bd5b	bd81fc33-c410-4d95-8b46-d77ff388cdc9	2026-11-21 23:12:44.678+07	2026-11-15 07:12:44.678+07	2026-11-14 23:16:22.007+07	2026-11-14 23:37:17.739+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
279	2026-11-14 23:16:22.015+07	2026-11-14 23:16:22.015+07	31e10886c4e47469631b7564e4e659c3dc7261e2113a9d209cf1915c23c284a1	bd81fc33-c410-4d95-8b46-d77ff388cdc9	2026-11-21 23:16:22.015+07	2026-11-15 07:16:22.015+07	\N	2026-11-14 23:37:17.739+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
280	2026-11-14 23:16:22.021+07	2026-11-14 23:16:22.021+07	37a359724ca71f8bfe26c45971319faaa31f93d3f6c5ab1023fb5cebd2f9d39a	bd81fc33-c410-4d95-8b46-d77ff388cdc9	2026-11-21 23:16:22.021+07	2026-11-15 07:16:22.021+07	2026-11-14 23:16:43.099+07	2026-11-14 23:37:17.739+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
281	2026-11-14 23:16:43.107+07	2026-11-14 23:16:43.107+07	34de687eb71d77a559730bf775963ede0610aa757eed0a01325782280dd38e30	bd81fc33-c410-4d95-8b46-d77ff388cdc9	2026-11-21 23:16:43.106+07	2026-11-15 07:16:43.106+07	\N	2026-11-14 23:37:17.739+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
282	2026-11-14 23:35:50.995+07	2026-11-14 23:35:50.995+07	cd6f7b0307ff3881e4c0cb3a03a4e09ea2cf4c03fc814e4134b5c121a5267a2d	2b099d83-aa12-4f4c-878e-a55da16c658b	2026-11-21 23:35:50.993+07	2026-11-15 07:35:50.993+07	\N	2026-11-14 23:35:51.413+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
283	2026-11-14 23:36:06.497+07	2026-11-14 23:36:06.497+07	125e8b3771202f40030e260259eee199b4e6ad1e00aa82e1b83a399cc385067e	799546dc-abd0-42f1-9940-bcae4f01ece4	2026-11-21 23:36:06.497+07	2026-11-15 07:36:06.497+07	2026-11-14 23:41:18.466+07	2026-11-15 00:18:03.919+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
284	2026-11-14 23:37:19.964+07	2026-11-14 23:37:19.964+07	e0638e1db2187633fe51fae48b64ede06f77cdc5434996079c8360b37081dd80	f88a3ec6-6036-4c63-b559-9492cfa8a98a	2026-11-21 23:37:19.964+07	2026-11-15 07:37:19.964+07	2026-11-14 23:42:43.673+07	2026-11-15 00:17:42.868+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
285	2026-11-14 23:41:18.468+07	2026-11-14 23:41:18.468+07	647a578214a680f4f6ac04322250b4a7b5ca446e7927a3b0d9ecc268023f5f83	799546dc-abd0-42f1-9940-bcae4f01ece4	2026-11-21 23:41:18.468+07	2026-11-15 07:41:18.468+07	\N	2026-11-15 00:18:03.919+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
286	2026-11-14 23:41:18.468+07	2026-11-14 23:41:18.468+07	a576568ca0266e01fdaea3bd7629ff293db4bc9e014a7700dd2d1b04483bc1a4	799546dc-abd0-42f1-9940-bcae4f01ece4	2026-11-21 23:41:18.468+07	2026-11-15 07:41:18.468+07	2026-11-15 00:18:03.059+07	2026-11-15 00:18:03.919+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
287	2026-11-14 23:42:43.673+07	2026-11-14 23:42:43.673+07	5533a445f0a9a3150dc3bfd8e06144f8ecd8d81ab14846c760173da11b2d8c50	f88a3ec6-6036-4c63-b559-9492cfa8a98a	2026-11-21 23:42:43.673+07	2026-11-15 07:42:43.673+07	2026-11-15 00:17:41.77+07	2026-11-15 00:17:42.868+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
288	2026-11-14 23:42:43.673+07	2026-11-14 23:42:43.673+07	ead15c1f01b9f0d437903cb6031f225c0240a4b9e4573f69fb052b3f64d712b2	f88a3ec6-6036-4c63-b559-9492cfa8a98a	2026-11-21 23:42:43.673+07	2026-11-15 07:42:43.673+07	\N	2026-11-15 00:17:42.868+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
289	2026-11-15 00:17:41.79+07	2026-11-15 00:17:41.79+07	c4e51ff697447830c8815c906e6b6a3b5d1549b72f56f41314f5d07bcf2c098a	f88a3ec6-6036-4c63-b559-9492cfa8a98a	2026-11-22 00:17:41.789+07	2026-11-15 08:17:41.789+07	\N	2026-11-15 00:17:42.868+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
290	2026-11-15 00:17:45.016+07	2026-11-15 00:17:45.016+07	c59b0dd1e64f8a6f64782da79e5a3d6a313c814bc2ccf5a3680facb545ca8135	fde21a82-1dec-434c-9ed3-76cf8a5efdb4	2026-11-22 00:17:45.016+07	2026-11-15 08:17:45.016+07	\N	2026-11-15 08:34:17.297+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
291	2026-11-15 00:18:03.137+07	2026-11-15 00:18:03.137+07	3e2cd024435c7cc04890e7ab2c903aa8276f09ea80a2e48d63a20661dead9aab	799546dc-abd0-42f1-9940-bcae4f01ece4	2026-11-22 00:18:03.137+07	2026-11-15 08:18:03.137+07	\N	2026-11-15 00:18:03.919+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
292	2026-11-15 00:18:19.687+07	2026-11-15 00:18:19.687+07	83742ce3e288c3e8850b31019f016175863a74243538299172d5e6e7c9548caa	b4105475-3a74-42af-b454-73e0a6f0c85e	2026-11-22 00:18:19.687+07	2026-11-15 08:18:19.687+07	2026-11-15 00:19:34.492+07	2026-11-15 00:19:34.492+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
294	2026-11-15 00:19:34.499+07	2026-11-15 00:19:34.499+07	40dc43a05ff168949cca38bfd99ad113b2a6fa21d94ab910fd8572651d049931	b4105475-3a74-42af-b454-73e0a6f0c85e	2026-11-22 00:19:34.499+07	2026-11-15 08:19:34.499+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
326	2026-11-15 08:34:22.767+07	2026-11-15 08:34:22.767+07	b8deeb5e55960a6b93ee5e3391bbbd3c4a93dc38739e7c93a9d8fc35e2c7b632	4ba281fb-1673-4b77-9a84-2d15878e5e88	2026-11-22 08:34:22.767+07	2026-11-15 16:34:22.767+07	2026-11-15 08:34:27.642+07	2026-11-15 08:34:27.642+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
327	2026-11-15 08:34:27.642+07	2026-11-15 08:34:27.642+07	a23dd113df94b63260f906141a69e647d1f9ee6c73fbc5f5ee33b55d15835768	4ba281fb-1673-4b77-9a84-2d15878e5e88	2026-11-22 08:34:27.642+07	2026-11-15 16:34:27.642+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
328	2026-11-15 08:34:27.645+07	2026-11-15 08:34:27.645+07	3153679baefc3951d20d1ffdbf1a98f566cdbab3a99895a403d2eba978f66758	4ba281fb-1673-4b77-9a84-2d15878e5e88	2026-11-22 08:34:27.645+07	2026-11-15 16:34:27.645+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
329	2026-11-15 08:34:33.37+07	2026-11-15 08:34:33.37+07	fd9e9c8fdd10607ac547fd98ba11b3b5520e3596945f8aa82d62aff273e95c43	2a108155-75fc-4031-afa0-88056f779103	2026-11-22 08:34:33.37+07	2026-11-15 16:34:33.37+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
330	2026-11-15 08:35:24.202+07	2026-11-15 08:35:24.202+07	3bffa25f91822899eb1ec998d325bdbd5581cc46e289e30483ca6d133adaecb2	9bb648fe-2ead-419f-9a08-7f0362e1d339	2026-11-22 08:35:24.201+07	2026-11-15 16:35:24.201+07	2026-11-15 08:37:55.545+07	2026-11-15 08:37:55.935+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
331	2026-11-15 08:37:55.557+07	2026-11-15 08:37:55.557+07	02fa1528b2a04d0d66f9b4041e691f3e9e5756757d8101e8e8c3beedc4acbbdf	9bb648fe-2ead-419f-9a08-7f0362e1d339	2026-11-22 08:37:55.556+07	2026-11-15 16:37:55.556+07	\N	2026-11-15 08:37:55.935+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
332	2026-11-15 08:38:13.433+07	2026-11-15 08:38:13.433+07	8c05cf4d0fa79ffc2160331fb64c48452d4b0a845044d2d7f97cf4f85eac64cf	a3c42cb7-c6d2-41b2-93d2-aec02a9cb003	2026-11-22 08:38:13.43+07	2026-11-15 16:38:13.43+07	2026-11-15 08:52:09.006+07	2026-11-15 08:58:49.176+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
333	2026-11-15 08:52:09.013+07	2026-11-15 08:52:09.013+07	90c736bd6f9501062e5adfccf6139433cd5f9d503a9b9f137a270a9ba540f11a	a3c42cb7-c6d2-41b2-93d2-aec02a9cb003	2026-11-22 08:52:09.013+07	2026-11-15 16:52:09.013+07	2026-11-15 08:58:05.882+07	2026-11-15 08:58:49.176+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
334	2026-11-15 08:52:09.013+07	2026-11-15 08:52:09.013+07	8fe48b9e5e4c758eebb00d9194ae6aab9650ac17d7052b721a4e2658abc3b8e8	a3c42cb7-c6d2-41b2-93d2-aec02a9cb003	2026-11-22 08:52:09.013+07	2026-11-15 16:52:09.013+07	\N	2026-11-15 08:58:49.176+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
335	2026-11-15 08:58:05.894+07	2026-11-15 08:58:05.894+07	77ebe6173062a6711444c7653007675baf54a35a327b933f1488a67c5bedb225	a3c42cb7-c6d2-41b2-93d2-aec02a9cb003	2026-11-22 08:58:05.894+07	2026-11-15 16:58:05.894+07	\N	2026-11-15 08:58:49.176+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
336	2026-11-15 08:58:05.898+07	2026-11-15 08:58:05.898+07	421200d81d9deda1ddc025d257c76120f7d0e01613fbafe9af8bc53d888ce495	a3c42cb7-c6d2-41b2-93d2-aec02a9cb003	2026-11-22 08:58:05.896+07	2026-11-15 16:58:05.896+07	2026-11-15 08:58:49.174+07	2026-11-15 08:58:49.176+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
337	2026-11-15 08:58:49.176+07	2026-11-15 08:58:49.176+07	3b5c515f3488b18b9cd2666ccf414f743ba19233ef54dd21b1908e2d8cdf3f27	a3c42cb7-c6d2-41b2-93d2-aec02a9cb003	2026-11-22 08:58:49.176+07	2026-11-15 16:58:49.176+07	\N	2026-11-15 08:58:49.176+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
338	2026-11-15 08:59:17.587+07	2026-11-15 08:59:17.587+07	d98e1b84c6c18a19821de6b8e976b36aefe810fa6e84adb56508ff94ef3b0186	e1b16268-782f-4067-9865-320d50d91f8a	2026-11-22 08:59:17.587+07	2026-11-15 16:59:17.587+07	2026-11-15 08:59:22.164+07	2026-11-15 09:09:18.788+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
339	2026-11-15 08:59:22.165+07	2026-11-15 08:59:22.165+07	4785c156006a65d1f31b636e9a372d96fb2d408429efd647d40b10a512f3fd44	e1b16268-782f-4067-9865-320d50d91f8a	2026-11-22 08:59:22.165+07	2026-11-15 16:59:22.165+07	\N	2026-11-15 09:09:18.788+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
340	2026-11-15 08:59:22.165+07	2026-11-15 08:59:22.165+07	8a5d5e8c7bc23aaead2d5a78a4d68babf2475093f3748a548b6eb1a492a87421	e1b16268-782f-4067-9865-320d50d91f8a	2026-11-22 08:59:22.165+07	2026-11-15 16:59:22.165+07	2026-11-15 09:09:18.783+07	2026-11-15 09:09:18.788+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
341	2026-11-15 09:09:18.783+07	2026-11-15 09:09:18.783+07	a12935140618078b9799ae0db82559eccbfda49f0a36d7c4e0bc83d9e907f851	e1b16268-782f-4067-9865-320d50d91f8a	2026-11-22 09:09:18.783+07	2026-11-15 17:09:18.783+07	\N	2026-11-15 09:09:18.788+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
342	2026-11-15 09:11:54.003+07	2026-11-15 09:11:54.003+07	a2a8264c0c1c445c34954c79a90d6f3866cdc594a58b96a85089f99df084568f	ac22f564-b1d3-4882-85ac-93f4468585f4	2026-11-22 09:11:54.003+07	2026-11-15 17:11:54.003+07	2026-11-15 09:14:04.977+07	2026-11-15 09:14:07.109+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
343	2026-11-15 09:14:04.977+07	2026-11-15 09:14:04.977+07	d4e0fee0ac1faf68236eb819821c4ec09b7c2d5637ecb06ca1c5517975972fda	ac22f564-b1d3-4882-85ac-93f4468585f4	2026-11-22 09:14:04.977+07	2026-11-15 17:14:04.977+07	\N	2026-11-15 09:14:07.109+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
344	2026-11-15 09:14:04.977+07	2026-11-15 09:14:04.977+07	c14bdebc7628ca8a60c5b494261645f9f3309658651ad5e8f8ff74881f901605	ac22f564-b1d3-4882-85ac-93f4468585f4	2026-11-22 09:14:04.977+07	2026-11-15 17:14:04.977+07	2026-11-15 09:14:06.513+07	2026-11-15 09:14:07.109+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
345	2026-11-15 09:14:06.511+07	2026-11-15 09:14:06.511+07	f7e6b7872913fd372446e4acb1e35a54f7d67e8ff1b90b6b1881f1ffe5da6b16	ac22f564-b1d3-4882-85ac-93f4468585f4	2026-11-22 09:14:06.511+07	2026-11-15 17:14:06.511+07	\N	2026-11-15 09:14:07.109+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
346	2026-11-15 09:14:06.519+07	2026-11-15 09:14:06.519+07	97e4745832f9d41e1851326b5d5898f84b7d8fa504d24a6242f8444ac6133307	ac22f564-b1d3-4882-85ac-93f4468585f4	2026-11-22 09:14:06.518+07	2026-11-15 17:14:06.518+07	\N	2026-11-15 09:14:07.109+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
347	2026-11-15 09:14:23.31+07	2026-11-15 09:14:23.31+07	bcab60cf3b57eb8ce832a0717768ca628c248f080b8f88707e8294c3ebba6c4d	2de79a44-b38b-4323-b1f6-e5109748b00d	2026-11-22 09:14:23.31+07	2026-11-15 17:14:23.31+07	2026-11-15 09:29:35.781+07	2026-11-15 09:31:14.4+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
348	2026-11-15 09:20:33.977+07	2026-11-15 09:20:33.977+07	0190848be8366565c0aac87b4b2fb01c76f7b842d4b79b616f7fe9ac836c304d	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 09:20:33.977+07	2026-11-15 17:20:33.977+07	2026-11-15 09:25:24.816+07	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
349	2026-11-15 09:25:24.822+07	2026-11-15 09:25:24.822+07	a12fc65f094722dc3f1d96e0686713503e93c5d57ca6c21f066ed8e819544873	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 09:25:24.82+07	2026-11-15 17:25:24.82+07	\N	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
350	2026-11-15 09:25:24.824+07	2026-11-15 09:25:24.824+07	71d3b7a806922e73b385d2072251dc6a8e4f40654cb4d1f5a6aa4298b39702ae	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 09:25:24.824+07	2026-11-15 17:25:24.824+07	2026-11-15 09:25:35.018+07	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
351	2026-11-15 09:25:35.018+07	2026-11-15 09:25:35.018+07	9723b6f378026b2d856b13f6cefcbd355f0afd2c502e9b000b06bcc4fd85f8c8	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 09:25:35.018+07	2026-11-15 17:25:35.018+07	\N	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
352	2026-11-15 09:25:35.025+07	2026-11-15 09:25:35.025+07	4241cdc23173d9dd9db86fdd9f4b0abd906144007809db6d6b07a657327d9d6b	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 09:25:35.025+07	2026-11-15 17:25:35.025+07	2026-11-15 09:29:22.448+07	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
353	2026-11-15 09:29:22.455+07	2026-11-15 09:29:22.455+07	077056a5f3f2417b03ee891e88eb6092ba00a84b387b7ff702c2c778de0a71c5	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 09:29:22.455+07	2026-11-15 17:29:22.455+07	2026-11-15 09:44:35.853+07	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
354	2026-11-15 09:29:22.455+07	2026-11-15 09:29:22.455+07	f8d0ee6a9ce500e047c649e4f1dbb2cbc6900933c01fd91083f04ae2beea9992	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 09:29:22.455+07	2026-11-15 17:29:22.455+07	\N	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
355	2026-11-15 09:29:35.783+07	2026-11-15 09:29:35.783+07	2006e2ba1534575ea91de46bc8eecbc23568be89444a153441814bc1f376aa9c	2de79a44-b38b-4323-b1f6-e5109748b00d	2026-11-22 09:29:35.783+07	2026-11-15 17:29:35.783+07	2026-11-15 09:31:14.397+07	2026-11-15 09:31:14.4+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
356	2026-11-15 09:31:14.4+07	2026-11-15 09:31:14.4+07	69367f71339279cb63a234f095e398e81304cf5035f14a57a31cbbdc234b5036	2de79a44-b38b-4323-b1f6-e5109748b00d	2026-11-22 09:31:14.4+07	2026-11-15 17:31:14.4+07	\N	2026-11-15 09:31:14.4+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
357	2026-11-15 09:31:28.12+07	2026-11-15 09:31:28.12+07	767ca3dd87f95c17f69dfea08592294d8d546c9c586e91394f97dda01e90408b	ca6821ce-7ba2-4ddc-8377-2827b2f24ed0	2026-11-22 09:31:28.12+07	2026-11-15 17:31:28.12+07	2026-11-15 09:55:23.698+07	2026-11-15 11:38:41.69+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
358	2026-11-15 09:44:35.862+07	2026-11-15 09:44:35.862+07	3394e74960516afd54d3ee993f440fe2b2cc6a67e9c7a84cdbc44c463ad6808e	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 09:44:35.861+07	2026-11-15 17:44:35.861+07	2026-11-15 09:45:13.588+07	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
359	2026-11-15 09:45:13.591+07	2026-11-15 09:45:13.591+07	fc559e180a93f198d564088b0759acb51a2ecc9c1c6b5936333dc5b36384d7fc	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 09:45:13.591+07	2026-11-15 17:45:13.591+07	\N	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
360	2026-11-15 09:45:13.594+07	2026-11-15 09:45:13.594+07	2d31c174c2b1bcb6be74f3099630706d4b8dea580736771abe33448ca42f50f0	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 09:45:13.593+07	2026-11-15 17:45:13.593+07	2026-11-15 09:54:00.368+07	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
361	2026-11-15 09:54:00.375+07	2026-11-15 09:54:00.375+07	b95e60deb94e6a8ea5c80dbfe392cdb6539631e50e775cf302efbfdf182d53b8	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 09:54:00.375+07	2026-11-15 17:54:00.375+07	\N	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
362	2026-11-15 09:54:00.375+07	2026-11-15 09:54:00.375+07	6b6a8a5b138823e2b1ecddb0686abb24ddb19eed5c20b6b10d87d22080782c7c	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 09:54:00.375+07	2026-11-15 17:54:00.375+07	2026-11-15 10:03:17.292+07	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
363	2026-11-15 09:55:23.948+07	2026-11-15 09:55:23.948+07	d09cb15075d210d4127dd82ff3e704689f2c5fe51832050915ae7246c40014c5	ca6821ce-7ba2-4ddc-8377-2827b2f24ed0	2026-11-22 09:55:23.946+07	2026-11-15 17:55:23.946+07	2026-11-15 09:55:24.49+07	2026-11-15 11:38:41.69+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
364	2026-11-15 09:55:24.493+07	2026-11-15 09:55:24.493+07	1545cb77b428af8c4701a43ad59ab7d402ab37df423c6be7662b361da3e6d5d9	ca6821ce-7ba2-4ddc-8377-2827b2f24ed0	2026-11-22 09:55:24.492+07	2026-11-15 17:55:24.492+07	\N	2026-11-15 11:38:41.69+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
365	2026-11-15 09:55:24.493+07	2026-11-15 09:55:24.493+07	96d7a3462c9d96d15db2b378770316ed17d3fc3295e9c88c6c1956e10a93c1d9	ca6821ce-7ba2-4ddc-8377-2827b2f24ed0	2026-11-22 09:55:24.493+07	2026-11-15 17:55:24.493+07	2026-11-15 11:25:23.682+07	2026-11-15 11:38:41.69+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
366	2026-11-15 10:03:17.312+07	2026-11-15 10:03:17.312+07	52fbb92aff4b2a367561be9d116bdc171647eed2f02f935d659fbe6edca15465	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 10:03:17.312+07	2026-11-15 18:03:17.312+07	\N	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
367	2026-11-15 10:03:17.306+07	2026-11-15 10:03:17.306+07	5422dec07547cf21a752e45e5d4e54adb1165deb63cafe9c0055f626765802b8	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 10:03:17.306+07	2026-11-15 18:03:17.306+07	2026-11-15 10:18:35.776+07	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
368	2026-11-15 10:18:35.786+07	2026-11-15 10:18:35.786+07	e2df8afedccbe5de8eb745ac02b7677489302879094b0d6328d1b7894ec9be00	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 10:18:35.785+07	2026-11-15 18:18:35.785+07	2026-11-15 10:21:22.372+07	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
369	2026-11-15 10:21:22.373+07	2026-11-15 10:21:22.373+07	9e972b582b54b8347d604a2f3ba751b1f96aab1bf23e39fceafb5ec726f00f53	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 10:21:22.373+07	2026-11-15 18:21:22.373+07	\N	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
370	2026-11-15 10:21:22.373+07	2026-11-15 10:21:22.373+07	5d4c8ac7fde6b073c22fb7d1d0476ba749fb9844e52a268caa76a8f3ffeefc3d	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 10:21:22.373+07	2026-11-15 18:21:22.373+07	2026-11-15 10:34:37.264+07	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
371	2026-11-15 10:34:37.277+07	2026-11-15 10:34:37.277+07	5e609c5e59e22150e4fd6ee9945cecc8551e435cd32ec5d7b4bcd4e337718079	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 10:34:37.271+07	2026-11-15 18:34:37.271+07	2026-11-15 11:22:22.74+07	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
372	2026-11-15 10:34:37.278+07	2026-11-15 10:34:37.278+07	f85ecefbdcde8cb3ad103d66a67ebdeee1e76be684a7a39b8da53a341810e351	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 10:34:37.277+07	2026-11-15 18:34:37.277+07	\N	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
373	2026-11-15 11:22:22.757+07	2026-11-15 11:22:22.757+07	d019879ccfcd8a94a6903e356deb1dd853a067e8eb986c78d45afc261b88a29b	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 11:22:22.757+07	2026-11-15 19:22:22.757+07	2026-11-15 11:22:24.328+07	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
374	2026-11-15 11:22:24.331+07	2026-11-15 11:22:24.331+07	000bbc802e52fa00a5538589fd3d069f35c0c17adeb12b3df50603d8200ac274	710d486a-61f1-455d-b22e-d5b4519629a2	2026-11-22 11:22:24.331+07	2026-11-15 19:22:24.331+07	\N	2026-11-15 11:22:24.331+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
375	2026-11-15 11:22:26.403+07	2026-11-15 11:22:26.403+07	686275129272604315079e3aafa34d80ff3519b2d93ad9e07d0de4283608dfc4	f3251e6d-e542-4263-bb84-19acb0b91f8e	2026-11-22 11:22:26.403+07	2026-11-15 19:22:26.403+07	2026-11-15 11:37:30.801+07	2026-11-15 11:37:30.801+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
376	2026-11-15 11:25:23.849+07	2026-11-15 11:25:23.849+07	a0ecb9a42714d27e76a45f38308217feb2d016c41fa0c2c79f6351cdf5e76d56	ca6821ce-7ba2-4ddc-8377-2827b2f24ed0	2026-11-22 11:25:23.849+07	2026-11-15 19:25:23.849+07	2026-11-15 11:25:24.424+07	2026-11-15 11:38:41.69+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
377	2026-11-15 11:25:24.424+07	2026-11-15 11:25:24.424+07	0e8bb55eb30a66fd02f4d7a300666c484673787fe8b2e70a7c30878e7643ac9d	ca6821ce-7ba2-4ddc-8377-2827b2f24ed0	2026-11-22 11:25:24.424+07	2026-11-15 19:25:24.424+07	\N	2026-11-15 11:38:41.69+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
378	2026-11-15 11:25:24.424+07	2026-11-15 11:25:24.424+07	188710a43f131afc65218ea63d13e3cbf24b7b4272a412aeaaf36c9d025394b7	ca6821ce-7ba2-4ddc-8377-2827b2f24ed0	2026-11-22 11:25:24.424+07	2026-11-15 19:25:24.424+07	2026-11-15 11:38:41.577+07	2026-11-15 11:38:41.69+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
379	2026-11-15 11:37:30.805+07	2026-11-15 11:37:30.805+07	324e536c59e7ce886e1b2d263e0016c2d64e3f57fd0a9b65244eca635dc9b466	f3251e6d-e542-4263-bb84-19acb0b91f8e	2026-11-22 11:37:30.805+07	2026-11-15 19:37:30.805+07	2026-11-15 11:52:34.808+07	2026-11-15 11:52:34.808+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
380	2026-11-15 11:38:41.595+07	2026-11-15 11:38:41.595+07	c19ce9884c3ceb8f20133c85213a613304fb6accf78038e7c833cbf2c23fc554	ca6821ce-7ba2-4ddc-8377-2827b2f24ed0	2026-11-22 11:38:41.595+07	2026-11-15 19:38:41.595+07	\N	2026-11-15 11:38:41.69+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	28
381	2026-11-15 11:39:29.76+07	2026-11-15 11:39:29.76+07	891afce23e70b88d72d02a31dd4827be8756f214e36a6789b36a741614ee8e59	66422a96-bb72-48c9-b166-b16439b9a415	2026-11-22 11:39:29.76+07	2026-11-15 19:39:29.76+07	2026-11-15 11:46:47.771+07	2026-11-15 12:26:34.207+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
382	2026-11-15 11:46:47.777+07	2026-11-15 11:46:47.777+07	cbf1fc18559bfe407ab6e4b2f801eb3be15f5dbbfc5b9fd61cf679553ead52c7	66422a96-bb72-48c9-b166-b16439b9a415	2026-11-22 11:46:47.777+07	2026-11-15 19:46:47.777+07	\N	2026-11-15 12:26:34.207+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
383	2026-11-15 11:46:47.777+07	2026-11-15 11:46:47.777+07	d5675648e60bc1df940219d0f9eba664b5771fd942d3bac4ddaa6e87e8283b34	66422a96-bb72-48c9-b166-b16439b9a415	2026-11-22 11:46:47.777+07	2026-11-15 19:46:47.777+07	2026-11-15 11:54:29.267+07	2026-11-15 12:26:34.207+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
384	2026-11-15 11:52:34.808+07	2026-11-15 11:52:34.808+07	eb13aa1f65e76b7fabb486c634cac94ca2df966147e95557c73d96fd2f7dc794	f3251e6d-e542-4263-bb84-19acb0b91f8e	2026-11-22 11:52:34.808+07	2026-11-15 19:52:34.808+07	2026-11-15 12:07:38.804+07	2026-11-15 12:07:38.804+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
385	2026-11-15 11:54:29.267+07	2026-11-15 11:54:29.267+07	2581717ec2ea48096c822eb716e3cfab50a4b0893402b7dc725ad59df1d3c01c	66422a96-bb72-48c9-b166-b16439b9a415	2026-11-22 11:54:29.267+07	2026-11-15 19:54:29.267+07	\N	2026-11-15 12:26:34.207+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
386	2026-11-15 11:54:29.267+07	2026-11-15 11:54:29.267+07	d2377c567867e855028ddf411a1ba6fabf143bdc90bc31d7bc515ff0226530f2	66422a96-bb72-48c9-b166-b16439b9a415	2026-11-22 11:54:29.267+07	2026-11-15 19:54:29.267+07	2026-11-15 12:04:15.119+07	2026-11-15 12:26:34.207+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
387	2026-11-15 11:55:59.683+07	2026-11-15 11:55:59.683+07	2694b5ff9735e148b8025afbaf01e2fb0ecf03a2b71d41ddbb4a04387d6b15f2	11a46781-7b11-47e1-9380-122292fcc317	2026-11-22 11:55:59.683+07	2026-11-15 19:55:59.683+07	2026-11-15 11:56:48.673+07	2026-11-15 12:29:48.741+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	2
388	2026-11-15 11:56:48.672+07	2026-11-15 11:56:48.672+07	ad01e8cd82a44642e1bc77edcb151b2a1b4781f5fba5ff4d42266be817cd6eda	11a46781-7b11-47e1-9380-122292fcc317	2026-11-22 11:56:48.671+07	2026-11-15 19:56:48.671+07	\N	2026-11-15 12:29:48.741+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	2
389	2026-11-15 11:56:48.677+07	2026-11-15 11:56:48.677+07	c9233d5203c56b84cf0f85e1bd3af0a1d0a0ced0da146e8aeeeaf422450a8552	11a46781-7b11-47e1-9380-122292fcc317	2026-11-22 11:56:48.677+07	2026-11-15 19:56:48.677+07	2026-11-15 12:05:02.412+07	2026-11-15 12:29:48.741+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	2
390	2026-11-15 12:04:15.131+07	2026-11-15 12:04:15.131+07	63c8650e5a2a6bb7ad08a5e0a9b2b4e6cfa196265af87e25b600a384fedfc246	66422a96-bb72-48c9-b166-b16439b9a415	2026-11-22 12:04:15.128+07	2026-11-15 20:04:15.128+07	\N	2026-11-15 12:26:34.207+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
391	2026-11-15 12:04:15.136+07	2026-11-15 12:04:15.136+07	987aebd0116fa0fd13423e9dac65c5496271ee2bc0f5bcca2cb2606ab33cfb78	66422a96-bb72-48c9-b166-b16439b9a415	2026-11-22 12:04:15.134+07	2026-11-15 20:04:15.134+07	2026-11-15 12:23:17.479+07	2026-11-15 12:26:34.207+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
392	2026-11-15 12:05:02.412+07	2026-11-15 12:05:02.412+07	ce9210a4edffcfe82495d4cdde88775efdc5a307ac07801670b3e97e94e21920	11a46781-7b11-47e1-9380-122292fcc317	2026-11-22 12:05:02.412+07	2026-11-15 20:05:02.412+07	2026-11-15 12:24:24.289+07	2026-11-15 12:29:48.741+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	2
393	2026-11-15 12:05:02.414+07	2026-11-15 12:05:02.414+07	ccd38ac8c5a715d2cec0982cf03bacc30bded0deb7ec70d539ff2200b8daa9fd	11a46781-7b11-47e1-9380-122292fcc317	2026-11-22 12:05:02.413+07	2026-11-15 20:05:02.413+07	\N	2026-11-15 12:29:48.741+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	2
394	2026-11-15 12:07:38.819+07	2026-11-15 12:07:38.819+07	d73bd5543735e507a82bcab5219b75268688b3e3528d98f342479112d3bbc388	f3251e6d-e542-4263-bb84-19acb0b91f8e	2026-11-22 12:07:38.819+07	2026-11-15 20:07:38.819+07	2026-11-15 12:22:42.824+07	2026-11-15 12:22:42.824+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
395	2026-11-15 12:22:42.831+07	2026-11-15 12:22:42.831+07	42565880ef208a3a80e230e5ef35faa9b3057b9154e5d0024fa09a789a501e91	f3251e6d-e542-4263-bb84-19acb0b91f8e	2026-11-22 12:22:42.831+07	2026-11-15 20:22:42.831+07	2026-11-15 12:37:46.816+07	2026-11-15 12:37:46.816+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
396	2026-11-15 12:23:17.484+07	2026-11-15 12:23:17.484+07	05ab0134ab89c03c53317e54bc46505820c9a80ad5f861605dfe99ba1cb156b6	66422a96-bb72-48c9-b166-b16439b9a415	2026-11-22 12:23:17.484+07	2026-11-15 20:23:17.484+07	2026-11-15 12:23:18.42+07	2026-11-15 12:26:34.207+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
397	2026-11-15 12:23:18.426+07	2026-11-15 12:23:18.426+07	f0e143ce0f0cb930c55c45e0ed9a6df98fd54bce8b516c7b90504bb2f3619877	66422a96-bb72-48c9-b166-b16439b9a415	2026-11-22 12:23:18.426+07	2026-11-15 20:23:18.426+07	\N	2026-11-15 12:26:34.207+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
398	2026-11-15 12:23:18.427+07	2026-11-15 12:23:18.427+07	2cf5b7a3a4caa48464d33bf4527881995573234bb3480066f634c7718e35e245	66422a96-bb72-48c9-b166-b16439b9a415	2026-11-22 12:23:18.427+07	2026-11-15 20:23:18.427+07	2026-11-15 12:24:11.877+07	2026-11-15 12:26:34.207+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
400	2026-11-15 12:24:11.884+07	2026-11-15 12:24:11.884+07	b5c0f948919951cd7e4e5fc4e52516d26eedc5e4f1946d74fdf3da6c16ac7148	66422a96-bb72-48c9-b166-b16439b9a415	2026-11-22 12:24:11.884+07	2026-11-15 20:24:11.884+07	\N	2026-11-15 12:26:34.207+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
401	2026-11-15 12:24:24.289+07	2026-11-15 12:24:24.289+07	721e3441a02b7f2eb5ebd9bc63f276ef2c1e30f9bd54039e0b4f5cc9ec529379	11a46781-7b11-47e1-9380-122292fcc317	2026-11-22 12:24:24.289+07	2026-11-15 20:24:24.289+07	2026-11-15 12:24:28.565+07	2026-11-15 12:29:48.741+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	2
402	2026-11-15 12:24:28.565+07	2026-11-15 12:24:28.565+07	cbce12fea05d34496b1e4561caca4f7ec5f70be47a7d13a7ae9692ad6e68bff0	11a46781-7b11-47e1-9380-122292fcc317	2026-11-22 12:24:28.565+07	2026-11-15 20:24:28.565+07	\N	2026-11-15 12:29:48.741+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	2
403	2026-11-15 12:26:34.205+07	2026-11-15 12:26:34.207+07	8ec8e6b4a90b481fc6bbaa3a62b7b86f12e3c64cf8e932601f9c5a41cd8bbc72	66422a96-bb72-48c9-b166-b16439b9a415	2026-11-22 12:26:34.205+07	2026-11-15 20:26:34.205+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
404	2026-11-15 12:27:01.462+07	2026-11-15 12:27:01.462+07	c76a4c4a92cba89fcf79195229344f611a847330ef6dbd7f6b6b4894194d0167	37dbfe2c-a349-4bb0-a43c-730fa8f4d3bc	2026-11-22 12:27:01.462+07	2026-11-15 20:27:01.462+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
405	2026-11-15 12:29:52.505+07	2026-11-15 12:29:52.505+07	6f24117be4cd0eb8784147ebf526db292bf5d2aa22a22fd8aefdad0e9742eff5	3744a819-bcf1-4aea-b99a-74903be9d15c	2026-11-22 12:29:52.505+07	2026-11-15 20:29:52.505+07	2026-11-15 12:34:20.867+07	2026-11-15 12:34:20.874+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	2
406	2026-11-15 12:34:20.874+07	2026-11-15 12:34:20.874+07	a2854222f5dffc8d720ee1dfff2e91f061339439ca95b1e5e4ee3526bd648909	3744a819-bcf1-4aea-b99a-74903be9d15c	2026-11-22 12:34:20.874+07	2026-11-15 20:34:20.874+07	\N	2026-11-15 12:34:20.874+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	2
407	2026-11-15 12:34:28.724+07	2026-11-15 12:34:28.724+07	bae3e4bbf6e9127700c954fdc8aedad55740992071e2d7bdbc7c822427502fd3	f0c6fd5b-6d8e-4217-9671-0a9ec24c86aa	2026-11-22 12:34:28.724+07	2026-11-15 20:34:28.724+07	2026-11-15 12:36:28.546+07	2026-11-15 12:47:53.981+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	2
408	2026-11-15 12:35:26.955+07	2026-11-15 12:35:26.955+07	400cf9810b4c89c94595d78c8bb366017357e7e6fbad6de01cd86a8d4c36da84	104f8953-d809-4e0d-a8d9-05c24a3758dd	2026-11-22 12:35:26.955+07	2026-11-15 20:35:26.955+07	2026-11-15 12:48:30.436+07	2026-11-15 12:48:30.436+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
409	2026-11-15 12:36:28.552+07	2026-11-15 12:36:28.552+07	de6f3170d52aaf79e8a1804c6003ece8c1fc8f167b1fdde9c990273e224e18c3	f0c6fd5b-6d8e-4217-9671-0a9ec24c86aa	2026-11-22 12:36:28.552+07	2026-11-15 20:36:28.552+07	2026-11-15 12:36:35.4+07	2026-11-15 12:47:53.981+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	2
410	2026-11-15 12:36:28.552+07	2026-11-15 12:36:28.552+07	da049b5775782f01664e5d806a8f33875b9a2274faeae4460b9bc752f901601d	f0c6fd5b-6d8e-4217-9671-0a9ec24c86aa	2026-11-22 12:36:28.552+07	2026-11-15 20:36:28.552+07	\N	2026-11-15 12:47:53.981+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	2
411	2026-11-15 12:36:35.406+07	2026-11-15 12:36:35.406+07	6accffbcbedee23f1ad2171978cf731389567118996cc8920ab43080cdfca7c9	f0c6fd5b-6d8e-4217-9671-0a9ec24c86aa	2026-11-22 12:36:35.405+07	2026-11-15 20:36:35.405+07	\N	2026-11-15 12:47:53.981+07	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	2
412	2026-11-15 12:37:46.816+07	2026-11-15 12:37:46.816+07	e249d38e2d18c377e3f9c4f188d864069e872827dc3e772ed63a61b2b3b5df67	f3251e6d-e542-4263-bb84-19acb0b91f8e	2026-11-22 12:37:46.816+07	2026-11-15 20:37:46.816+07	2026-11-15 12:52:50.801+07	2026-11-15 12:52:50.801+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
413	2026-11-15 12:47:57.751+07	2026-11-15 12:47:57.751+07	2a81f191c1c33f91e1662582b883b27500417a070105aeb75995690101a7f685	e01e0f9b-1f06-453f-9e57-3878a7757673	2026-11-22 12:47:57.751+07	2026-11-15 20:47:57.751+07	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36	127.0.0.1	2
414	2026-11-15 12:48:30.436+07	2026-11-15 12:48:30.436+07	cdb28376eb05bad39c333d70a1cd16543545a4852d0944e4215f2904d9f356ed	104f8953-d809-4e0d-a8d9-05c24a3758dd	2026-11-22 12:48:30.436+07	2026-11-15 20:48:30.436+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
415	2026-11-15 12:48:30.44+07	2026-11-15 12:48:30.44+07	2757d18615e313abf9fe22a1a60fe3a64ab8e38688e5ec6f62ce144f1d35cbe6	104f8953-d809-4e0d-a8d9-05c24a3758dd	2026-11-22 12:48:30.44+07	2026-11-15 20:48:30.44+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	2
416	2026-11-15 12:50:19.116+07	2026-11-15 12:50:19.116+07	60f663c4e1e804cf99b25973d95f8ee3ccb23a7a47a3f2db0b2ab393d535be80	50de388e-6b7b-4d1e-b11b-5b0000fdbca5	2026-11-22 12:50:19.116+07	2026-11-15 20:50:19.116+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
417	2026-11-15 12:52:50.803+07	2026-11-15 12:52:50.803+07	cde9bed9ad68bfea92172abe663ad7e8ad0073593cb32908ad3979a3adebec9e	f3251e6d-e542-4263-bb84-19acb0b91f8e	2026-11-22 12:52:50.803+07	2026-11-15 20:52:50.803+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
418	2026-11-16 09:23:58.35+07	2026-11-16 09:23:58.35+07	e872e3ff283930ef2855c858497bc262da8015b5f85f0df73918fc6c9e4dbff4	7129ef92-c707-4cd1-a2c9-702a497280fb	2026-11-23 09:23:58.35+07	2026-11-16 17:23:58.35+07	2026-11-16 09:33:08.571+07	2026-11-16 09:56:05.794+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
419	2026-11-16 09:33:08.571+07	2026-11-16 09:33:08.571+07	3a8689045b73a19d82af31bfac00f032f51d383082535dd5abb70adb33ed7c1c	7129ef92-c707-4cd1-a2c9-702a497280fb	2026-11-23 09:33:08.571+07	2026-11-16 17:33:08.571+07	\N	2026-11-16 09:56:05.794+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
426	2026-11-16 09:56:08.652+07	2026-11-16 09:56:08.652+07	727d4e55fa3f1f9d57ed993a6fa4157ae95fb2b086510fbe604e5e693d0a790f	f0fbd944-d620-4c40-bc5f-2785e2a28880	2026-11-23 09:56:08.652+07	2026-11-16 17:56:08.652+07	2026-11-16 10:00:41.727+07	2026-11-16 10:00:41.727+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
427	2026-11-16 10:00:41.728+07	2026-11-16 10:00:41.728+07	1b74ae825ae94b1b2dd10ef5cefd54804692284f5f6050ffc6d7fb0b5ce36ce2	f0fbd944-d620-4c40-bc5f-2785e2a28880	2026-11-23 10:00:41.728+07	2026-11-16 18:00:41.728+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
428	2026-11-16 10:00:41.729+07	2026-11-16 10:00:41.729+07	4170ae696d2ffd83506f142662e28f7ca599f4d98d4cd416091a728a0dc553e5	f0fbd944-d620-4c40-bc5f-2785e2a28880	2026-11-23 10:00:41.729+07	2026-11-16 18:00:41.729+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
429	2026-11-16 10:00:44.904+07	2026-11-16 10:00:44.904+07	3fc7f97dbe0e16c5f802f7f5f2f39abbb009bd764d6e389330adf44ccccb15dc	73d24c55-99c4-48f4-83bf-a1fb1dfb958c	2026-11-23 10:00:44.904+07	2026-11-16 18:00:44.904+07	2026-11-16 10:06:08.762+07	2026-11-16 10:25:59.296+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
430	2026-11-16 10:06:08.767+07	2026-11-16 10:06:08.767+07	f23032f52a23e27a59f996ed5bc27b203840cef0ecf14d7b27c1b0b8e41c2a6f	73d24c55-99c4-48f4-83bf-a1fb1dfb958c	2026-11-23 10:06:08.767+07	2026-11-16 18:06:08.767+07	\N	2026-11-16 10:25:59.296+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
431	2026-11-16 10:06:08.77+07	2026-11-16 10:06:08.77+07	26a7df14d525a861fe439107aa7920808d4339d1db38f52c3a1ac2bddd412857	73d24c55-99c4-48f4-83bf-a1fb1dfb958c	2026-11-23 10:06:08.769+07	2026-11-16 18:06:08.769+07	2026-11-16 10:10:28.782+07	2026-11-16 10:25:59.296+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
432	2026-11-16 10:10:28.784+07	2026-11-16 10:10:28.784+07	162867c2ef9413cf03687d553ee2281faed66242643a4978fc37902c84c0df06	73d24c55-99c4-48f4-83bf-a1fb1dfb958c	2026-11-23 10:10:28.784+07	2026-11-16 18:10:28.784+07	\N	2026-11-16 10:25:59.296+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
433	2026-11-16 10:10:28.784+07	2026-11-16 10:10:28.784+07	e285a1b87f76a82591112e37390364c60db851f78849b9877db2987e9e2ae517	73d24c55-99c4-48f4-83bf-a1fb1dfb958c	2026-11-23 10:10:28.784+07	2026-11-16 18:10:28.784+07	2026-11-16 10:17:48.262+07	2026-11-16 10:25:59.296+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
434	2026-11-16 10:17:48.266+07	2026-11-16 10:17:48.266+07	ff96eb31f8ba987d7d5980f5f959db2cd4154c64c71a8ff7e63f390561d0420c	73d24c55-99c4-48f4-83bf-a1fb1dfb958c	2026-11-23 10:17:48.266+07	2026-11-16 18:17:48.266+07	\N	2026-11-16 10:25:59.296+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
439	2026-11-16 10:37:28.252+07	2026-11-16 10:37:28.252+07	cfeb072afe1c58eab2a7e50c102b2497ae1bac46a582a70876baed35dbde16ee	fecbf4e0-a3c9-44f2-b73d-eb6ce2b0ec47	2026-11-23 10:37:28.251+07	2026-11-16 18:37:28.251+07	2026-11-16 10:41:04.153+07	2026-11-16 10:41:04.157+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
440	2026-11-16 10:41:04.156+07	2026-11-16 10:41:04.156+07	3450cabf7bb3e892ab1b73bd18363bb612c2589dcf07a2a7347acf8345869a76	fecbf4e0-a3c9-44f2-b73d-eb6ce2b0ec47	2026-11-23 10:41:04.155+07	2026-11-16 18:41:04.155+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
441	2026-11-16 10:41:06.679+07	2026-11-16 10:41:06.679+07	c31ac665cf626696797241457ebd256bacf13aab3f2bd25912a1745ab2be75c3	82a8f174-58c4-46c4-8485-8bc4d0cd70eb	2026-11-23 10:41:06.679+07	2026-11-16 18:41:06.679+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
442	2026-11-16 10:44:54.832+07	2026-11-16 10:44:54.832+07	74f62f374db6e33a6f3aa0f71af67a430a6d67efd779bd08a8fa1e22c1f9c69e	110e12a8-a443-48b6-973e-99912ce8e30a	2026-11-23 10:44:54.831+07	2026-11-16 18:44:54.831+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
443	2026-11-16 10:45:43.523+07	2026-11-16 10:45:43.523+07	5104ca70cd1812c12af6719376371dcee2771f833c17747ecd597a47ab316f19	9ba2590e-7a0e-49e2-b7de-9b9d3a7045e4	2026-11-23 10:45:43.523+07	2026-11-16 18:45:43.523+07	2026-11-16 10:50:47.478+07	2026-11-16 10:50:47.481+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
444	2026-11-16 10:50:47.481+07	2026-11-16 10:50:47.481+07	54d4f39d67820a48f68df7074903a25a11559e4336b43994a5dfb8ec95079534	9ba2590e-7a0e-49e2-b7de-9b9d3a7045e4	2026-11-23 10:50:47.48+07	2026-11-16 18:50:47.48+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
445	2026-11-16 10:50:49.32+07	2026-11-16 10:50:49.32+07	bf58b68ce2c882e1c8b7133347ee09cf55f28ceb03918e06f18b48767470c167	71da8812-c0be-40db-9430-0f52cf0bddb6	2026-11-23 10:50:49.319+07	2026-11-16 18:50:49.319+07	2026-11-16 10:54:54.586+07	2026-11-16 11:25:16.701+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
446	2026-11-16 10:54:54.589+07	2026-11-16 10:54:54.589+07	db14df68a1fc333e072889b09e998ced9356b6f102a994b5eba45a4ca337ddc1	71da8812-c0be-40db-9430-0f52cf0bddb6	2026-11-23 10:54:54.588+07	2026-11-16 18:54:54.588+07	\N	2026-11-16 11:25:16.701+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
447	2026-11-16 10:54:54.589+07	2026-11-16 10:54:54.589+07	6b36cdac53d3c0563dc0b5f34ca69c8e7faac208ff66e241994f5bc4f80575d5	71da8812-c0be-40db-9430-0f52cf0bddb6	2026-11-23 10:54:54.589+07	2026-11-16 18:54:54.589+07	2026-11-16 11:10:04.37+07	2026-11-16 11:25:16.701+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
448	2026-11-16 11:10:04.377+07	2026-11-16 11:10:04.377+07	85ed571f68b60f3a74367239a7d3a3e7861e7939fcec3ea7d1eccec31c24ba88	71da8812-c0be-40db-9430-0f52cf0bddb6	2026-11-23 11:10:04.377+07	2026-11-16 19:10:04.377+07	2026-11-16 11:25:16.489+07	2026-11-16 11:25:16.701+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
449	2026-11-16 11:25:16.495+07	2026-11-16 11:25:16.495+07	dbefee7dde66c6732883958e0de7cc77f63dd1fcf5bc61d53a63e78f0a1a0917	71da8812-c0be-40db-9430-0f52cf0bddb6	2026-11-23 11:25:16.495+07	2026-11-16 19:25:16.495+07	\N	2026-11-16 11:25:16.701+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
450	2026-11-16 11:25:18.789+07	2026-11-16 11:25:18.789+07	f21eea786caa5598d967b4d5d7208b930ada24857cb6f6efc41639caf04c9d15	9321274a-0b7b-413a-b50e-15d1570a37ff	2026-11-23 11:25:18.789+07	2026-11-16 19:25:18.789+07	2026-11-16 11:33:07.763+07	2026-11-16 11:36:09.07+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
451	2026-11-16 11:33:07.765+07	2026-11-16 11:33:07.765+07	82b7e64d71843233fd786dc68c40ca45157243f9201b9aaab355b7125dd7e1cc	9321274a-0b7b-413a-b50e-15d1570a37ff	2026-11-23 11:33:07.765+07	2026-11-16 19:33:07.765+07	\N	2026-11-16 11:36:09.07+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
452	2026-11-16 11:33:07.766+07	2026-11-16 11:33:07.766+07	bd4ec2b81a3f38b6b3ff7ae661de4f41ba7199eeb2c775e20043d380673d5e37	9321274a-0b7b-413a-b50e-15d1570a37ff	2026-11-23 11:33:07.765+07	2026-11-16 19:33:07.765+07	2026-11-16 11:36:08.966+07	2026-11-16 11:36:09.07+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
453	2026-11-16 11:36:08.969+07	2026-11-16 11:36:08.969+07	e4457ec590ff4707f6c62a24d9e74c75d3fcaed51c68a4d3a306158284daea9b	9321274a-0b7b-413a-b50e-15d1570a37ff	2026-11-23 11:36:08.969+07	2026-11-16 19:36:08.969+07	\N	2026-11-16 11:36:09.07+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
454	2026-11-16 11:36:11.114+07	2026-11-16 11:36:11.114+07	ad475d527a854153be4457ea8a34b90bd9a7fe778c10a901f7d0aefc7377d4bf	9b4e1e5f-3db0-49df-ad0e-662a46a6e38e	2026-11-23 11:36:11.114+07	2026-11-16 19:36:11.114+07	2026-11-16 11:36:28.282+07	2026-11-16 11:36:42.935+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
455	2026-11-16 11:36:28.283+07	2026-11-16 11:36:28.283+07	a5ad19cdae3dc0b55d2b2eeb791b7311e48a205b2b491e9d058669e88f36607d	9b4e1e5f-3db0-49df-ad0e-662a46a6e38e	2026-11-23 11:36:28.283+07	2026-11-16 19:36:28.283+07	\N	2026-11-16 11:36:42.935+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
456	2026-11-16 11:36:28.283+07	2026-11-16 11:36:28.283+07	dd4d515cc3512802b37b0a863d833e2d10b5407ed5d3ad2abe3e9cde23c8e13a	9b4e1e5f-3db0-49df-ad0e-662a46a6e38e	2026-11-23 11:36:28.283+07	2026-11-16 19:36:28.283+07	2026-11-16 11:36:41.653+07	2026-11-16 11:36:42.935+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
458	2026-11-16 11:36:41.655+07	2026-11-16 11:36:41.655+07	4c8fdd60d4b9b25404740847080230d2d8a690d68d452ce51d3f3f333fa0fbd9	9b4e1e5f-3db0-49df-ad0e-662a46a6e38e	2026-11-23 11:36:41.654+07	2026-11-16 19:36:41.654+07	\N	2026-11-16 11:36:42.935+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
459	2026-11-16 11:36:42.249+07	2026-11-16 11:36:42.249+07	b86fdea84d06781e4a146c426954bb3e5180c0a970b85df91884affc5619eb97	9b4e1e5f-3db0-49df-ad0e-662a46a6e38e	2026-11-23 11:36:42.249+07	2026-11-16 19:36:42.249+07	\N	2026-11-16 11:36:42.935+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
460	2026-11-16 11:36:42.25+07	2026-11-16 11:36:42.25+07	0591ec5a263cbea3b571bef3dca174b31eedfcffa95b512a4fc4697260911b5c	9b4e1e5f-3db0-49df-ad0e-662a46a6e38e	2026-11-23 11:36:42.25+07	2026-11-16 19:36:42.25+07	2026-11-16 11:36:42.668+07	2026-11-16 11:36:42.935+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
461	2026-11-16 11:36:42.67+07	2026-11-16 11:36:42.67+07	f592663d2f300e62bf3c1a676877964729b09e3acc1dfeb015132363e8a523f8	9b4e1e5f-3db0-49df-ad0e-662a46a6e38e	2026-11-23 11:36:42.67+07	2026-11-16 19:36:42.67+07	\N	2026-11-16 11:36:42.935+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
462	2026-11-16 11:36:42.671+07	2026-11-16 11:36:42.671+07	9ca72d2aa63da51f7dceee6fb400abd89f662950ff91c12d0afa64c1a93e11dd	9b4e1e5f-3db0-49df-ad0e-662a46a6e38e	2026-11-23 11:36:42.671+07	2026-11-16 19:36:42.671+07	\N	2026-11-16 11:36:42.935+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
464	2026-11-16 11:37:29.404+07	2026-11-16 11:37:29.404+07	4b2d9ef0789d0656aa70df67d14303135a51f265a232dbcb8d5ae9cbaf299a0a	5b5c10fb-74e4-46cb-9c72-9fbeafa20663	2026-11-23 11:37:29.404+07	2026-11-16 19:37:29.404+07	\N	2026-11-16 12:14:22.002+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
465	2026-11-16 11:37:29.405+07	2026-11-16 11:37:29.405+07	16ec9d292cc8a75c9741bc62f8f1bfa439bc56a2efecf7f0e44ffc84d6888b5e	5b5c10fb-74e4-46cb-9c72-9fbeafa20663	2026-11-23 11:37:29.405+07	2026-11-16 19:37:29.405+07	2026-11-16 11:45:44.515+07	2026-11-16 12:14:22.002+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
466	2026-11-16 11:45:44.516+07	2026-11-16 11:45:44.516+07	396249bc244674fa880e174bd878ad21af1578578cd9bfcc9a85d0ba751e7eb0	5b5c10fb-74e4-46cb-9c72-9fbeafa20663	2026-11-23 11:45:44.516+07	2026-11-16 19:45:44.516+07	\N	2026-11-16 12:14:22.002+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
467	2026-11-16 11:45:44.517+07	2026-11-16 11:45:44.517+07	519517291a34c61cc425dd28e2c3d567dcd18dac0cad578afe7b35ec31a928aa	5b5c10fb-74e4-46cb-9c72-9fbeafa20663	2026-11-23 11:45:44.517+07	2026-11-16 19:45:44.517+07	2026-11-16 11:54:13.27+07	2026-11-16 12:14:22.002+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
468	2026-11-16 11:54:13.271+07	2026-11-16 11:54:13.271+07	4368ff0fd9f4de67901bb750f3e645682433b68da8b4556109bacc793d80dc71	5b5c10fb-74e4-46cb-9c72-9fbeafa20663	2026-11-23 11:54:13.271+07	2026-11-16 19:54:13.271+07	\N	2026-11-16 12:14:22.002+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
469	2026-11-16 11:54:13.272+07	2026-11-16 11:54:13.272+07	88b12a80f25a0bc6f69b3d9b087996a9fa3aa6802d5704bc0ab41cef5e201b26	5b5c10fb-74e4-46cb-9c72-9fbeafa20663	2026-11-23 11:54:13.272+07	2026-11-16 19:54:13.272+07	2026-11-16 11:59:59.203+07	2026-11-16 12:14:22.002+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
471	2026-11-16 11:59:59.206+07	2026-11-16 11:59:59.206+07	1ce6e00a6cffa6c696c4e03af2855370ca53cbc15744a351c991581abdbb7269	5b5c10fb-74e4-46cb-9c72-9fbeafa20663	2026-11-23 11:59:59.205+07	2026-11-16 19:59:59.205+07	2026-11-16 12:14:21.992+07	2026-11-16 12:14:22.002+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
472	2026-11-16 12:14:21.998+07	2026-11-16 12:14:21.998+07	57f534e9c5a60a9bc9fd3c7e265444b697aa16325628a2f8e1323f5110fd7526	5b5c10fb-74e4-46cb-9c72-9fbeafa20663	2026-11-23 12:14:21.997+07	2026-11-16 20:14:21.997+07	\N	2026-11-16 12:14:22.002+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
473	2026-11-16 12:14:24.188+07	2026-11-16 12:14:24.188+07	08a3d12302c9924e7e9c46a1a19c8ccf8d908aecd17cbd5cccd7e096912d6602	d82ed227-8e9f-4b04-8296-532b1d58eea7	2026-11-23 12:14:24.188+07	2026-11-16 20:14:24.188+07	2026-11-16 12:26:37.179+07	2026-11-16 12:26:37.183+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
474	2026-11-16 12:26:37.182+07	2026-11-16 12:26:37.182+07	e62353c6ee4d6d4fbe75bdb165bb12aff334cf9881ef9de09e4e5109df4a56db	d82ed227-8e9f-4b04-8296-532b1d58eea7	2026-11-23 12:26:37.182+07	2026-11-16 20:26:37.182+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
475	2026-11-16 12:26:39.442+07	2026-11-16 12:26:39.442+07	b712d80a0b1409aff225a0685bbe253a263270e0b57d7ab8db0c8215366d8d2d	8d5bd8d5-cf6d-48dc-bee5-915856d46020	2026-11-23 12:26:39.442+07	2026-11-16 20:26:39.442+07	2026-11-16 12:33:35.813+07	2026-11-16 12:33:35.944+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
476	2026-11-16 12:33:35.815+07	2026-11-16 12:33:35.815+07	f31e8485546b5bf4acb14757c7cae79a44e8d5dfa289794cbae7cd914f43479b	8d5bd8d5-cf6d-48dc-bee5-915856d46020	2026-11-23 12:33:35.815+07	2026-11-16 20:33:35.815+07	\N	2026-11-16 12:33:35.944+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
477	2026-11-16 12:33:38.043+07	2026-11-16 12:33:38.043+07	2ad00c4fd7be848c168529346524bb4828fef811b4dcc92211df8e7331d9699b	5aa29508-f557-44d5-984d-54b4c0af71ef	2026-11-23 12:33:38.042+07	2026-11-16 20:33:38.042+07	2026-11-16 12:49:04.367+07	2026-11-16 13:31:37.006+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
478	2026-11-16 12:35:11.04+07	2026-11-16 12:35:11.04+07	1f9ab1b706c7bc73fd2280bf6ba221317c332ce9d4aced112176565667c70d61	4890624e-d71a-4821-8b9d-b9cdca812ade	2026-11-23 12:35:11.04+07	2026-11-16 20:35:11.04+07	2026-11-16 12:37:10.57+07	2026-11-16 12:56:35.707+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
479	2026-11-16 12:37:10.571+07	2026-11-16 12:37:10.571+07	9c7e99b6d11978c0ad997e43852ec77268d7674968759e4c297f5baa99517616	4890624e-d71a-4821-8b9d-b9cdca812ade	2026-11-23 12:37:10.571+07	2026-11-16 20:37:10.571+07	\N	2026-11-16 12:56:35.707+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
480	2026-11-16 12:37:10.571+07	2026-11-16 12:37:10.571+07	081f0b84abfb683928fbd6984245bae504eeeb1028be0b79600b8295e41bf968	4890624e-d71a-4821-8b9d-b9cdca812ade	2026-11-23 12:37:10.571+07	2026-11-16 20:37:10.571+07	2026-11-16 12:53:04.363+07	2026-11-16 12:56:35.707+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
481	2026-11-16 12:49:04.369+07	2026-11-16 12:49:04.369+07	ad8876fcd6f5f3e3aafc98404dfda5f61413a1030563410461be93a4378013cc	5aa29508-f557-44d5-984d-54b4c0af71ef	2026-11-23 12:49:04.369+07	2026-11-16 20:49:04.369+07	2026-11-16 13:12:43.977+07	2026-11-16 13:31:37.006+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
482	2026-11-16 12:53:04.363+07	2026-11-16 12:53:04.363+07	ffa01c0fc7ea60067690a0df392a746d2743a37f0fee3db40fa471a0745d30c7	4890624e-d71a-4821-8b9d-b9cdca812ade	2026-11-23 12:53:04.363+07	2026-11-16 20:53:04.363+07	2026-11-16 12:56:35.572+07	2026-11-16 12:56:35.707+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
483	2026-11-16 12:56:35.576+07	2026-11-16 12:56:35.576+07	678f136f4c164a32743007987701306cdafe1eeb2acc105fe2d9d65856b0d66d	4890624e-d71a-4821-8b9d-b9cdca812ade	2026-11-23 12:56:35.576+07	2026-11-16 20:56:35.576+07	\N	2026-11-16 12:56:35.707+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
484	2026-11-16 12:56:41.742+07	2026-11-16 12:56:41.742+07	9d1777a0065cf17fcbe22fe2e9a7cfebb8ef68413360dfa0ad7d3a83609ae986	12875ec6-5aa9-4cd2-aa4a-561208852f73	2026-11-23 12:56:41.742+07	2026-11-16 20:56:41.742+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
485	2026-11-16 13:12:43.982+07	2026-11-16 13:12:43.982+07	7697fa050e70ed6f6edbe080d9c36c499775281be03308257b0dffd9a944cba8	5aa29508-f557-44d5-984d-54b4c0af71ef	2026-11-23 13:12:43.982+07	2026-11-16 21:12:43.982+07	2026-11-16 13:28:04.359+07	2026-11-16 13:31:37.006+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
486	2026-11-16 13:12:43.982+07	2026-11-16 13:12:43.982+07	e7bf7eb47c67d3647854e604d0a06d38d999b620930f19e3f2ef3a6927477d19	5aa29508-f557-44d5-984d-54b4c0af71ef	2026-11-23 13:12:43.982+07	2026-11-16 21:12:43.982+07	\N	2026-11-16 13:31:37.006+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
487	2026-11-16 13:21:44.732+07	2026-11-16 13:21:44.732+07	5fac629a594065d24b8d9ff10c71f035552a65430fe9d9d6ffbd67eef66fe2f6	9e677d2a-4770-49f9-910d-f86ce3c4be46	2026-11-23 13:21:44.732+07	2026-11-16 21:21:44.732+07	2026-11-16 13:29:11.235+07	2026-11-16 13:29:11.235+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
488	2026-11-16 13:28:04.36+07	2026-11-16 13:28:04.36+07	1deb1d21caa9c12df691c1c05d32571a271f811f2942a67184a77a23a1ade3b6	5aa29508-f557-44d5-984d-54b4c0af71ef	2026-11-23 13:28:04.36+07	2026-11-16 21:28:04.36+07	2026-11-16 13:29:06.126+07	2026-11-16 13:31:37.006+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
489	2026-11-16 13:29:06.128+07	2026-11-16 13:29:06.128+07	6815cbc30d9e277f896e2e7db8c0f067e9823cb7a621efd0ab6caa04f3be5128	5aa29508-f557-44d5-984d-54b4c0af71ef	2026-11-23 13:29:06.128+07	2026-11-16 21:29:06.128+07	\N	2026-11-16 13:31:37.006+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
490	2026-11-16 13:29:06.129+07	2026-11-16 13:29:06.129+07	6c1315cede8796d00fc6246089d3ddbb0c859bf223788762b4d5e79593417048	5aa29508-f557-44d5-984d-54b4c0af71ef	2026-11-23 13:29:06.129+07	2026-11-16 21:29:06.129+07	2026-11-16 13:31:10.848+07	2026-11-16 13:31:37.006+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
491	2026-11-16 13:29:11.235+07	2026-11-16 13:29:11.235+07	2bda2a133b738d03f1e62e6769b587664272a1d33ad3ee49e388e442d557375d	9e677d2a-4770-49f9-910d-f86ce3c4be46	2026-11-23 13:29:11.235+07	2026-11-16 21:29:11.235+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
492	2026-11-16 13:29:11.237+07	2026-11-16 13:29:11.237+07	8ca13a3ece52b6a6aa8b45311495e4dd861cc19f697b5348de3b568a7b78b5f1	9e677d2a-4770-49f9-910d-f86ce3c4be46	2026-11-23 13:29:11.237+07	2026-11-16 21:29:11.237+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
493	2026-11-16 13:31:10.852+07	2026-11-16 13:31:10.852+07	d47577cf580ea7b1123663e4222b7997fab525961b065b8dd115ff232b3eb498	5aa29508-f557-44d5-984d-54b4c0af71ef	2026-11-23 13:31:10.852+07	2026-11-16 21:31:10.852+07	\N	2026-11-16 13:31:37.006+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
494	2026-11-16 13:31:39.463+07	2026-11-16 13:31:39.463+07	32740c89d19db485307eba4ab349ce16ba50a363a07333084aaeaf8aecf39788	d1ca9418-96c0-42a1-bdf8-44a437626245	2026-11-23 13:31:39.463+07	2026-11-16 21:31:39.463+07	2026-11-16 20:48:40.408+07	2026-11-16 20:48:40.408+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
495	2026-11-16 20:48:40.419+07	2026-11-16 20:48:40.419+07	299a383a6ab8da0c71848bfcea64c010a2bad9383d2fe83a2568e7ec32fde899	d1ca9418-96c0-42a1-bdf8-44a437626245	2026-11-23 20:48:40.419+07	2026-11-17 04:48:40.419+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
496	2026-11-16 20:48:40.418+07	2026-11-16 20:48:40.418+07	498a8faf6c5884708d196e205f0742faea02e0ff19d6c4b7555ea11c38c8fbba	d1ca9418-96c0-42a1-bdf8-44a437626245	2026-11-23 20:48:40.418+07	2026-11-17 04:48:40.418+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
497	2026-11-16 20:49:36.866+07	2026-11-16 20:49:36.866+07	5a0bfbf36a9e3571a7c52b2fd5660ae703dc7bc6461937f2a0a0fa7ec5516845	6422d218-d92b-4fdf-8b37-862db0e901d0	2026-11-23 20:49:36.865+07	2026-11-17 04:49:36.865+07	2026-11-16 21:04:44.354+07	2026-11-16 21:36:21.421+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
498	2026-11-16 21:04:44.356+07	2026-11-16 21:04:44.356+07	91464671f1d3a4db09941aeb35a1306e307c5053072b9e2f717a7d087a4a815e	6422d218-d92b-4fdf-8b37-862db0e901d0	2026-11-23 21:04:44.356+07	2026-11-17 05:04:44.356+07	2026-11-16 21:36:21.2+07	2026-11-16 21:36:21.421+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
499	2026-11-16 21:36:21.203+07	2026-11-16 21:36:21.203+07	eb38945008791873ad38a92c25dced78a5e1814e5f97d3f54515d775b66ec5e6	6422d218-d92b-4fdf-8b37-862db0e901d0	2026-11-23 21:36:21.203+07	2026-11-17 05:36:21.203+07	\N	2026-11-16 21:36:21.421+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
500	2026-11-16 22:01:00.014+07	2026-11-16 22:01:00.014+07	4795837021f55415d8b69a9b0197ada3756c139943e70e71ba68fa95be65d6b5	44d5b8b5-3070-4b5e-9297-87c0858debde	2026-11-23 22:01:00.014+07	2026-11-17 06:01:00.014+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
501	2026-11-16 22:02:38.766+07	2026-11-16 22:02:38.766+07	2d41f753386755fc097323ccd57022e059d7f03218698d6856fe6706b22f3d85	270f38fd-0ce2-41bf-b636-eeecdabddf5e	2026-11-23 22:02:38.766+07	2026-11-17 06:02:38.766+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
502	2026-11-16 22:04:24.707+07	2026-11-16 22:04:24.707+07	7f7228d3ef7abdeefaeec61281a09f1e8677de00944a98ca7897a22286971112	9fa86f95-4e3b-4871-a72e-91768429c8d2	2026-11-23 22:04:24.705+07	2026-11-17 06:04:24.705+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
503	2026-11-16 22:07:54.579+07	2026-11-16 22:07:54.579+07	562251fb8a53a4238c2c5ebf2da810bf6b92dde2e08f3efdb28a2f3b3685c51b	64caa9b8-9f90-457a-8645-bd0cb9b79403	2026-11-23 22:07:54.579+07	2026-11-17 06:07:54.579+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
504	2026-11-16 22:17:31.015+07	2026-11-16 22:17:31.015+07	9ec1aaec9aba7b41141b9948d6467036be3b283111776240ae6351bf756a7be7	bca9fc8d-7d5f-4dd3-92e2-3aae89b2018f	2026-11-23 22:17:31.014+07	2026-11-17 06:17:31.014+07	2026-11-16 22:23:35.755+07	2026-11-16 22:23:35.755+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
505	2026-11-16 22:23:35.757+07	2026-11-16 22:23:35.757+07	e275b7f72e52cad92daffb91ea22275a4933fcaaf142cebf645ed2c9d63ba579	bca9fc8d-7d5f-4dd3-92e2-3aae89b2018f	2026-11-23 22:23:35.757+07	2026-11-17 06:23:35.757+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
506	2026-11-16 22:23:35.758+07	2026-11-16 22:23:35.758+07	8ec2683e9fbe92e176aba9585d18593bc137fc636cc67ac710c10e0459ec7c79	bca9fc8d-7d5f-4dd3-92e2-3aae89b2018f	2026-11-23 22:23:35.758+07	2026-11-17 06:23:35.758+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
507	2026-11-16 22:25:36.217+07	2026-11-16 22:25:36.217+07	d3fabf68f049c9b82a608448cebe23b7d027506f8f4aecc9f10a45ce57f22501	6e04d7c7-28a6-4860-9ef7-394000a59467	2026-11-23 22:25:36.217+07	2026-11-17 06:25:36.217+07	2026-11-16 22:30:04.539+07	2026-11-16 22:36:45.731+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
508	2026-11-16 22:30:04.541+07	2026-11-16 22:30:04.541+07	7eb118278d127b45b81988ffbd8e596038970141ff109fa9276c325042baa12c	6e04d7c7-28a6-4860-9ef7-394000a59467	2026-11-23 22:30:04.541+07	2026-11-17 06:30:04.541+07	\N	2026-11-16 22:36:45.731+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
509	2026-11-16 22:30:04.542+07	2026-11-16 22:30:04.542+07	f3cc294fbe7dbf75b24871d4b228a9a42ff71bb6a2558954991985b98a0bc2cb	6e04d7c7-28a6-4860-9ef7-394000a59467	2026-11-23 22:30:04.542+07	2026-11-17 06:30:04.542+07	2026-11-16 22:32:44.082+07	2026-11-16 22:36:45.731+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
511	2026-11-16 22:32:44.085+07	2026-11-16 22:32:44.085+07	4c02b1281bae5f29b16196386a45e628e3e40d0067e4099a56ccfedbf85f8ce8	6e04d7c7-28a6-4860-9ef7-394000a59467	2026-11-23 22:32:44.085+07	2026-11-17 06:32:44.085+07	2026-11-16 22:34:03.566+07	2026-11-16 22:36:45.731+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
512	2026-11-16 22:34:03.567+07	2026-11-16 22:34:03.567+07	b72c9e1586dc98624a239d4514286a20defd568b03ff0f882b8d1f8853e67513	6e04d7c7-28a6-4860-9ef7-394000a59467	2026-11-23 22:34:03.567+07	2026-11-17 06:34:03.567+07	2026-11-16 22:36:45.608+07	2026-11-16 22:36:45.731+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
513	2026-11-16 22:34:03.568+07	2026-11-16 22:34:03.568+07	adbb82657f7d7dc8685927b191180e34f96dd89ea6d2922f385d5a20cddf7b56	6e04d7c7-28a6-4860-9ef7-394000a59467	2026-11-23 22:34:03.568+07	2026-11-17 06:34:03.568+07	\N	2026-11-16 22:36:45.731+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
514	2026-11-16 22:36:45.609+07	2026-11-16 22:36:45.609+07	f599584b8a8e3b16bbe2e7bf728862184fdf4a29c5b9a761f88d65496aab0e98	6e04d7c7-28a6-4860-9ef7-394000a59467	2026-11-23 22:36:45.609+07	2026-11-17 06:36:45.609+07	\N	2026-11-16 22:36:45.731+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
515	2026-11-16 22:36:54.909+07	2026-11-16 22:36:54.909+07	34808aa92df8d502f90fa4f494b0c28187b772bde7458e503c1a6fae8a973610	4e14a914-30b0-42a5-8dab-3aa9e8a33fd1	2026-11-23 22:36:54.909+07	2026-11-17 06:36:54.909+07	2026-11-16 22:38:48.528+07	2026-11-16 22:38:48.533+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
517	2026-11-16 22:39:17.517+07	2026-11-16 22:39:17.517+07	c2b640598191abf6e829c5ecaa0ce5af6e0275283b1177f6b791d9dc173447c7	31b27bc0-0951-43ec-b463-22454403ff5a	2026-11-23 22:39:17.516+07	2026-11-17 06:39:17.516+07	2026-11-16 22:44:56.876+07	2026-11-17 00:35:06.638+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
518	2026-11-16 22:44:56.879+07	2026-11-16 22:44:56.879+07	d344596708e405498347232aba3833afd5105f7fefc2eacfb1d3318ace3d4d63	31b27bc0-0951-43ec-b463-22454403ff5a	2026-11-23 22:44:56.879+07	2026-11-17 06:44:56.879+07	\N	2026-11-17 00:35:06.638+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
519	2026-11-16 22:44:56.88+07	2026-11-16 22:44:56.88+07	53ec397bfc39f99c3c057e65e24c3e7a17d2387a59e1b3a8d49f6a8e5ff4e926	31b27bc0-0951-43ec-b463-22454403ff5a	2026-11-23 22:44:56.88+07	2026-11-17 06:44:56.88+07	2026-11-16 22:49:02.745+07	2026-11-17 00:35:06.638+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
520	2026-11-16 22:49:02.748+07	2026-11-16 22:49:02.748+07	f8afc1b2ae9759b5992c4623a748a1433b1b2d10ebb5d436caedc896b34c47b1	31b27bc0-0951-43ec-b463-22454403ff5a	2026-11-23 22:49:02.748+07	2026-11-17 06:49:02.748+07	2026-11-16 22:50:38.476+07	2026-11-17 00:35:06.638+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
522	2026-11-16 22:50:38.478+07	2026-11-16 22:50:38.478+07	b558186036bb8a3390dfced05f138e85a20af7e0aa2e254fbdcb72231d99e019	31b27bc0-0951-43ec-b463-22454403ff5a	2026-11-23 22:50:38.478+07	2026-11-17 06:50:38.478+07	\N	2026-11-17 00:35:06.638+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
523	2026-11-16 22:50:38.479+07	2026-11-16 22:50:38.479+07	120f0901596e80936232fe06ddd6e50f5a0e38389eea35a5d076f12a7dbf2f21	31b27bc0-0951-43ec-b463-22454403ff5a	2026-11-23 22:50:38.479+07	2026-11-17 06:50:38.479+07	2026-11-17 00:35:06.584+07	2026-11-17 00:35:06.638+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
524	2026-11-17 00:35:06.597+07	2026-11-17 00:35:06.597+07	4f804583bddf53ebef06e89196e9370ab215d329fb29406921c448bec228be74	31b27bc0-0951-43ec-b463-22454403ff5a	2026-11-24 00:35:06.597+07	2026-11-17 08:35:06.597+07	\N	2026-11-17 00:35:06.638+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
526	2026-11-17 00:40:58.523+07	2026-11-17 00:40:58.523+07	225d553cd737909ae527c40d26be650fe376ab4491121f68545797ed9c96739a	138743de-6a64-4a53-8c17-2fe62493e998	2026-11-24 00:40:58.523+07	2026-11-17 08:40:58.523+07	2026-11-17 00:43:54.661+07	2026-11-17 00:50:16.142+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
527	2026-11-17 00:43:54.662+07	2026-11-17 00:43:54.662+07	a4ecf2eec4026555f208079d971c00238a67c9837b0243ce8c96f53d6a44533a	138743de-6a64-4a53-8c17-2fe62493e998	2026-11-24 00:43:54.662+07	2026-11-17 08:43:54.662+07	2026-11-17 00:45:46.484+07	2026-11-17 00:50:16.142+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
528	2026-11-17 00:43:54.663+07	2026-11-17 00:43:54.663+07	78f4ce20d24a83859c11495ec0a2f858bcb4641ee0578a754376a3a4b9cd9af2	138743de-6a64-4a53-8c17-2fe62493e998	2026-11-24 00:43:54.663+07	2026-11-17 08:43:54.663+07	\N	2026-11-17 00:50:16.142+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
530	2026-11-17 00:45:46.486+07	2026-11-17 00:45:46.486+07	5d3ed06800868ca06de33a8969ca670133b468f86df39914671970e460cfc2aa	138743de-6a64-4a53-8c17-2fe62493e998	2026-11-24 00:45:46.485+07	2026-11-17 08:45:46.485+07	2026-11-17 00:50:11.393+07	2026-11-17 00:50:16.142+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
531	2026-11-17 00:50:11.398+07	2026-11-17 00:50:11.398+07	72a0f0767ee7fd60e13688b27aa6ecc88dbb2aa37a5aa49117b94b3f0d379a65	138743de-6a64-4a53-8c17-2fe62493e998	2026-11-24 00:50:11.397+07	2026-11-17 08:50:11.397+07	\N	2026-11-17 00:50:16.142+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
532	2026-11-17 00:50:20.691+07	2026-11-17 00:50:20.692+07	37200dd7997c87e6e2adb47473237909b82865c9c948184858125181d62ad153	aa8e4bf6-374e-4d79-980e-03ce63214a4c	2026-11-24 00:50:20.691+07	2026-11-17 08:50:20.691+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
534	2026-11-17 00:53:16.24+07	2026-11-17 00:53:16.24+07	2adfb5d001c4ff1cf8586794f809fc2df5d6299b2c33a0549ae382906fa58108	97f6001a-7736-4213-b8eb-e60465e47022	2026-11-24 00:53:16.239+07	2026-11-17 08:53:16.239+07	2026-11-17 00:56:08.622+07	2026-11-17 00:56:08.73+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
535	2026-11-17 00:56:08.624+07	2026-11-17 00:56:08.624+07	3096ce67423d86d46e00eda79e7133391023d1adf78f8bd65547cc5fd27f3e6f	97f6001a-7736-4213-b8eb-e60465e47022	2026-11-24 00:56:08.624+07	2026-11-17 08:56:08.624+07	\N	2026-11-17 00:56:08.73+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
537	2026-11-17 00:59:51.713+07	2026-11-17 00:59:51.713+07	b38eaa5ee1f9ae0573d56ca778a2a915f3edbc0ef1b9ea3818fa05203bffe1b1	2063305e-7675-4f44-a595-27ca771d1619	2026-11-24 00:59:51.713+07	2026-11-17 08:59:51.713+07	2026-11-17 00:59:52.782+07	2026-11-17 00:59:52.788+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
538	2026-11-17 00:59:52.784+07	2026-11-17 00:59:52.784+07	2b553af7b924f87181e9486144bfb3897a7243c96f298c11d9304e37a51e9728	2063305e-7675-4f44-a595-27ca771d1619	2026-11-24 00:59:52.784+07	2026-11-17 08:59:52.784+07	\N	2026-11-17 00:59:52.788+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
540	2026-11-17 01:00:09.605+07	2026-11-17 01:00:09.605+07	9557dbbbbf7430157374854c11984d32818f96fad8599e99330a714d903f79d5	d9d50d3b-c65f-418d-8fbf-81bc16acf69f	2026-11-24 01:00:09.605+07	2026-11-17 09:00:09.605+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
541	2026-11-17 01:00:09.606+07	2026-11-17 01:00:09.606+07	0e76ead9d287c24546b86aa22a0c9488f093c2a8f150cac73f3ad74f0e47aa78	d9d50d3b-c65f-418d-8fbf-81bc16acf69f	2026-11-24 01:00:09.606+07	2026-11-17 09:00:09.606+07	2026-11-17 01:02:43.563+07	2026-11-17 01:02:43.563+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
542	2026-11-17 01:02:43.565+07	2026-11-17 01:02:43.565+07	ddadbf6552b147c857da072e1b3a7abeceef26df57c978b80c56fe21d6fc4eb1	d9d50d3b-c65f-418d-8fbf-81bc16acf69f	2026-11-24 01:02:43.565+07	2026-11-17 09:02:43.565+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
544	2026-11-17 01:10:06.361+07	2026-11-17 01:10:06.361+07	54de5430abaf564a3f135bfa8f92b611318d159b104be4e15a3065444f913a36	d9d50d3b-c65f-418d-8fbf-81bc16acf69f	2026-11-24 01:10:06.361+07	2026-11-17 09:10:06.361+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
545	2026-11-17 01:10:06.362+07	2026-11-17 01:10:06.362+07	1ec12265bd22334b48de8fc01d11f5a1d4b286d3d96a98fcbd37b7a76a74272d	d9d50d3b-c65f-418d-8fbf-81bc16acf69f	2026-11-24 01:10:06.362+07	2026-11-17 09:10:06.362+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
546	2026-11-17 01:16:37.491+07	2026-11-17 01:16:37.491+07	fdb6aadaa1d8df7a30738c890571e99f77ef10853fbed4097a273032c5916314	c66ed122-ed11-45e3-beb3-93528192a030	2026-11-24 01:16:37.491+07	2026-11-17 09:16:37.491+07	\N	2026-11-17 13:29:55.815+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
547	2026-11-17 13:30:04.733+07	2026-11-17 13:30:04.733+07	bce2111f3f1234f49b63efb1ab4aacbaba7eb7367e51e4722756d92f6eee0264	646926df-1289-4867-b866-bf2ccb8ad16d	2026-11-24 13:30:04.733+07	2026-11-17 21:30:04.733+07	2026-11-17 13:32:26.59+07	2026-11-17 13:32:26.73+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
548	2026-11-17 13:32:26.592+07	2026-11-17 13:32:26.592+07	27648767728c0eb7df6d99955506b3a09e0a6dbd405a8ab5c5d362b104b1c625	646926df-1289-4867-b866-bf2ccb8ad16d	2026-11-24 13:32:26.592+07	2026-11-17 21:32:26.592+07	\N	2026-11-17 13:32:26.73+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
549	2026-11-17 13:35:45.167+07	2026-11-17 13:35:45.167+07	e7bfb077e76b65a442f0f1afc721eef5be6bb37882009ea94cbb08e524314fe5	5919f069-0d9d-4196-8828-584ed8d5e90f	2026-11-24 13:35:45.167+07	2026-11-17 21:35:45.167+07	2026-11-17 13:40:35.585+07	2026-11-17 13:45:09.906+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
550	2026-11-17 13:40:35.586+07	2026-11-17 13:40:35.586+07	f715ea079bab5d716c464b5a5e11905b775aef1d3589c27b22444f0de059352c	5919f069-0d9d-4196-8828-584ed8d5e90f	2026-11-24 13:40:35.586+07	2026-11-17 21:40:35.586+07	\N	2026-11-17 13:45:09.906+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
551	2026-11-17 13:40:35.587+07	2026-11-17 13:40:35.587+07	773180c0daa32040d4ea9d4b05cf61ded5c5bd2e03ec3b452e196db7ccf72546	5919f069-0d9d-4196-8828-584ed8d5e90f	2026-11-24 13:40:35.587+07	2026-11-17 21:40:35.587+07	2026-11-17 13:45:09.81+07	2026-11-17 13:45:09.906+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
562	2026-11-17 14:24:49.634+07	2026-11-17 14:24:49.634+07	6e25d2df9f6766cc31e8f096b8dd33fec75e1850afcbb10b2690cbf0e50244c1	544302f5-a439-4421-ba62-2ac343ecf3c6	2026-11-24 14:24:49.633+07	2026-11-17 22:24:49.633+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
563	2026-11-17 14:30:42.198+07	2026-11-17 14:30:42.198+07	322967a32b6b83f8dfeee055cbd8c4698e631be6983a87dc81693962d82933eb	c378b940-d7e0-4e92-8bcc-72e67db9e6e9	2026-11-24 14:30:42.198+07	2026-11-17 22:30:42.198+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
564	2026-11-17 15:21:17.623+07	2026-11-17 15:21:17.623+07	9dc6668deb5718a02240b8452d78f343985c5eb09f2638d075f59688f1c79857	9c6a1a4d-6b35-47ba-9748-57f5abbd1160	2026-11-24 15:21:17.623+07	2026-11-17 23:21:17.623+07	2026-11-17 15:21:29.592+07	2026-11-17 15:21:29.592+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
565	2026-11-17 15:21:29.594+07	2026-11-17 15:21:29.594+07	c2d88eef6d3bac4a2edd4d757d527f078c0736d19b072766a61e26b62148cb9c	9c6a1a4d-6b35-47ba-9748-57f5abbd1160	2026-11-24 15:21:29.593+07	2026-11-17 23:21:29.593+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
566	2026-11-17 15:21:29.594+07	2026-11-17 15:21:29.594+07	d7e2885b4be109eb0370c478044f386768c7110373a1ad8c24bf94de210a9fc1	9c6a1a4d-6b35-47ba-9748-57f5abbd1160	2026-11-24 15:21:29.594+07	2026-11-17 23:21:29.594+07	2026-11-17 20:47:02.827+07	2026-11-17 20:47:02.827+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
590	2026-11-17 23:26:13.547+07	2026-11-17 23:26:13.547+07	fa171c58d58fa5832c281f38449f1c2e87081d00fca33bfcc16ceb0a88b58dee	4395ae50-27c4-490e-886e-b24f233266c8	2026-11-24 23:26:13.547+07	2026-11-18 07:26:13.547+07	2026-11-18 01:30:40.658+07	2026-11-18 01:30:40.658+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
591	2026-11-18 01:30:40.666+07	2026-11-18 01:30:40.666+07	0974c992c50a38e5f5abee99d9f22a9bcf7592939197937572e5ced7acc6d6e6	4395ae50-27c4-490e-886e-b24f233266c8	2026-11-25 01:30:40.666+07	2026-11-18 09:30:40.666+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	22
598	2026-11-18 01:39:53.915+07	2026-11-18 01:39:53.915+07	78257eb687a26888cd792e6f044d6ec23ebed45935380329a4a41a3d8a289620	c56af978-d2ee-4820-9c45-d7a57f74d7ef	2026-11-25 01:39:53.915+07	2026-11-18 09:39:53.915+07	\N	2026-11-18 18:05:07.7+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
599	2026-11-18 18:05:15.814+07	2026-11-18 18:05:15.814+07	97056322157fea0a6dac62fc6c5219127d1ee3d80ac442e126522a58debb2bad	147d86f8-934f-415d-970a-7846fd45eb28	2026-11-25 18:05:15.814+07	2026-11-19 02:05:15.814+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
600	2026-11-18 18:08:42.419+07	2026-11-18 18:08:42.419+07	8cbbea1906dbb8ee6b3225ef7c116db5d2f742c9319ab4b0ff5381e114012992	93341f0d-4b74-4da9-9e20-6aeda89cf791	2026-11-25 18:08:42.419+07	2026-11-19 02:08:42.419+07	2026-11-18 18:23:42.508+07	2026-11-18 18:23:42.508+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
601	2026-11-18 18:23:42.511+07	2026-11-18 18:23:42.511+07	8fffadf505d6a2c5d091a46138fab334d803048ea5d7337aed1ebfdf7311af67	93341f0d-4b74-4da9-9e20-6aeda89cf791	2026-11-25 18:23:42.511+07	2026-11-19 02:23:42.511+07	2026-11-18 18:38:42.504+07	2026-11-18 18:38:42.504+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
602	2026-11-18 18:38:42.506+07	2026-11-18 18:38:42.506+07	451c36a95ef38c4d3de3a36c35af7e4bd591a1ef586a63fefd24da00d8fb6a83	93341f0d-4b74-4da9-9e20-6aeda89cf791	2026-11-25 18:38:42.506+07	2026-11-19 02:38:42.506+07	2026-11-18 18:53:42.505+07	2026-11-18 18:53:42.505+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
603	2026-11-18 18:53:42.507+07	2026-11-18 18:53:42.507+07	e5cc36fc1321609b8a4b79ee1be2b3f08e19dbdc178200bdfee6cca0f3a1dcec	93341f0d-4b74-4da9-9e20-6aeda89cf791	2026-11-25 18:53:42.507+07	2026-11-19 02:53:42.507+07	2026-11-18 19:08:42.506+07	2026-11-18 19:08:42.506+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
604	2026-11-18 19:08:42.51+07	2026-11-18 19:08:42.51+07	4d6f11a87abab837f6aba489760ec9f3ff027155d568065b19956aeb0dbef1c0	93341f0d-4b74-4da9-9e20-6aeda89cf791	2026-11-25 19:08:42.51+07	2026-11-19 03:08:42.51+07	2026-11-18 19:23:42.604+07	2026-11-18 19:23:42.604+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
605	2026-11-18 19:23:42.605+07	2026-11-18 19:23:42.605+07	47fb3e847fd94831aae7deee5f220a7576dbfb360c7d1005671794eb6af3c1bd	93341f0d-4b74-4da9-9e20-6aeda89cf791	2026-11-25 19:23:42.605+07	2026-11-19 03:23:42.605+07	2026-11-18 19:38:42.506+07	2026-11-18 19:38:42.506+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
606	2026-11-18 19:38:42.508+07	2026-11-18 19:38:42.508+07	eb787ef978eca8dd4b742218dd0bfcd060f485364e62b274203de3231532b074	93341f0d-4b74-4da9-9e20-6aeda89cf791	2026-11-25 19:38:42.508+07	2026-11-19 03:38:42.508+07	2026-11-18 19:53:42.505+07	2026-11-18 19:53:42.505+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
607	2026-11-18 19:53:42.507+07	2026-11-18 19:53:42.507+07	83b307438ac3ae189031b2f40a587ac4e3885b8931697ffe2f46b033fcddf32e	93341f0d-4b74-4da9-9e20-6aeda89cf791	2026-11-25 19:53:42.507+07	2026-11-19 03:53:42.507+07	2026-11-18 20:08:42.508+07	2026-11-18 20:08:42.508+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
608	2026-11-18 20:08:42.511+07	2026-11-18 20:08:42.511+07	426de7df3cd3939ce62fcf0c25e316ab9c33db23569e2098aeb67791c8ac0015	93341f0d-4b74-4da9-9e20-6aeda89cf791	2026-11-25 20:08:42.511+07	2026-11-19 04:08:42.511+07	2026-11-18 20:23:42.505+07	2026-11-18 20:23:42.505+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
609	2026-11-18 20:23:42.507+07	2026-11-18 20:23:42.507+07	da694caca0c38dbcea5b9d2b56713a7cc423d37baf01c88ccd82708ef95c8969	93341f0d-4b74-4da9-9e20-6aeda89cf791	2026-11-25 20:23:42.507+07	2026-11-19 04:23:42.507+07	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	1
610	2026-11-18 20:24:58.925+07	2026-11-18 20:24:58.925+07	cb7af0bacb14a526d01e15e26c29a665d978d746780cdd3c1ba69954734efcfb	a12161fd-4129-4489-badc-268ad7b6ae2f	2026-11-25 20:24:58.925+07	2026-11-19 04:24:58.925+07	2026-11-18 20:40:31.349+07	2026-11-18 21:04:51.228+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
611	2026-11-18 20:40:31.352+07	2026-11-18 20:40:31.352+07	f3abaf73120d061dbd17fcc7b4bcbfe5def3bf10c8d78ac0b2c63cb7c09ae75b	a12161fd-4129-4489-badc-268ad7b6ae2f	2026-11-25 20:40:31.352+07	2026-11-19 04:40:31.352+07	2026-11-18 21:04:51.047+07	2026-11-18 21:04:51.228+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
612	2026-11-18 21:04:51.051+07	2026-11-18 21:04:51.051+07	720a2b9f2e21e593806ed120a0b1eda8938c2f6f9f0701be1980fd29d94f0a91	a12161fd-4129-4489-badc-268ad7b6ae2f	2026-11-25 21:04:51.05+07	2026-11-19 05:04:51.05+07	\N	2026-11-18 21:04:51.228+07	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36 Edg/157.0.0.0	127.0.0.1	29
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservations (id, created_at, updated_at, status, type, ready_at, hold_expires_at, queue_position, notified_at, no_show_counted, cancel_reason, book_id, copy_id, user_id) FROM stdin;
8	2026-11-14 15:16:30.437+07	2026-11-14 15:16:30.437+07	ready	borrow	2026-11-14 15:16:27.591+07	2026-11-18 06:59:59.591+07	1	\N	f	\N	203	707	9
9	2026-11-14 15:16:30.444+07	2026-11-14 15:16:30.444+07	cancelled	borrow	2026-11-14 15:16:27.591+07	2026-11-18 06:59:59.591+07	1	\N	t	Hủy bởi sv001	204	713	2
10	2026-11-14 15:16:30.444+07	2026-11-14 15:16:30.444+07	pending	borrow	\N	\N	1	\N	f	\N	201	\N	10
11	2026-11-14 15:16:30.444+07	2026-11-14 15:16:30.444+07	pending	borrow	\N	\N	1	\N	f	\N	201	\N	11
12	2026-11-14 15:50:51.625+07	2026-11-14 15:50:51.625+07	fulfilled	borrow	2026-11-14 15:50:51.611+07	2026-11-17 23:59:59.999+07	1	\N	f	\N	279	972	22
13	2026-11-14 17:44:37.611+07	2026-11-14 17:44:37.611+07	ready	borrow	2026-11-14 17:44:37.606+07	2026-11-17 23:59:59.999+07	1	\N	f	\N	283	986	2
14	2026-11-14 21:45:34.253+07	2026-11-14 22:21:38.035+07	fulfilled	borrow	2026-11-14 21:45:34.247+07	2026-11-17 23:59:59.999+07	1	\N	f	\N	283	987	28
15	2026-11-14 22:34:20.286+07	2026-11-14 22:34:20.286+07	cancelled	borrow	2026-11-14 22:34:20.278+07	2026-11-17 23:59:59.999+07	1	\N	t	Hủy bởi 052205006506	232	808	28
16	2026-11-15 08:37:23.887+07	2026-11-15 08:37:23.887+07	cancelled	borrow	2026-11-15 08:37:23.88+07	2026-11-18 23:59:59.999+07	1	\N	t	Hủy bởi 052205006506	277	967	28
17	2026-11-15 08:39:39.763+07	2026-11-15 08:39:39.763+07	cancelled	borrow	2026-11-15 08:39:39.763+07	2026-11-18 23:59:59.999+07	1	\N	t	Hủy bởi 052205006506	281	981	28
18	2026-11-15 09:08:52.243+07	2026-11-15 09:08:52.243+07	cancelled	borrow	2026-11-15 09:08:52.243+07	2026-11-18 23:59:59.999+07	1	\N	t	Hủy bởi 052205006506	269	939	28
19	2026-11-15 09:40:07.628+07	2026-11-15 09:40:07.628+07	ready	borrow	2026-11-15 09:40:07.626+07	2026-11-18 23:59:59.999+07	1	\N	f	\N	283	988	1
20	2026-11-17 15:21:32.528+07	2026-11-17 15:21:32.528+07	fulfilled	borrow	2026-11-17 15:21:32.526+07	2026-11-20 23:59:59.999+07	1	\N	f	\N	280	976	29
\.


--
-- Data for Name: student_roster; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_roster (id, created_at, updated_at, student_code, full_name, department, major, email, phone, academic_year, status, is_card_issued, user_id, class_name, avatar) FROM stdin;
\.


--
-- Data for Name: suggestion_campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suggestion_campaigns (id, created_at, updated_at, title, description, start_date, end_date, status, target_audience, created_by_id) FROM stdin;
\.


--
-- Data for Name: suggestion_votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suggestion_votes (id, created_at, suggestion_id, user_id) FROM stdin;
\.


--
-- Data for Name: suggestions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suggestions (id, created_at, updated_at, book_title, author, reason, status, review_note, reviewed_at, received_at, reviewed_by_id, user_id, department, campaign_id) FROM stdin;
5	2026-11-14 15:16:30.444+07	2026-11-15 00:19:20.331+07	Kỹ thuật Xây dựng Cầu dây văng Khẩu độ Lớn trên thế giới	Dr. Michel Virlogeux	Tài liệu cần thiết phục vụ làm đồ án tốt nghiệp ngành Cầu đường.	rejected	Hiện thư viện đã có tài liệu tương đương hoặc chưa phù hợp kế hoạch mua sắm đợt này.	2026-11-15 00:19:20.331+07	\N	1	2	\N	\N
6	2026-11-14 15:16:30.444+07	2026-11-14 15:16:30.444+07	Thiết kế Hệ thống Phân tán (Designing Data-Intensive Applications)	Martin Kleppmann	Sách kinh điển về cơ sở dữ liệu và xử lý dữ liệu lớn trong CNTT.	approved	Đã duyệt mua trong đợt nhập sách quý 4/2026.	2026-11-12 15:16:27.591+07	\N	1	3	\N	\N
7	2026-11-14 23:38:57.379+07	2026-11-14 23:39:53.063+07	Vũ đẹp tria	Vũ	ko có	approved	Đã duyệt mua tài liệu phục vụ đào tạo.	2026-11-14 23:39:53.063+07	\N	1	28	\N	\N
8	2026-11-15 00:18:46.256+07	2026-11-15 00:19:12.756+07	Bay Bỏng	Decaptorio	Hay vcl	approved	Đã duyệt mua tài liệu phục vụ đào tạo.	2026-11-15 00:19:12.756+07	\N	1	28	\N	\N
41	2026-11-15 09:17:57.755+07	2026-11-15 09:20:52.974+07	1222	12122	1221	rejected	Hiện thư viện đã có tài liệu tương đương hoặc chưa phù hợp kế hoạch mua sắm đợt này.	2026-11-15 09:20:52.974+07	\N	1	28	\N	\N
42	2026-11-15 09:33:27+07	2026-11-15 12:27:19.577+07	ưee	ew	ew	rejected	Hiện thư viện đã có tài liệu tương đương hoặc chưa phù hợp kế hoạch mua sắm đợt này.	2026-11-15 12:27:19.577+07	\N	1	28	\N	\N
\.


--
-- Data for Name: system_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_config (id, created_at, updated_at, library_name, address, hotline, email, opening_hours, logo, favicon, overdue_grace_days, overdue_lost_days, reminder_days, card_expiring_days, noshow_limit, noshow_window_days, noshow_lock_days, upload_max_size, session_idle_hours, login_max_attempts, login_lock_minutes, login_daily_max_attempts) FROM stdin;
1	2026-11-14 10:07:33.17+07	2026-11-14 15:16:27.611+07	Thư viện Trường Đại học Giao thông vận tải TP.HCM	Số 2, Đường Võ Oanh, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh	(028) 3899 1373 - (028) 3899 2862	library@uth.edu.vn	{"sunday": "Đóng cửa", "mon_fri": "07:30 - 20:30", "saturday": "07:30 - 16:30"}	\N	\N	0	30	2	30	3	90	30	5242880	8	5	15	10
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, password, last_login, is_superuser, username, full_name, email, phone, avatar, dob, address, role, card_code, department, card_expiry, is_locked, lock_reason, locked_until, failed_login_count, last_failed_login_at, reservation_locked_until, password_changed_at, must_change_password, is_active, is_staff, deleted_at, created_at, updated_at) FROM stdin;
2	argon2$argon2id$v=19$m=102400,t=2,p=8$OGw2ZE5Xdmt3UWVqQVI3UmVUQ0pBNg$hsu2bfpjKZVtsQQzEP5Dj8eGFPTmzPivQCj/a0UYzqo	2026-11-15 12:47:57.654+07	f	sv001	Sinh Viên UTH 01	sv001@uth.edu.vn	\N	https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260001	Khoa Kinh tế Vận tải	2027-11-14	f	\N	\N	0	\N	\N	2026-11-14 15:16:27.733+07	f	t	f	\N	2026-11-14 15:16:27.733+07	2026-11-14 15:16:27.834+07
10	argon2$argon2id$v=19$m=102400,t=2,p=8$YTRnTDN6dkNqRFdKYkszOUpUbk42Tg$JKNX6sFPR7qyRvQ6jTsObvpfiIwckXt1X3PzNXW8W3I	\N	f	sv009	Sinh Viên UTH 09	sv009@uth.edu.vn	\N	https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260009	Khoa Kinh tế Vận tải	2027-11-14	f	\N	\N	0	\N	\N	2026-11-14 15:16:28.391+07	f	t	f	\N	2026-11-14 15:16:28.391+07	2026-11-14 15:16:28.471+07
1	argon2$argon2id$v=19$m=102400,t=2,p=8$SnBTZ293OG9XSUVzQlZXM2NhSGJhaw$kaeF90iWX+gPwE4JeBp8iqWE1io8a+ygblYnrY53+gY	2026-11-18 18:08:42.37+07	t	admin	Nguyễn Văn Quản Trị (Thủ Thư Trưởng)	admin@uth.edu.vn	\N	/media/avatars/avatar_55_5a78653ae01dab5e.png	\N	\N	admin	ADMIN001	Trung tâm Thông tin - Thư viện UTH	2036-11-11	f	\N	\N	0	2026-11-14 20:32:23.414+07	\N	2026-11-14 15:16:27.616+07	f	t	t	\N	2026-11-14 15:16:27.616+07	2026-11-14 15:16:27.733+07
3	argon2$argon2id$v=19$m=102400,t=2,p=8$RUtXeVpIRGlUQjJGSFcxSHhFMFZyOA$wTVdmU8w1CTye4HahEoIUVwKpSeL0Nsl6bNtGyGq4Uo	\N	f	sv002	Sinh Viên UTH 02	sv002@uth.edu.vn	\N	https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260002	Viện Công nghệ Thông tin	2027-11-14	f	\N	\N	0	\N	\N	2026-11-14 15:16:27.834+07	f	t	f	\N	2026-11-14 15:16:27.839+07	2026-11-14 15:16:27.929+07
4	argon2$argon2id$v=19$m=102400,t=2,p=8$WmxyaEk4ZjIwNWVjc1o4THUwNlp5ag$ZEsOKPb7W7ytSFXFgUfuhDeZ4wf+CzHyXIfcPrx71D4	\N	f	sv003	Sinh Viên UTH 03	sv003@uth.edu.vn	\N	https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260003	Khoa Kinh tế Vận tải	2027-11-14	f	\N	\N	0	\N	\N	2026-11-14 15:16:27.929+07	f	t	f	\N	2026-11-14 15:16:27.929+07	2026-11-14 15:16:27.991+07
5	argon2$argon2id$v=19$m=102400,t=2,p=8$TkVFSWduekNNQWlVam9YR3Q5RVliMQ$n7VQjvkMhIHVF6nCEUgV0pKVznChzKG8Kw+N0pA+XxA	\N	f	sv004	Sinh Viên UTH 04	sv004@uth.edu.vn	\N	https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260004	Viện Công nghệ Thông tin	2027-11-14	f	\N	\N	0	\N	\N	2026-11-14 15:16:28.007+07	f	t	f	\N	2026-11-14 15:16:28.007+07	2026-11-14 15:16:28.081+07
6	argon2$argon2id$v=19$m=102400,t=2,p=8$akNIczBKUE9pWFE4VjRJSnk4Z3hjUA$yB+0SgqV4z9kzDeMdSUhOzyiO/5l58X6OSAl/znTO0w	\N	f	sv005	Sinh Viên UTH 05	sv005@uth.edu.vn	\N	https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260005	Khoa Kinh tế Vận tải	2027-11-14	f	\N	\N	0	\N	\N	2026-11-14 15:16:28.081+07	f	t	f	\N	2026-11-14 15:16:28.081+07	2026-11-14 15:16:28.154+07
7	argon2$argon2id$v=19$m=102400,t=2,p=8$c1lnRzQzWjN0Y3hlUFNhYkRFZVlUTw$GUwxki9vU2g3Ke/j/zw37Q8dXHZtsV1Tz17iJIUj/Sg	\N	f	sv006	Sinh Viên UTH 06	sv006@uth.edu.vn	\N	https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260006	Viện Công nghệ Thông tin	2027-11-14	f	\N	\N	0	\N	\N	2026-11-14 15:16:28.156+07	f	t	f	\N	2026-11-14 15:16:28.156+07	2026-11-14 15:16:28.226+07
8	argon2$argon2id$v=19$m=102400,t=2,p=8$eFFmN0MzU0JPU2M2MmJwZU56YWhocA$95lAQqryeWPjcDQzd4Dmv+jyHfGAzTpn39+G5W3IKOk	\N	f	sv007	Sinh Viên UTH 07	sv007@uth.edu.vn	\N	https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260007	Khoa Kinh tế Vận tải	2027-11-14	f	\N	\N	0	\N	\N	2026-11-14 15:16:28.237+07	f	t	f	\N	2026-11-14 15:16:28.237+07	2026-11-14 15:16:28.312+07
9	argon2$argon2id$v=19$m=102400,t=2,p=8$Y08xbndBYjhSVnROZ3RnblBkME5KeA$MQJ+oF459UZtyMe0s+AiBzKDP1D7VG8jQDMrLTkFfzU	\N	f	sv008	Sinh Viên UTH 08	sv008@uth.edu.vn	\N	https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260008	Viện Công nghệ Thông tin	2027-11-14	f	\N	\N	0	\N	\N	2026-11-14 15:16:28.312+07	f	t	f	\N	2026-11-14 15:16:28.312+07	2026-11-14 15:16:28.389+07
11	argon2$argon2id$v=19$m=102400,t=2,p=8$OWhTTU1oOVU1bE13dTVlNDAzOUVVWQ$1nbgqsVD1DWtgFxdJqnkVzHdeZoLcm+C2GxD3N42uR0	\N	f	sv010	Sinh Viên UTH 10	sv010@uth.edu.vn	\N	https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260010	Viện Công nghệ Thông tin	2027-11-14	f	\N	\N	0	\N	\N	2026-11-14 15:16:28.471+07	f	t	f	\N	2026-11-14 15:16:28.471+07	2026-11-14 15:16:28.563+07
12	argon2$argon2id$v=19$m=102400,t=2,p=8$R3lWUUxiUUhhM3lTbEtPODZBMWF2QQ$QM6SA5BXLEL8wJGJ5NdAdowiO5vileVVwbsfUfbdwGw	\N	f	sv011	Sinh Viên UTH 11	sv011@uth.edu.vn	\N	https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260011	Khoa Kinh tế Vận tải	2027-11-14	f	\N	\N	0	\N	\N	2026-11-14 15:16:28.565+07	f	t	f	\N	2026-11-14 15:16:28.565+07	2026-11-14 15:16:28.652+07
29	argon2$argon2id$v=19$m=102400,t=2,p=8$UTB4aFBlNFZCZ0dDV3VlMDg0d1BFVg$ZtJu5fxJ8vLVvpMnWz4FFB4T8hiVY2GrkOBTxdDEuOs	2026-11-23 09:47:20.617+07	f	123456	phong	alo123@gmail.com	123243545	\N	\N	\N	student	123456	Khoa Công nghệ thông tin	2027-12-31	f	\N	\N	0	2026-11-17 15:21:14.097+07	\N	2026-11-16 13:21:19.949+07	f	t	f	\N	2026-11-16 13:21:19.995+07	2026-11-16 13:21:19.995+07
13	argon2$argon2id$v=19$m=102400,t=2,p=8$bmlZckFtV04zaVFKSFU1N2ZNWHo4cQ$mn029a08O7QGbv6PjEDXWgo81Z06TNfEKCWgVXVCeKg	\N	f	sv012	Sinh Viên UTH 12	sv012@uth.edu.vn	\N	https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260012	Viện Công nghệ Thông tin	2027-11-14	f	\N	\N	0	\N	\N	2026-11-14 15:16:28.653+07	f	t	f	\N	2026-11-14 15:16:28.653+07	2026-11-14 15:16:28.736+07
14	argon2$argon2id$v=19$m=102400,t=2,p=8$eVpxM2M0V2FhWVRmMDdSdGVNVmxtdw$iUu+k7ofmf5BBSU0A7VPh6wCUFBf4kbbL+m+iQ1ldOA	\N	f	sv013	Sinh Viên UTH 13	sv013@uth.edu.vn	\N	https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260013	Khoa Kinh tế Vận tải	2027-11-14	f	\N	\N	0	\N	\N	2026-11-14 15:16:28.736+07	f	t	f	\N	2026-11-14 15:16:28.736+07	2026-11-14 15:16:28.82+07
15	argon2$argon2id$v=19$m=102400,t=2,p=8$d1cxWGdCckx4cUpOOHBiUmx4R3ZUbw$mGMzHsQZab6SGPeP24ZZaMbtmY2ThXyVHXYe1NkpM5c	\N	f	sv014	Sinh Viên UTH 14	sv014@uth.edu.vn	\N	https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260014	Viện Công nghệ Thông tin	2027-11-14	f	\N	\N	0	\N	\N	2026-11-14 15:16:28.824+07	f	t	f	\N	2026-11-14 15:16:28.824+07	2026-11-14 15:16:28.911+07
16	argon2$argon2id$v=19$m=102400,t=2,p=8$VXpNYkFaOU9CdDQ1aFkyRGk1a2JaOQ$Z1nJ9pr5lxwoJkH0uoS2z2fXizCo7rncUrejviqcI9M	\N	f	sv015	Sinh Viên UTH 15	sv015@uth.edu.vn	\N	https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260015	Khoa Kinh tế Vận tải	2027-11-14	f	\N	\N	0	\N	\N	2026-11-14 15:16:28.911+07	f	t	f	\N	2026-11-14 15:16:28.911+07	2026-11-14 15:16:28.987+07
17	argon2$argon2id$v=19$m=102400,t=2,p=8$VHYzUkNiYmtzd29BQ0ZoYjhHRFFxNQ$zGQp0cxeLR9qZAU/sUPkKkWd/2wQiZvoFD56ZkZ372k	\N	f	sv016	Sinh Viên UTH 16	sv016@uth.edu.vn	\N	https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260016	Viện Công nghệ Thông tin	2027-11-14	f	\N	\N	0	\N	\N	2026-11-14 15:16:28.987+07	f	t	f	\N	2026-11-14 15:16:28.987+07	2026-11-14 15:16:29.077+07
18	argon2$argon2id$v=19$m=102400,t=2,p=8$RnpLZHB6cEtXZmRiOWpaVDkzczZyaA$gEpzLbkpP2fzB1H9vIb3DpdEZdS8B2X35J7h2YRFQoM	\N	f	sv017	Sinh Viên UTH 17	sv017@uth.edu.vn	\N	https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260017	Khoa Kinh tế Vận tải	2027-11-14	f	\N	\N	0	\N	\N	2026-11-14 15:16:29.079+07	f	t	f	\N	2026-11-14 15:16:29.079+07	2026-11-14 15:16:29.158+07
19	argon2$argon2id$v=19$m=102400,t=2,p=8$SUV4TnlFcExoUm5TMmFMc3hwVndrQg$e7G/XJXU/0QypXxDoEnX7woSJTRX+g1OUG/p8f7zp0w	\N	f	sv018	Sinh Viên UTH 18	sv018@uth.edu.vn	\N	https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260018	Viện Công nghệ Thông tin	2026-11-04	f	\N	\N	0	\N	\N	2026-11-14 15:16:29.16+07	f	t	f	\N	2026-11-14 15:16:29.16+07	2026-11-14 15:16:29.243+07
20	argon2$argon2id$v=19$m=102400,t=2,p=8$TFhld2tKaWFGeEVOZFJhNTBQM3VabQ$bOhu/6XMarTpAHkh1C8weZJvrYqqNpVLIEbiTy+Bnpk	\N	f	sv019	Sinh Viên UTH 19	sv019@uth.edu.vn	\N	https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260019	Khoa Kinh tế Vận tải	2027-11-14	t	manual	\N	0	\N	\N	2026-11-14 15:16:29.246+07	f	t	f	\N	2026-11-14 15:16:29.246+07	2026-11-14 15:16:29.375+07
21	argon2$argon2id$v=19$m=102400,t=2,p=8$N2NXd1BlSWwyNnlhWkp5TmRMTWJqQg$obD8TvmTgmXVzAzTwJZXqiB+Whil9vPE3LSjKIB5nJg	\N	f	sv020	Sinh Viên UTH 20	sv020@uth.edu.vn	\N	https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80	\N	\N	student	SV20260020	Viện Công nghệ Thông tin	2027-11-14	f	\N	\N	0	\N	2026-12-14 15:16:27.591+07	2026-11-14 15:16:29.383+07	f	t	f	\N	2026-11-14 15:16:29.384+07	2026-11-14 15:16:29.478+07
22	argon2$argon2id$v=19$m=102400,t=2,p=8$bzgwc0dBTnVwbXBvZEkwRml3ZFE1cQ$L0rprYx2USF6/rCREZCbh/6Osb/UXF3ycAVB5gAHHMc	2026-11-17 23:11:13.86+07	f	gv01	ThS. Giảng Viên UTH 01	gv01@uth.edu.vn	\N	https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80	\N	\N	lecturer	GV2026001	Khoa Logistics & Quản lý Chuỗi cung ứng	2031-11-13	f	\N	\N	0	\N	\N	2026-11-14 15:16:29.479+07	f	t	f	\N	2026-11-14 15:16:29.479+07	2026-11-14 15:16:29.578+07
23	argon2$argon2id$v=19$m=102400,t=2,p=8$UkJiWW41MlRKUXBKOFVIQTVrdWZ2eQ$S25/VltsmdZYESIoIl66uhLm9O5PFSX+D7aPp3kWoyU	\N	f	gv02	ThS. Giảng Viên UTH 02	gv02@uth.edu.vn	\N	https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80	\N	\N	lecturer	GV2026002	Khoa Kỹ thuật Giao thông	2031-11-13	f	\N	\N	0	\N	\N	2026-11-14 15:16:29.578+07	f	t	f	\N	2026-11-14 15:16:29.578+07	2026-11-14 15:16:29.661+07
24	argon2$argon2id$v=19$m=102400,t=2,p=8$ckQ4RjE2NGc3U1JlMFJoWmJGbmp5TQ$zR6UxJe0fptJojle+NhkKi1SeA2snfWRnm+xZRAt3E0	\N	f	gv03	ThS. Giảng Viên UTH 03	gv03@uth.edu.vn	\N	https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80	\N	\N	lecturer	GV2026003	Khoa Logistics & Quản lý Chuỗi cung ứng	2031-11-13	f	\N	\N	0	\N	\N	2026-11-14 15:16:29.661+07	f	t	f	\N	2026-11-14 15:16:29.661+07	2026-11-14 15:16:29.74+07
25	argon2$argon2id$v=19$m=102400,t=2,p=8$WUdqckRTN3g2SHNSMkpjT2dhM1R0cg$qG8QjqOOqS+AuzkM+3xFa29AGz7z+AyB1yE5/OP7zMc	\N	f	gv04	ThS. Giảng Viên UTH 04	gv04@uth.edu.vn	\N	https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80	\N	\N	lecturer	GV2026004	Khoa Kỹ thuật Giao thông	2031-11-13	f	\N	\N	0	\N	\N	2026-11-14 15:16:29.74+07	f	t	f	\N	2026-11-14 15:16:29.74+07	2026-11-14 15:16:29.822+07
26	argon2$argon2id$v=19$m=102400,t=2,p=8$V2dqeVgzb2d6QllwUnozS1Q5RnlRaw$trGzqz72ZRn7+Forq99AgET7iOdfaX6bFaQ5KccfR/8	\N	f	gv05	ThS. Giảng Viên UTH 05	gv05@uth.edu.vn	\N	https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80	\N	\N	lecturer	GV2026005	Khoa Logistics & Quản lý Chuỗi cung ứng	2031-11-13	f	\N	\N	0	\N	\N	2026-11-14 15:16:29.825+07	f	t	f	\N	2026-11-14 15:16:29.825+07	2026-11-14 15:16:29.879+07
27	argon2$argon2id$v=19$m=102400,t=2,p=8$RHhjTTB4RUJ6Ync2OXlHazFTbndLSQ$mJpLfKcO7zr/7gwU7Wqg9sM7juVnZm2O6ipoOlvEqZs	\N	f	034205011586	BÙI VŨ HẢI PHONG	034205011586@ut.edu.vn	\N	/student-avatar.png	\N	\N	student	034205011586	Hệ thống thông tin quản lý	2027-11-14	f	login	2026-11-16 13:34:49.803+07	5	2026-11-16 13:19:49.803+07	\N	2026-11-14 20:12:05.601+07	f	t	f	\N	2026-11-14 20:12:05.763+07	2026-11-14 20:12:05.763+07
28	argon2$argon2id$v=19$m=102400,t=2,p=8$SHNMNUlIcXFIaTdHeXZuUTFYbzFLOQ$QBCYZb7FhNEQMC0TgjWSMYj1qG7wbQ0xuJuUFuxiQnE	2026-11-15 09:31:27.565+07	f	052205006506	Lê Hoài Vũ	vulh@ut.edu.vn	0338722349	/media/avatars/avatar_82_58658dc213a9.jpg	\N	\N	student	052205006506	Khoa Công nghệ thông tin	2027-12-31	f	login	2026-11-16 21:04:25.164+07	8	2026-11-16 20:49:25.164+07	2026-12-15 09:13:15.458+07	2026-11-14 21:44:19.861+07	f	t	f	\N	2026-11-14 21:44:20.136+07	2026-11-14 21:44:20.136+07
\.


--
-- Data for Name: users_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users_groups (id, user_id, group_id) FROM stdin;
\.


--
-- Data for Name: users_user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users_user_permissions (id, user_id, permission_id) FROM stdin;
\.


--
-- Name: assistant_conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assistant_conversations_id_seq', 29, true);


--
-- Name: assistant_memory_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assistant_memory_entries_id_seq', 1, false);


--
-- Name: assistant_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assistant_messages_id_seq', 138, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 324, true);


--
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_id_seq', 1, false);


--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_permissions_id_seq', 1, false);


--
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_permission_id_seq', 144, true);


--
-- Name: authors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.authors_id_seq', 65, true);


--
-- Name: barcode_sequences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.barcode_sequences_id_seq', 24, true);


--
-- Name: books_authors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.books_authors_id_seq', 149, true);


--
-- Name: books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.books_id_seq', 283, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 24, true);


--
-- Name: copies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.copies_id_seq', 988, true);


--
-- Name: deaccession_batches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.deaccession_batches_id_seq', 1, false);


--
-- Name: digital_approval_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.digital_approval_logs_id_seq', 1, false);


--
-- Name: digital_document_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.digital_document_versions_id_seq', 1, false);


--
-- Name: digital_documents_allowed_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.digital_documents_allowed_users_id_seq', 1, false);


--
-- Name: digital_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.digital_documents_id_seq', 1, false);


--
-- Name: digital_reading_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.digital_reading_sessions_id_seq', 1, false);


--
-- Name: digital_resources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.digital_resources_id_seq', 1, false);


--
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_content_type_id_seq', 36, true);


--
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_migrations_id_seq', 35, true);


--
-- Name: fine_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fine_payments_id_seq', 2, true);


--
-- Name: fines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fines_id_seq', 13, true);


--
-- Name: holidays_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.holidays_id_seq', 1, false);


--
-- Name: loans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.loans_id_seq', 22, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 126, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, false);


--
-- Name: payment_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_transactions_id_seq', 1, false);


--
-- Name: policies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.policies_id_seq', 7, true);


--
-- Name: reading_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reading_sessions_id_seq', 1, false);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 614, true);


--
-- Name: reservations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reservations_id_seq', 20, true);


--
-- Name: student_roster_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_roster_id_seq', 1, false);


--
-- Name: suggestion_campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suggestion_campaigns_id_seq', 1, false);


--
-- Name: suggestion_votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suggestion_votes_id_seq', 1, false);


--
-- Name: suggestions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suggestions_id_seq', 42, true);


--
-- Name: system_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_config_id_seq', 1, true);


--
-- Name: users_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_groups_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 29, true);


--
-- Name: users_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_permissions_id_seq', 1, false);


--
-- Name: assistant_conversations assistant_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assistant_conversations
    ADD CONSTRAINT assistant_conversations_pkey PRIMARY KEY (id);


--
-- Name: assistant_memory_entries assistant_memory_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assistant_memory_entries
    ADD CONSTRAINT assistant_memory_entries_pkey PRIMARY KEY (id);


--
-- Name: assistant_messages assistant_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assistant_messages
    ADD CONSTRAINT assistant_messages_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: auth_group auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- Name: auth_group_permissions auth_group_permissions_group_id_permission_id_0cd325b0_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq UNIQUE (group_id, permission_id);


--
-- Name: auth_group_permissions auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- Name: auth_permission auth_permission_content_type_id_codename_01ab375a_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq UNIQUE (content_type_id, codename);


--
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- Name: authors authors_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_name_key UNIQUE (name);


--
-- Name: authors authors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_pkey PRIMARY KEY (id);


--
-- Name: barcode_sequences barcode_sequences_category_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barcode_sequences
    ADD CONSTRAINT barcode_sequences_category_id_key UNIQUE (category_id);


--
-- Name: barcode_sequences barcode_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barcode_sequences
    ADD CONSTRAINT barcode_sequences_pkey PRIMARY KEY (id);


--
-- Name: books_authors books_authors_book_id_author_id_723cdcc0_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books_authors
    ADD CONSTRAINT books_authors_book_id_author_id_723cdcc0_uniq UNIQUE (book_id, author_id);


--
-- Name: books_authors books_authors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books_authors
    ADD CONSTRAINT books_authors_pkey PRIMARY KEY (id);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- Name: categories categories_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_code_key UNIQUE (code);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: copies copies_barcode_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.copies
    ADD CONSTRAINT copies_barcode_key UNIQUE (barcode);


--
-- Name: copies copies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.copies
    ADD CONSTRAINT copies_pkey PRIMARY KEY (id);


--
-- Name: deaccession_batches deaccession_batches_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deaccession_batches
    ADD CONSTRAINT deaccession_batches_code_key UNIQUE (code);


--
-- Name: deaccession_batches deaccession_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deaccession_batches
    ADD CONSTRAINT deaccession_batches_pkey PRIMARY KEY (id);


--
-- Name: digital_approval_logs digital_approval_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_approval_logs
    ADD CONSTRAINT digital_approval_logs_pkey PRIMARY KEY (id);


--
-- Name: digital_document_versions digital_document_version_document_id_version_numb_b278c441_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_document_versions
    ADD CONSTRAINT digital_document_version_document_id_version_numb_b278c441_uniq UNIQUE (document_id, version_number);


--
-- Name: digital_document_versions digital_document_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_document_versions
    ADD CONSTRAINT digital_document_versions_pkey PRIMARY KEY (id);


--
-- Name: digital_documents_allowed_users digital_documents_allowe_digitaldocument_id_user__6bcd5911_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_documents_allowed_users
    ADD CONSTRAINT digital_documents_allowe_digitaldocument_id_user__6bcd5911_uniq UNIQUE (digitaldocument_id, user_id);


--
-- Name: digital_documents_allowed_users digital_documents_allowed_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_documents_allowed_users
    ADD CONSTRAINT digital_documents_allowed_users_pkey PRIMARY KEY (id);


--
-- Name: digital_documents digital_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_documents
    ADD CONSTRAINT digital_documents_pkey PRIMARY KEY (id);


--
-- Name: digital_reading_sessions digital_reading_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_reading_sessions
    ADD CONSTRAINT digital_reading_sessions_pkey PRIMARY KEY (id);


--
-- Name: digital_reading_sessions digital_reading_sessions_session_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_reading_sessions
    ADD CONSTRAINT digital_reading_sessions_session_code_key UNIQUE (session_code);


--
-- Name: digital_reading_sessions digital_reading_sessions_session_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_reading_sessions
    ADD CONSTRAINT digital_reading_sessions_session_id_key UNIQUE (session_id);


--
-- Name: digital_resources digital_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_resources
    ADD CONSTRAINT digital_resources_pkey PRIMARY KEY (id);


--
-- Name: django_content_type django_content_type_app_label_model_76bd3d3b_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model);


--
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- Name: django_session django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);


--
-- Name: fine_payments fine_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fine_payments
    ADD CONSTRAINT fine_payments_pkey PRIMARY KEY (id);


--
-- Name: fines fines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fines
    ADD CONSTRAINT fines_pkey PRIMARY KEY (id);


--
-- Name: holidays holidays_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_date_key UNIQUE (date);


--
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- Name: loans loans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_dedupe_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_dedupe_key_key UNIQUE (dedupe_key);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_receipt_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_receipt_code_key UNIQUE (receipt_code);


--
-- Name: payment_transactions payment_transactions_transaction_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_transaction_code_key UNIQUE (transaction_code);


--
-- Name: policies policies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policies
    ADD CONSTRAINT policies_pkey PRIMARY KEY (id);


--
-- Name: reading_sessions reading_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_sessions
    ADD CONSTRAINT reading_sessions_pkey PRIMARY KEY (id);


--
-- Name: reading_sessions reading_sessions_user_id_digital_resource_id_670d4cb2_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_sessions
    ADD CONSTRAINT reading_sessions_user_id_digital_resource_id_670d4cb2_uniq UNIQUE (user_id, digital_resource_id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: student_roster student_roster_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_roster
    ADD CONSTRAINT student_roster_pkey PRIMARY KEY (id);


--
-- Name: student_roster student_roster_student_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_roster
    ADD CONSTRAINT student_roster_student_code_key UNIQUE (student_code);


--
-- Name: student_roster student_roster_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_roster
    ADD CONSTRAINT student_roster_user_id_key UNIQUE (user_id);


--
-- Name: suggestion_campaigns suggestion_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suggestion_campaigns
    ADD CONSTRAINT suggestion_campaigns_pkey PRIMARY KEY (id);


--
-- Name: suggestion_votes suggestion_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suggestion_votes
    ADD CONSTRAINT suggestion_votes_pkey PRIMARY KEY (id);


--
-- Name: suggestion_votes suggestion_votes_suggestion_id_user_id_66a406b5_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suggestion_votes
    ADD CONSTRAINT suggestion_votes_suggestion_id_user_id_66a406b5_uniq UNIQUE (suggestion_id, user_id);


--
-- Name: suggestions suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suggestions
    ADD CONSTRAINT suggestions_pkey PRIMARY KEY (id);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);


--
-- Name: assistant_conversations uq_assistant_conversation_user_session; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assistant_conversations
    ADD CONSTRAINT uq_assistant_conversation_user_session UNIQUE (user_id, client_session_id);


--
-- Name: assistant_memory_entries uq_assistant_memory_user_content; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assistant_memory_entries
    ADD CONSTRAINT uq_assistant_memory_user_content UNIQUE (user_id, normalized_content);


--
-- Name: users users_card_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_card_code_key UNIQUE (card_code);


--
-- Name: users_groups users_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_groups
    ADD CONSTRAINT users_groups_pkey PRIMARY KEY (id);


--
-- Name: users_groups users_groups_user_id_group_id_fc7788e8_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_groups
    ADD CONSTRAINT users_groups_user_id_group_id_fc7788e8_uniq UNIQUE (user_id, group_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_user_permissions users_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_user_permissions
    ADD CONSTRAINT users_user_permissions_pkey PRIMARY KEY (id);


--
-- Name: users_user_permissions users_user_permissions_user_id_permission_id_3b86cbdf_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_user_permissions
    ADD CONSTRAINT users_user_permissions_user_id_permission_id_3b86cbdf_uniq UNIQUE (user_id, permission_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: assistant_c_user_id_deae81_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX assistant_c_user_id_deae81_idx ON public.assistant_conversations USING btree (user_id, last_message_at DESC);


--
-- Name: assistant_conversations_last_message_at_951e511c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX assistant_conversations_last_message_at_951e511c ON public.assistant_conversations USING btree (last_message_at);


--
-- Name: assistant_conversations_user_id_dc2563ab; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX assistant_conversations_user_id_dc2563ab ON public.assistant_conversations USING btree (user_id);


--
-- Name: assistant_m_convers_e4d26f_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX assistant_m_convers_e4d26f_idx ON public.assistant_messages USING btree (conversation_id, created_at DESC);


--
-- Name: assistant_m_user_id_2aabd0_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX assistant_m_user_id_2aabd0_idx ON public.assistant_memory_entries USING btree (user_id, is_active, updated_at DESC);


--
-- Name: assistant_memory_entries_is_active_2ba029da; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX assistant_memory_entries_is_active_2ba029da ON public.assistant_memory_entries USING btree (is_active);


--
-- Name: assistant_memory_entries_user_id_e14759da; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX assistant_memory_entries_user_id_e14759da ON public.assistant_memory_entries USING btree (user_id);


--
-- Name: assistant_messages_conversation_id_0f8adcb3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX assistant_messages_conversation_id_0f8adcb3 ON public.assistant_messages USING btree (conversation_id);


--
-- Name: audit_logs_action_327a0be3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_action_327a0be3 ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_action_327a0be3_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_action_327a0be3_like ON public.audit_logs USING btree (action varchar_pattern_ops);


--
-- Name: audit_logs_action_391715_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_action_391715_idx ON public.audit_logs USING btree (action, created_at);


--
-- Name: audit_logs_created_27acb2_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_created_27acb2_idx ON public.audit_logs USING btree (created_at, user_id);


--
-- Name: audit_logs_created_at_939a9b33; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_created_at_939a9b33 ON public.audit_logs USING btree (created_at);


--
-- Name: audit_logs_entity_type_97919293; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_entity_type_97919293 ON public.audit_logs USING btree (entity_type);


--
-- Name: audit_logs_entity_type_97919293_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_entity_type_97919293_like ON public.audit_logs USING btree (entity_type varchar_pattern_ops);


--
-- Name: audit_logs_user_id_752b0e2b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_user_id_752b0e2b ON public.audit_logs USING btree (user_id);


--
-- Name: auth_group_name_a6ea08ec_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_name_a6ea08ec_like ON public.auth_group USING btree (name varchar_pattern_ops);


--
-- Name: auth_group_permissions_group_id_b120cbf9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON public.auth_group_permissions USING btree (group_id);


--
-- Name: auth_group_permissions_permission_id_84c5c92e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON public.auth_group_permissions USING btree (permission_id);


--
-- Name: auth_permission_content_type_id_2f476e4b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_permission_content_type_id_2f476e4b ON public.auth_permission USING btree (content_type_id);


--
-- Name: authors_name_b87ae7ca_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authors_name_b87ae7ca_like ON public.authors USING btree (name varchar_pattern_ops);


--
-- Name: books_authors_author_id_d8863de7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX books_authors_author_id_d8863de7 ON public.books_authors USING btree (author_id);


--
-- Name: books_authors_book_id_8940dd6d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX books_authors_book_id_8940dd6d ON public.books_authors USING btree (book_id);


--
-- Name: books_categor_7d8cd4_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX books_categor_7d8cd4_idx ON public.books USING btree (category_id);


--
-- Name: books_category_id_1efdc3d3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX books_category_id_1efdc3d3 ON public.books USING btree (category_id);


--
-- Name: books_isbn_6168c404; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX books_isbn_6168c404 ON public.books USING btree (isbn);


--
-- Name: books_isbn_6168c404_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX books_isbn_6168c404_like ON public.books USING btree (isbn varchar_pattern_ops);


--
-- Name: books_isbn_ce4a1a_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX books_isbn_ce4a1a_idx ON public.books USING btree (isbn);


--
-- Name: books_title_6e7eff41; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX books_title_6e7eff41 ON public.books USING btree (title);


--
-- Name: books_title_6e7eff41_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX books_title_6e7eff41_like ON public.books USING btree (title varchar_pattern_ops);


--
-- Name: books_title_7a737c_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX books_title_7a737c_idx ON public.books USING btree (title);


--
-- Name: categories_code_6d9ff322_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_code_6d9ff322_like ON public.categories USING btree (code varchar_pattern_ops);


--
-- Name: categories_name_09afee77_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_name_09afee77_like ON public.categories USING btree (name varchar_pattern_ops);


--
-- Name: copies_barcode_99b64c75_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX copies_barcode_99b64c75_like ON public.copies USING btree (barcode varchar_pattern_ops);


--
-- Name: copies_barcode_c8c7d0_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX copies_barcode_c8c7d0_idx ON public.copies USING btree (barcode);


--
-- Name: copies_book_id_c25b747e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX copies_book_id_c25b747e ON public.copies USING btree (book_id);


--
-- Name: copies_deacces_f62f39_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX copies_deacces_f62f39_idx ON public.copies USING btree (deaccession_batch_id);


--
-- Name: copies_deaccession_batch_id_da9ae75a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX copies_deaccession_batch_id_da9ae75a ON public.copies USING btree (deaccession_batch_id);


--
-- Name: copies_held_fo_65a9f7_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX copies_held_fo_65a9f7_idx ON public.copies USING btree (held_for_user_id);


--
-- Name: copies_held_for_user_id_568d49b0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX copies_held_for_user_id_568d49b0 ON public.copies USING btree (held_for_user_id);


--
-- Name: copies_status_227095_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX copies_status_227095_idx ON public.copies USING btree (status);


--
-- Name: copies_status_d85414a2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX copies_status_d85414a2 ON public.copies USING btree (status);


--
-- Name: copies_status_d85414a2_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX copies_status_d85414a2_like ON public.copies USING btree (status varchar_pattern_ops);


--
-- Name: deaccession_batches_approved_by_id_9aec6a1a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX deaccession_batches_approved_by_id_9aec6a1a ON public.deaccession_batches USING btree (approved_by_id);


--
-- Name: deaccession_batches_code_f05d4b73_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX deaccession_batches_code_f05d4b73_like ON public.deaccession_batches USING btree (code varchar_pattern_ops);


--
-- Name: deaccession_batches_created_by_id_cad9d3d2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX deaccession_batches_created_by_id_cad9d3d2 ON public.deaccession_batches USING btree (created_by_id);


--
-- Name: deaccession_batches_status_206de3db; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX deaccession_batches_status_206de3db ON public.deaccession_batches USING btree (status);


--
-- Name: deaccession_batches_status_206de3db_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX deaccession_batches_status_206de3db_like ON public.deaccession_batches USING btree (status varchar_pattern_ops);


--
-- Name: digital_approval_logs_actor_id_2ae0c9de; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_approval_logs_actor_id_2ae0c9de ON public.digital_approval_logs USING btree (actor_id);


--
-- Name: digital_approval_logs_document_id_6f7f86b7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_approval_logs_document_id_6f7f86b7 ON public.digital_approval_logs USING btree (document_id);


--
-- Name: digital_doc_departm_bd31f0_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_doc_departm_bd31f0_idx ON public.digital_documents USING btree (department, major);


--
-- Name: digital_doc_documen_fa1e08_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_doc_documen_fa1e08_idx ON public.digital_documents USING btree (document_type, status);


--
-- Name: digital_doc_year_1a9501_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_doc_year_1a9501_idx ON public.digital_documents USING btree (year);


--
-- Name: digital_document_versions_document_id_8a027963; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_document_versions_document_id_8a027963 ON public.digital_document_versions USING btree (document_id);


--
-- Name: digital_document_versions_file_hash_sha256_74dd3d10; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_document_versions_file_hash_sha256_74dd3d10 ON public.digital_document_versions USING btree (file_hash_sha256);


--
-- Name: digital_document_versions_file_hash_sha256_74dd3d10_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_document_versions_file_hash_sha256_74dd3d10_like ON public.digital_document_versions USING btree (file_hash_sha256 varchar_pattern_ops);


--
-- Name: digital_document_versions_uploaded_by_id_5f306ec0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_document_versions_uploaded_by_id_5f306ec0 ON public.digital_document_versions USING btree (uploaded_by_id);


--
-- Name: digital_documents_access_scope_72264c90; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_access_scope_72264c90 ON public.digital_documents USING btree (access_scope);


--
-- Name: digital_documents_access_scope_72264c90_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_access_scope_72264c90_like ON public.digital_documents USING btree (access_scope varchar_pattern_ops);


--
-- Name: digital_documents_allowed_users_digitaldocument_id_79eca806; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_allowed_users_digitaldocument_id_79eca806 ON public.digital_documents_allowed_users USING btree (digitaldocument_id);


--
-- Name: digital_documents_allowed_users_user_id_7e08a640; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_allowed_users_user_id_7e08a640 ON public.digital_documents_allowed_users USING btree (user_id);


--
-- Name: digital_documents_approved_by_id_30d076bb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_approved_by_id_30d076bb ON public.digital_documents USING btree (approved_by_id);


--
-- Name: digital_documents_author_names_261168bb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_author_names_261168bb ON public.digital_documents USING btree (author_names);


--
-- Name: digital_documents_author_names_261168bb_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_author_names_261168bb_like ON public.digital_documents USING btree (author_names varchar_pattern_ops);


--
-- Name: digital_documents_catalog_book_id_612a5da5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_catalog_book_id_612a5da5 ON public.digital_documents USING btree (catalog_book_id);


--
-- Name: digital_documents_created_by_id_231eb874; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_created_by_id_231eb874 ON public.digital_documents USING btree (created_by_id);


--
-- Name: digital_documents_department_4635a352; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_department_4635a352 ON public.digital_documents USING btree (department);


--
-- Name: digital_documents_department_4635a352_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_department_4635a352_like ON public.digital_documents USING btree (department varchar_pattern_ops);


--
-- Name: digital_documents_document_type_903ae9cf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_document_type_903ae9cf ON public.digital_documents USING btree (document_type);


--
-- Name: digital_documents_document_type_903ae9cf_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_document_type_903ae9cf_like ON public.digital_documents USING btree (document_type varchar_pattern_ops);


--
-- Name: digital_documents_major_4fd40332; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_major_4fd40332 ON public.digital_documents USING btree (major);


--
-- Name: digital_documents_major_4fd40332_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_major_4fd40332_like ON public.digital_documents USING btree (major varchar_pattern_ops);


--
-- Name: digital_documents_status_e77dd7f5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_status_e77dd7f5 ON public.digital_documents USING btree (status);


--
-- Name: digital_documents_status_e77dd7f5_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_status_e77dd7f5_like ON public.digital_documents USING btree (status varchar_pattern_ops);


--
-- Name: digital_documents_title_76e10a60; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_title_76e10a60 ON public.digital_documents USING btree (title);


--
-- Name: digital_documents_title_76e10a60_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_title_76e10a60_like ON public.digital_documents USING btree (title varchar_pattern_ops);


--
-- Name: digital_documents_year_9f516bd4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_documents_year_9f516bd4 ON public.digital_documents USING btree (year);


--
-- Name: digital_rea_status_f0ff44_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_rea_status_f0ff44_idx ON public.digital_reading_sessions USING btree (status, expires_at);


--
-- Name: digital_rea_user_id_6f1851_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_rea_user_id_6f1851_idx ON public.digital_reading_sessions USING btree (user_id, document_id);


--
-- Name: digital_reading_sessions_document_id_fc19c23c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_reading_sessions_document_id_fc19c23c ON public.digital_reading_sessions USING btree (document_id);


--
-- Name: digital_reading_sessions_session_code_2e6d41cd_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_reading_sessions_session_code_2e6d41cd_like ON public.digital_reading_sessions USING btree (session_code varchar_pattern_ops);


--
-- Name: digital_reading_sessions_user_id_cd2458f1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_reading_sessions_user_id_cd2458f1 ON public.digital_reading_sessions USING btree (user_id);


--
-- Name: digital_reading_sessions_version_id_69ccbc78; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_reading_sessions_version_id_69ccbc78 ON public.digital_reading_sessions USING btree (version_id);


--
-- Name: digital_resources_book_id_1cf0cb9f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_resources_book_id_1cf0cb9f ON public.digital_resources USING btree (book_id);


--
-- Name: digital_resources_created_by_id_026d2461; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_resources_created_by_id_026d2461 ON public.digital_resources USING btree (created_by_id);


--
-- Name: django_session_expire_date_a5c62663; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_expire_date_a5c62663 ON public.django_session USING btree (expire_date);


--
-- Name: django_session_session_key_c0390e0f_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_session_key_c0390e0f_like ON public.django_session USING btree (session_key varchar_pattern_ops);


--
-- Name: fine_payments_collected_by_id_630712d1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fine_payments_collected_by_id_630712d1 ON public.fine_payments USING btree (collected_by_id);


--
-- Name: fine_payments_fine_id_c6171a06; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fine_payments_fine_id_c6171a06 ON public.fine_payments USING btree (fine_id);


--
-- Name: fines_loan_id_e2d1d992; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fines_loan_id_e2d1d992 ON public.fines USING btree (loan_id);


--
-- Name: fines_status_06cf6f_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fines_status_06cf6f_idx ON public.fines USING btree (status);


--
-- Name: fines_status_7ec0ff26; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fines_status_7ec0ff26 ON public.fines USING btree (status);


--
-- Name: fines_status_7ec0ff26_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fines_status_7ec0ff26_like ON public.fines USING btree (status varchar_pattern_ops);


--
-- Name: fines_type_38bd1fcd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fines_type_38bd1fcd ON public.fines USING btree (type);


--
-- Name: fines_type_38bd1fcd_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fines_type_38bd1fcd_like ON public.fines USING btree (type varchar_pattern_ops);


--
-- Name: fines_user_id_7da2b3_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fines_user_id_7da2b3_idx ON public.fines USING btree (user_id, status);


--
-- Name: fines_user_id_f8419dc3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fines_user_id_f8419dc3 ON public.fines USING btree (user_id);


--
-- Name: fines_waived_by_id_ebfe3463; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fines_waived_by_id_ebfe3463 ON public.fines USING btree (waived_by_id);


--
-- Name: loans_book_id_8fbe56c7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX loans_book_id_8fbe56c7 ON public.loans USING btree (book_id);


--
-- Name: loans_copy_id_165d0eb3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX loans_copy_id_165d0eb3 ON public.loans USING btree (copy_id);


--
-- Name: loans_created_by_id_54c3babe; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX loans_created_by_id_54c3babe ON public.loans USING btree (created_by_id);


--
-- Name: loans_due_at_1674a7_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX loans_due_at_1674a7_idx ON public.loans USING btree (due_at);


--
-- Name: loans_due_at_df4a4091; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX loans_due_at_df4a4091 ON public.loans USING btree (due_at);


--
-- Name: loans_handled_by_id_02653d47; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX loans_handled_by_id_02653d47 ON public.loans USING btree (handled_by_id);


--
-- Name: loans_status_9049a0_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX loans_status_9049a0_idx ON public.loans USING btree (status);


--
-- Name: loans_status_b834dd8f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX loans_status_b834dd8f ON public.loans USING btree (status);


--
-- Name: loans_status_b834dd8f_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX loans_status_b834dd8f_like ON public.loans USING btree (status varchar_pattern_ops);


--
-- Name: loans_user_id_e6467baa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX loans_user_id_e6467baa ON public.loans USING btree (user_id);


--
-- Name: loans_user_id_efac20_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX loans_user_id_efac20_idx ON public.loans USING btree (user_id, status);


--
-- Name: notificatio_user_id_7336fd_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notificatio_user_id_7336fd_idx ON public.notifications USING btree (user_id, created_at);


--
-- Name: notificatio_user_id_a4dd5c_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notificatio_user_id_a4dd5c_idx ON public.notifications USING btree (user_id, is_read);


--
-- Name: notifications_dedupe_key_433c91e2_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_dedupe_key_433c91e2_like ON public.notifications USING btree (dedupe_key varchar_pattern_ops);


--
-- Name: notifications_is_read_27cb7368; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_is_read_27cb7368 ON public.notifications USING btree (is_read);


--
-- Name: notifications_type_be5d2171; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_type_be5d2171 ON public.notifications USING btree (type);


--
-- Name: notifications_type_be5d2171_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_type_be5d2171_like ON public.notifications USING btree (type varchar_pattern_ops);


--
-- Name: notifications_user_id_468e288d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_user_id_468e288d ON public.notifications USING btree (user_id);


--
-- Name: password_reset_tokens_token_hash_27f0c266_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX password_reset_tokens_token_hash_27f0c266_like ON public.password_reset_tokens USING btree (token_hash varchar_pattern_ops);


--
-- Name: password_reset_tokens_user_id_0aeaaad3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX password_reset_tokens_user_id_0aeaaad3 ON public.password_reset_tokens USING btree (user_id);


--
-- Name: payment_tra_collect_1be203_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_tra_collect_1be203_idx ON public.payment_transactions USING btree (collected_at);


--
-- Name: payment_tra_receipt_3f6300_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_tra_receipt_3f6300_idx ON public.payment_transactions USING btree (receipt_code);


--
-- Name: payment_tra_transac_0f64bd_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_tra_transac_0f64bd_idx ON public.payment_transactions USING btree (transaction_type, status);


--
-- Name: payment_tra_transac_e31ef9_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_tra_transac_e31ef9_idx ON public.payment_transactions USING btree (transaction_code);


--
-- Name: payment_transactions_collected_at_65894f40; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_transactions_collected_at_65894f40 ON public.payment_transactions USING btree (collected_at);


--
-- Name: payment_transactions_collected_by_id_2cb4307e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_transactions_collected_by_id_2cb4307e ON public.payment_transactions USING btree (collected_by_id);


--
-- Name: payment_transactions_receipt_code_c01d103c_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_transactions_receipt_code_c01d103c_like ON public.payment_transactions USING btree (receipt_code varchar_pattern_ops);


--
-- Name: payment_transactions_status_2a5d6e09; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_transactions_status_2a5d6e09 ON public.payment_transactions USING btree (status);


--
-- Name: payment_transactions_status_2a5d6e09_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_transactions_status_2a5d6e09_like ON public.payment_transactions USING btree (status varchar_pattern_ops);


--
-- Name: payment_transactions_student_code_b1763aa0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_transactions_student_code_b1763aa0 ON public.payment_transactions USING btree (student_code);


--
-- Name: payment_transactions_student_code_b1763aa0_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_transactions_student_code_b1763aa0_like ON public.payment_transactions USING btree (student_code varchar_pattern_ops);


--
-- Name: payment_transactions_transaction_code_cad9ef31_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_transactions_transaction_code_cad9ef31_like ON public.payment_transactions USING btree (transaction_code varchar_pattern_ops);


--
-- Name: payment_transactions_transaction_type_578e35cc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_transactions_transaction_type_578e35cc ON public.payment_transactions USING btree (transaction_type);


--
-- Name: payment_transactions_transaction_type_578e35cc_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_transactions_transaction_type_578e35cc_like ON public.payment_transactions USING btree (transaction_type varchar_pattern_ops);


--
-- Name: payment_transactions_user_id_91653266; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_transactions_user_id_91653266 ON public.payment_transactions USING btree (user_id);


--
-- Name: policies_is_current_8e8ca73f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX policies_is_current_8e8ca73f ON public.policies USING btree (is_current);


--
-- Name: reading_sessions_digital_resource_id_5fda4e37; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reading_sessions_digital_resource_id_5fda4e37 ON public.reading_sessions USING btree (digital_resource_id);


--
-- Name: reading_sessions_user_id_6436cba9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reading_sessions_user_id_6436cba9 ON public.reading_sessions USING btree (user_id);


--
-- Name: refresh_tok_family__5b3991_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX refresh_tok_family__5b3991_idx ON public.refresh_tokens USING btree (family_id);


--
-- Name: refresh_tok_token_h_2fa7c6_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX refresh_tok_token_h_2fa7c6_idx ON public.refresh_tokens USING btree (token_hash);


--
-- Name: refresh_tok_user_id_973457_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX refresh_tok_user_id_973457_idx ON public.refresh_tokens USING btree (user_id, revoked_at);


--
-- Name: refresh_tokens_family_id_814ef118; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX refresh_tokens_family_id_814ef118 ON public.refresh_tokens USING btree (family_id);


--
-- Name: refresh_tokens_token_hash_8174b928_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX refresh_tokens_token_hash_8174b928_like ON public.refresh_tokens USING btree (token_hash varchar_pattern_ops);


--
-- Name: refresh_tokens_user_id_b02a6331; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX refresh_tokens_user_id_b02a6331 ON public.refresh_tokens USING btree (user_id);


--
-- Name: reservation_book_id_61e67a_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reservation_book_id_61e67a_idx ON public.reservations USING btree (book_id, status);


--
-- Name: reservation_hold_ex_5f5c39_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reservation_hold_ex_5f5c39_idx ON public.reservations USING btree (hold_expires_at);


--
-- Name: reservation_user_id_d4fda7_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reservation_user_id_d4fda7_idx ON public.reservations USING btree (user_id, status);


--
-- Name: reservations_book_id_6bb0a875; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reservations_book_id_6bb0a875 ON public.reservations USING btree (book_id);


--
-- Name: reservations_copy_id_0afd62be; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reservations_copy_id_0afd62be ON public.reservations USING btree (copy_id);


--
-- Name: reservations_status_3316acdb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reservations_status_3316acdb ON public.reservations USING btree (status);


--
-- Name: reservations_status_3316acdb_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reservations_status_3316acdb_like ON public.reservations USING btree (status varchar_pattern_ops);


--
-- Name: reservations_user_id_d03abc5b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reservations_user_id_d03abc5b ON public.reservations USING btree (user_id);


--
-- Name: student_ros_status_253572_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_ros_status_253572_idx ON public.student_roster USING btree (status, is_card_issued);


--
-- Name: student_ros_student_c89c7d_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_ros_student_c89c7d_idx ON public.student_roster USING btree (student_code);


--
-- Name: student_roster_is_card_issued_938333e8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_roster_is_card_issued_938333e8 ON public.student_roster USING btree (is_card_issued);


--
-- Name: student_roster_status_4d3a7abc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_roster_status_4d3a7abc ON public.student_roster USING btree (status);


--
-- Name: student_roster_status_4d3a7abc_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_roster_status_4d3a7abc_like ON public.student_roster USING btree (status varchar_pattern_ops);


--
-- Name: student_roster_student_code_e71cf8f2_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX student_roster_student_code_e71cf8f2_like ON public.student_roster USING btree (student_code varchar_pattern_ops);


--
-- Name: suggestion__suggest_e9f89a_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suggestion__suggest_e9f89a_idx ON public.suggestion_votes USING btree (suggestion_id, user_id);


--
-- Name: suggestion_campaigns_created_by_id_3b7f6b88; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suggestion_campaigns_created_by_id_3b7f6b88 ON public.suggestion_campaigns USING btree (created_by_id);


--
-- Name: suggestion_campaigns_status_b1ce79f8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suggestion_campaigns_status_b1ce79f8 ON public.suggestion_campaigns USING btree (status);


--
-- Name: suggestion_campaigns_status_b1ce79f8_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suggestion_campaigns_status_b1ce79f8_like ON public.suggestion_campaigns USING btree (status varchar_pattern_ops);


--
-- Name: suggestion_votes_suggestion_id_fa6a80ca; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suggestion_votes_suggestion_id_fa6a80ca ON public.suggestion_votes USING btree (suggestion_id);


--
-- Name: suggestion_votes_user_id_14236ef4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suggestion_votes_user_id_14236ef4 ON public.suggestion_votes USING btree (user_id);


--
-- Name: suggestions_campaig_3e0fec_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suggestions_campaig_3e0fec_idx ON public.suggestions USING btree (campaign_id, status);


--
-- Name: suggestions_campaign_id_7ac95f4f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suggestions_campaign_id_7ac95f4f ON public.suggestions USING btree (campaign_id);


--
-- Name: suggestions_reviewed_by_id_4bc0674a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suggestions_reviewed_by_id_4bc0674a ON public.suggestions USING btree (reviewed_by_id);


--
-- Name: suggestions_status_29281be8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suggestions_status_29281be8 ON public.suggestions USING btree (status);


--
-- Name: suggestions_status_29281be8_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suggestions_status_29281be8_like ON public.suggestions USING btree (status varchar_pattern_ops);


--
-- Name: suggestions_status_dc6c14_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suggestions_status_dc6c14_idx ON public.suggestions USING btree (status);


--
-- Name: suggestions_user_id_2811d1_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suggestions_user_id_2811d1_idx ON public.suggestions USING btree (user_id, status);


--
-- Name: suggestions_user_id_be2b2735; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suggestions_user_id_be2b2735 ON public.suggestions USING btree (user_id);


--
-- Name: unique_active_loan_per_copy; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_active_loan_per_copy ON public.loans USING btree (copy_id) WHERE ((status)::text = 'active'::text);


--
-- Name: unique_active_loan_per_user_book; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_active_loan_per_user_book ON public.loans USING btree (user_id, book_id) WHERE ((status)::text = 'active'::text);


--
-- Name: unique_pending_reservation_per_user_book; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_pending_reservation_per_user_book ON public.reservations USING btree (user_id, book_id) WHERE ((status)::text = 'pending'::text);


--
-- Name: unique_ready_reservation_per_copy; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_ready_reservation_per_copy ON public.reservations USING btree (copy_id) WHERE ((status)::text = 'ready'::text);


--
-- Name: users_card_co_b0f955_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_card_co_b0f955_idx ON public.users USING btree (card_code);


--
-- Name: users_card_code_be7cd0f5_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_card_code_be7cd0f5_like ON public.users USING btree (card_code varchar_pattern_ops);


--
-- Name: users_email_0ea73cca; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_0ea73cca ON public.users USING btree (email);


--
-- Name: users_email_0ea73cca_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_0ea73cca_like ON public.users USING btree (email varchar_pattern_ops);


--
-- Name: users_groups_group_id_2f3517aa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_groups_group_id_2f3517aa ON public.users_groups USING btree (group_id);


--
-- Name: users_groups_user_id_f500bee5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_groups_user_id_f500bee5 ON public.users_groups USING btree (user_id);


--
-- Name: users_role_a8f2ba_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_role_a8f2ba_idx ON public.users USING btree (role, is_active);


--
-- Name: users_role_f0571928; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_role_f0571928 ON public.users USING btree (role);


--
-- Name: users_role_f0571928_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_role_f0571928_like ON public.users USING btree (role varchar_pattern_ops);


--
-- Name: users_user_permissions_permission_id_6d08dcd2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_user_permissions_permission_id_6d08dcd2 ON public.users_user_permissions USING btree (permission_id);


--
-- Name: users_user_permissions_user_id_92473840; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_user_permissions_user_id_92473840 ON public.users_user_permissions USING btree (user_id);


--
-- Name: users_username_e8658fc8_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_username_e8658fc8_like ON public.users USING btree (username varchar_pattern_ops);


--
-- Name: assistant_conversations assistant_conversations_user_id_dc2563ab_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assistant_conversations
    ADD CONSTRAINT assistant_conversations_user_id_dc2563ab_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assistant_memory_entries assistant_memory_entries_user_id_e14759da_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assistant_memory_entries
    ADD CONSTRAINT assistant_memory_entries_user_id_e14759da_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: assistant_messages assistant_messages_conversation_id_0f8adcb3_fk_assistant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assistant_messages
    ADD CONSTRAINT assistant_messages_conversation_id_0f8adcb3_fk_assistant FOREIGN KEY (conversation_id) REFERENCES public.assistant_conversations(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: audit_logs audit_logs_user_id_752b0e2b_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_752b0e2b_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_group_permissions auth_group_permissio_permission_id_84c5c92e_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_group_permissions auth_group_permissions_group_id_b120cbf9_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_permission auth_permission_content_type_id_2f476e4b_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: barcode_sequences barcode_sequences_category_id_882a949f_fk_categories_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barcode_sequences
    ADD CONSTRAINT barcode_sequences_category_id_882a949f_fk_categories_id FOREIGN KEY (category_id) REFERENCES public.categories(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: books_authors books_authors_author_id_d8863de7_fk_authors_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books_authors
    ADD CONSTRAINT books_authors_author_id_d8863de7_fk_authors_id FOREIGN KEY (author_id) REFERENCES public.authors(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: books_authors books_authors_book_id_8940dd6d_fk_books_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books_authors
    ADD CONSTRAINT books_authors_book_id_8940dd6d_fk_books_id FOREIGN KEY (book_id) REFERENCES public.books(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: books books_category_id_1efdc3d3_fk_categories_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_category_id_1efdc3d3_fk_categories_id FOREIGN KEY (category_id) REFERENCES public.categories(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: copies copies_book_id_c25b747e_fk_books_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.copies
    ADD CONSTRAINT copies_book_id_c25b747e_fk_books_id FOREIGN KEY (book_id) REFERENCES public.books(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: copies copies_deaccession_batch_id_da9ae75a_fk_deaccession_batches_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.copies
    ADD CONSTRAINT copies_deaccession_batch_id_da9ae75a_fk_deaccession_batches_id FOREIGN KEY (deaccession_batch_id) REFERENCES public.deaccession_batches(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: copies copies_held_for_user_id_568d49b0_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.copies
    ADD CONSTRAINT copies_held_for_user_id_568d49b0_fk_users_id FOREIGN KEY (held_for_user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: deaccession_batches deaccession_batches_approved_by_id_9aec6a1a_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deaccession_batches
    ADD CONSTRAINT deaccession_batches_approved_by_id_9aec6a1a_fk_users_id FOREIGN KEY (approved_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: deaccession_batches deaccession_batches_created_by_id_cad9d3d2_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deaccession_batches
    ADD CONSTRAINT deaccession_batches_created_by_id_cad9d3d2_fk_users_id FOREIGN KEY (created_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: digital_approval_logs digital_approval_log_document_id_6f7f86b7_fk_digital_d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_approval_logs
    ADD CONSTRAINT digital_approval_log_document_id_6f7f86b7_fk_digital_d FOREIGN KEY (document_id) REFERENCES public.digital_documents(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: digital_approval_logs digital_approval_logs_actor_id_2ae0c9de_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_approval_logs
    ADD CONSTRAINT digital_approval_logs_actor_id_2ae0c9de_fk_users_id FOREIGN KEY (actor_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: digital_document_versions digital_document_ver_document_id_8a027963_fk_digital_d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_document_versions
    ADD CONSTRAINT digital_document_ver_document_id_8a027963_fk_digital_d FOREIGN KEY (document_id) REFERENCES public.digital_documents(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: digital_document_versions digital_document_versions_uploaded_by_id_5f306ec0_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_document_versions
    ADD CONSTRAINT digital_document_versions_uploaded_by_id_5f306ec0_fk_users_id FOREIGN KEY (uploaded_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: digital_documents_allowed_users digital_documents_al_digitaldocument_id_79eca806_fk_digital_d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_documents_allowed_users
    ADD CONSTRAINT digital_documents_al_digitaldocument_id_79eca806_fk_digital_d FOREIGN KEY (digitaldocument_id) REFERENCES public.digital_documents(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: digital_documents_allowed_users digital_documents_allowed_users_user_id_7e08a640_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_documents_allowed_users
    ADD CONSTRAINT digital_documents_allowed_users_user_id_7e08a640_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: digital_documents digital_documents_approved_by_id_30d076bb_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_documents
    ADD CONSTRAINT digital_documents_approved_by_id_30d076bb_fk_users_id FOREIGN KEY (approved_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: digital_documents digital_documents_catalog_book_id_612a5da5_fk_books_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_documents
    ADD CONSTRAINT digital_documents_catalog_book_id_612a5da5_fk_books_id FOREIGN KEY (catalog_book_id) REFERENCES public.books(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: digital_documents digital_documents_created_by_id_231eb874_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_documents
    ADD CONSTRAINT digital_documents_created_by_id_231eb874_fk_users_id FOREIGN KEY (created_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: digital_reading_sessions digital_reading_sess_document_id_fc19c23c_fk_digital_d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_reading_sessions
    ADD CONSTRAINT digital_reading_sess_document_id_fc19c23c_fk_digital_d FOREIGN KEY (document_id) REFERENCES public.digital_documents(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: digital_reading_sessions digital_reading_sess_version_id_69ccbc78_fk_digital_d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_reading_sessions
    ADD CONSTRAINT digital_reading_sess_version_id_69ccbc78_fk_digital_d FOREIGN KEY (version_id) REFERENCES public.digital_document_versions(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: digital_reading_sessions digital_reading_sessions_user_id_cd2458f1_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_reading_sessions
    ADD CONSTRAINT digital_reading_sessions_user_id_cd2458f1_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: digital_resources digital_resources_book_id_1cf0cb9f_fk_books_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_resources
    ADD CONSTRAINT digital_resources_book_id_1cf0cb9f_fk_books_id FOREIGN KEY (book_id) REFERENCES public.books(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: digital_resources digital_resources_created_by_id_026d2461_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_resources
    ADD CONSTRAINT digital_resources_created_by_id_026d2461_fk_users_id FOREIGN KEY (created_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: fine_payments fine_payments_collected_by_id_630712d1_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fine_payments
    ADD CONSTRAINT fine_payments_collected_by_id_630712d1_fk_users_id FOREIGN KEY (collected_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: fine_payments fine_payments_fine_id_c6171a06_fk_fines_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fine_payments
    ADD CONSTRAINT fine_payments_fine_id_c6171a06_fk_fines_id FOREIGN KEY (fine_id) REFERENCES public.fines(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: fines fines_loan_id_e2d1d992_fk_loans_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fines
    ADD CONSTRAINT fines_loan_id_e2d1d992_fk_loans_id FOREIGN KEY (loan_id) REFERENCES public.loans(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: fines fines_user_id_f8419dc3_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fines
    ADD CONSTRAINT fines_user_id_f8419dc3_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: fines fines_waived_by_id_ebfe3463_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fines
    ADD CONSTRAINT fines_waived_by_id_ebfe3463_fk_users_id FOREIGN KEY (waived_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: loans loans_book_id_8fbe56c7_fk_books_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_book_id_8fbe56c7_fk_books_id FOREIGN KEY (book_id) REFERENCES public.books(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: loans loans_copy_id_165d0eb3_fk_copies_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_copy_id_165d0eb3_fk_copies_id FOREIGN KEY (copy_id) REFERENCES public.copies(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: loans loans_created_by_id_54c3babe_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_created_by_id_54c3babe_fk_users_id FOREIGN KEY (created_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: loans loans_handled_by_id_02653d47_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_handled_by_id_02653d47_fk_users_id FOREIGN KEY (handled_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: loans loans_user_id_e6467baa_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_user_id_e6467baa_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: notifications notifications_user_id_468e288d_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_468e288d_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_0aeaaad3_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_0aeaaad3_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: payment_transactions payment_transactions_collected_by_id_2cb4307e_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_collected_by_id_2cb4307e_fk_users_id FOREIGN KEY (collected_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: payment_transactions payment_transactions_user_id_91653266_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_user_id_91653266_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: reading_sessions reading_sessions_digital_resource_id_5fda4e37_fk_digital_r; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_sessions
    ADD CONSTRAINT reading_sessions_digital_resource_id_5fda4e37_fk_digital_r FOREIGN KEY (digital_resource_id) REFERENCES public.digital_resources(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: reading_sessions reading_sessions_user_id_6436cba9_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reading_sessions
    ADD CONSTRAINT reading_sessions_user_id_6436cba9_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: refresh_tokens refresh_tokens_user_id_b02a6331_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_b02a6331_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: reservations reservations_book_id_6bb0a875_fk_books_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_book_id_6bb0a875_fk_books_id FOREIGN KEY (book_id) REFERENCES public.books(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: reservations reservations_copy_id_0afd62be_fk_copies_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_copy_id_0afd62be_fk_copies_id FOREIGN KEY (copy_id) REFERENCES public.copies(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: reservations reservations_user_id_d03abc5b_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_user_id_d03abc5b_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: student_roster student_roster_user_id_7023c7fd_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_roster
    ADD CONSTRAINT student_roster_user_id_7023c7fd_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: suggestion_campaigns suggestion_campaigns_created_by_id_3b7f6b88_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suggestion_campaigns
    ADD CONSTRAINT suggestion_campaigns_created_by_id_3b7f6b88_fk_users_id FOREIGN KEY (created_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: suggestion_votes suggestion_votes_suggestion_id_fa6a80ca_fk_suggestions_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suggestion_votes
    ADD CONSTRAINT suggestion_votes_suggestion_id_fa6a80ca_fk_suggestions_id FOREIGN KEY (suggestion_id) REFERENCES public.suggestions(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: suggestion_votes suggestion_votes_user_id_14236ef4_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suggestion_votes
    ADD CONSTRAINT suggestion_votes_user_id_14236ef4_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: suggestions suggestions_campaign_id_7ac95f4f_fk_suggestion_campaigns_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suggestions
    ADD CONSTRAINT suggestions_campaign_id_7ac95f4f_fk_suggestion_campaigns_id FOREIGN KEY (campaign_id) REFERENCES public.suggestion_campaigns(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: suggestions suggestions_reviewed_by_id_4bc0674a_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suggestions
    ADD CONSTRAINT suggestions_reviewed_by_id_4bc0674a_fk_users_id FOREIGN KEY (reviewed_by_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: suggestions suggestions_user_id_be2b2735_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suggestions
    ADD CONSTRAINT suggestions_user_id_be2b2735_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_groups users_groups_group_id_2f3517aa_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_groups
    ADD CONSTRAINT users_groups_group_id_2f3517aa_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_groups users_groups_user_id_f500bee5_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_groups
    ADD CONSTRAINT users_groups_user_id_f500bee5_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_user_permissions users_user_permissio_permission_id_6d08dcd2_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_user_permissions
    ADD CONSTRAINT users_user_permissio_permission_id_6d08dcd2_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: users_user_permissions users_user_permissions_user_id_92473840_fk_users_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_user_permissions
    ADD CONSTRAINT users_user_permissions_user_id_92473840_fk_users_id FOREIGN KEY (user_id) REFERENCES public.users(id) DEFERRABLE INITIALLY DEFERRED;


--
-- PostgreSQL database dump complete
--

\unrestrict vbTx9iH0Ack0JsROyja3jEFMOOPJjMO6YwEWHdtEipFEdcVTCI3L3pAQXkeUOhn

