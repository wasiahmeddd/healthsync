import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs("report_assets", exist_ok=True)

# 1. Generate VTU Seal
vtu_img = Image.new("RGBA", (300, 300), (255, 255, 255, 0))
d = ImageDraw.Draw(vtu_img)
# Shield and gears
d.ellipse((10, 10, 290, 290), outline="#15803d", width=6)
d.ellipse((25, 25, 275, 275), outline="#b91c1c", width=4)
d.ellipse((50, 50, 250, 250), fill="#f0fdf4", outline="#15803d", width=3)
d.rectangle((90, 90, 210, 210), fill="#dc2626", outline="#991b1b", width=2)
d.polygon([(150, 60), (230, 200), (70, 200)], fill="#eab308")
d.ellipse((120, 110, 180, 170), fill="#1e3a8a")
vtu_img.save("report_assets/vtu_seal.png")

# 2. Generate BMSCE Seal
bms_img = Image.new("RGBA", (300, 300), (255, 255, 255, 0))
d = ImageDraw.Draw(bms_img)
d.ellipse((10, 10, 290, 290), outline="#1e3a8a", width=7)
d.ellipse((22, 22, 278, 278), outline="#0284c7", width=3)
d.ellipse((40, 40, 260, 260), fill="#eff6ff", outline="#1e3a8a", width=4)
# Cogwheel / rays
d.ellipse((80, 80, 220, 220), fill="#1e3a8a")
d.ellipse((105, 105, 195, 195), fill="#f59e0b")
d.ellipse((125, 125, 175, 175), fill="#ffffff")
bms_img.save("report_assets/bmsce_seal.png")

# 3. Generate Schema Diagram (matching template page 8 format)
schema_img = Image.new("RGB", (1200, 1500), (255, 255, 255))
d = ImageDraw.Draw(schema_img)

def draw_table_box(x, y, title, cols, w=900, h=65):
    # Header title
    d.text((x + 20, y - 20), title, fill="#0f172a")
    # Outer box
    d.rectangle((x, y, x + w, y + h), outline="#0f766e", width=2, fill="#f8fafc")
    # Col dividers
    col_w = w / len(cols)
    for i, col in enumerate(cols):
        cx = x + i * col_w
        if i > 0:
            d.line((cx, y, cx, y + h), fill="#cbd5e1", width=2)
        d.text((cx + 12, y + 24), col, fill="#1e293b")

draw_table_box(150, 80, "HOSPITALS", ["HOSPITAL_ID (PK)", "NAME", "CODE", "ADDRESS", "PHONE", "HELPLINE"])
d.line((600, 145, 600, 200), fill="#0d9488", width=2)

draw_table_box(150, 200, "USERS", ["USER_ID (PK)", "EMAIL", "PASSWORD_HASH", "ROLE_ID (FK)", "FULL_NAME", "PHONE"])
d.line((300, 265, 300, 320), fill="#0d9488", width=2)
d.line((900, 265, 900, 320), fill="#0d9488", width=2)

draw_table_box(150, 320, "PATIENTS", ["PATIENT_ID (PK)", "USER_ID (FK)", "DOB", "GENDER", "BLOOD_GROUP", "QR_CODE_HASH"])
d.line((600, 385, 600, 440), fill="#0d9488", width=2)

draw_table_box(150, 440, "HEALTH_PROFILES", ["PROFILE_ID (PK)", "PATIENT_ID (FK)", "HEIGHT", "WEIGHT", "ALLERGIES", "CHRONIC_COND"])

draw_table_box(150, 560, "DOCTORS", ["DOCTOR_ID (PK)", "USER_ID (FK)", "HOSPITAL_ID (FK)", "SPECIALIZATION", "DEPT", "LICENSE", "FEE"])
d.line((600, 625, 600, 680), fill="#0d9488", width=2)

draw_table_box(150, 680, "APPOINTMENTS", ["APPT_ID (PK)", "HOSP_ID (FK)", "DOC_ID (FK)", "PAT_ID (FK)", "DATE", "TIME_SLOT", "STATUS"])
d.line((600, 745, 600, 800), fill="#0d9488", width=2)

draw_table_box(150, 800, "CONSULTATIONS", ["CONSULT_ID (PK)", "APPT_ID (FK)", "DOCTOR_ID (FK)", "PATIENT_ID (FK)", "DIAGNOSIS", "VITALS"])
d.line((600, 865, 600, 920), fill="#0d9488", width=2)

draw_table_box(150, 920, "PRESCRIPTIONS", ["RX_ID (PK)", "CONSULT_ID (FK)", "PATIENT_ID (FK)", "DOCTOR_ID (FK)", "STATUS", "TOKEN"])
d.line((600, 985, 600, 1040), fill="#0d9488", width=2)

draw_table_box(150, 1040, "PRESCRIPTION_ITEMS", ["ITEM_ID (PK)", "RX_ID (FK)", "MEDICINE_NAME", "DOSAGE", "FREQUENCY", "DURATION"])

draw_table_box(150, 1160, "ACCESS_REQUESTS (PRIVACY)", ["REQ_ID (PK)", "PATIENT_ID (FK)", "DOCTOR_ID (FK)", "PURPOSE", "SCOPE", "STATUS"])

draw_table_box(150, 1280, "AUDIT_LOGS", ["LOG_ID (PK)", "PATIENT_ID (FK)", "ACTOR_NAME", "ROLE", "ACTION", "RESOURCE", "TIMESTAMP"])

schema_img.save("report_assets/schema_diagram.png")

# 4. Generate ER Diagram (matching template page 7 format)
er_img = Image.new("RGB", (1200, 1500), (255, 255, 255))
d = ImageDraw.Draw(er_img)

def draw_entity(x, y, name, w=200, h=60):
    d.rectangle((x, y, x + w, y + h), fill="#f0fdfa", outline="#0f766e", width=3)
    d.text((x + 30, y + 22), name, fill="#0f172a")

def draw_rel(x, y, name, w=140, h=60):
    d.polygon([(x + w//2, y), (x + w, y + h//2), (x + w//2, y + h), (x, y + h//2)], fill="#eff6ff", outline="#1e40af", width=2)
    d.text((x + 25, y + 22), name, fill="#1e3a8a")

def draw_attr(x, y, name, w=130, h=40, is_pk=False):
    d.ellipse((x, y, x + w, y + h), fill="#ffffff", outline="#64748b", width=1)
    d.text((x + 15, y + 14), name, fill="#0f172a")
    if is_pk:
        d.line((x + 15, y + 27, x + 15 + len(name)*7, y + 27), fill="#0f172a", width=1)

# Entities
draw_entity(100, 150, "HOSPITAL")
draw_attr(50, 80, "hosp_id", is_pk=True)
draw_attr(190, 80, "name")
d.line((115, 120, 150, 150), fill="#94a3b8")
d.line((255, 120, 250, 150), fill="#94a3b8")

draw_rel(380, 150, "EMPLOYS")
d.line((300, 180, 380, 180), fill="#0f766e", width=2)
d.text((320, 165), "1", fill="#0f766e")

draw_entity(600, 150, "DOCTOR")
d.line((520, 180, 600, 180), fill="#0f766e", width=2)
d.text((540, 165), "N", fill="#0f766e")
draw_attr(580, 80, "doc_id", is_pk=True)
draw_attr(720, 80, "specialty")
d.line((645, 120, 660, 150), fill="#94a3b8")
d.line((785, 120, 750, 150), fill="#94a3b8")

draw_rel(630, 290, "CONSULTS")
d.line((700, 210, 700, 290), fill="#0f766e", width=2)
d.text((710, 240), "M", fill="#0f766e")

draw_entity(600, 430, "CONSULTATION")
d.line((700, 350, 700, 430), fill="#0f766e", width=2)
d.text((710, 380), "N", fill="#0f766e")

draw_rel(380, 430, "UNDERGOES")
d.line((300, 460, 380, 460), fill="#0f766e", width=2)
d.line((520, 460, 600, 460), fill="#0f766e", width=2)

draw_entity(100, 430, "PATIENT")
draw_attr(50, 520, "pat_id", is_pk=True)
draw_attr(190, 520, "qr_hash")
d.line((115, 520, 150, 490), fill="#94a3b8")
d.line((255, 520, 250, 490), fill="#94a3b8")

draw_rel(130, 580, "HAS_PROFILE")
d.line((200, 490, 200, 580), fill="#0f766e", width=2)
d.text((210, 530), "1", fill="#0f766e")

draw_entity(100, 700, "HEALTH_PROFILE")
d.line((200, 640, 200, 700), fill="#0f766e", width=2)
d.text((210, 660), "1", fill="#0f766e")

draw_rel(700, 570, "GENERATES")
d.line((700, 490, 700, 570), fill="#0f766e", width=2)
d.text((710, 520), "1", fill="#0f766e")

draw_entity(600, 700, "PRESCRIPTION")
d.line((700, 630, 700, 700), fill="#0f766e", width=2)
d.text((710, 660), "1", fill="#0f766e")

draw_rel(700, 830, "CONTAINS")
d.line((700, 760, 700, 830), fill="#0f766e", width=2)
d.text((710, 790), "1", fill="#0f766e")

draw_entity(600, 960, "PRESCRIPTION_ITEMS")
d.line((700, 890, 700, 960), fill="#0f766e", width=2)
d.text((710, 920), "N", fill="#0f766e")

draw_rel(380, 700, "DISPENSES")
d.line((600, 730, 520, 730), fill="#0f766e", width=2)
d.line((380, 730, 300, 730), fill="#0f766e", width=2)

draw_entity(100, 960, "PHARMACIST")
d.line((200, 760, 200, 960), fill="#0f766e", width=2)

draw_rel(380, 1100, "REQUESTS_ACCESS")
draw_entity(100, 1220, "ACCESS_REQUEST")
draw_entity(600, 1220, "AUDIT_LOGS")

er_img.save("report_assets/er_diagram.png")
print("Visual assets created successfully.")
