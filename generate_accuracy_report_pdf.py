import json
import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
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
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (Only on page 2 onwards)
        if self._pageNumber > 1:
            self.drawString(36, 810, "FloodWatch India | Machine Learning Model Accuracy & Testing Evaluation Report")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(36, 804, 559, 804)
        
        # Footer (All pages)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(559, 25, page_text)
        self.drawString(36, 25, "B.Tech Final Year Project — Flood Risk Prediction Using Weather & GIS Data")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(36, 35, 559, 35)
        self.restoreState()

def generate_pdf():
    pdf_path = r'C:\Users\Lenovo\Desktop\FRP\Flood_Risk_AI_Model_Accuracy_Report_All_States.pdf'
    
    with open(r'C:\Users\Lenovo\Desktop\FRP\models\model_evaluation_metrics.json', encoding='utf-8') as f:
        data = json.load(f)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=44,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=3
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#475569"),
        spaceAfter=10
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#1e3a8a"),
        spaceBefore=8,
        spaceAfter=5
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    bold_body = ParagraphStyle(
        'BoldBody',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=4
    )

    th_style = ParagraphStyle(
        'TH',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white,
        alignment=1
    )

    td_style = ParagraphStyle(
        'TD',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#0f172a")
    )

    td_bold = ParagraphStyle(
        'TDBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#0f172a")
    )

    td_center = ParagraphStyle(
        'TDCenter',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#0f172a"),
        alignment=1
    )

    td_green = ParagraphStyle(
        'TDGreen',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#047857"),
        alignment=1
    )

    story = []

    # Title Header Banner
    story.append(Paragraph("FloodWatch India — ML Model Accuracy & Evaluation Report", title_style))
    story.append(Paragraph("<b>Project:</b> Flood Risk Prediction Using Weather and GIS Data &nbsp;|&nbsp; <b>Evaluation:</b> 80:20 Stratified Train-Test Split", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563eb"), spaceAfter=8))

    # Executive Summary Card
    nat = data['national_model']
    states = data['states']

    acc_list = [v['test_accuracy'] for v in states.values() if 'test_accuracy' in v]
    auc_list = [v['roc_auc'] for v in states.values() if 'roc_auc' in v]
    f1_list = [v['f1_score'] for v in states.values() if 'f1_score' in v]

    avg_acc = sum(acc_list) / len(acc_list) * 100
    avg_auc = sum(auc_list) / len(auc_list)
    avg_f1 = sum(f1_list) / len(f1_list)

    summary_data = [
        [
            Paragraph("<b>Overall Average Test Accuracy</b>", td_center),
            Paragraph("<b>National ROC-AUC Score</b>", td_center),
            Paragraph("<b>Total Historical Samples</b>", td_center),
            Paragraph("<b>Coverage (States & UTs)</b>", td_center)
        ],
        [
            Paragraph(f"<font size=13 color='#047857'><b>{avg_acc:.2f}%</b></font>", td_center),
            Paragraph(f"<font size=13 color='#1d4ed8'><b>{nat['roc_auc']:.4f}</b></font>", td_center),
            Paragraph("<font size=13 color='#334155'><b>816 Samples</b></font>", td_center),
            Paragraph("<font size=13 color='#7c3aed'><b>37 States & UTs</b></font>", td_center)
        ]
    ]

    t_sum = Table(summary_data, colWidths=[130, 130, 130, 133])
    t_sum.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_sum)
    story.append(Spacer(1, 8))

    # Methodology Section
    story.append(Paragraph("1. Training & Evaluation Methodology", h1_style))
    story.append(Paragraph(
        "The model architecture uses <b>Gradient Boosting Decision Trees (GBDT)</b> and Ensemble Classifiers trained on historical hydro-meteorological, dam capacity, GIS waterbody, and demographic data. "
        "The complete dataset of <b>816 instances</b> is split using an <b>80% Training (652 samples)</b> and <b>20% Testing (164 samples)</b> stratified protocol to ensure fair, unbiased testing on completely unseen flood situations.",
        body_style
    ))

    # National Model Metrics Table
    story.append(Paragraph("2. National Benchmark Model Performance", h1_style))
    nat_rows = [
        [
            Paragraph("Metric", th_style),
            Paragraph("Test Accuracy", th_style),
            Paragraph("ROC-AUC Score", th_style),
            Paragraph("Precision", th_style),
            Paragraph("Recall (Sensitivity)", th_style),
            Paragraph("F1-Score", th_style),
            Paragraph("Train / Test Samples", th_style)
        ],
        [
            Paragraph("<b>All-India Master Model</b>", td_bold),
            Paragraph(f"<b>{nat['test_accuracy']*100:.2f}%</b>", td_green),
            Paragraph(f"{nat['roc_auc']:.4f}", td_center),
            Paragraph(f"{nat['precision']*100:.2f}%", td_center),
            Paragraph(f"{nat['recall']*100:.2f}%", td_center),
            Paragraph(f"{nat['f1_score']:.4f}", td_center),
            Paragraph(f"{nat['train_samples']} / {nat['test_samples']} (80/20)", td_center)
        ]
    ]
    t_nat = Table(nat_rows, colWidths=[115, 68, 68, 68, 72, 62, 70])
    t_nat.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e3a8a")),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor("#eff6ff")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#93c5fd")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_nat)
    story.append(Spacer(1, 8))

    # All 37 States Table
    story.append(Paragraph("3. State-Wise Machine Learning Test Accuracy Table (All 37 States & UTs)", h1_style))
    story.append(Paragraph("Comprehensive evaluation across all individual State/UT Gradient Boosting models evaluated against independent test sets:", body_style))

    table_rows = [
        [
            Paragraph("#", th_style),
            Paragraph("State / Union Territory", th_style),
            Paragraph("Test Accuracy", th_style),
            Paragraph("ROC-AUC", th_style),
            Paragraph("Precision", th_style),
            Paragraph("Recall", th_style),
            Paragraph("F1-Score", th_style),
            Paragraph("Training Strategy / Fallback", th_style)
        ]
    ]

    idx = 1
    for s_name in sorted(states.keys()):
        s_data = states[s_name]
        acc = s_data.get('test_accuracy', 0) * 100
        auc = s_data.get('roc_auc', 0)
        prec = s_data.get('precision', None)
        rec = s_data.get('recall', None)
        f1 = s_data.get('f1_score', 0)
        strategy = s_data.get('training_strategy', 'Dedicated State Model')
        
        prec_str = f"{prec*100:.1f}%" if prec is not None else "N/A"
        rec_str = f"{rec*100:.1f}%" if rec is not None else "N/A"
        
        # Color coding high accuracy
        acc_cell = Paragraph(f"<b>{acc:.1f}%</b>", td_green if acc >= 75 else td_bold)

        table_rows.append([
            Paragraph(str(idx), td_center),
            Paragraph(s_name, td_bold),
            acc_cell,
            Paragraph(f"{auc:.3f}", td_center),
            Paragraph(prec_str, td_center),
            Paragraph(rec_str, td_center),
            Paragraph(f"{f1:.3f}", td_center),
            Paragraph(strategy[:36] + ('...' if len(strategy) > 36 else ''), td_style)
        ])
        idx += 1

    # Add Summary Average Row at end
    table_rows.append([
        Paragraph("<b>--</b>", td_center),
        Paragraph("<b>AVERAGE (ALL 37 STATES)</b>", td_bold),
        Paragraph(f"<b>{avg_acc:.1f}%</b>", td_green),
        Paragraph(f"<b>{avg_auc:.3f}</b>", td_center),
        Paragraph(f"<b>{(sum(v.get('precision', 0) for v in states.values() if v.get('precision') is not None) / max(1, len([v for v in states.values() if v.get('precision') is not None])) * 100):.1f}%</b>", td_center),
        Paragraph(f"<b>{(sum(v.get('recall', 0) for v in states.values() if v.get('recall') is not None) / max(1, len([v for v in states.values() if v.get('recall') is not None])) * 100):.1f}%</b>", td_center),
        Paragraph(f"<b>{avg_f1:.3f}</b>", td_center),
        Paragraph("<b>Ensemble GBDT Protocol</b>", td_bold)
    ])

    t_states = Table(table_rows, colWidths=[20, 115, 60, 50, 48, 48, 48, 134])
    t_states.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [colors.white, colors.HexColor("#f8fafc")]),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor("#dbeafe")),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_states)
    story.append(Spacer(1, 10))

    # Top Influencing Features Section
    story.append(Paragraph("4. Feature Importance & Key Predictors", h1_style))
    story.append(Paragraph(
        "• <b>Population Exposure (36.61%):</b> Highest predictor weight determining critical risk zones.<br/>"
        "• <b>Mean Flood Inundation Duration (14.69%):</b> Duration of water stagnation from river basin overflow.<br/>"
        "• <b>GIS Flooded Area Percentage (13.80%):</b> Satellite-derived historical flood extent.<br/>"
        "• <b>Permanent Waterbodies & Reservoir Capacity (16.27% combined):</b> Catchment runoff retention limits.<br/>"
        "• <b>Dam Storage & Max Dam Height (9.63% combined):</b> Spillway overflow and upstream reservoir breach risk.",
        body_style
    ))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {pdf_path}")
    generate_html_report(data, avg_acc, avg_auc, avg_f1, nat, states)


def generate_html_report(data, avg_acc, avg_auc, avg_f1, nat, states):
    html_path = r'C:\Users\Lenovo\Desktop\FRP\public\accuracy-report.html'
    prec_vals = [v['precision'] for v in states.values() if v.get('precision') is not None]
    rec_vals = [v['recall'] for v in states.values() if v.get('recall') is not None]
    avg_prec = (sum(prec_vals) / len(prec_vals) * 100) if prec_vals else 0
    avg_rec = (sum(rec_vals) / len(rec_vals) * 100) if rec_vals else 0

    body_rows = []
    for i, name in enumerate(sorted(states.keys()), 1):
        s = states[name]
        acc = s.get('test_accuracy', 0) * 100
        auc = s.get('roc_auc', 0)
        prec = s.get('precision')
        rec = s.get('recall')
        f1 = s.get('f1_score', 0)
        strategy = s.get('training_strategy', 'Dedicated State Model')
        acc_cls = 'good' if acc >= 75 else 'warn'
        prec_str = f"{prec * 100:.1f}%" if prec is not None else "N/A"
        rec_str = f"{rec * 100:.1f}%" if rec is not None else "N/A"
        body_rows.append(
            "<tr>"
            f"<td>{i}</td><td><b>{name}</b></td>"
            f"<td class='{acc_cls}'>{acc:.1f}%</td>"
            f"<td>{auc:.3f}</td><td>{prec_str}</td><td>{rec_str}</td>"
            f"<td>{f1:.3f}</td><td>{strategy}</td>"
            "</tr>"
        )

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>FloodWatch India — Model Accuracy Report (All States & UTs)</title>
  <style>
    body {{ font-family: Segoe UI, Arial, sans-serif; background:#f8fafc; color:#0f172a; margin:0; padding:32px; }}
    h1 {{ margin:0 0 6px; font-size:26px; }}
    .sub {{ color:#475569; margin-bottom:22px; }}
    .cards {{ display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:22px; }}
    .card {{ background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:14px; }}
    .card b {{ display:block; font-size:22px; color:#047857; }}
    table {{ width:100%; border-collapse:collapse; background:#fff; }}
    th {{ background:#0f172a; color:#fff; text-align:left; padding:8px; font-size:13px; }}
    td {{ border-bottom:1px solid #e2e8f0; padding:7px 8px; font-size:13px; }}
    tr:nth-child(even) td {{ background:#f8fafc; }}
    .good {{ color:#047857; font-weight:700; }}
    .warn {{ color:#b45309; font-weight:700; }}
    .note {{ margin-top:18px; color:#475569; font-size:13px; line-height:1.5; }}
  </style>
</head>
<body>
  <h1>FloodWatch India — ML Model Accuracy Report</h1>
  <div class="sub">Project: Flood Risk Prediction Using Weather and GIS Data &nbsp;|&nbsp; 80:20 stratified train-test split &nbsp;|&nbsp; 37 States &amp; UTs</div>
  <div class="cards">
    <div class="card">Average Test Accuracy<b>{avg_acc:.2f}%</b></div>
    <div class="card">National ROC-AUC<b style="color:#1d4ed8">{nat['roc_auc']:.4f}</b></div>
    <div class="card">National Accuracy<b style="color:#1d4ed8">{nat['test_accuracy']*100:.2f}%</b></div>
    <div class="card">Coverage<b style="color:#7c3aed">37 States & UTs</b></div>
  </div>
  <h2>National Benchmark</h2>
  <p>Accuracy {nat['test_accuracy']*100:.2f}% &nbsp; Precision {nat['precision']*100:.2f}% &nbsp; Recall {nat['recall']*100:.2f}% &nbsp; F1 {nat['f1_score']:.4f} &nbsp; Train/Test {nat['train_samples']}/{nat['test_samples']}</p>
  <h2>State / UT Gradient Boosting Models</h2>
  <table>
    <thead>
      <tr><th>#</th><th>State / UT</th><th>Test Accuracy</th><th>ROC-AUC</th><th>Precision</th><th>Recall</th><th>F1</th><th>Training Strategy</th></tr>
    </thead>
    <tbody>
      {''.join(body_rows)}
      <tr>
        <td>--</td><td><b>AVERAGE (ALL 37)</b></td>
        <td class="good">{avg_acc:.1f}%</td><td><b>{avg_auc:.3f}</b></td>
        <td><b>{avg_prec:.1f}%</b></td><td><b>{avg_rec:.1f}%</b></td>
        <td><b>{avg_f1:.3f}</b></td><td><b>Ensemble GBDT Protocol</b></td>
      </tr>
    </tbody>
  </table>
  <p class="note">
    Models with fewer native district samples use regional-neighbour augmentation or the national master fallback.
    Accuracy is evaluated on held-out test districts, not on the live map heatmap.
    Feature importance (national): Population 36.61%, Mean Flood Duration 14.69%, Corrected Flooded Area 13.80%.
  </p>
</body>
</html>
"""
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"HTML report generated at: {html_path}")


if __name__ == '__main__':
    generate_pdf()
