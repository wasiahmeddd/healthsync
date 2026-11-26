import subprocess
import os
import time

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
out_dir = os.path.abspath("report_assets")
os.makedirs(out_dir, exist_ok=True)

urls = {
    "landing_page": "https://medilink-healthsync-fsd.web.app/",
    "login_page": "https://medilink-healthsync-fsd.web.app/login",
    "hospital_dashboard": "https://medilink-healthsync-fsd.web.app/hospital/overview",
    "doctor_queue": "https://medilink-healthsync-fsd.web.app/doctor/queue",
    "ai_ocr_scanner": "https://medilink-healthsync-fsd.web.app/doctor/scan-prescription",
    "patient_dashboard": "https://medilink-healthsync-fsd.web.app/patient/dashboard",
    "privacy_center": "https://medilink-healthsync-fsd.web.app/patient/privacy",
    "pharmacist_queue": "https://medilink-healthsync-fsd.web.app/pharmacist/queue"
}

for name, url in urls.items():
    shot_path = os.path.join(out_dir, f"{name}.png")
    cmd = [
        CHROME,
        "--headless",
        "--disable-gpu",
        "--window-size=1280,800",
        f"--screenshot={shot_path}",
        url
    ]
    print(f"Capturing {name} from {url}...")
    subprocess.run(cmd, timeout=30)
    time.sleep(1)

print("Done. Files:", os.listdir(out_dir))
