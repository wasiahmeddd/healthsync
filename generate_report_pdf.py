import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether
)
from reportlab.pdfgen import canvas

class CollegeReportCanvas(canvas.Canvas):
    """Draws outer border and custom page numbering matching VTU / BMSCE report standard."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_decorations(self, total_pages):
        self.saveState()
        w, h = letter

        # 1. Outer Box Border on every page (exact match to college template)
        self.setStrokeColor(colors.black)
        self.setLineWidth(1.5)
        self.rect(28, 28, w - 56, h - 56)

        # Inner subtle guideline
        self.setLineWidth(0.5)
        self.rect(31, 31, w - 62, h - 62)

        # 2. Running Header (omitted on pages 1-3)
        if self._pageNumber > 3:
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#475569"))
            self.drawString(45, h - 42, "BMSCE CSE | Full Stack Web Development (23CS3AEFWD) — HealthSync")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(45, h - 46, w - 45, h - 46)

        # 3. Bottom Right Page Numbering (exact match to template)
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.black)
        self.drawRightString(w - 45, 38, str(self._pageNumber))

        self.restoreState()


def build_college_report(filename="HealthSync_Full_Stack_Report.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=45,
        rightMargin=45,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Custom typography
    navy = colors.HexColor("#0f172a")
    teal = colors.HexColor("#0f766e")
    gray_txt = colors.HexColor("#334155")
    red_accent = colors.HexColor("#b91c1c")

    title_inst = ParagraphStyle(
        'InstTitle', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=13, leading=17,
        alignment=1, textColor=navy
    )
    title_sub = ParagraphStyle(
        'InstSub', parent=styles['Normal'],
        fontName='Helvetica', fontSize=10, leading=14,
        alignment=1, textColor=colors.HexColor("#475569")
    )
    proj_report_on = ParagraphStyle(
        'ReportOn', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=12, leading=16,
        alignment=1, textColor=colors.black, spaceBefore=10, spaceAfter=8
    )
    proj_title_main = ParagraphStyle(
        'ProjTitleMain', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=18, leading=22,
        alignment=1, textColor=red_accent, spaceAfter=14
    )
    submitted_by_lbl = ParagraphStyle(
        'SubBy', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=11, leading=15,
        alignment=1, textColor=colors.black, spaceAfter=8
    )
    student_name = ParagraphStyle(
        'StudName', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=10, leading=14,
        alignment=1, textColor=red_accent
    )
    guide_lbl = ParagraphStyle(
        'GuideLbl', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=11, leading=15,
        alignment=1, textColor=colors.black, spaceBefore=8, spaceAfter=4
    )
    guide_val = ParagraphStyle(
        'GuideVal', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=10, leading=14,
        alignment=1, textColor=red_accent
    )
    guide_desig = ParagraphStyle(
        'GuideDesig', parent=styles['Normal'],
        fontName='Helvetica', fontSize=9.5, leading=13,
        alignment=1, textColor=colors.black
    )
    degree_text = ParagraphStyle(
        'DegText', parent=styles['Normal'],
        fontName='Helvetica', fontSize=9.5, leading=13,
        alignment=1, textColor=colors.black
    )
    bmsce_footer = ParagraphStyle(
        'BMSFooter', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=11, leading=14,
        alignment=1, textColor=navy
    )

    cert_heading = ParagraphStyle(
        'CertHead', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=15, leading=18,
        alignment=1, textColor=colors.black, spaceBefore=10, spaceAfter=15
    )
    body_justify = ParagraphStyle(
        'BodyJust', parent=styles['Normal'],
        fontName='Helvetica', fontSize=9.5, leading=14.5,
        alignment=4, textColor=colors.black, spaceAfter=8
    )
    h1_style = ParagraphStyle(
        'SecH1', parent=styles['Heading1'],
        fontName='Helvetica-Bold', fontSize=13, leading=16,
        alignment=1, textColor=colors.black, spaceBefore=10, spaceAfter=10,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'SecH2', parent=styles['Heading2'],
        fontName='Helvetica-Bold', fontSize=10.5, leading=14,
        textColor=navy, spaceBefore=8, spaceAfter=4,
        keepWithNext=True
    )
    caption_style = ParagraphStyle(
        'FigCap', parent=styles['Normal'],
        fontName='Helvetica-Bold', fontSize=8, leading=11,
        alignment=1, textColor=colors.HexColor("#334155"), spaceBefore=3, spaceAfter=6
    )

    story = []

    # =========================================================================
    # PAGE 1: TITLE PAGE (Matching template page 1)
    # =========================================================================
    story.append(Spacer(1, 15))
    story.append(Paragraph("VISVESVARAYA TECHNOLOGICAL UNIVERSITY", title_inst))
    story.append(Paragraph("“Jnana Sangama”, Belgaum -590014, Karnataka.", title_sub))
    story.append(Spacer(1, 15))

    if os.path.exists("report_assets/vtu_seal.png"):
        story.append(Image("report_assets/vtu_seal.png", width=1.1*inch, height=1.1*inch))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Full Stack Web Development Report<br/>On", proj_report_on))
    story.append(Paragraph("“HealthSync: Connected Healthcare Platform”", proj_title_main))

    story.append(Paragraph("Submitted by", submitted_by_lbl))
    students_cover = [
        "SUJAN RD (1WN25CS269)",
        "SUBRAMANYA K (1WN25CS266)",
        "WASI AHMED (1BM26CS576-T)",
        "VINAY GOWDA (1BM26CS554-T)"
    ]
    for s in students_cover:
        story.append(Paragraph(s, student_name))
    story.append(Spacer(1, 16))

    story.append(Paragraph("Under the Guidance of", guide_lbl))
    story.append(Paragraph("Mrs. Arpitha", guide_val))
    story.append(Paragraph("Assistant Professor, Department of CSE", guide_desig))
    story.append(Spacer(1, 18))

    story.append(Paragraph("<i>in partial fulfillment for the award of the degree of</i>", degree_text))
    story.append(Paragraph("<b>BACHELOR OF ENGINEERING</b><br/>in<br/><b>COMPUTER SCIENCE AND ENGINEERING</b>", degree_text))
    story.append(Spacer(1, 16))

    if os.path.exists("report_assets/bmsce_seal.png"):
        story.append(Image("report_assets/bmsce_seal.png", width=0.85*inch, height=0.85*inch))
    story.append(Spacer(1, 8))

    story.append(Paragraph("B.M.S. COLLEGE OF ENGINEERING", bmsce_footer))
    story.append(Paragraph("(Autonomous Institution under VTU)<br/><b>BENGALURU-560019</b><br/>Sep 2026 – Jan 2027", title_sub))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: CERTIFICATE (Matching template page 2)
    # =========================================================================
    story.append(Spacer(1, 15))
    story.append(Paragraph("<b>B. M. S. College of Engineering,</b><br/>Bull Temple Road, Bangalore 560019", title_inst))
    story.append(Paragraph("(Affiliated to Visvesvaraya Technological University, Belgaum)", title_sub))
    story.append(Paragraph("<b>Department of Computer Science and Engineering</b>", title_inst))
    story.append(Spacer(1, 10))

    if os.path.exists("report_assets/bmsce_seal.png"):
        story.append(Image("report_assets/bmsce_seal.png", width=0.85*inch, height=0.85*inch))
    story.append(Spacer(1, 8))

    story.append(Paragraph("CERTIFICATE", cert_heading))

    cert_text = (
        "This is to certify that the project work entitled <b><font color='#b91c1c'>“HealthSync: Connected Healthcare Platform”</font></b> "
        "carried out by <b><font color='#b91c1c'>SUJAN RD (1WN25CS269), SUBRAMANYA K (1WN25CS266), WASI AHMED (1BM26CS576-T), VINAY GOWDA (1BM26CS554-T)</font></b> "
        "who are bonafide students of <b>B. M. S. College of Engineering</b>. It is in partial fulfillment for the award of "
        "<b>Bachelor of Engineering in Computer Science and Engineering</b> of the Visveswaraiah Technological University, Belgaum during the year 2026-2027. "
        "The project report has been approved as it satisfies the academic requirements in respect of "
        "<b>Full Stack Web Development (23CS3AEFWD)</b> work prescribed for the said degree."
    )
    story.append(Paragraph(cert_text, body_justify))
    story.append(Spacer(1, 35))

    sig_data = [
        [Paragraph("Signature of the Guide", ParagraphStyle('G1', parent=styles['Normal'], fontName='Helvetica', fontSize=9.5, textColor=colors.black)),
         Paragraph("Signature of the HOD", ParagraphStyle('G2', parent=styles['Normal'], fontName='Helvetica', fontSize=9.5, textColor=colors.black, alignment=2))],
        [Spacer(1, 20), Spacer(1, 20)],
        [Paragraph("<b><font color='#b91c1c'>Mrs. Arpitha</font></b><br/>Assistant Professor<br/>BMSCE, Bengaluru", ParagraphStyle('G3', parent=styles['Normal'], fontName='Helvetica', fontSize=9, textColor=colors.black)),
         Paragraph("<b><font color='#b91c1c'>Cluster Head</font></b><br/>Prof &amp; Head of Dept of CSE<br/>BMSCE, Bengaluru", ParagraphStyle('G4', parent=styles['Normal'], fontName='Helvetica', fontSize=9, textColor=colors.black, alignment=2))]
    ]
    t_sig = Table(sig_data, colWidths=[3.5*inch, 3.5*inch])
    t_sig.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_sig)
    story.append(Spacer(1, 30))

    story.append(Paragraph("<b>External Viva</b>", ParagraphStyle('EV', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, alignment=1, spaceAfter=8)))
    viva_data = [
        [Paragraph("Name of the Examiner", ParagraphStyle('V1', fontName='Helvetica-Bold', fontSize=9)),
         Paragraph("Signature with date", ParagraphStyle('V2', fontName='Helvetica-Bold', fontSize=9, alignment=2))],
        [Paragraph("1)", ParagraphStyle('V3', fontName='Helvetica', fontSize=9)),
         Paragraph("..................................................", ParagraphStyle('V4', fontName='Helvetica', fontSize=9, alignment=2))],
        [Paragraph("2)", ParagraphStyle('V5', fontName='Helvetica', fontSize=9)),
         Paragraph("..................................................", ParagraphStyle('V6', fontName='Helvetica', fontSize=9, alignment=2))]
    ]
    t_viva = Table(viva_data, colWidths=[3.5*inch, 3.5*inch])
    story.append(t_viva)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: DECLARATION (Matching template page 3)
    # =========================================================================
    story.append(Spacer(1, 15))
    story.append(Paragraph("<b>B.M.S. COLLEGE OF ENGINEERING</b><br/><b>DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING</b>", title_inst))
    story.append(Spacer(1, 15))

    if os.path.exists("report_assets/bmsce_seal.png"):
        story.append(Image("report_assets/bmsce_seal.png", width=0.9*inch, height=0.9*inch))
    story.append(Spacer(1, 12))

    story.append(Paragraph("DECLARATION", cert_heading))

    decl_text = (
        "We, <b><font color='#b91c1c'>SUJAN RD (1WN25CS269), SUBRAMANYA K (1WN25CS266), WASI AHMED (1BM26CS576-T), VINAY GOWDA (1BM26CS554-T)</font></b> "
        "students of 3rd Semester, B.E, Department of Computer Science and Engineering, BMS College of Engineering, Bangalore, hereby declare that, this "
        "Full Stack Web Development project entitled <b><font color='#b91c1c'>“HealthSync: Connected Healthcare Platform”</font></b> has been carried out by us under the "
        "guidance of <b><font color='#b91c1c'>Mrs. Arpitha</font></b>, Assistant Professor, Department of CSE, BMS College of Engineering, Bangalore during the academic semester Sep 2026 - Dec 2026.<br/><br/>"
        "We also declare that to the best of our knowledge and belief, the development reported here is not from part of any other report by any other students."
    )
    story.append(Paragraph(decl_text, body_justify))
    story.append(Spacer(1, 40))

    story.append(Paragraph("Signature", ParagraphStyle('SigLbl', fontName='Helvetica-Bold', fontSize=10, alignment=2, spaceAfter=15)))
    stud_sigs = [
        [Paragraph("", ParagraphStyle('E')), Paragraph("<b>SUJAN RD (1WN25CS269)</b>", student_name)],
        [Paragraph("", ParagraphStyle('E')), Paragraph("<b>SUBRAMANYA K (1WN25CS266)</b>", student_name)],
        [Paragraph("", ParagraphStyle('E')), Paragraph("<b>WASI AHMED (1BM26CS576-T)</b>", student_name)],
        [Paragraph("", ParagraphStyle('E')), Paragraph("<b>VINAY GOWDA (1BM26CS554-T)</b>", student_name)]
    ]
    t_stud_sigs = Table(stud_sigs, colWidths=[4.2*inch, 2.8*inch])
    story.append(t_stud_sigs)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: TABLE OF CONTENTS (Matching template page 4)
    # =========================================================================
    story.append(Spacer(1, 15))
    story.append(Paragraph("TABLE OF CONTENTS", cert_heading))
    story.append(Spacer(1, 10))

    toc_data = [
        [Paragraph("<b>Serial No.</b>", ParagraphStyle('TH1', fontName='Helvetica-Bold', fontSize=9, alignment=1)),
         Paragraph("<b>TITLE</b>", ParagraphStyle('TH2', fontName='Helvetica-Bold', fontSize=9)),
         Paragraph("<b>PAGE NO.</b>", ParagraphStyle('TH3', fontName='Helvetica-Bold', fontSize=9, alignment=1))],
        [Paragraph("1", ParagraphStyle('T1', fontName='Helvetica', fontSize=9, alignment=1)), Paragraph("<b>Introduction</b>", ParagraphStyle('T1b', fontName='Helvetica-Bold', fontSize=9)), Paragraph("5", ParagraphStyle('T1p', fontName='Helvetica', fontSize=9, alignment=1))],
        [Paragraph("1.1", ParagraphStyle('T2', fontName='Helvetica', fontSize=9, alignment=1)), Paragraph("Overview", ParagraphStyle('T2b', fontName='Helvetica', fontSize=9)), Paragraph("5", ParagraphStyle('T2p', fontName='Helvetica', fontSize=9, alignment=1))],
        [Paragraph("1.2", ParagraphStyle('T3', fontName='Helvetica', fontSize=9, alignment=1)), Paragraph("Motivation", ParagraphStyle('T3b', fontName='Helvetica', fontSize=9)), Paragraph("5", ParagraphStyle('T3p', fontName='Helvetica', fontSize=9, alignment=1))],
        [Paragraph("2", ParagraphStyle('T4', fontName='Helvetica', fontSize=9, alignment=1)), Paragraph("<b>Software Requirement Specification</b>", ParagraphStyle('T4b', fontName='Helvetica-Bold', fontSize=9)), Paragraph("6", ParagraphStyle('T4p', fontName='Helvetica', fontSize=9, alignment=1))],
        [Paragraph("2.1", ParagraphStyle('T5', fontName='Helvetica', fontSize=9, alignment=1)), Paragraph("Hardware Requirements", ParagraphStyle('T5b', fontName='Helvetica', fontSize=9)), Paragraph("6", ParagraphStyle('T5p', fontName='Helvetica', fontSize=9, alignment=1))],
        [Paragraph("2.2", ParagraphStyle('T6', fontName='Helvetica', fontSize=9, alignment=1)), Paragraph("Software Requirements", ParagraphStyle('T6b', fontName='Helvetica', fontSize=9)), Paragraph("6", ParagraphStyle('T6p', fontName='Helvetica', fontSize=9, alignment=1))],
        [Paragraph("3", ParagraphStyle('T7', fontName='Helvetica', fontSize=9, alignment=1)), Paragraph("<b>ER diagram of the project</b>", ParagraphStyle('T7b', fontName='Helvetica-Bold', fontSize=9)), Paragraph("7", ParagraphStyle('T7p', fontName='Helvetica', fontSize=9, alignment=1))],
        [Paragraph("4", ParagraphStyle('T8', fontName='Helvetica', fontSize=9, alignment=1)), Paragraph("<b>Schema of project</b>", ParagraphStyle('T8b', fontName='Helvetica-Bold', fontSize=9)), Paragraph("8", ParagraphStyle('T8p', fontName='Helvetica', fontSize=9, alignment=1))],
        [Paragraph("5", ParagraphStyle('T9', fontName='Helvetica', fontSize=9, alignment=1)), Paragraph("<b>User Interface Design</b>", ParagraphStyle('T9b', fontName='Helvetica-Bold', fontSize=9)), Paragraph("9", ParagraphStyle('T9p', fontName='Helvetica', fontSize=9, alignment=1))],
        [Paragraph("6", ParagraphStyle('T10', fontName='Helvetica', fontSize=9, alignment=1)), Paragraph("<b>Integration of AI</b>", ParagraphStyle('T10b', fontName='Helvetica-Bold', fontSize=9)), Paragraph("11", ParagraphStyle('T10p', fontName='Helvetica', fontSize=9, alignment=1))],
        [Paragraph("7", ParagraphStyle('T11', fontName='Helvetica', fontSize=9, alignment=1)), Paragraph("<b>Back End Design</b>", ParagraphStyle('T11b', fontName='Helvetica-Bold', fontSize=9)), Paragraph("12", ParagraphStyle('T11p', fontName='Helvetica', fontSize=9, alignment=1))],
        [Paragraph("8", ParagraphStyle('T12', fontName='Helvetica', fontSize=9, alignment=1)), Paragraph("<b>Deployment Process</b>", ParagraphStyle('T12b', fontName='Helvetica-Bold', fontSize=9)), Paragraph("13", ParagraphStyle('T12p', fontName='Helvetica', fontSize=9, alignment=1))],
        [Paragraph("9", ParagraphStyle('T13', fontName='Helvetica', fontSize=9, alignment=1)), Paragraph("<b>Conclusion and Future work</b>", ParagraphStyle('T13b', fontName='Helvetica-Bold', fontSize=9)), Paragraph("14", ParagraphStyle('T13p', fontName='Helvetica', fontSize=9, alignment=1))],
        [Paragraph("10", ParagraphStyle('T14', fontName='Helvetica', fontSize=9, alignment=1)), Paragraph("<b>References</b>", ParagraphStyle('T14b', fontName='Helvetica-Bold', fontSize=9)), Paragraph("14", ParagraphStyle('T14p', fontName='Helvetica', fontSize=9, alignment=1))]
    ]
    t_toc = Table(toc_data, colWidths=[1.1*inch, 4.8*inch, 1.1*inch])
    t_toc.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.black),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#64748b")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
    ]))
    story.append(t_toc)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 5: 1. INTRODUCTION (Matching template page 5)
    # =========================================================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("1. INTRODUCTION", h1_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph("1.1 Overview", h2_style))
    ov_text = (
        "<b>HealthSync</b> is an advanced full-stack connected healthcare platform engineered to unify multi-hospital networks, "
        "physicians, pharmacists, and diagnostic laboratories around <b>ONE sovereign patient health record</b>. "
        "In traditional healthcare systems, patient health data is severely fragmented across incompatible hospital databases, paper prescriptions, "
        "and disconnected clinical silos. This leads to duplicate diagnostic testing, dangerous adverse drug-drug interactions, and life-threatening medical errors.<br/><br/>"
        "HealthSync resolves this systemic fragmentation by introducing a centralized, role-based ecosystem comprising four dedicated portals:<br/>"
        "<b>1. Hospital Administration &amp; Admissions Desk:</b> Centralized patient registration, sequential Patient ID generation, cryptographic QR code badges, doctor roster management, and conflict-free appointment scheduling.<br/>"
        "<b>2. Doctor Clinical Portal:</b> Real-time appointment queue, longitudinal patient timeline visualization, consultation diagnosis builder, future doctor handoff notes, and instant e-prescription routing.<br/>"
        "<b>3. Patient Sovereign Portal:</b> Complete medical timeline, dynamic vitals tracking with interactive Recharts visualizations, intelligent rules-driven medication reminders, and a sovereign <b>Privacy Center</b> enabling patients to grant, scope, and revoke doctor access.<br/>"
        "<b>4. Pharmacist Dispensary Portal:</b> Live FIFO prescription queue, automated pickup token number generation (e.g., Token #T-24), real-time stock-out flagging, and complete dispensing history audit logs."
    )
    story.append(Paragraph(ov_text, body_justify))
    story.append(Spacer(1, 10))

    story.append(Paragraph("1.2 Motivation", h2_style))
    mot_text = (
        "The driving motivation behind HealthSync is rooted in clinical safety, data sovereignty, and operational efficiency:<br/>"
        "• <b>Eliminating Medical Silos:</b> Over 70% of medical complications in emergency or cross-hospital consultations stem from an incomplete understanding of a patient's prior medical history, allergies, and chronic medication regimens.<br/>"
        "• <b>Patient-Controlled Consent Architecture:</b> Under contemporary data privacy norms (such as India's Digital Personal Data Protection Act - DPDP and international HIPAA guidelines), patient data must never be accessible by unauthorized personnel simply by guessing a patient ID. HealthSync ensures that outside doctors must formally request access, specifying clinical purpose, duration, and scope, requiring explicit patient authorization.<br/>"
        "• <b>Automation of Clinical Handoffs:</b> Replacing illegible handwritten paper slips with an AI-assisted OCR prescription scanner and automatic real-time dispatch to the dispensary counter minimizes pharmacy waiting lines and eliminates dispensing mistakes.<br/>"
        "• <b>Academic Excellence:</b> Demonstrating a complete, enterprise-grade Full Stack Development architecture combining React 19, Tailwind CSS, Python FastAPI, SQLAlchemy 2.0 ORM, and dual-mode database reliability."
    )
    story.append(Paragraph(mot_text, body_justify))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 6: 2. SOFTWARE REQUIREMENTS (Matching template page 6)
    # =========================================================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("2. SOFTWARE REQUIREMENT SPECIFICATION", h1_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph("2.1 Hardware Requirements:", h2_style))
    hw_text = (
        "• <b>Processor:</b> Intel Core i3 (7th Gen or higher) / AMD Ryzen 3 / Apple Silicon M1 or higher.<br/>"
        "• <b>System Memory (RAM):</b> 8 GB DDR4 RAM minimum (16 GB recommended for concurrent backend and frontend dev servers).<br/>"
        "• <b>Storage:</b> 500 GB Hard Disk Drive (HDD) or Solid State Drive (SSD) with at least 5 GB free disk space.<br/>"
        "• <b>Network Connectivity:</b> Stable broadband internet connection (2 Mbps or higher) for Firebase Cloud sync and external dependencies.<br/>"
        "• <b>Display Resolution:</b> 1280 x 800 resolution or higher for multi-portal responsive viewport inspection."
    )
    story.append(Paragraph(hw_text, body_justify))
    story.append(Spacer(1, 12))

    story.append(Paragraph("2.2 Software Requirements:", h2_style))
    sw_table_data = [
        [Paragraph("<b>Category</b>", ParagraphStyle('SW1', fontName='Helvetica-Bold', fontSize=9)),
         Paragraph("<b>Technology / Tool</b>", ParagraphStyle('SW2', fontName='Helvetica-Bold', fontSize=9)),
         Paragraph("<b>Version / Specification</b>", ParagraphStyle('SW3', fontName='Helvetica-Bold', fontSize=9))],
        [Paragraph("Operating System", body_justify), Paragraph("Windows 10 / 11, Linux (Ubuntu 22.04+), macOS", body_justify), Paragraph("64-bit Architecture", body_justify)],
        [Paragraph("Frontend Framework", body_justify), Paragraph("React 19, Vite, React Router v7", body_justify), Paragraph("Vite 8.3.5 / Node.js 20+", body_justify)],
        [Paragraph("Styling &amp; Icons", body_justify), Paragraph("Tailwind CSS v3.4, Lucide React Icons", body_justify), Paragraph("Responsive Medical Theme (Teal/Navy)", body_justify)],
        [Paragraph("Data Visualization", body_justify), Paragraph("Recharts React Graphing Library", body_justify), Paragraph("Dynamic Responsive Time-Series Charts", body_justify)],
        [Paragraph("Backend Framework", body_justify), Paragraph("Python FastAPI, Uvicorn ASGI Server", body_justify), Paragraph("Python 3.13 / FastAPI 0.115+", body_justify)],
        [Paragraph("ORM &amp; Database Layer", body_justify), Paragraph("SQLAlchemy 2.0 ORM, Pydantic v2", body_justify), Paragraph("Dual-Mode Engine: SQLite / MySQL 8.0", body_justify)],
        [Paragraph("Authentication &amp; Security", body_justify), Paragraph("Pure-Python HMAC-SHA256 JWT, PBKDF2 Hashing", body_justify), Paragraph("Zero C-extension dependency runtime", body_justify)],
        [Paragraph("Cloud Hosting &amp; Serverless", body_justify), Paragraph("Firebase Hosting &amp; Cloud Functions 2nd Gen", body_justify), Paragraph("Google Cloud Run Container Runtime", body_justify)],
        [Paragraph("Development Tools", body_justify), Paragraph("Visual Studio Code, Git, Google Chrome DevTools", body_justify), Paragraph("OxLint, ReportLab PDF Engine", body_justify)]
    ]
    t_sw = Table(sw_table_data, colWidths=[1.8*inch, 2.6*inch, 2.6*inch])
    t_sw.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#0f766e")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f0fdf4")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_sw)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 7: 3. ER DIAGRAM (Matching template page 7)
    # =========================================================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("3. ER DIAGRAM OF THE PROJECT", h1_style))
    story.append(Spacer(1, 6))

    if os.path.exists("report_assets/er_diagram.png"):
        story.append(Image("report_assets/er_diagram.png", width=6.8*inch, height=5.2*inch))
        story.append(Paragraph("Figure 3.1: Entity-Relationship (ER) Diagram of HealthSync Healthcare Platform", caption_style))
    story.append(Spacer(1, 6))

    er_desc = (
        "<b>Entity-Relationship Architecture Discussion:</b><br/>"
        "Figure 3.1 illustrates the Chen-style ER diagram mapping the entities, primary keys (underlined), attributes, and relationship cardinalities:<br/>"
        "• <b>HOSPITAL (1:N) DOCTOR:</b> A hospital employs multiple doctors, each belonging to an accredited clinical department.<br/>"
        "• <b>DOCTOR (M:N) PATIENT:</b> Doctors conduct consultations with patients through scheduled appointments or emergency admissions.<br/>"
        "• <b>PATIENT (1:1) HEALTH_PROFILE:</b> Each patient possesses a single longitudinal profile recording blood group, allergies, and chronic conditions.<br/>"
        "• <b>CONSULTATION (1:1) PRESCRIPTION:</b> Clinical diagnoses generate structured e-prescriptions routed directly to the pharmacy dispensary.<br/>"
        "• <b>PATIENT (1:N) ACCESS_REQUEST &amp; AUDIT_LOG:</b> Patient records are protected by sovereign access requests and immutable security logs."
    )
    story.append(Paragraph(er_desc, body_justify))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 8: 4. SCHEMA OF PROJECT (Matching template page 8)
    # =========================================================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("4. SCHEMA OF THE PROJECT", h1_style))
    story.append(Spacer(1, 6))

    if os.path.exists("report_assets/schema_diagram.png"):
        story.append(Image("report_assets/schema_diagram.png", width=6.8*inch, height=5.2*inch))
        story.append(Paragraph("Figure 4.1: Relational Schema Diagram showing Primary &amp; Foreign Key Constraints", caption_style))
    story.append(Spacer(1, 6))

    schema_desc = (
        "<b>Relational Schema Normalization &amp; Integrity Analysis:</b><br/>"
        "The HealthSync relational schema is strictly decomposed into <b>Third Normal Form (3NF)</b> and <b>Boyce-Codd Normal Form (BCNF)</b>:<br/>"
        "• <b>First Normal Form (1NF):</b> Every attribute contains atomic values. Multi-valued clinical data (such as allergy lists and vitals) are structured as valid JSON columns with native index support.<br/>"
        "• <b>Second Normal Form (2NF):</b> All non-key attributes are fully functionally dependent on the entire composite primary key, eliminating partial dependencies.<br/>"
        "• <b>Third Normal Form (3NF):</b> Transitive dependencies are removed. Doctor specialties and hospital locations are abstracted into independent relation tables referenced by foreign keys with cascading updates."
    )
    story.append(Paragraph(schema_desc, body_justify))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 9: 5. USER INTERFACE DESIGN (Part 1 - Landing, Login, Hospital)
    # =========================================================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("5. USER INTERFACE DESIGN", h1_style))
    story.append(Paragraph("Attach various screenshots of each page along with a brief discussion. Each figure illustrates the intuitive, role-tailored user experience engineered with React 19 and Tailwind CSS.", body_style_desc := ParagraphStyle('BDesc', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=12, textColor=colors.HexColor("#475569"), spaceAfter=8)))

    if os.path.exists("report_assets/landing_page.png"):
        story.append(Image("report_assets/landing_page.png", width=6.2*inch, height=2.3*inch))
        story.append(Paragraph("Figure 5.1: HealthSync Public Landing Page with Feature Overviews &amp; Portal Gateways", caption_style))
    story.append(Spacer(1, 4))

    if os.path.exists("report_assets/login_page.png"):
        story.append(Image("report_assets/login_page.png", width=6.2*inch, height=2.3*inch))
        story.append(Paragraph("Figure 5.2: Role-Based Authentication with Sliding Segmented Persona Switcher", caption_style))
    story.append(Spacer(1, 4))

    ui_p1_text = (
        "<b>Discussion of Landing &amp; Authentication Interface:</b><br/>"
        "<b>Figure 5.1</b> showcases the public landing gateway explaining HealthSync's sovereign patient consent model, cross-hospital synchronization, and security compliance. "
        "<b>Figure 5.2</b> demonstrates the unified authentication interface featuring a sliding animated segmented pill control. Users can toggle between Hospital Admin, Doctor, Patient, and Pharmacist roles with instantaneous demo auto-fill credentials for presentations."
    )
    story.append(Paragraph(ui_p1_text, body_justify))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 10: 5. USER INTERFACE DESIGN (Part 2 - Hospital, Doctor, Patient, Pharmacy)
    # =========================================================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("5. USER INTERFACE DESIGN (CONTINUED)", h1_style))
    story.append(Spacer(1, 4))

    if os.path.exists("report_assets/hospital_dashboard.png"):
        story.append(Image("report_assets/hospital_dashboard.png", width=6.2*inch, height=2.1*inch))
        story.append(Paragraph("Figure 5.3: Hospital Administration Dashboard with Real-Time KPIs &amp; Admissions Desk", caption_style))
    story.append(Spacer(1, 3))

    if os.path.exists("report_assets/doctor_queue.png"):
        story.append(Image("report_assets/doctor_queue.png", width=6.2*inch, height=2.1*inch))
        story.append(Paragraph("Figure 5.4: Doctor Clinical Queue displaying Patient Baseline, Allergies &amp; Vitals", caption_style))
    story.append(Spacer(1, 3))

    if os.path.exists("report_assets/pharmacist_queue.png"):
        story.append(Image("report_assets/pharmacist_queue.png", width=6.2*inch, height=2.1*inch))
        story.append(Paragraph("Figure 5.5: Pharmacist Live Dispensing Queue with Auto-Generated Pickup Tokens", caption_style))
    story.append(Spacer(1, 4))

    ui_p2_text = (
        "<b>Discussion of Operational Portals:</b><br/>"
        "<b>Figure 5.3</b> shows the Hospital Admin dashboard tracking today's appointments, active physicians on duty, and pending prescriptions. "
        "<b>Figure 5.4</b> presents the Doctor Clinical Queue, showing clinical alerts (allergies, chronic conditions) directly on patient cards. "
        "<b>Figure 5.5</b> displays the Pharmacist Live Queue where moving a prescription to 'Ready for Pickup' assigns a queue token (e.g. #T-24) and dispatches an instant patient alert."
    )
    story.append(Paragraph(ui_p2_text, body_justify))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 11: 6. INTEGRATION OF AI (Matching template page 10)
    # =========================================================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("6. INTEGRATION OF AI", h1_style))
    story.append(Spacer(1, 6))

    if os.path.exists("report_assets/ai_ocr_scanner.png"):
        story.append(Image("report_assets/ai_ocr_scanner.png", width=6.2*inch, height=2.5*inch))
        story.append(Paragraph("Figure 6.1: Simulated AI OCR Prescription Scanner Extracting Structured Clinical Data", caption_style))
    story.append(Spacer(1, 6))

    if os.path.exists("report_assets/privacy_center.png"):
        story.append(Image("report_assets/privacy_center.png", width=6.2*inch, height=2.5*inch))
        story.append(Paragraph("Figure 6.2: Sovereign Privacy Center &amp; AI Rules-Engine for Automated Care Reminders", caption_style))
    story.append(Spacer(1, 6))

    ai_desc = (
        "<b>Discussion of Artificial Intelligence &amp; Rule Engine Integration:</b><br/>"
        "HealthSync integrates two intelligent subsystems to augment clinical workflows and patient compliance:<br/>"
        "<b>1. Simulated OCR Prescription Extraction Engine (Figure 6.1):</b> Physicians can upload images or raw textual scans of handwritten prescription slips. "
        "The system processes the text, extracts key entities (Diagnosis, Vitals, Drug Name, Dosage, Frequency, and Duration), and pre-populates the interactive consultation form. "
        "Crucially, the system employs a 'human-in-the-loop' safety protocol: the physician must review and confirm the extracted medication regimen before saving, eliminating AI hallucination risks.<br/>"
        "<b>2. Intelligent Clinical Rules Engine (Figure 6.2):</b> Maps diagnosed chronic conditions and active prescriptions into actionable smart patient reminders: "
        "Asthma &rarr; post-inhalation oral rinse alerts; Diabetes &rarr; fasting glucose tracking; Hypertension &rarr; resting BP checks; Kidney stones &rarr; 2-hour hydration alerts."
    )
    story.append(Paragraph(ai_desc, body_justify))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 12: 7. BACK END DESIGN (Matching template page 11)
    # =========================================================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("7. BACK END DESIGN", h1_style))
    story.append(Spacer(1, 6))

    if os.path.exists("report_assets/swagger_api_docs.png"):
        story.append(Image("report_assets/swagger_api_docs.png", width=6.2*inch, height=2.6*inch))
        story.append(Paragraph("Figure 7.1: FastAPI Interactive Swagger API Documentation showing 45 REST Endpoints", caption_style))
    story.append(Spacer(1, 6))

    backend_desc = (
        "<b>Discussion of Backend Architecture &amp; RESTful API Design:</b><br/>"
        "The HealthSync backend is constructed using <b>Python 3.13, FastAPI, and SQLAlchemy 2.0 ORM</b>, engineered around high performance, security, and zero-configuration startup:<br/>"
        "• <b>Dual-Mode Database Engine:</b> Defaults to a local persistent SQLite database (<code>healthsync.db</code>) with zero manual database configuration for presentations, while seamlessly falling back to MySQL 8.0 when configured in production environments.<br/>"
        "• <b>Pure-Python Cryptography (auth.py):</b> Built without external C-extensions using standard library <code>hashlib</code> PBKDF2-HMAC-SHA256 (100,000 iterations) and HMAC-SHA256 JWT tokens, ensuring 100% compatibility across Python 3.13 runtimes.<br/>"
        "• <b>45 Modular REST Endpoints:</b> Structured into domain controllers for Hospital Administration, Doctor Queue, Patient Dynamic Records, Privacy Center, and Pharmacy Live Queue.<br/>"
        "• <b>Sovereign Consent Gatekeeper:</b> Access to a patient's historical visit timeline requires either an active scheduled appointment or an approved <code>AccessRequest</code> record, preventing unauthorized data crawling."
    )
    story.append(Paragraph(backend_desc, body_justify))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 13: 8. DEPLOYMENT PROCESS (Matching template page 12)
    # =========================================================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("8. DEPLOYMENT PROCESS", h1_style))
    story.append(Spacer(1, 8))

    deploy_desc = (
        "<b>Multi-Cloud Deployment &amp; Local Execution Pipeline:</b><br/>"
        "HealthSync implements a modern, automated deployment pipeline supporting both cloud hosting and offline academic viva demonstrations:<br/><br/>"
        "<b>1. Google Firebase Hosting (Production Frontend):</b><br/>"
        "The production React frontend is compiled using <code>npm run build</code> into optimized static bundles (HTML/CSS/JS) and deployed directly to Firebase Hosting CDN:<br/>"
        "• <b>Live Deployment URL:</b> <code>https://medilink-healthsync-fsd.web.app</code><br/>"
        "• <b>Global CDN Edge Caching:</b> Provides sub-50ms latency worldwide with automated SSL certification.<br/>"
        "• <b>Single Page Application (SPA) Rewrites:</b> All route paths (e.g. <code>/hospital/overview</code>, <code>/doctor/queue</code>) are rewritten to <code>/index.html</code> via <code>firebase.json</code>.<br/><br/>"
        "<b>2. Firebase Cloud Functions 2nd Generation (Serverless Backend):</b><br/>"
        "The Python FastAPI application is packaged using <code>firebase-functions</code> and <code>a2wsgi</code> into a Google Cloud Run container. "
        "Any API request to <code>/api/**</code> on the Firebase domain is automatically routed to the serverless function.<br/><br/>"
        "<b>3. Presentation One-Click Batch Launcher (START_HEALTHSYNC.bat):</b><br/>"
        "For classroom and viva evaluations where external internet access may be throttled, a robust batch script was created to boot the full platform with a single double-click:<br/>"
        "• Port collision clearance on 8000 (Backend) and 5173 (Frontend).<br/>"
        "• Automatic clinical seed data initialization.<br/>"
        "• Automated browser launch to <code>http://localhost:5173</code>.<br/>"
        "• Interactive console cheat sheet displaying credentials for all 4 clinical roles."
    )
    story.append(Paragraph(deploy_desc, body_justify))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 14: 9. CONCLUSION & 10. REFERENCES (Matching template page 13 & 14)
    # =========================================================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("9. CONCLUSION AND FUTURE WORK", h1_style))
    story.append(Spacer(1, 6))

    conc_text = (
        "<b>Conclusion:</b><br/>"
        "HealthSync successfully demonstrates a connected healthcare platform that bridges hospitals, physicians, patients, and pharmacists around a single sovereign patient record. "
        "By enforcing 3NF/BCNF relational integrity, sovereign patient consent barriers, and automated pharmacy handoffs, the project addresses the core challenges of medical data fragmentation and patient privacy.<br/><br/>"
        "<b>Future Work:</b><br/>"
        "• <b>FHIR / HL7 International Standards:</b> Integrating Fast Healthcare Interoperability Resources (FHIR) protocols for seamless cross-border hospital EHR interoperability.<br/>"
        "• <b>Mobile Applications (React Native):</b> Developing iOS and Android companion apps for instant emergency QR scanning by ambulance paramedics.<br/>"
        "• <b>WebSockets &amp; Real-time Prescriptions:</b> Upgrading the pharmacy queue from polling to persistent bidirectional WebSocket streams for zero-latency token dispatch."
    )
    story.append(Paragraph(conc_text, body_justify))
    story.append(Spacer(1, 14))

    story.append(Paragraph("10. REFERENCES", h1_style))
    story.append(Spacer(1, 6))

    ref_text = (
        "1. <b>React Official Documentation:</b> https://react.dev — Component Architecture &amp; Hooks API.<br/>"
        "2. <b>FastAPI Web Framework:</b> https://fastapi.tiangolo.com — High-performance Python async REST APIs.<br/>"
        "3. <b>SQLAlchemy 2.0 Documentation:</b> https://docs.sqlalchemy.org — Database Object Relational Mapping.<br/>"
        "4. <b>Tailwind CSS:</b> https://tailwindcss.com — Utility-first CSS framework for medical UI design.<br/>"
        "5. <b>Google Firebase Hosting &amp; Functions:</b> https://firebase.google.com/docs — Cloud hosting &amp; serverless functions.<br/>"
        "6. <b>Visvesvaraya Technological University (VTU):</b> Curriculum guidelines for Full Stack Web Development (23CS3AEFWD).<br/>"
        "7. <b>Lucide Icons:</b> https://lucide.dev — Medical and UI iconography for accessible design."
    )
    story.append(Paragraph(ref_text, body_justify))

    doc.build(story, canvasmaker=CollegeReportCanvas)
    print(f" Academic Report successfully built: {filename}")

if __name__ == "__main__":
    build_college_report()
