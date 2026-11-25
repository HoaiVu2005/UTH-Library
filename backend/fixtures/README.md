# UTHie public seed

`uthie_seed_data.json` là fixture công khai dùng để đưa một database mới về trạng thái demo có đủ dữ liệu grounding cho UTHie.

Nạp dữ liệu sau khi migrate:

```bash
python manage.py restore_ai_database
```

Fixture chỉ được phép chứa các model nghiệp vụ demo đã được command whitelist. Không đưa vào fixture:

- refresh token hoặc session;
- audit log và notification runtime;
- hội thoại, tin nhắn hoặc bộ nhớ cá nhân của AI;
- tài khoản người dùng thật;
- API key hoặc secret.

UTHie không được “train” từ fixture này. Khả năng của trợ lý đến từ Gemini, prompt/knowledge trong mã nguồn và dữ liệu nghiệp vụ mà fixture cung cấp.
