#!/usr/bin/env python
import os
import sys

def ensure_postgres_running():
    """Tự động kiểm tra và khởi động PostgreSQL ngầm nếu chưa chạy."""
    # Bỏ qua nếu chỉ kiểm tra version
    if len(sys.argv) > 1 and sys.argv[1] in {'--version', '-v'}:
        return

    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(0.3)
    try:
        s.connect(('127.0.0.1', 5433))
        s.close()
        return  # PostgreSQL đã chạy sẵn
    except (OSError, ConnectionRefusedError):
        pass
    finally:
        try:
            s.close()
        except Exception:
            pass

    from pathlib import Path
    pgdata = Path(__file__).resolve().parent.parent / '.pgdata'
    if not pgdata.exists():
        return

    postgres_bin = r"C:\Program Files\Odoo 17.0.20260622\PostgreSQL\bin\postgres.exe"
    if not os.path.exists(postgres_bin):
        return

    # Kiểm tra và dọn dẹp postmaster.pid cũ nếu tiến trình đã chết
    pid_file = pgdata / 'postmaster.pid'
    if pid_file.exists():
        try:
            with open(pid_file, 'r', encoding='utf-8') as f:
                first_line = f.readline().strip()
                if first_line.isdigit():
                    pid = int(first_line)
                    import subprocess
                    check = subprocess.run(
                        ['tasklist', '/FI', f'PID eq {pid}', '/FO', 'CSV'],
                        capture_output=True, text=True
                    )
                    if str(pid) not in check.stdout:
                        pid_file.unlink(missing_ok=True)
        except Exception:
            pass

    import subprocess
    import time
    print("\n[UTH-Library] ⏳ Phát hiện PostgreSQL (cổng 5433) chưa chạy.")
    print("[UTH-Library] 🚀 Đang tự động khởi động cơ sở dữ liệu ngầm...")

    DETACHED_PROCESS = 0x00000008
    CREATE_NEW_PROCESS_GROUP = 0x00000200
    try:
        subprocess.Popen(
            [postgres_bin, "-D", str(pgdata), "-p", "5433"],
            creationflags=DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP,
            close_fds=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    except Exception as e:
        print(f"[UTH-Library] ⚠️ Không thể tự khởi động PostgreSQL: {e}")
        return

    # Chờ tối đa 8 giây để cổng 5433 sẵn sàng nhận kết nối
    for _ in range(25):
        time.sleep(0.3)
        try:
            with socket.create_connection(('127.0.0.1', 5433), timeout=0.3):
                print("[UTH-Library] ✅ Cơ sở dữ liệu PostgreSQL đã sẵn sàng kết nối!\n")
                return
        except (OSError, ConnectionRefusedError):
            pass

    print("[UTH-Library] ⚠️ Đã gửi lệnh khởi động PostgreSQL, đang tiếp tục nạp Django...\n")


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
    ensure_postgres_running()
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()


