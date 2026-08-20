from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

root = Path(r"C:\Users\a.vicentini\OneDrive - SPOT\Área de Trabalho\Tempos e Movimentos")
images = sorted((root / "work_auditoria").glob("slide-*.png"))
output = root / "analise" / "entregaveis" / "Tempos e Movimentos - Estudo Executivo P&G.pdf"

if len(images) != 12:
    raise ValueError(f"Expected 12 rendered slides, found {len(images)}")

canvas_pdf = canvas.Canvas(str(output), pagesize=(960, 540))
for image in images:
    canvas_pdf.drawImage(ImageReader(str(image)), 0, 0, width=960, height=540)
    canvas_pdf.showPage()
canvas_pdf.save()
print(output)
