import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        # Header line & text
        self.drawString(36, 810, "FloodWatch India | Technical Dataset Audit & Gap Analysis Report")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(36, 804, 559, 804)
        
        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(559, 25, page_text)
        self.drawString(36, 25, "Confidential - For Internal Machine Learning Pipeline Use")
        self.line(36, 35, 559, 35)
        self.restoreState()

def build_pdf_report():
    pdf_path = r'C:\Users\Lenovo\Desktop\FRP\State_Wise_Coverage_and_Gap_Analysis_Report.pdf'
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=48,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569"),
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#1e3a8a"),
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#0f172a")
    )
    
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#0f172a")
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white,
        alignment=1
    )

    story = []

    # Title & Metadata Banner
    story.append(Paragraph("FloodWatch India: State-Wise Dataset Coverage & Gap Analysis", title_style))
    story.append(Paragraph("Comprehensive Audit of 8 Target Flood Parameters across 38 Indian States & Union Territories", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563eb"), spaceAfter=12))

    # Executive Summary Cards Table
    summary_data = [
        [
            Paragraph("<b>Total States & UTs</b><br/><font size=14 color='#1e3a8a'><b>38</b></font>", body_style),
            Paragraph("<b>Target Datasets</b><br/><font size=14 color='#1e3a8a'><b>8 Types</b></font>", body_style),
            Paragraph("<b>Historical Events</b><br/><font size=14 color='#16a34a'><b>6,876 Floods</b></font>", body_style),
            Paragraph("<b>National Master Coverage</b><br/><font size=14 color='#2563eb'><b>816 Districts</b></font>", body_style)
        ]
    ]
    summary_table = Table(summary_data, colWidths=[130, 130, 130, 133])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 10))

    # 1. 8 Target Dataset Categories Description
    story.append(Paragraph("1. Target Flood Prediction Dataset Hierarchy (8 Core Categories)", h1_style))
    cat_desc = (
        "Following the FloodWatch India architecture (excluding Land Use/Cover), the system requires 8 primary data parameters: "
        "<b>(1) Rainfall</b> (hourly/daily telemetry), <b>(2) River Water Level (RWL)</b> (CWC gauge heights), "
        "<b>(3) River Discharge</b> (flow rate in cumecs), <b>(4) Reservoir Storage</b> (live dam levels), "
        "<b>(5) Dam Locations (GIS)</b> (structural dam database), <b>(6) Elevation DEM</b> (terrain slopes), "
        "<b>(7) Flood Hazard Layer</b> (DFSI risk score & historical impacts), and <b>(8) Groundwater Level (GWL)</b> (subsurface saturation depth)."
    )
    story.append(Paragraph(cat_desc, body_style))
    story.append(Spacer(1, 6))

    # 2. Main Matrix Table
    story.append(Paragraph("2. State-Wise Coverage Matrix (Kis State Me Kya Hai aur Kya Missing Hai)", h1_style))

    # Data matrix
    matrix_rows = [
        # [State, Rain, RWL, Disch, Resrv, Dams, DEM, Flood, GWL, Score, Status]
        ("Bihar", "YES", "YES", "YES", "NO", "YES*", "YES*", "YES*", "YES", "7/8", "High Coverage"),
        ("Gujarat", "YES", "YES", "YES", "NO", "YES*", "YES*", "YES*", "YES", "7/8", "High Coverage"),
        ("Kerala", "YES", "YES", "YES", "NO", "YES*", "YES*", "YES*", "YES", "7/8", "High Coverage"),
        ("Assam", "YES", "YES", "NO", "NO", "YES*", "YES*", "YES*", "YES", "6/8", "High Coverage"),
        ("Andhra Pradesh", "YES", "NO", "YES", "YES", "YES*", "YES*", "YES*", "NO", "6/8", "High Coverage"),
        ("Karnataka", "YES", "NO", "YES", "YES", "YES*", "YES*", "YES*", "NO", "6/8", "High Coverage"),
        ("Madhya Pradesh", "YES", "NO", "YES", "YES", "YES*", "YES*", "YES*", "NO", "6/8", "High Coverage"),
        ("Maharashtra", "YES", "NO", "YES", "NO", "YES*", "YES*", "YES*", "YES", "6/8", "High Coverage"),
        ("Odisha", "YES", "NO", "YES", "YES", "YES*", "YES*", "YES*", "NO", "6/8", "High Coverage"),
        ("Telangana", "YES", "NO", "YES", "NO", "YES*", "YES*", "YES*", "YES", "6/8", "High Coverage"),
        ("West Bengal", "YES", "NO", "YES", "YES", "YES*", "YES*", "YES*", "NO", "6/8", "High Coverage"),
        ("Rajasthan", "YES", "NO", "YES", "NO", "YES*", "YES*", "YES*", "NO", "5/8", "Moderate"),
        ("Jharkhand", "YES", "NO", "YES", "NO", "YES*", "YES*", "YES*", "NO", "5/8", "Moderate"),
        ("Tamil Nadu", "YES", "NO", "YES", "NO", "YES*", "YES*", "YES*", "NO", "5/8", "Moderate"),
        ("Punjab", "YES", "NO", "NO", "NO", "YES*", "YES*", "YES*", "YES", "5/8", "Moderate"),
        ("Haryana", "YES", "NO", "NO", "NO", "YES*", "YES*", "YES*", "YES", "5/8", "Moderate"),
        ("Meghalaya", "YES", "NO", "YES", "NO", "YES*", "YES*", "YES*", "NO", "5/8", "Moderate"),
        ("Tripura", "YES", "NO", "YES", "NO", "YES*", "YES*", "YES*", "NO", "5/8", "Moderate"),
        ("Mizoram", "YES", "NO", "YES", "NO", "YES*", "YES*", "YES*", "NO", "5/8", "Moderate"),
        ("Goa", "YES", "NO", "YES", "NO", "YES*", "YES*", "YES*", "NO", "5/8", "Moderate"),
        ("Chhattisgarh", "YES", "NO", "YES", "NO", "YES*", "YES*", "YES*", "NO", "5/8", "Moderate"),
        ("Himachal Pradesh", "YES", "NO", "NO", "YES", "YES*", "YES*", "YES*", "NO", "5/8", "Moderate"),
        ("Delhi", "YES", "NO", "NO", "NO", "YES*", "YES*", "YES*", "YES", "5/8", "Moderate"),
        ("Puducherry", "NO", "NO", "YES", "NO", "YES*", "YES*", "YES*", "YES", "5/8", "Moderate"),
        ("Uttar Pradesh", "YES", "NO", "NO", "NO", "YES*", "YES*", "YES*", "NO", "4/8", "Basic"),
        ("Uttarakhand", "YES", "NO", "NO", "NO", "YES*", "YES*", "YES*", "NO", "4/8", "Basic"),
        ("Jammu & Kashmir", "YES", "NO", "NO", "NO", "YES*", "YES*", "YES*", "NO", "4/8", "Basic"),
        ("Sikkim", "YES", "NO", "NO", "NO", "YES*", "YES*", "YES*", "NO", "4/8", "Basic"),
        ("Arunachal Pradesh", "YES", "NO", "NO", "NO", "YES*", "YES*", "YES*", "NO", "4/8", "Basic"),
        ("Manipur", "YES", "NO", "NO", "NO", "YES*", "YES*", "YES*", "NO", "4/8", "Basic"),
        ("Nagaland", "YES", "NO", "NO", "NO", "YES*", "YES*", "YES*", "NO", "4/8", "Basic"),
        ("Daman & Diu", "NO", "NO", "YES", "NO", "YES*", "YES*", "YES*", "NO", "4/8", "Basic"),
        ("Dadra & Nagar Haveli", "YES", "NO", "NO", "NO", "YES*", "YES*", "YES*", "NO", "4/8", "Basic"),
        ("Dadra/Nagar Haveli & DD", "NO", "NO", "NO", "NO", "YES*", "YES*", "YES*", "NO", "3/8", "National Only"),
        ("Ladakh", "NO", "NO", "NO", "NO", "YES*", "YES*", "YES*", "NO", "3/8", "National Only"),
        ("Chandigarh", "NO", "NO", "NO", "NO", "YES*", "YES*", "YES*", "NO", "3/8", "National Only"),
        ("Andaman & Nicobar", "NO", "NO", "NO", "NO", "YES*", "YES*", "YES*", "NO", "3/8", "National Only"),
        ("Lakshadweep", "NO", "NO", "NO", "NO", "YES*", "YES*", "YES*", "NO", "3/8", "National Only"),
    ]

    table_data = [[
        Paragraph("State / UT Name", table_header_style),
        Paragraph("1.Rain", table_header_style),
        Paragraph("2.RWL", table_header_style),
        Paragraph("3.Disch", table_header_style),
        Paragraph("4.Resrv", table_header_style),
        Paragraph("5.Dams*", table_header_style),
        Paragraph("6.DEM*", table_header_style),
        Paragraph("7.Flood*", table_header_style),
        Paragraph("8.GWL", table_header_style),
        Paragraph("Score", table_header_style),
    ]]

    for row in matrix_rows:
        st_name = row[0]
        r = row[1]
        rwl = row[2]
        dis = row[3]
        res = row[4]
        dam = row[5]
        dem = row[6]
        fld = row[7]
        gwl = row[8]
        score = row[9]
        
        row_cells = [
            Paragraph(st_name, table_cell_bold),
            Paragraph(f"<font color={'#16a34a' if r=='YES' else '#dc2626'}>{r}</font>", table_cell_style),
            Paragraph(f"<font color={'#16a34a' if rwl=='YES' else '#dc2626'}>{rwl}</font>", table_cell_style),
            Paragraph(f"<font color={'#16a34a' if dis=='YES' else '#dc2626'}>{dis}</font>", table_cell_style),
            Paragraph(f"<font color={'#16a34a' if res=='YES' else '#dc2626'}>{res}</font>", table_cell_style),
            Paragraph(f"<font color='#2563eb'>{dam}</font>", table_cell_style),
            Paragraph(f"<font color='#2563eb'>{dem}</font>", table_cell_style),
            Paragraph(f"<font color='#2563eb'>{fld}</font>", table_cell_style),
            Paragraph(f"<font color={'#16a34a' if gwl=='YES' else '#dc2626'}>{gwl}</font>", table_cell_style),
            Paragraph(f"<b>{score}</b>", table_cell_bold),
        ]
        table_data.append(row_cells)

    col_widths = [135, 40, 40, 42, 42, 42, 42, 46, 40, 44]
    main_table = Table(table_data, colWidths=col_widths, repeatRows=1)
    
    t_style = [
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e3a8a")),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('ALIGN', (0,1), (0,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor("#cbd5e1")),
    ]
    
    for i in range(1, len(table_data)):
        if i % 2 == 0:
            t_style.append(('BACKGROUND', (0, i), (-1, i), colors.HexColor("#f8fafc")))
            
    main_table.setStyle(TableStyle(t_style))
    story.append(main_table)
    
    story.append(Spacer(1, 6))
    story.append(Paragraph("<i>*Note: <b>YES*</b> denotes features guaranteed 100% across all districts via National Master files (Dams Master, Elevation DEM & DFSI Risk Hazard).</i>", body_style))
    story.append(Spacer(1, 10))

    # 3. Gap Analysis & ML Strategy Section
    story.append(Paragraph("3. Gap Analysis Findings & Recommendations for Machine Learning", h1_style))
    
    gap_points = [
        "<b>Tier 1 High-Coverage States (Best ML Training Targets):</b> <i>Bihar, Gujarat, Kerala, Assam, Maharashtra, West Bengal, Andhra Pradesh, Karnataka, Odisha, and Madhya Pradesh</i> have 6 to 7 parameters fully available. These states should form the backbone for initial time-series and gradient boosting validation.",
        "<b>River Water Level (RWL) Telemetry Gap:</b> Local RWL telemetry is heavily concentrated in major flood-prone basins (Ganga in Bihar, Brahmaputra in Assam, Tapi/Narmada in Gujarat, Periyar in Kerala). For remaining states, CWC multi-basin telemetry in <code>All_India_National_Masters</code> can be routed to stations via geographical basin mapping.",
        "<b>Historical Ground Truth Integration:</b> The project includes <b>6,876 verified historical flood disaster events (1967–2023)</b> recorded by IMD in <code>cleaned_master_flood_inventory.csv</code>. This provides empirical ground truth (Fatalities, Duration, Damage Extent) for model calibration.",
        "<b>Pruning of Non-Essential Datasets:</b> 376 non-target files (Water Quality tests, Humidity, Solar Radiation) can be safely excluded to streamline feature stores and optimize training compute."
    ]
    
    for pt in gap_points:
        story.append(Paragraph(f"• {pt}", body_style))
        story.append(Spacer(1, 3))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] PDF Generated at: {pdf_path}")
    return pdf_path

if __name__ == '__main__':
    build_pdf_report()
